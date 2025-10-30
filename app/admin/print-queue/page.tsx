"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  BarChart,
  Package,
  Filter,
  RefreshCw,
  Trash2,
  Printer,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();
import type { PrintQueue, Printer as PrinterType } from "@/types/supabase";

export default function PrintQueuePage() {
  const [queueItems, setQueueItems] = useState<PrintQueue[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [printerFilter, setPrinterFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PrintQueue | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load data with retry logic for reliability
  const loadData = async (showError: boolean = true) => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        // Build query
        let query = supabase
          .from('print_queue')
          .select(`
            *,
            printer:printers(*)
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }
        if (printerFilter !== "all") {
          query = query.eq('printer_id', parseInt(printerFilter));
        }

        const { data: queueData, error: queueError } = await query;
        if (queueError) throw queueError;

        // Load printers for filter
        const { data: printersData, error: printersError } = await supabase
          .from('printers')
          .select('*')
          .order('name', { ascending: true });

        if (printersError) throw printersError;

        setQueueItems(queueData || []);
        setPrinters(printersData || []);
        
        return true;
      } catch (error) {
        console.error(`Erro ao carregar dados (tentativa ${retryCount + 1}/${maxRetries}):`, error);
        return false;
      }
    };
    
    // Try loading with retries
    while (retryCount < maxRetries) {
      const success = await attemptLoad();
      if (success) {
        setLoading(false);
        return;
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
      }
    }
    
    // All retries failed - only show error on initial load, not on auto-refresh
    if (showError) {
      toast.error("Erro ao carregar fila de impressão. Por favor, recarregue a página.");
    }
    setLoading(false);
  };

  // Load data on mount and setup auto-refresh
  useEffect(() => {
    // Initial load with error display
    const timer = setTimeout(() => {
      loadData(true);
    }, 100);
    
    // Auto refresh without error display
    const interval = setInterval(() => loadData(false), 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [statusFilter, printerFilter]);

  // Calculate statistics
  const stats = {
    pending: queueItems.filter(item => item.status === 'pending').length,
    printing: queueItems.filter(item => item.status === 'printing').length,
    completed: queueItems.filter(item => item.status === 'completed').length,
    failed: queueItems.filter(item => item.status === 'failed').length,
    total: queueItems.length
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Aguardando
        </Badge>;
      case 'printing':
        return <Badge className="bg-blue-500 text-white gap-1">
          <Printer className="h-3 w-3" />
          Imprimindo
        </Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white gap-1">
          <CheckCircle className="h-3 w-3" />
          Concluído
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white gap-1">
          <XCircle className="h-3 w-3" />
          Erro
        </Badge>;
      default:
        return null;
    }
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order':
        return <Badge variant="outline" className="gap-1">
          <Package className="h-3 w-3" />
          Pedido
        </Badge>;
      case 'report':
        return <Badge variant="outline" className="gap-1">
          <BarChart className="h-3 w-3" />
          Relatório
        </Badge>;
      case 'receipt':
        return <Badge variant="outline" className="gap-1">
          <FileText className="h-3 w-3" />
          Cupom
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Retry print job
  const retryPrint = async (item: PrintQueue) => {
    try {
      const { error } = await supabase
        .from('print_queue')
        .update({ status: 'pending', error_message: null })
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success("Impressão reenviada para fila");
      loadData();
    } catch (error) {
      console.error('Error retrying print:', error);
      toast.error("Erro ao reenviar impressão");
    }
  };

  // Delete print job
  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('print_queue')
        .delete()
        .eq('id', deleteItem.id);

      if (error) throw error;
      
      toast.success("Item removido da fila");
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Erro ao remover item");
    } finally {
      setDeleting(false);
    }
  };

  // Clear old completed/failed items
  const clearOldItems = async () => {
    try {
      const { error } = await supabase
        .from('print_queue')
        .delete()
        .in('status', ['completed', 'failed'])
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      
      toast.success("Items antigos removidos");
      loadData();
    } catch (error) {
      console.error('Error clearing old items:', error);
      toast.error("Erro ao limpar items antigos");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                </div>
                Fila de Impressão
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Monitore e gerencie todas as impressões do sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearOldItems}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Antigos
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={loadData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Aguardando</p>
                    <p className="text-xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Imprimindo</p>
                    <p className="text-xl font-bold text-blue-500">{stats.printing}</p>
                  </div>
                  <Printer className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Concluídos</p>
                    <p className="text-xl font-bold text-green-500">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Erros</p>
                    <p className="text-xl font-bold text-red-500">{stats.failed}</p>
                  </div>
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Aguardando</SelectItem>
                <SelectItem value="printing">Imprimindo</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="failed">Erros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Impressora:</label>
            <Select value={printerFilter} onValueChange={setPrinterFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {printers.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id.toString()}>
                    {printer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="px-6 py-6">
        <div className="space-y-3">
          {queueItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <p className="font-medium">#{item.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div>
                      {getTypeBadge(item.type)}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">
                        {item.printer?.name || 'Impressora Removida'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.printer?.ip}:{item.printer?.port}
                      </p>
                    </div>
                    {item.error_message && (
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{item.error_message}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryPrint(item)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Tentar Novamente
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors"
                      onClick={() => {
                        setDeleteItem(item);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {queueItems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum item na fila de impressão
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => setIsDeleteModalOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este item da fila de impressão?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}