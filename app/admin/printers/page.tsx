'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Printer as PrinterIcon, 
  Trash2, 
  Edit,
  Save,
  Loader2,
  Search,
  Wifi,
  WifiOff,
  Network,
  CheckCircle,
  XCircle,
  Star,
  MoreVertical,
  Pencil,
  AlertCircle,
  TestTube,
  Activity,
  Info,
  Clock,
  Power,
  PowerOff,
  Zap,
  Signal,
  SignalLow,
  SignalZero,
  Globe,
  Monitor,
  HardDrive
} from "lucide-react";
import useSWR, { mutate } from 'swr';

interface Printer {
  id: number;
  name: string;
  ip_address: string;
  port: string;
  type: 'thermal' | 'laser' | 'inkjet' | 'other';
  printer_model?: string;
  is_main: boolean;
  active: boolean;
  description?: string;
  sort_order: number;
  connection_status?: string;
  last_test_at?: string;
  test_result?: string;
  created_at?: string;
  updated_at?: string;
}

// Modelos populares de impressoras térmicas para restaurantes
const PRINTER_MODELS = {
  thermal: [
    // Epson - Líder mundial
    "Epson TM-T88VI",
    "Epson TM-T88V", 
    "Epson TM-T88IV",
    "Epson TM-T88III",
    "Epson TM-T20X",
    "Epson TM-T20III",
    "Epson TM-T20II",
    "Epson TM-T70II",
    "Epson TM-U220",
    "Epson TM-U950",
    
    // Bematech - Nacional
    "Bematech MP-4200 TH",
    "Bematech MP-5100 TH",
    "Bematech MP-2800 TH",
    "Bematech MP-100S TH",
    "Bematech PP-10",
    
    // Elgin - Nacional
    "Elgin i9",
    "Elgin i8",
    "Elgin i7",
    "Elgin VOX",
    "Elgin Smart",
    
    // Star Micronics - Japonesa
    "Star TSP143III",
    "Star TSP143IIIU",
    "Star TSP654II",
    "Star TSP700II",
    "Star TSP800II",
    "Star mC-Print3",
    "Star mC-Print2",
    
    // Citizen - Japonesa
    "Citizen CT-S310II",
    "Citizen CT-E351",
    "Citizen CT-E651",
    "Citizen CT-S801III",
    "Citizen CT-S601",
    
    // Daruma - Nacional
    "Daruma DR800",
    "Daruma DR700",
    "Daruma DS300",
    "Daruma DS348",
    
    // Sweda - Nacional  
    "Sweda SI-300S",
    "Sweda SI-300L",
    "Sweda SI-250",
    
    // Zebra
    "Zebra ZD220",
    "Zebra ZD420",
    "Zebra ZD621",
    
    // Tanca
    "Tanca TMP-500",
    "Tanca TP-650",
    "Tanca TP-450",
    
    // Diebold Nixdorf
    "Diebold IM453HU",
    "Diebold IM433TD",
    "Diebold IM113ID",
    
    // Control ID
    "Control ID Print iD",
    "Control ID Print iD Touch",
    
    // Jetway
    "Jetway JP-500",
    "Jetway JP-800",
    
    // POS Tech
    "POStech POS-90",
    "POStech POS-80"
  ],
  laser: [
    "HP LaserJet Pro M404n",
    "HP LaserJet Pro M15w",
    "HP LaserJet Pro M203dw",
    "Brother HL-L2350DW",
    "Brother HL-L2395DW",
    "Brother DCP-L2540DW",
    "Samsung Xpress M2020W",
    "Canon imageCLASS LBP6030w"
  ],
  inkjet: [
    "Epson L3250",
    "Epson L3210",
    "Epson L5290",
    "Canon G3110",
    "Canon G3160",
    "Canon G4110",
    "HP Smart Tank 517",
    "HP DeskJet 2774"
  ],
  other: [
    "Modelo Personalizado"
  ]
};

// SWR fetcher function
const fetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('printers')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export default function PrintersPage() {
  // Use SWR for automatic data fetching and caching
  const { data: printers = [], error, isLoading } = useSWR('printers', fetcher, {
    refreshInterval: 5000, // Auto refresh every 5 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '9100',
    type: 'thermal' as 'thermal' | 'laser' | 'inkjet' | 'other',
    printer_model: 'Epson TM-T88VI',
    is_main: false,
    active: true,
    sort_order: 0
  });
  const supabase = createClient();
  
  // Verificar status inicial apenas uma vez quando carregar as impressoras
  useEffect(() => {
    if (printers.length > 0) {
      // Verificar status inicial após 2 segundos
      const timeout = setTimeout(() => {
        checkAllPrintersStatus();
      }, 2000);
      
      // Não verificar automaticamente depois - apenas quando usuário clicar em "Status"
      // Isso evita mudanças aleatórias de status
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [printers.length]);

  const checkAllPrintersStatus = async () => {
    const activePrinters = printers.filter((p: Printer) => p.active);
    for (const printer of activePrinters) {
      await checkPrinterStatus(printer.id, true);
    }
  };

  const checkPrinterStatus = async (printerId: number, silent = false) => {
    try {
      if (!silent) setCheckingStatus(printerId);
      
      const response = await fetch('/api/printers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId })
      });

      const result = await response.json();
      
      if (!silent) {
        if (result.status === 'online') {
          toast.success(`${result.message}`);
        } else {
          toast.error(`${result.message}`);
        }
      }

      // Atualizar status local com mutate otimista
      mutate('printers', 
        printers.map((p: Printer) => 
          p.id === printerId 
            ? { ...p, connection_status: result.status }
            : p
        ),
        false // não revalidar, apenas atualizar cache local
      );
    } catch (error) {
      if (!silent) {
        toast.error("Erro ao verificar status da impressora");
      }
    } finally {
      setCheckingStatus(null);
    }
  };

  const testPrinter = async (printer: Printer) => {
    try {
      setTesting(printer.id);
      toast(`🖨️ Enviando teste de impressão para ${printer.name}...`);
      
      const response = await fetch('/api/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId: printer.id })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ ${result.message}`);
        // Revalidar dados para mostrar último teste
        mutate('printers');
        
        // Se foi teste real, mostrar detalhes
        if (result.method === 'network') {
          toast.success(`📡 Impressão enviada via rede TCP/IP para ${result.printer.ip}:${result.printer.port}`);
        } else if (result.method === 'virtual') {
          toast(`🎭 Teste simulado em impressora virtual`);
        } else if (result.method === 'local') {
          toast.success(`🖨️ Impressão enviada para impressora local do sistema`);
        }
      } else {
        toast.error(`❌ ${result.error}`);
        
        // Mostrar dicas se disponíveis
        if (result.details?.hints) {
          result.details.hints.forEach((hint: string, index: number) => {
            setTimeout(() => {
              toast(`💡 ${hint}`, { duration: 5000 });
            }, (index + 1) * 1000);
          });
        }
      }
    } catch (error) {
      toast.error("❌ Erro ao testar impressora");
      console.error('Erro:', error);
    } finally {
      setTesting(null);
    }
  };

  // Nova função para testar impressora local diretamente
  const testLocalPrinter = async (printerName: string, printerData?: any) => {
    try {
      toast(`🖨️ Testando impressora local: ${printerName}...`);
      
      const response = await fetch('/api/printers/test-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerName, printerData })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        
        if (result.details) {
          console.log('📊 Detalhes do teste:', result.details);
        }
        
        if (result.thermalInfo) {
          toast(`💡 Impressora térmica detectada - suporta recursos especiais`, { duration: 4000 });
        }
      } else {
        toast.error(`❌ ${result.error}`);
        
        if (result.solution) {
          toast(`💡 ${result.solution}`, { duration: 6000 });
        }
      }
    } catch (error) {
      toast.error("❌ Erro ao testar impressora local");
      console.error('Erro:', error);
    }
  };
  
  // Função de busca de rede removida - agora só usa detecção local

  // Nova função para detectar impressoras locais usando WMIC/CUPS
  const handleDetectLocalPrinters = async () => {
    try {
      setDiscovering(true);
      setShowDiscoverModal(true);
      setDiscoveredPrinters([]);
      
      toast(`🖨️ Detectando impressoras locais do sistema...`);
      
      const response = await fetch('/api/printers/detect-local');
      const result = await response.json();
      
      if (result.success) {
        if (result.printers && result.printers.length > 0) {
          // Converter impressoras locais para formato esperado
          const formattedPrinters = result.printers.map((p: any) => ({
            name: p.name,
            ip: p.port === 'Network' ? 'Local Network' : 'Local',
            port: p.port === 'Network' ? 9100 : 0,
            type: p.type || 'unknown',
            model: p.driver || p.name,
            status: p.status || 'Ready',
            isLocal: true,
            os: result.platform,
            rawData: p
          }));
          
          setDiscoveredPrinters(formattedPrinters);
          toast.success(`✅ ${result.count} impressora(s) local(is) detectada(s) no ${result.platform}!`);
          
          // Mostrar informações adicionais
          if (result.message) {
            toast(result.message);
          }
        } else {
          toast.error(`⚠️ Nenhuma impressora local encontrada no sistema`);
        }
      } else {
        toast.error(`❌ Erro: ${result.error || 'Falha ao detectar impressoras locais'}`);
        
        // Dar dicas baseadas no sistema
        if (result.platform === 'win32') {
          toast(`💡 No Windows, verifique se o serviço de spooler está ativo`);
        } else if (result.platform === 'linux') {
          toast(`💡 No Linux, instale o CUPS: sudo apt-get install cups`);
        } else if (result.platform === 'darwin') {
          toast(`💡 No macOS, verifique as Preferências do Sistema > Impressoras`);
        }
      }
    } catch (error) {
      toast.error('❌ Erro ao detectar impressoras locais');
      console.error('Erro:', error);
    } finally {
      setDiscovering(false);
    }
  };
  
  // Função para escanear IP específico
  const handleScanSpecificIP = async (ip: string, port: number = 9100) => {
    try {
      toast(`🔍 Verificando ${ip}:${port}...`);
      
      const response = await fetch('/api/printers/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, ports: [port] })
      });
      
      const result = await response.json();
      
      if (result.success && result.found) {
        // Adicionar às impressoras descobertas
        setDiscoveredPrinters([...discoveredPrinters, ...result.printers]);
        toast.success(`✅ ${result.message || `Impressora encontrada em ${ip}:${port}!`}`);
      } else {
        toast(`⚠️ ${result.message || `Nenhuma impressora em ${ip}:${port}`}`);
        
        // Se tiver sugestão de porta alternativa
        if (result.alternativePort) {
          toast(`💡 Tente a porta ${result.alternativePort}`);
        }
      }
    } catch (error) {
      toast.error('❌ Erro ao verificar IP');
    }
  };
  
  // Função para testar conexão direta
  const testDirectConnection = async (ip: string, port: number = 9100) => {
    try {
      toast(`🖨️ Testando conexão direta com ${ip}:${port}...`);
      
      const response = await fetch('/api/printers/test-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, port })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Conexão estabelecida! ${result.message}`);
        if (result.details) {
          console.log('📊 Detalhes da conexão:', result.details);
        }
      } else {
        toast.error(`❌ ${result.error}`);
        if (result.solution) {
          toast(`💡 ${result.solution}`);
        }
        if (result.alternativePort) {
          toast(`💡 Tente a porta ${result.alternativePort}`);
        }
        console.error('Detalhes do erro:', result);
      }
    } catch (error) {
      toast.error('❌ Erro ao testar conexão');
      console.error(error);
    }
  };
  
  const addDiscoveredPrinter = async (discoveredPrinter: any) => {
    // Preencher formulário com dados da impressora descoberta
    setFormData({
      name: discoveredPrinter.name,
      ip_address: discoveredPrinter.ip,
      port: String(discoveredPrinter.port),
      type: 'thermal',
      printer_model: discoveredPrinter.model,
      is_main: false,
      active: true,
      sort_order: printers.length
    });
    
    // Fechar modal de descoberta e abrir modal de adição
    setShowDiscoverModal(false);
    setEditingPrinter(null);
    setIsModalOpen(true);
  };

  const openModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ip_address: printer.ip_address,
        port: printer.port,
        type: printer.type,
        printer_model: printer.printer_model || 'Epson TM-T88VI',
        is_main: printer.is_main,
        active: printer.active,
        sort_order: printer.sort_order
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: '',
        ip_address: '',
        port: '9100',
        type: 'thermal',
        printer_model: 'Epson TM-T88VI',
        is_main: false,
        active: true,
        sort_order: printers.length
      });
    }
    setIsModalOpen(true);
  };

  const savePrinter = async () => {
    if (!formData.name || !formData.ip_address) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSaving(true);
      
      const printerData = {
        name: formData.name,
        ip_address: formData.ip_address,
        port: formData.port,
        type: formData.type,
        printer_model: formData.printer_model,
        is_main: formData.is_main,
        active: formData.active,
        sort_order: Math.floor(formData.sort_order),
        connection_status: 'unknown'
      };

      if (editingPrinter) {
        const { error } = await supabase
          .from('printers')
          .update(printerData)
          .eq('id', editingPrinter.id);

        if (error) throw error;
        toast.success("Impressora atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('printers')
          .insert([printerData]);

        if (error) throw error;
        toast.success("Impressora criada com sucesso!");
      }

      setIsModalOpen(false);
      setEditingPrinter(null);
      setFormData({
        name: '',
        ip_address: '',
        port: '9100',
        type: 'thermal',
        printer_model: 'Epson TM-T88VI',
        is_main: false,
        active: true,
        sort_order: 0
      });
      mutate('printers');
    } catch (error) {
      console.error('Error saving printer:', error);
      toast.error("Erro ao salvar impressora");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (printer: Printer) => {
    setDeletePrinter(printer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletePrinter) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('printers')
        .delete()
        .eq('id', deletePrinter.id);

      if (error) throw error;
      
      toast.success("Impressora excluída com sucesso!");
      setIsDeleteModalOpen(false);
      setDeletePrinter(null);
      mutate('printers');
    } catch (error) {
      console.error('Error deleting printer:', error);
      toast.error("Erro ao excluir impressora");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (printer: Printer) => {
    try {
      const { error } = await supabase
        .from('printers')
        .update({ active: !printer.active })
        .eq('id', printer.id);

      if (error) throw error;
      
      toast.success(`Impressora ${!printer.active ? 'ativada' : 'desativada'}`);
      mutate('printers');
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error("Erro ao alterar status");
    }
  };

  const filteredPrinters = printers.filter((printer: Printer) =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.ip_address.includes(searchTerm) ||
    (printer.printer_model && printer.printer_model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getConnectionStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <Signal className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <SignalZero className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <SignalLow className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getConnectionStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-orange-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getConnectionStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Erro';
      default:
        return 'Verificando';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - mantém o original */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <PrinterIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Impressoras</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Pesquisar..."
                  className="w-64 pr-10 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full p-1">
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
              <Button 
                onClick={handleDetectLocalPrinters}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                disabled={discovering}
                title="Detectar impressoras instaladas no Windows"
              >
                {discovering ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Monitor className="h-4 w-4 mr-2" />
                )}
                Detectar Impressoras Locais
              </Button>
              <Button 
                onClick={() => openModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Impressora
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie impressoras térmicas para comandas e cupons
          </p>
        </div>
      </div>

      {/* Content - melhorado */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPrinters.map((printer: Printer) => (
              <div
                key={printer.id} 
                className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-lg ${!printer.active ? 'opacity-60' : ''}`}
              >
                <div className="p-6">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {printer.name}
                        </h3>
                        {printer.is_main && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {printer.printer_model || 'Modelo não especificado'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Network className="h-3 w-3" />
                        <span className="font-mono">{printer.ip_address}:{printer.port}</span>
                      </div>
                    </div>
                    
                    {/* Status Badge e Ações */}
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${getConnectionStatusColor(printer.connection_status)} text-white border-0 flex items-center gap-1`}
                      >
                        {getConnectionStatusIcon(printer.connection_status)}
                        {getConnectionStatusText(printer.connection_status)}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        onClick={() => openModal(printer)}
                        title="Editar impressora"
                      >
                        <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={() => handleDelete(printer)}
                        title="Excluir impressora"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Power Button */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleActive(printer)}
                      className={`w-full py-3 rounded-2xl font-medium transition-all ${
                        printer.active 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {printer.active ? (
                          <>
                            <Power className="h-4 w-4" />
                            Impressora Ativa
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-4 w-4" />
                            Impressora Inativa
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
                      <Badge variant="outline" className="text-xs">
                        {printer.type === 'thermal' ? 'Térmica' :
                         printer.type === 'laser' ? 'Laser' :
                         printer.type === 'inkjet' ? 'Jato de Tinta' : 
                         'Outro'}
                      </Badge>
                    </div>
                    {printer.is_main && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                          Principal
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Last Test Info */}
                  {printer.last_test_at && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1 text-xs">
                          <p className="text-blue-700 dark:text-blue-400 font-medium">
                            Último teste
                          </p>
                          <p className="text-blue-600 dark:text-blue-300 mt-0.5">
                            {new Date(printer.last_test_at).toLocaleString('pt-BR')}
                          </p>
                          {printer.test_result && (
                            <p className="text-blue-500 dark:text-blue-300 mt-1">
                              {printer.test_result}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-200 dark:border-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 dark:hover:bg-orange-900/20 transition-all"
                      onClick={() => testPrinter(printer)}
                      disabled={testing === printer.id || !printer.active}
                    >
                      {testing === printer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Testar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all"
                      onClick={() => checkPrinterStatus(printer.id)}
                      disabled={checkingStatus === printer.id || !printer.active}
                    >
                      {checkingStatus === printer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Activity className="h-4 w-4 mr-2" />
                          Status
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPrinters.length === 0 && (
          <div className="text-center py-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-3xl m-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <PrinterIcon className="h-10 w-10 text-orange-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {searchTerm 
                ? 'Nenhuma impressora encontrada com esses critérios'
                : 'Nenhuma impressora cadastrada'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => openModal()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Impressora
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? 'Editar Impressora' : 'Nova Impressora'}
            </DialogTitle>
            <DialogDescription>
              {editingPrinter 
                ? 'Atualize as informações da impressora'
                : 'Configure uma nova impressora para o sistema'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Impressora Cozinha"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'thermal' | 'laser' | 'inkjet' | 'other') => {
                  setFormData({
                    ...formData, 
                    type: value,
                    printer_model: PRINTER_MODELS[value][0]
                  });
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Térmica</SelectItem>
                  <SelectItem value="laser">Laser</SelectItem>
                  <SelectItem value="inkjet">Jato de Tinta</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="model">Modelo</Label>
              <Select
                value={formData.printer_model}
                onValueChange={(value) => setFormData({...formData, printer_model: value})}
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINTER_MODELS[formData.type].map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ip">Endereço IP *</Label>
                <Input
                  id="ip"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                  placeholder="192.168.1.100"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="port">Porta *</Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: e.target.value})}
                  placeholder="9100"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_main"
                  checked={formData.is_main}
                  onChange={(e) => setFormData({...formData, is_main: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_main" className="cursor-pointer">
                  Impressora Principal
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Ativa
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={savePrinter} 
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a impressora "{deletePrinter?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {saving ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal de Descoberta de Impressoras */}
      <Dialog open={showDiscoverModal} onOpenChange={setShowDiscoverModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {discoveredPrinters.some((p: any) => p.isLocal) ? (
                <>
                  <Monitor className="h-5 w-5 text-green-500" />
                  Impressoras Locais Detectadas
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5 text-blue-500" />
                  Impressoras Descobertas na Rede
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {discovering ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {discoveredPrinters.some((p: any) => p.isLocal)
                      ? 'Detectando impressoras instaladas no sistema...'
                      : 'Procurando impressoras na rede local...'}
                  </span>
                </div>
              ) : (
                <>
                  {discoveredPrinters.length > 0 ? (
                    <span>
                      Encontradas {discoveredPrinters.length} impressoras
                      {discoveredPrinters.some((p: any) => p.isLocal) && (
                        <span className="text-green-600 font-semibold ml-1">
                          (instaladas no {discoveredPrinters[0]?.os || 'sistema'})
                        </span>
                      )}
                    </span>
                  ) : (
                    'Nenhuma impressora encontrada'
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {discoveredPrinters.length > 0 ? (
              <div className="space-y-2">
                {discoveredPrinters.map((printer: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      printer.isLocal 
                        ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20' 
                        : printer.isVirtual 
                        ? 'border-blue-300 dark:border-blue-700' 
                        : 'border-green-300 dark:border-green-700'
                    }`}
                    onClick={() => addDiscoveredPrinter(printer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {printer.name}
                          </h4>
                          {printer.isLocal ? (
                            <>
                              <Badge variant="secondary" className="text-xs bg-purple-500 text-white">
                                <HardDrive className="h-3 w-3 mr-1" />
                                Local
                              </Badge>
                              {printer.type === 'thermal' && (
                                <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                                  Térmica
                                </Badge>
                              )}
                            </>
                          ) : printer.isVirtual ? (
                            <Badge variant="secondary" className="text-xs">
                              Virtual
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-xs bg-orange-500">
                              Local
                            </Badge>
                          )}
                          {printer.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              printer.status === 'Ready' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {printer.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {printer.model || printer.driver || 'Modelo não identificado'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {printer.isLocal ? (
                            <>
                              <span className="text-purple-600">Sistema: {printer.os || 'Local'}</span>
                              {printer.port && printer.port !== '0' && (
                                <span className="ml-2">| Porta: {printer.port}</span>
                              )}
                            </>
                          ) : (
                            `${printer.ip}:${printer.port}`
                          )}
                        </p>
                        {printer.rawData?.detected_via && (
                          <p className="text-xs text-gray-400 mt-1">
                            Detectado via: {printer.rawData.detected_via}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {discovering ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                ) : (
                  <PrinterIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                )}
                <p>
                  {discovering 
                    ? "Procurando impressoras..." 
                    : "Nenhuma impressora encontrada"}
                </p>
                <p className="text-xs mt-2">
                  Certifique-se de que as impressoras estão ligadas e conectadas à rede
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscoverModal(false)}>
              Fechar
            </Button>
            <Button 
              onClick={handleDetectLocalPrinters}
              disabled={discovering}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {discovering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detectando...
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-2" />
                  Detectar Novamente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}