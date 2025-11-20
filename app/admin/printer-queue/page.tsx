'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  X,
  Package,
  ShoppingBag,
  Loader2,
  Hash,
  CalendarDays,
  User,
  MapPin,
  ArrowRight,
  Sparkles
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
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printTemplate, setPrintTemplate] = useState<any>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

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
      
      // Limpar toda a fila de uma vez usando a rota específica
      const response = await fetch('/api/printer-queue/clear', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao limpar fila');
      }
      
      const result = await response.json();
      
      // Mostrar mensagem de sucesso
      if (result.count > 0) {
        toast.success(`${result.count} trabalho(s) removido(s) da fila`);
      } else {
        toast.info('Nenhum trabalho pendente para remover');
      }
      
      setClearQueueDialog(false);
      
      // Recarregar fila e impressoras
      await loadQueue();
      await loadPrinters();
    } catch (error) {
      console.error('Erro ao limpar fila:', error);
      toast.error('Erro ao limpar fila de impressão');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar job individual com visual melhorado
  const renderJob = (job: PrintJob) => {
    // Extrair informações do pedido
    const getItemsInfo = () => {
      // Se temos order_items com os dados relacionados
      if (job.order_items) {
        const orderItem = job.order_items;
        const item = orderItem.items;
        
        if (item) {
          return [{
            name: item.name || 'Item sem nome',
            quantity: orderItem.quantity || 1,
            price: orderItem.price || item.price || 0,
            description: item.description || '',
            notes: orderItem.notes || '',
            tableId: orderItem.orders?.table_id || null
          }];
        }
      }
      
      // Fallback para document_data se existir
      if (job.document_type === 'order' && job.document_data) {
        const items = job.document_data.items || [];
        return items.map((item: any) => ({
          name: item.name || item.item_name || 'Item',
          quantity: item.quantity || 1,
          price: item.price || 0,
          description: item.description || '',
          notes: item.notes || '',
          tableId: null
        }));
      }
      
      return [];
    };

    const items = getItemsInfo();
    const printerInfo = printers.find(p => p.id === job.printer_id);
    const tableId = items[0]?.tableId;
    

    return (
      <Card
        key={job.id}
        className={cn(
          "overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-1",
          selectedJobs.has(job.id) && "ring-2 ring-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
        )}
      >
        {/* Header do Card */}
        <div className={cn(
          "px-4 py-3 border-b",
          job.status === 'pending' && "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
          job.status === 'printing' && "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 animate-pulse",
          job.status === 'printed' && "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
          job.status === 'failed' && "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Pedido #{job.id}
                </span>
                {tableId && (
                  <Badge variant="outline" className="ml-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    Mesa {tableId}
                  </Badge>
                )}
              </div>
              
              {renderStatusBadge(job.status)}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(job.created_at).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {job.copies > 1 && (
                <Badge variant="outline" className="gap-1">
                  <Download className="h-3 w-3" />
                  {job.copies}x
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo do Card */}
        <CardContent className="p-4">
          {/* Lista de Itens */}
          {items.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                Itens para Impressão:
              </div>
              
              <div className="space-y-2 pl-6">
                {items.map((item: any, idx: number) => {
                  return (
                    <div key={idx} className="py-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-orange-600 italic pl-4">
                          Obs: {item.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Documento para impressão</p>
            </div>
          )}

          {/* Informações da Impressora */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Printer className="h-4 w-4" />
              <span>{printerInfo?.name || 'Impressora'}</span>
              {printerInfo?.location && (
                <>
                  <MapPin className="h-3 w-3 ml-2" />
                  <span>{printerInfo.location}</span>
                </>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  setPreviewJob(job);
                  setLoadingTemplate(true);
                  
                  // Buscar template apropriado
                  try {
                    // Para pedidos de produtos sempre usar template kitchen
                    const templateType = 'kitchen';
                    const response = await fetch(`/api/templates/${templateType}`);
                    if (response.ok) {
                      const data = await response.json();
                      setPrintTemplate(data.template);
                    } else {
                      // Se falhar, usar template padrão
                      setPrintTemplate({
                        header: `================================
       PEDIDO COZINHA
================================
Mesa: {{table_number}}
Pedido: #{{order_number}}
Hora: {{time}}
================================`,
                        items: `{{#each items}}
{{quantity}}x {{name}}
   {{#if observation}}
   OBS: {{observation}}
   {{/if}}
--------------------------------
{{/each}}`,
                        footer: `================================
Atendente: {{customer_name}}
================================`
                      });
                    }
                  } catch (error) {
                    console.error('Erro ao buscar template:', error);
                    // Usar template padrão em caso de erro
                    setPrintTemplate({
                      header: `================================
       PEDIDO COZINHA
================================
Mesa: {{table_number}}
Pedido: #{{order_number}}
Hora: {{time}}
================================`,
                      items: `{{#each items}}
{{quantity}}x {{name}}
   {{#if observation}}
   OBS: {{observation}}
   {{/if}}
--------------------------------
{{/each}}`,
                      footer: `================================
Atendente: {{customer_name}}
================================`
                    });
                  } finally {
                    setLoadingTemplate(false);
                    setShowPrintPreview(true);
                  }
                }}
                className="h-8 px-2 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20"
                title="Ver Impressão"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {job.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateJobStatus(job.id, 'printing')}
                    className="h-8 px-2 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => cancelJob(job.id)}
                    className="h-8 px-2 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {job.status === 'failed' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => retryJob(job.id)}
                  className="h-8 px-2 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              
              {['printed', 'cancelled', 'failed'].includes(job.status) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteJob(job.id)}
                  className="h-8 px-2 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mensagem de erro */}
          {job.error_message && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-600">{job.error_message}</p>
            </div>
          )}

          {/* Retry count */}
          {job.retry_count > 0 && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Tentativa {job.retry_count} de {maxRetries}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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

      {/* Lista de Jobs com Visual Melhorado */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando fila de impressão...</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Printer className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Fila de Impressão Vazia
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Não há trabalhos aguardando impressão no momento. 
                Novos pedidos aparecerão aqui automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map(job => renderJob(job))}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedJobs.map(group => (
            <Card key={group.printer.id} className="overflow-hidden">
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
                className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.printer.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                    <Printer className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {group.printer.name}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {group.printer.location}
                    </Badge>
                    <Badge 
                      className={cn(
                        "gap-1 ml-2",
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
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-600">
                      <Package className="h-3 w-3 mr-1" />
                      {group.jobs.length} trabalhos
                    </Badge>
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </button>

              {expandedGroups.has(group.printer.id) && (
                <CardContent className="p-4 border-t">
                  {group.jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Timer className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Nenhum trabalho aguardando nesta impressora
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {group.jobs.map(job => renderJob(job))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

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

      {/* Modal de Visualização da Impressão */}
      <AlertDialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" />
              Preview - Impressora Térmica 80mm
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          {/* Container do Preview estilo Impressora Térmica */}
          <div className="overflow-auto bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-lg" style={{ maxHeight: '600px' }}>
            {/* Frame da Impressora Térmica */}
            <div className="relative mx-auto" style={{ width: '320px' }}>
              {/* Rolo de Papel Superior */}
              <div className="h-8 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-lg relative">
                <div className="absolute inset-x-0 top-2 flex justify-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </div>
              
              {/* Papel com Cupom */}
              <div 
                className="relative"
                style={{
                  background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 50%, #f5f5f0 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(0,0,0,0.05)',
                  padding: '16px',
                  minHeight: '400px'
                }}
              >
                {/* Textura do Papel */}
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect fill='%23000000' x='0' y='0' width='1' height='1' opacity='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '2px 2px'
                  }}
                />
                
                {/* Conteúdo do Cupom */}
                <div className="relative text-gray-900 font-mono text-xs leading-5 whitespace-pre-wrap" style={{ fontSize: '11px', letterSpacing: '0.5px', lineHeight: '1.3' }}>
                  {loadingTemplate ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Carregando template...</p>
                    </div>
                  ) : previewJob && printTemplate ? (() => {
              // Função para aplicar as variáveis do template
              const applyTemplate = (template: string, data: any) => {
                let result = template;
                
                // Substituir variáveis simples
                Object.keys(data).forEach(key => {
                  const regex = new RegExp(`{{${key}}}`, 'g');
                  result = result.replace(regex, data[key] || '');
                });
                
                // Processar loops {{#each items}}
                const eachRegex = /{{#each items}}([\s\S]*?){{\/each}}/g;
                result = result.replace(eachRegex, (match, itemTemplate) => {
                  return data.items?.map((item: any) => {
                    let itemResult = itemTemplate;
                    
                    // Substituir variáveis do item
                    Object.keys(item).forEach(key => {
                      const itemRegex = new RegExp(`{{${key}}}`, 'g');
                      itemResult = itemResult.replace(itemRegex, item[key] || '');
                    });
                    
                    // Processar condicionais {{#if observation}}
                    const ifRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;
                    itemResult = itemResult.replace(ifRegex, (match: string, field: string, content: string) => {
                      return item[field] ? content : '';
                    });
                    
                    return itemResult.trim();
                  }).join('\n') || '';
                });
                
                return result;
              };
              
              // Preparar dados do pedido
              const getItemsInfo = () => {
                if (previewJob.order_items) {
                  const orderItem = previewJob.order_items;
                  const item = orderItem.items;
                  if (item) {
                    return [{
                      name: item.name || 'Item sem nome',
                      quantity: orderItem.quantity || 1,
                      price: item.price === 0 ? 'Incluso' : (item.price * (orderItem.quantity || 1)).toFixed(2),
                      observation: orderItem.notes || '',
                      tableId: orderItem.orders?.table_id || null
                    }];
                  }
                }
                if (previewJob.document_type === 'order' && previewJob.document_data) {
                  const items = previewJob.document_data.items || [];
                  return items.map((item: any) => ({
                    name: item.name || item.item_name || 'Item',
                    quantity: item.quantity || 1,
                    price: item.price === 0 ? 'Incluso' : (item.price * (item.quantity || 1)).toFixed(2),
                    observation: item.notes || '',
                    tableId: null
                  }));
                }
                return [];
              };

              const items = getItemsInfo();
              const totalPrice = items.reduce((sum: number, item: any) => {
                const price = item.price === 'Incluso' ? 0 : parseFloat(item.price);
                return sum + price;
              }, 0);
              const printerInfo = printers.find(p => p.id === previewJob.printer_id);
              const tableId = items[0]?.tableId || previewJob.document_data?.table_id;
              
              // Preparar dados para o template
              const now = new Date();
              const templateData = {
                company_name: 'COMIDEX RESTAURANTE',
                company_address: 'Rua Principal, 123 - Centro',
                company_phone: '(11) 1234-5678',
                order_number: previewJob.id.toString(),
                table_number: tableId || 'N/A',
                customer_name: previewJob.document_data?.customer_name || 'Cliente',
                date: now.toLocaleDateString('pt-BR'),
                time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                items: items,
                subtotal: totalPrice.toFixed(2),
                discount: '0.00',
                service_fee: '0.00',
                total: totalPrice.toFixed(2),
                payment_method: 'A definir'
              };
              
              // Aplicar template
              const header = applyTemplate(printTemplate.header || '', templateData);
              const itemsContent = applyTemplate(printTemplate.items || '', templateData);
              const footer = applyTemplate(printTemplate.footer || '', templateData);
              
              return (
                <div>
                  {header}
                  {itemsContent}
                  {footer}
                </div>
              );
            }) : previewJob && (() => {
              // Fallback caso não tenha template - usar formato padrão
              const getItemsInfo = () => {
                if (previewJob.order_items) {
                  const orderItem = previewJob.order_items;
                  const item = orderItem.items;
                  if (item) {
                    return [{
                      name: item.name || 'Item sem nome',
                      quantity: orderItem.quantity || 1,
                      price: orderItem.price || item.price || 0,
                      notes: orderItem.notes || '',
                      tableId: orderItem.orders?.table_id || null
                    }];
                  }
                }
                if (previewJob.document_type === 'order' && previewJob.document_data) {
                  const items = previewJob.document_data.items || [];
                  return items.map((item: any) => ({
                    name: item.name || item.item_name || 'Item',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    notes: item.notes || '',
                    tableId: null
                  }));
                }
                return [];
              };

              const items = getItemsInfo();
              const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
              const printerInfo = printers.find(p => p.id === previewJob.printer_id);
              const tableId = items[0]?.tableId;
              
              return (
                <div>
================================
       PEDIDO COZINHA
================================
Mesa: {tableId || 'N/A'}
Pedido: #{previewJob.id}
Hora: {new Date(previewJob.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
================================
{items.map((item: any, idx: number) => `
${item.quantity}x ${item.name}
${item.notes ? `   OBS: ${item.notes}` : ''}
--------------------------------`).join('')}
================================
Total: R$ {totalPrice.toFixed(2)}
================================
                </div>
              );
                    })()}
                </div>
              </div>
              
              {/* Serrilha do papel */}
              <div className="h-4 bg-gradient-to-b from-gray-100 to-gray-200 relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 h-2"
                  style={{
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, #ccc 3px, #ccc 4px)',
                  }}
                />
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}