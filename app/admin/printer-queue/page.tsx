'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Printer, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Pause, 
  Play,
  RotateCcw,
  Trash2,
  Settings,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Activity,
  FileText,
  Receipt,
  Layers,
  Eye,
  EyeOff,
  Download,
  Send,
  Timer,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PrintJob {
  id: number;
  order_item_id?: number;
  printer_id: number;
  document_type: 'order' | 'receipt' | 'report' | 'test' | 'bill';
  document_data: any;
  copies: number;
  status: 'pending' | 'printing' | 'printed' | 'failed' | 'cancelled';
  retry_count: number;
  max_retries: number;
  error_message?: string;
  created_at: string;
  printed_at?: string;
  order_items?: any;
  orders?: any;
}

interface PrinterData {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  queue_count: number;
  last_print?: string;
}

interface QueueStats {
  total: number;
  pending: number;
  printing: number;
  printed: number;
  failed: number;
  cancelled: number;
  avgWaitTime: number;
  successRate: number;
}

export default function PrinterQueuePage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [retryInterval, setRetryInterval] = useState(30); // seconds
  const [maxRetries, setMaxRetries] = useState(3);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    printing: 0,
    printed: 0,
    failed: 0,
    cancelled: 0,
    avgWaitTime: 0,
    successRate: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [clearQueueDialog, setClearQueueDialog] = useState(false);

  // Carregar dados da fila
  const loadQueue = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedPrinter !== 'all') {
        params.append('printer_id', selectedPrinter);
      }
      
      // Definir status baseado no filtro
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active') {
          // Não adicionar parâmetro de status, o backend retorna pending/printing por padrão
        } else {
          params.append('status', selectedStatus);
        }
      }

      const response = await fetch(`/api/printer-queue?${params}`);
      const data = await response.json();
      
      // Verificar se retornou um erro ou um array
      if (Array.isArray(data)) {
        setJobs(data);
        // Calcular estatísticas
        const newStats = calculateStats(data);
        setStats(newStats);
      } else {
        // Se não for array, setar array vazio
        setJobs([]);
        setStats({
          total: 0,
          pending: 0,
          printing: 0,
          printed: 0,
          failed: 0,
          cancelled: 0,
          avgWaitTime: 0,
          successRate: 0
        });
        
        if (data.error) {
          console.error('Erro da API:', data.error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar fila de impressão');
      setJobs([]);
    }
  }, [selectedPrinter, selectedStatus]);

  // Carregar impressoras
  const loadPrinters = async () => {
    try {
      const response = await fetch('/api/printers');
      const data = await response.json();
      
      // Processar dados das impressoras
      const processedPrinters = data.map((printer: any) => ({
        ...printer,
        queue_count: jobs.filter(j => j.printer_id === printer.id && ['pending', 'printing'].includes(j.status)).length
      }));
      
      setPrinters(processedPrinters);
    } catch (error) {
      console.error('Erro ao carregar impressoras:', error);
    }
  };

  // Calcular estatísticas
  const calculateStats = (data: PrintJob[]): QueueStats => {
    const stats: QueueStats = {
      total: data.length,
      pending: data.filter(j => j.status === 'pending').length,
      printing: data.filter(j => j.status === 'printing').length,
      printed: data.filter(j => j.status === 'printed').length,
      failed: data.filter(j => j.status === 'failed').length,
      cancelled: data.filter(j => j.status === 'cancelled').length,
      avgWaitTime: 0,
      successRate: 0
    };

    // Calcular taxa de sucesso
    const completed = stats.printed + stats.failed + stats.cancelled;
    if (completed > 0) {
      stats.successRate = (stats.printed / completed) * 100;
    }

    // Calcular tempo médio de espera (simulado)
    const pendingJobs = data.filter(j => j.status === 'pending');
    if (pendingJobs.length > 0) {
      const totalWait = pendingJobs.reduce((acc, job) => {
        const waitTime = Date.now() - new Date(job.created_at).getTime();
        return acc + waitTime;
      }, 0);
      stats.avgWaitTime = Math.round(totalWait / pendingJobs.length / 1000); // em segundos
    }

    return stats;
  };

  // Atualizar status do job
  const updateJobStatus = async (jobId: number, status: string) => {
    try {
      const response = await fetch(`/api/printer-queue?id=${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Status atualizado para ${status}`);
        await loadQueue();
      } else {
        throw new Error('Falha ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do job');
    }
  };

  // Reenviar job
  const retryJob = async (jobId: number) => {
    try {
      // Atualizar para pending para reenviar
      await updateJobStatus(jobId, 'pending');
      
      // Incrementar contador de retry no backend seria ideal
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        toast.success(`Job #${jobId} reenviado para impressão`);
      }
    } catch (error) {
      console.error('Erro ao reenviar job:', error);
      toast.error('Erro ao reenviar job');
    }
  };

  // Cancelar job
  const cancelJob = async (jobId: number) => {
    try {
      await updateJobStatus(jobId, 'cancelled');
    } catch (error) {
      console.error('Erro ao cancelar job:', error);
      toast.error('Erro ao cancelar job');
    }
  };

  // Processar múltiplos jobs
  const processBulkAction = async (action: 'retry' | 'cancel' | 'delete') => {
    if (selectedJobs.size === 0) {
      toast.error('Nenhum job selecionado');
      return;
    }

    try {
      const promises = Array.from(selectedJobs).map(jobId => {
        switch (action) {
          case 'retry':
            return retryJob(jobId);
          case 'cancel':
            return cancelJob(jobId);
          case 'delete':
            return deleteJob(jobId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSelectedJobs(new Set());
      toast.success(`${selectedJobs.size} jobs processados`);
    } catch (error) {
      console.error('Erro ao processar ação em massa:', error);
      toast.error('Erro ao processar ação em massa');
    }
  };

  // Deletar job (apenas jobs cancelados ou impressos)
  const deleteJob = async (jobId: number) => {
    try {
      const response = await fetch(`/api/printer-queue/${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Job removido da fila');
        await loadQueue();
      } else {
        throw new Error('Falha ao deletar job');
      }
    } catch (error) {
      console.error('Erro ao deletar job:', error);
      toast.error('Erro ao deletar job');
    }
  };

  // Retry automático para jobs falhados
  useEffect(() => {
    if (!retryEnabled) return;

    const retryFailedJobs = async () => {
      const failedJobs = jobs.filter(j => 
        j.status === 'failed' && 
        j.retry_count < maxRetries
      );

      for (const job of failedJobs) {
        await retryJob(job.id);
      }
    };

    const interval = setInterval(retryFailedJobs, retryInterval * 1000);
    return () => clearInterval(interval);
  }, [jobs, retryEnabled, retryInterval, maxRetries]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadQueue();
      loadPrinters();
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, loadQueue]);

  // Carregar dados iniciais
  useEffect(() => {
    setLoading(true);
    Promise.all([loadQueue(), loadPrinters()])
      .finally(() => setLoading(false));
  }, [loadQueue]);

  // Filtrar jobs
  const filteredJobs = jobs.filter(job => {
    // Filtro de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const printer = printers.find(p => p.id === job.printer_id);
      const matchesSearch = 
        job.id.toString().includes(search) ||
        job.document_type.includes(search) ||
        printer?.name.toLowerCase().includes(search) ||
        printer?.location.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Agrupar jobs por impressora
  const groupedJobs = viewMode === 'grouped' 
    ? printers.map(printer => ({
        printer,
        jobs: filteredJobs.filter(j => j.printer_id === printer.id)
      }))
    : [];

  // Renderizar badge de status
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-600', icon: Clock, label: 'Pendente' },
      printing: { color: 'bg-blue-500/20 text-blue-600', icon: Printer, label: 'Imprimindo' },
      printed: { color: 'bg-green-500/20 text-green-600', icon: CheckCircle2, label: 'Impresso' },
      failed: { color: 'bg-red-500/20 text-red-600', icon: AlertCircle, label: 'Falha' },
      cancelled: { color: 'bg-gray-500/20 text-gray-600', icon: X, label: 'Cancelado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={cn('gap-1', config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };


  // Renderizar tipo de documento
  const renderDocumentType = (type: string) => {
    const typeConfig = {
      order: { icon: FileText, label: 'Pedido' },
      receipt: { icon: Receipt, label: 'Recibo' },
      bill: { icon: Receipt, label: 'Conta' },
      report: { icon: Layers, label: 'Relatório' },
      test: { icon: Settings, label: 'Teste' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { icon: FileText, label: type };
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span>{config.label}</span>
      </div>
    );
  };

  // Função para limpar fila
  const handleClearQueue = async () => {
    try {
      setLoading(true);
      
      // Pegar todos os jobs pendentes
      const pendingJobs = jobs.filter(j => j.status === 'pending');
      
      // Cancelar cada job pendente
      for (const job of pendingJobs) {
        await fetch(`/api/printer-queue/${job.id}`, {
          method: 'DELETE'
        });
      }
      
      toast.success(`${pendingJobs.length} jobs removidos da fila`);
      setClearQueueDialog(false);
      
      // Recarregar fila
      await loadQueue();
      await loadPrinters();
    } catch (error) {
      console.error('Erro ao limpar fila:', error);
      toast.error('Erro ao limpar fila');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar job individual
  const renderJob = (job: PrintJob) => (
    <div
      key={job.id}
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        selectedJobs.has(job.id) && "bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-700"
      )}
    >
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={selectedJobs.has(job.id)}
          onChange={(e) => {
            const newSelected = new Set(selectedJobs);
            if (e.target.checked) {
              newSelected.add(job.id);
            } else {
              newSelected.delete(job.id);
            }
            setSelectedJobs(newSelected);
          }}
          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-500">#{job.id}</span>
            {renderDocumentType(job.document_type)}
            {renderStatusBadge(job.status)}
            {job.copies > 1 && (
              <Badge variant="outline" className="gap-1">
                <Download className="h-3 w-3" />
                {job.copies} cópias
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Printer className="h-3 w-3" />
              {printers.find(p => p.id === job.printer_id)?.name || `Impressora #${job.printer_id}`}
            </div>
            <div>
              {new Date(job.created_at).toLocaleString('pt-BR')}
            </div>
            {job.retry_count > 0 && (
              <Badge variant="outline" className="text-xs">
                {job.retry_count}/{maxRetries} tentativas
              </Badge>
            )}
          </div>

          {job.error_message && (
            <div className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {job.error_message}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {job.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateJobStatus(job.id, 'printing')}
              className="h-8 px-2"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => cancelJob(job.id)}
              className="h-8 px-2"
            >
              <Pause className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {job.status === 'failed' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => retryJob(job.id)}
            className="h-8 px-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        
        {['printed', 'cancelled', 'failed'].includes(job.status) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteJob(job.id)}
            className="h-8 px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Fila de Impressão
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie e monitore todos os trabalhos de impressão
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-atualizar
            </Label>
          </div>
          
          <Button
            onClick={() => {
              loadQueue();
              loadPrinters();
              toast.success('Fila atualizada');
            }}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>

          <Button
            onClick={() => setClearQueueDialog(true)}
            disabled={loading || stats.pending === 0}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Fila
          </Button>
          
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Imprimindo</p>
                <p className="text-2xl font-bold text-blue-600">{stats.printing}</p>
              </div>
              <Printer className="h-8 w-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.floor(stats.avgWaitTime / 60)}:{(stats.avgWaitTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <Timer className="h-8 w-8 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações (quando visível) */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Retry Automático</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Retry Automático</Label>
                <p className="text-sm text-gray-600">
                  Reenviar automaticamente jobs com falha
                </p>
              </div>
              <Switch
                checked={retryEnabled}
                onCheckedChange={setRetryEnabled}
              />
            </div>

            {retryEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Intervalo de Retry (segundos)</Label>
                    <Input
                      type="number"
                      value={retryInterval}
                      onChange={(e) => setRetryInterval(parseInt(e.target.value) || 30)}
                      min="10"
                      max="300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de Tentativas</Label>
                    <Input
                      type="number"
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros e ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID, impressora ou tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas as impressoras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as impressoras</SelectItem>
                    {printers.map(printer => (
                      <SelectItem key={printer.id} value={printer.id.toString()}>
                        {printer.name} ({printer.queue_count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="printing">Imprimindo</SelectItem>
                    <SelectItem value="printed">Impressos</SelectItem>
                    <SelectItem value="failed">Falhados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 border-l pl-3">
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="h-8 px-2"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'grouped' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grouped')}
                    className="h-8 px-2"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedJobs.size > 0 && (
                <div className="flex items-center gap-2 pl-4 border-l">
                  <span className="text-sm text-gray-600">
                    {selectedJobs.size} selecionados
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => processBulkAction('retry')}
                    className="h-8"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reenviar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => processBulkAction('cancel')}
                    className="h-8"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => processBulkAction('delete')}
                    className="h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Jobs */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Printer className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhum job na fila
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                filteredJobs.map(job => renderJob(job))
              ) : (
                groupedJobs.map(group => (
                  <div key={group.printer.id} className="space-y-2">
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedGroups);
                        if (newExpanded.has(group.printer.id)) {
                          newExpanded.delete(group.printer.id);
                        } else {
                          newExpanded.add(group.printer.id);
                        }
                        setExpandedGroups(newExpanded);
                      }}
                      className="flex items-center justify-between w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedGroups.has(group.printer.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Printer className="h-4 w-4" />
                        <span className="font-medium">{group.printer.name}</span>
                        <Badge variant="outline">
                          {group.printer.location}
                        </Badge>
                        <Badge 
                          className={cn(
                            "gap-1",
                            group.printer.status === 'online' 
                              ? "bg-green-500/20 text-green-600"
                              : group.printer.status === 'offline'
                              ? "bg-gray-500/20 text-gray-600"
                              : "bg-red-500/20 text-red-600"
                          )}
                        >
                          {group.printer.status === 'online' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {group.printer.status}
                        </Badge>
                      </div>
                      <Badge>
                        {group.jobs.length} jobs
                      </Badge>
                    </button>

                    {expandedGroups.has(group.printer.id) && (
                      <div className="pl-8 space-y-2">
                        {group.jobs.length === 0 ? (
                          <p className="text-sm text-gray-500 p-3">
                            Nenhum job para esta impressora
                          </p>
                        ) : (
                          group.jobs.map(job => renderJob(job))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modal de Confirmação para Limpar Fila */}
      <AlertDialog open={clearQueueDialog} onOpenChange={setClearQueueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Fila de Impressão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja limpar toda a fila de impressão? 
              Esta ação irá cancelar {stats.pending} job(s) pendente(s).
              Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearQueue}
              className="bg-red-600 hover:bg-red-700"
            >
              Limpar Fila
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}