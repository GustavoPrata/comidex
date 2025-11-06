'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  Monitor,
  HardDrive,
  Check,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import useSWR, { mutate } from 'swr';

interface Printer {
  id: number;
  name: string;
  ip_address: string;
  port: string;
  type?: 'thermal' | 'laser' | 'inkjet' | 'other';
  printer_model?: string;
  profile_id?: number;
  is_main: boolean;
  is_local: boolean;
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

// SWR fetcher for printer profiles
const profilesFetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('printer_profiles')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

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
  
  // Fetch printer profiles
  const { data: profiles = [], error: profilesError, isLoading: profilesLoading } = useSWR('printer_profiles', profilesFetcher);

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
  const [addingPrinter, setAddingPrinter] = useState<string | null>(null);
  const [addedPrinters, setAddedPrinters] = useState<string[]>([]);
  const [localPrinters, setLocalPrinters] = useState<string[]>([]);
  const [detectingLocalPrinters, setDetectingLocalPrinters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '9100',
    profile_id: null as number | null,
    is_local: false,
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
      
      // Mostrar toast de progresso
      const loadingToast = toast.loading(`🖨️ Conectando com ${printer.name}...`);
      
      const response = await fetch('/api/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId: printer.id })
      });

      const result = await response.json();
      
      // Remover toast de loading
      toast.dismiss(loadingToast);
      
      if (result.success) {
        // Mostrar sucesso com detalhes
        toast.success(`✅ ${result.message}`);
        
        // Revalidar dados para mostrar último teste
        mutate('printers');
        
        // Mostrar detalhes do método de impressão
        if (result.method === 'network') {
          toast.success(`📡 Enviado via TCP/IP para ${result.printer.ip}:${result.printer.port}`);
        } else if (result.method === 'local') {
          toast.success(`💻 Enviado para impressora local Windows`);
        }
        
        // Avisar sobre o cupom de teste
        setTimeout(() => {
          toast('📄 Verifique se o cupom de teste foi impresso corretamente', {
            icon: '🖨️',
            duration: 5000
          });
        }, 1000);
      } else {
        // Mostrar erro detalhado
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
    try {
      setAddingPrinter(discoveredPrinter.name);
      
      // Preparar dados da impressora
      const printerData = {
        name: discoveredPrinter.name,
        ip_address: discoveredPrinter.isLocal ? 'LOCAL' : (discoveredPrinter.ip || 'localhost'),
        port: discoveredPrinter.isLocal ? 'LOCAL' : String(discoveredPrinter.port || '9100'),
        type: discoveredPrinter.type === 'thermal' ? 'thermal' : 'other',
        printer_model: discoveredPrinter.model || discoveredPrinter.driver || 'Detectado automaticamente',
        is_local: discoveredPrinter.isLocal === true,
        active: true,
        sort_order: Math.floor(printers.length),
        connection_status: 'unknown'
      };

      console.log('Adicionando impressora:', printerData);

      // Adicionar ao banco de dados
      const { data, error } = await supabase
        .from('printers')
        .insert([printerData])
        .select();

      if (error) {
        console.error('Erro ao adicionar impressora:', error);
        toast.error(`Erro ao adicionar impressora: ${error.message}`);
        return;
      }

      toast.success(`✅ Impressora "${discoveredPrinter.name}" adicionada com sucesso!`);
      
      // Marcar impressora como adicionada
      setAddedPrinters(prev => [...prev, discoveredPrinter.name]);
      
      // Atualizar lista de impressoras
      mutate('printers');
      
      // Se não houver mais impressoras descobertas, fechar o modal após delay
      if (discoveredPrinters.length <= 1) {
        setTimeout(() => {
          setShowDiscoverModal(false);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Erro ao adicionar impressora:', error);
      toast.error('Erro ao adicionar impressora');
    } finally {
      setAddingPrinter(null);
    }
  };

  // Função para detectar impressoras locais
  const detectLocalPrinters = async () => {
    try {
      setDetectingLocalPrinters(true);
      const response = await fetch('/api/printers/detect-local', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success && data.printers && data.printers.length > 0) {
        setLocalPrinters(data.printers);
        return data.printers;
      } else {
        setLocalPrinters([]);
        return [];
      }
    } catch (error) {
      console.error('Erro ao detectar impressoras locais:', error);
      setLocalPrinters([]);
      return [];
    } finally {
      setDetectingLocalPrinters(false);
    }
  };

  const openModal = async (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ip_address: printer.ip_address || '',
        port: printer.port || '9100',
        profile_id: printer.profile_id || null,
        is_local: printer.is_local || false,
        active: printer.active,
        sort_order: printer.sort_order
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: '',
        ip_address: '',
        port: '9100',
        profile_id: null,
        is_local: false,
        active: true,
        sort_order: printers.length
      });
    }
    
    // Detectar impressoras locais ao abrir o modal
    await detectLocalPrinters();
    setIsModalOpen(true);
  };

  // Função para validar IP
  const isValidIP = (ip: string) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    const parts = ip.split('.');
    return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
  };

  // Função para validar porta
  const isValidPort = (port: string) => {
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
  };

  const savePrinter = async () => {
    // Validação diferente para impressoras locais e de rede
    if (!formData.name) {
      toast.error("Nome da impressora é obrigatório");
      return;
    }
    
    if (!formData.is_local) {
      if (!formData.ip_address) {
        toast.error("Endereço IP é obrigatório para impressoras de rede");
        return;
      }
      
      if (!isValidIP(formData.ip_address)) {
        toast.error("Endereço IP inválido. Use o formato: 192.168.1.100");
        return;
      }
      
      if (!isValidPort(formData.port)) {
        toast.error("Porta inválida. Use valores entre 1 e 65535");
        return;
      }
    }

    try {
      setSaving(true);
      
      // Se não tem nenhuma impressora ou nenhuma é principal, esta será a principal
      const shouldBeMain = !editingPrinter && (printers.length === 0 || !printers.some((p: Printer) => p.is_main));
      
      const printerData = {
        name: formData.name,
        ip_address: formData.is_local ? 'LOCAL' : formData.ip_address,
        port: formData.is_local ? 'LOCAL' : formData.port,
        profile_id: formData.profile_id,
        is_main: shouldBeMain || false,
        is_local: formData.is_local,
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
        if (shouldBeMain) {
          toast("Esta impressora foi definida como principal", { icon: '⭐' });
        }
      }

      setIsModalOpen(false);
      setEditingPrinter(null);
      setFormData({
        name: '',
        ip_address: '',
        port: '9100',
        profile_id: null,
        is_local: false,
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
      
      // Se está deletando a principal, transfere para outra
      if (deletePrinter.is_main && printers.length > 1) {
        const nextMainPrinter = printers.find((p: Printer) => p.id !== deletePrinter.id);
        if (nextMainPrinter) {
          const { error: updateError } = await supabase
            .from('printers')
            .update({ is_main: true })
            .eq('id', nextMainPrinter.id);
            
          if (updateError) throw updateError;
        }
      }
      
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

  const setAsMain = async (printer: Printer) => {
    if (printer.is_main) {
      toast("Esta impressora já é a principal", { icon: '⭐' });
      return;
    }

    try {
      // Primeiro remove o status principal de todas as outras
      const { error: resetError } = await supabase
        .from('printers')
        .update({ is_main: false })
        .neq('id', printer.id);

      if (resetError) throw resetError;

      // Depois define esta como principal
      const { error: setError } = await supabase
        .from('printers')
        .update({ is_main: true })
        .eq('id', printer.id);

      if (setError) throw setError;
      
      toast.success(`${printer.name} definida como impressora principal`);
      mutate('printers');
    } catch (error) {
      console.error('Error setting main printer:', error);
      toast.error("Erro ao definir impressora principal");
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
        return <Wifi className="h-3 w-3" />;
      case 'offline':
        return <WifiOff className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Loader2 className="h-3 w-3 animate-spin" />;
    }
  };

  const getConnectionStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'from-green-600 to-green-700';
      case 'offline':
        return 'from-red-500 to-red-600';
      case 'error':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getConnectionStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Conectada';
      case 'offline':
        return 'Desconectada';
      case 'error':
        return 'Erro';
      default:
        return 'Verificando...';
    }
  };
  
  const getConnectionStatusShortText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'ON';
      case 'offline':
        return 'OFF';
      case 'error':
        return 'ERR';
      default:
        return '...';
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
                variant="outline"
                onClick={handleDetectLocalPrinters}
                className="rounded-full"
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

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie impressoras térmicas para comandas e cupons
          </div>
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
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {printer.printer_model || 'Modelo não especificado'}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {printer.is_local ? (
                          <>
                            <Monitor className="h-3 w-3" />
                            <span className="font-mono">Impressora Local Windows</span>
                          </>
                        ) : (
                          <>
                            <Network className="h-3 w-3" />
                            <span className="font-mono">{printer.ip_address}:{printer.port}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge e Ações */}
                    <div className="flex items-center gap-2">
                      {/* Status Badge Compacto */}
                      <div className={`
                        flex items-center space-x-1 
                        px-2 py-1 
                        bg-gradient-to-r ${getConnectionStatusColor(printer.connection_status)} 
                        text-white rounded-full 
                        shadow-sm
                      `}>
                        {/* Ícone */}
                        {getConnectionStatusIcon(printer.connection_status)}
                        
                        {/* Texto */}
                        <span className="text-xs font-semibold">
                          {getConnectionStatusShortText(printer.connection_status)}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => openModal(printer)}
                        className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(printer)}
                        className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Power Button & Main Printer Button */}
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => toggleActive(printer)}
                      className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                        printer.active 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {printer.active ? (
                          <>
                            <Power className="h-3 w-3" />
                            <span>Ativa</span>
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-3 w-3" />
                            <span>Inativa</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setAsMain(printer)}
                      className={`px-3 py-1.5 rounded-full transition-all ${
                        printer.is_main 
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-sm'
                          : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:text-gray-300'
                      }`}
                      title={printer.is_main ? "Impressora principal" : "Definir como principal"}
                    >
                      <Star className={`h-3.5 w-3.5 ${printer.is_main ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Modelo:</span>
                      <Badge variant="outline" className="text-xs">
                        {printer.printer_model || 'Não especificado'}
                      </Badge>
                    </div>
                  </div>

                  {/* Last Test Info */}
                  {printer.last_test_at && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1 text-xs">
                          <div className="text-blue-700 dark:text-blue-400 font-medium">
                            Último teste
                          </div>
                          <div className="text-blue-600 dark:text-blue-300 mt-0.5">
                            {new Date(printer.last_test_at).toLocaleString('pt-BR')}
                          </div>
                          {printer.test_result && (
                            <div className="text-blue-500 dark:text-blue-300 mt-1">
                              {printer.test_result}
                            </div>
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
              <Label>Tipo de Conexão</Label>
              <div className="flex items-center justify-center space-x-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className={`flex items-center space-x-2 ${!formData.is_local ? 'text-orange-600 dark:text-orange-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  <Network className="h-4 w-4" />
                  <span className="text-sm">Rede</span>
                </div>
                <Switch
                  id="is_local"
                  checked={formData.is_local}
                  onCheckedChange={async (checked) => {
                    setFormData({...formData, is_local: checked});
                    // Detectar impressoras ao mudar para modo local
                    if (checked && localPrinters.length === 0) {
                      await detectLocalPrinters();
                    }
                  }}
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-orange-200 dark:data-[state=unchecked]:bg-orange-900/50"
                />
                <div className={`flex items-center space-x-2 ${formData.is_local ? 'text-orange-600 dark:text-orange-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  <Monitor className="h-4 w-4" />
                  <span className="text-sm">Local</span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="profile">Perfil de Impressora *</Label>
              <Select
                value={formData.profile_id?.toString() || ''}
                onValueChange={(value) => setFormData({...formData, profile_id: parseInt(value)})}
              >
                <SelectTrigger id="profile">
                  <SelectValue placeholder="Selecione um perfil de impressora" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile: any) => (
                    <SelectItem key={profile.id} value={profile.id.toString()}>
                      <div className="flex flex-col">
                        <span>{profile.name}</span>
                        <span className="text-xs text-gray-500">
                          {profile.manufacturer} - {profile.model} ({profile.paper_width}mm)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Configure novos perfis em <a href="/admin/print-config" className="text-orange-500 hover:underline">Configuração de Impressoras</a>
              </p>
            </div>
            
            {formData.is_local ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Selecione a Impressora Local</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={detectLocalPrinters}
                      disabled={detectingLocalPrinters}
                      className="h-7"
                    >
                      {detectingLocalPrinters ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Detectando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Atualizar Lista
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {detectingLocalPrinters ? (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-lg">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-orange-500" />
                      <span className="text-sm text-gray-500">Detectando impressoras locais...</span>
                    </div>
                  ) : localPrinters.length > 0 ? (
                    <Select
                      value={formData.name}
                      onValueChange={(value) => setFormData({...formData, name: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma impressora" />
                      </SelectTrigger>
                      <SelectContent>
                        {localPrinters.map((printer) => (
                          <SelectItem key={printer} value={printer}>
                            <div className="flex items-center space-x-2">
                              <PrinterIcon className="h-4 w-4 text-gray-500" />
                              <span>{printer}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        ⚠️ Nenhuma impressora local detectada. Certifique-se de que:
                      </p>
                      <ul className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 space-y-1 list-disc list-inside">
                        <li>O sistema está rodando no Windows</li>
                        <li>Existem impressoras instaladas no sistema</li>
                        <li>O aplicativo tem permissões para acessá-las</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {formData.name && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      ✅ Impressora selecionada: <strong>{formData.name}</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
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
            )}
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setFormData({...formData, active: !formData.active})}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.active 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {formData.active ? (
                  <>
                    <Power className="h-4 w-4 mr-1.5 inline" />
                    Impressora Ativa
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4 mr-1.5 inline" />
                    Impressora Inativa
                  </>
                )}
              </button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              onClick={savePrinter}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              type="button"
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
            <DialogTitle>
              Impressoras Locais Detectadas
            </DialogTitle>
            <DialogDescription>
              {discovering ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    Detectando impressoras instaladas no sistema...
                  </span>
                </div>
              ) : (
                <>
                  {discoveredPrinters.length > 0 ? (
                    <span>
                      Encontradas {discoveredPrinters.length} impressoras
                      {discoveredPrinters.some((p: any) => p.isLocal) && (
                        <span className="text-orange-600 font-semibold ml-1">
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
                    className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      printer.isLocal 
                        ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20' 
                        : 'border-green-300 dark:border-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {printer.name}
                          </h4>
                          {printer.isLocal ? (
                            <>
                              <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                                <HardDrive className="h-3 w-3 mr-1" />
                                Local
                              </Badge>
                              {printer.printer_model && (
                                <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                                  {printer.printer_model}
                                </Badge>
                              )}
                            </>
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
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {printer.model || printer.driver || 'Modelo não identificado'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {printer.isLocal ? (
                            <>
                              <span className="text-orange-600">Sistema: {printer.os || 'Local'}</span>
                              {printer.port && printer.port !== '0' && (
                                <span className="ml-2">| Porta: {printer.port}</span>
                              )}
                            </>
                          ) : (
                            `${printer.ip}:${printer.port}`
                          )}
                        </div>
                        {printer.rawData?.detected_via && (
                          <div className="text-xs text-gray-400 mt-1">
                            Detectado via: {printer.rawData.detected_via}
                          </div>
                        )}
                      </div>
                      {addedPrinters.includes(printer.name) ? (
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Adicionada
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-500 text-orange-500 hover:bg-orange-50"
                          onClick={() => addDiscoveredPrinter(printer)}
                          disabled={addingPrinter === printer.name}
                        >
                          {addingPrinter === printer.name ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-1" />
                          )}
                          {addingPrinter === printer.name ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                      )}
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
                <div>
                  {discovering 
                    ? "Procurando impressoras..." 
                    : "Nenhuma impressora encontrada"}
                </div>
                <div className="text-xs mt-2">
                  Certifique-se de que as impressoras estão instaladas no Windows
                </div>
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