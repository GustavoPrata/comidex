'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "react-hot-toast";
import {
  Printer as PrinterIcon,
  FileText,
  Download,
  Eye,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Plus,
  Loader2,
  Monitor,
  Wifi,
  WifiOff,
  Zap,
  Save,
  Copy,
  File,
  X,
  Power,
  PowerOff,
  Edit,
  Network,
  Volume2,
  Scissors,
  Package,
  RotateCcw
} from "lucide-react";
import jsPDF from 'jspdf';

interface VirtualPrinter {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  port: string;
  status: 'online' | 'offline' | 'printing' | 'error';
  powered: boolean;
  queue: PrintJob[];
  config: PrinterConfig;
  stats: PrinterStats;
}

interface PrintJob {
  id: string;
  content: string;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'error';
  type: 'receipt' | 'order' | 'report' | 'test';
  copies: number;
}

interface PrinterConfig {
  paperSize: 'thermal-80mm' | 'thermal-58mm' | 'a4' | 'letter';
  dpi: number;
  cutPaper: boolean;
  beep: boolean;
  drawerKick: boolean;
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
  font: 'default' | 'monospace' | 'serif' | 'sans-serif';
  fontSize: number;
  charset: 'utf-8' | 'iso-8859-1' | 'windows-1252';
  logoEnabled: boolean;
  footerText: string;
}

interface PrinterStats {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  paperUsed: number; // em metros
  uptime: number; // em minutos
  lastPrintTime?: Date;
}

const DEFAULT_CONFIG: PrinterConfig = {
  paperSize: 'thermal-80mm',
  dpi: 203,
  cutPaper: true,
  beep: true,
  drawerKick: false,
  topMargin: 10,
  bottomMargin: 10,
  leftMargin: 5,
  rightMargin: 5,
  font: 'monospace',
  fontSize: 12,
  charset: 'utf-8',
  logoEnabled: true,
  footerText: 'Obrigado pela preferência!'
};

const PRINTER_MODELS = [
  "Epson TM-T88VI",
  "Epson TM-T88V",
  "Epson TM-T20X",
  "Bematech MP-4200 TH",
  "Bematech MP-5100 TH",
  "Elgin i9",
  "Elgin i8",
  "Star TSP143III",
  "Star TSP654II",
  "Citizen CT-S310II",
  "Daruma DR800",
  "Sweda SI-300S"
];

// Função para gerar IP local aleatório
const generateLocalIP = () => {
  const subnet = Math.random() > 0.5 ? '192.168' : '10.0';
  const third = Math.floor(Math.random() * 255);
  const fourth = Math.floor(Math.random() * 254) + 1;
  return `${subnet}.${third}.${fourth}`;
};

export default function VirtualPrintersPage() {
  const [printers, setPrinters] = useState<VirtualPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<VirtualPrinter | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<VirtualPrinter | null>(null);
  const [editingPrinter, setEditingPrinter] = useState<VirtualPrinter | null>(null);
  const [tempConfig, setTempConfig] = useState<PrinterConfig | null>(null);
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    model: PRINTER_MODELS[0],
    ipAddress: generateLocalIP(),
    port: '9100'
  });

  // Carregar impressoras do localStorage
  useEffect(() => {
    const savedPrinters = localStorage.getItem('virtualPrinters');
    if (savedPrinters) {
      try {
        const parsed = JSON.parse(savedPrinters);
        setPrinters(parsed.map((p: any) => ({
          ...p,
          queue: p.queue?.map((j: any) => ({
            ...j,
            timestamp: new Date(j.timestamp)
          })) || [],
          stats: {
            ...p.stats,
            lastPrintTime: p.stats?.lastPrintTime ? new Date(p.stats.lastPrintTime) : undefined
          }
        })));
      } catch (e) {
        // Se falhar, criar impressoras padrão
        initializeDefaultPrinters();
      }
    } else {
      initializeDefaultPrinters();
    }
  }, []);

  // Salvar impressoras no localStorage sempre que mudar
  useEffect(() => {
    if (printers.length > 0) {
      localStorage.setItem('virtualPrinters', JSON.stringify(printers));
    }
  }, [printers]);

  // Simular uptime das impressoras
  useEffect(() => {
    const interval = setInterval(() => {
      setPrinters(prev => prev.map(p => ({
        ...p,
        stats: {
          ...p.stats,
          uptime: p.powered ? p.stats.uptime + 1 : p.stats.uptime
        }
      })));
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const initializeDefaultPrinters = () => {
    const defaultPrinters: VirtualPrinter[] = [
      {
        id: '1',
        name: 'Virtual Cozinha',
        model: 'Epson TM-T88VI',
        ipAddress: '192.168.1.101',
        port: '9100',
        status: 'online',
        powered: true,
        queue: [],
        config: { ...DEFAULT_CONFIG },
        stats: {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          paperUsed: 0,
          uptime: 0
        }
      },
      {
        id: '2',
        name: 'Virtual Bar',
        model: 'Bematech MP-4200 TH',
        ipAddress: '192.168.1.102',
        port: '9100',
        status: 'online',
        powered: true,
        queue: [],
        config: { ...DEFAULT_CONFIG },
        stats: {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          paperUsed: 0,
          uptime: 0
        }
      },
      {
        id: '3',
        name: 'Virtual Caixa',
        model: 'Elgin i9',
        ipAddress: '192.168.1.103',
        port: '9100',
        status: 'online',
        powered: true,
        queue: [],
        config: { ...DEFAULT_CONFIG, drawerKick: true },
        stats: {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          paperUsed: 0,
          uptime: 0
        }
      },
      {
        id: '4',
        name: 'Virtual Sushi Bar',
        model: 'Star TSP143III',
        ipAddress: '192.168.1.104',
        port: '9100',
        status: 'online',
        powered: true,
        queue: [],
        config: { ...DEFAULT_CONFIG },
        stats: {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          paperUsed: 0,
          uptime: 0
        }
      }
    ];
    setPrinters(defaultPrinters);
  };

  const createPrinter = () => {
    if (!newPrinter.name.trim()) {
      toast.error('Digite o nome da impressora');
      return;
    }
    
    if (!newPrinter.ipAddress.trim()) {
      toast.error('Digite o endereço IP');
      return;
    }

    // Verificar se IP já existe
    if (printers.some(p => p.ipAddress === newPrinter.ipAddress && p.port === newPrinter.port)) {
      toast.error('Já existe uma impressora com este IP e porta');
      return;
    }

    const printer: VirtualPrinter = {
      id: Date.now().toString(),
      name: newPrinter.name,
      model: newPrinter.model,
      ipAddress: newPrinter.ipAddress,
      port: newPrinter.port,
      status: 'offline',
      powered: false,
      queue: [],
      config: { ...DEFAULT_CONFIG },
      stats: {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        paperUsed: 0,
        uptime: 0
      }
    };

    setPrinters(prev => [...prev, printer]);
    setCreateModalOpen(false);
    setNewPrinter({
      name: '',
      model: PRINTER_MODELS[0],
      ipAddress: generateLocalIP(),
      port: '9100'
    });
    toast.success('Impressora virtual criada!');
  };

  const deletePrinter = (printer: VirtualPrinter) => {
    setPrinterToDelete(printer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (printerToDelete) {
      setPrinters(prev => prev.filter(p => p.id !== printerToDelete.id));
      toast.success('Impressora virtual excluída');
      setDeleteModalOpen(false);
      setPrinterToDelete(null);
    }
  };

  const togglePower = (printer: VirtualPrinter) => {
    setPrinters(prev => prev.map(p => 
      p.id === printer.id 
        ? {
            ...p,
            powered: !p.powered,
            status: !p.powered ? 'online' : 'offline',
            stats: {
              ...p.stats,
              uptime: !p.powered ? 0 : p.stats.uptime
            }
          }
        : p
    ));
    
    toast.success(`Impressora ${!printer.powered ? 'ligada' : 'desligada'}`);
  };

  const generateReceiptContent = (printer: VirtualPrinter, type: string = 'test'): string => {
    const date = new Date().toLocaleString('pt-BR');
    const config = printer.config;
    
    let content = '';
    const width = config.paperSize === 'thermal-80mm' ? 48 : 32;
    
    const center = (text: string) => {
      const padding = Math.floor((width - text.length) / 2);
      return ' '.repeat(padding) + text;
    };
    
    const line = '='.repeat(width);
    const dashLine = '-'.repeat(width);
    
    // Header
    if (config.logoEnabled) {
      content += center('COMIDEX RESTAURANT') + '\n';
      content += center('Comida Japonesa Premium') + '\n';
      content += line + '\n';
    }
    
    // Info da impressora virtual
    content += `[Virtual: ${printer.ipAddress}:${printer.port}]\n`;
    content += dashLine + '\n';
    
    // Tipo de documento
    switch (type) {
      case 'order':
        content += center('PEDIDO #' + Math.floor(Math.random() * 10000)) + '\n';
        content += dashLine + '\n';
        content += `Mesa: 12\n`;
        content += `Garçom: João Silva\n`;
        content += `Data: ${date}\n`;
        content += dashLine + '\n';
        content += 'ITENS:\n';
        content += '2x Sushi Combo Premium........R$ 89,00\n';
        content += '1x Sashimi Salmão.............R$ 45,00\n';
        content += '2x Refrigerante................R$ 8,00\n';
        content += '1x Hot Roll....................R$ 35,00\n';
        content += dashLine + '\n';
        content += 'SUBTOTAL:....................R$ 185,00\n';
        content += 'SERVIÇO 10%:..................R$ 18,50\n';
        content += line + '\n';
        content += 'TOTAL:.......................R$ 203,50\n';
        break;
        
      case 'receipt':
        content += center('CUPOM FISCAL') + '\n';
        content += center('NÃO É DOCUMENTO FISCAL') + '\n';
        content += dashLine + '\n';
        content += `CNPJ: 12.345.678/0001-90\n`;
        content += `IE: 123.456.789.012\n`;
        content += `Data: ${date}\n`;
        content += dashLine + '\n';
        content += 'DESCRIÇÃO         QTD   UN   TOTAL\n';
        content += 'Combo Especial     2  89,00  178,00\n';
        content += 'Bebida             3   8,00   24,00\n';
        content += dashLine + '\n';
        content += 'TOTAL:                      R$ 202,00\n';
        content += 'Dinheiro:                   R$ 250,00\n';
        content += 'Troco:                      R$ 48,00\n';
        break;
        
      case 'report':
        content += center('RELATÓRIO DE VENDAS') + '\n';
        content += center(date) + '\n';
        content += line + '\n';
        content += 'Total de Pedidos:..............127\n';
        content += 'Ticket Médio:..............R$ 85,50\n';
        content += 'Total do Dia:...........R$ 10.858,50\n';
        content += dashLine + '\n';
        content += 'FORMAS DE PAGAMENTO:\n';
        content += 'Dinheiro:...............R$ 3.250,00\n';
        content += 'Cartão Crédito:.........R$ 5.608,50\n';
        content += 'Cartão Débito:..........R$ 2.000,00\n';
        break;
        
      default: // test
        content += center('TESTE DE IMPRESSÃO') + '\n';
        content += line + '\n';
        content += `Impressora: ${printer.name}\n`;
        content += `Modelo: ${printer.model}\n`;
        content += `IP: ${printer.ipAddress}\n`;
        content += `Porta: ${printer.port}\n`;
        content += `Status: ${printer.status.toUpperCase()}\n`;
        content += `Data/Hora: ${date}\n`;
        content += dashLine + '\n';
        content += `Configurações:\n`;
        content += `- Papel: ${config.paperSize}\n`;
        content += `- DPI: ${config.dpi}\n`;
        content += `- Charset: ${config.charset}\n`;
        content += `- Fonte: ${config.font}\n`;
        content += `- Tamanho: ${config.fontSize}pt\n`;
        content += `- Corte automático: ${config.cutPaper ? 'SIM' : 'NÃO'}\n`;
        content += `- Abertura gaveta: ${config.drawerKick ? 'SIM' : 'NÃO'}\n`;
        content += dashLine + '\n';
        content += center('Impressão funcionando') + '\n';
        content += center('corretamente!') + '\n';
    }
    
    // Footer
    content += line + '\n';
    if (config.footerText) {
      content += center(config.footerText) + '\n';
    }
    content += center('www.comidex.com.br') + '\n';
    
    // Simular corte de papel
    if (config.cutPaper) {
      content += '\n' + center('[PAPEL CORTADO]') + '\n';
    }
    
    return content;
  };

  const testPrint = async (printer: VirtualPrinter, type: string = 'test') => {
    if (!printer.powered) {
      toast.error('Impressora desligada! Ligue primeiro.');
      return;
    }
    
    setProcessing(printer.id);
    
    // Simular processo de impressão
    const job: PrintJob = {
      id: Date.now().toString(),
      content: generateReceiptContent(printer, type),
      timestamp: new Date(),
      status: 'printing',
      type: type as any,
      copies: 1
    };
    
    // Atualizar status da impressora
    setPrinters(prev => prev.map(p => 
      p.id === printer.id 
        ? {
            ...p,
            status: 'printing',
            queue: [...p.queue, job]
          }
        : p
    ));
    
    // Simular tempo de impressão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Marcar como concluído
    setPrinters(prev => prev.map(p => 
      p.id === printer.id 
        ? {
            ...p,
            status: 'online',
            queue: p.queue.map(j => 
              j.id === job.id 
                ? { ...j, status: 'completed' }
                : j
            ),
            stats: {
              ...p.stats,
              totalJobs: p.stats.totalJobs + 1,
              successfulJobs: p.stats.successfulJobs + 1,
              paperUsed: p.stats.paperUsed + 0.3,
              lastPrintTime: new Date()
            }
          }
        : p
    ));
    
    // Feedback
    if (printer.config.beep) {
      // Simular beep
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAEisAAABAAgAZGF0YQoGAACBhYmLjo+');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }
    
    toast.success(`Impressão enviada para ${printer.name}!`);
    setProcessing(null);
  };

  const clearQueue = (printerId: string) => {
    setPrinters(prev => prev.map(p => 
      p.id === printerId 
        ? { ...p, queue: [] }
        : p
    ));
    toast.success('Fila de impressão limpa!');
  };

  const exportToPDF = async () => {
    if (!previewContent) return;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 297]
    });
    
    pdf.setFont('courier');
    pdf.setFontSize(10);
    
    const lines = previewContent.split('\n');
    let y = 10;
    
    lines.forEach(line => {
      if (y > 280) {
        pdf.addPage();
        y = 10;
      }
      pdf.text(line, 5, y);
      y += 4;
    });
    
    pdf.save(`impressao_${Date.now()}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  const updatePrinter = () => {
    if (!editingPrinter) return;
    
    // Verificar duplicação de IP/porta
    const duplicate = printers.find(p => 
      p.id !== editingPrinter.id && 
      p.ipAddress === editingPrinter.ipAddress && 
      p.port === editingPrinter.port
    );
    
    if (duplicate) {
      toast.error('Já existe outra impressora com este IP e porta');
      return;
    }
    
    // Atualizar impressora com config temporária se houver
    const updatedPrinter = tempConfig 
      ? { ...editingPrinter, config: tempConfig }
      : editingPrinter;
    
    setPrinters(prev => prev.map(p => 
      p.id === editingPrinter.id ? updatedPrinter : p
    ));
    
    setConfigModalOpen(false);
    setEditingPrinter(null);
    setTempConfig(null);
    toast.success('Impressora atualizada!');
  };

  const openPreview = (content: string) => {
    setPreviewContent(content);
    setPreviewModalOpen(true);
  };

  const getStatusColor = (status: string, powered: boolean) => {
    if (!powered) return 'bg-gray-500';
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'printing': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string, powered: boolean) => {
    if (!powered) return <PowerOff className="h-4 w-4" />;
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'printing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Abrir modal de configuração
  const openConfigModal = (printer: VirtualPrinter, editMode: boolean = false) => {
    if (editMode) {
      setEditingPrinter(printer);
      setTempConfig(printer.config);
    } else {
      setSelectedPrinter(printer);
      setTempConfig(printer.config);
    }
    setConfigModalOpen(true);
  };

  // Salvar apenas configurações
  const saveConfig = () => {
    if (!tempConfig) return;
    
    if (selectedPrinter) {
      setPrinters(prev => prev.map(p => 
        p.id === selectedPrinter.id 
          ? { ...p, config: tempConfig }
          : p
      ));
      toast.success('Configurações salvas!');
    }
    
    setConfigModalOpen(false);
    setSelectedPrinter(null);
    setEditingPrinter(null);
    setTempConfig(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Impressoras Virtuais
              </h1>
              <Badge variant="outline" className="ml-2">
                Simulador
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (confirm('Isso irá resetar todas as impressoras virtuais para o padrão (incluindo Sushi Bar). Continuar?')) {
                    localStorage.removeItem('virtualPrinters');
                    initializeDefaultPrinters();
                    toast.success('Impressoras virtuais resetadas com sucesso!');
                  }
                }}
                variant="outline"
                className="rounded-full"
                title="Resetar impressoras virtuais para o padrão"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Impressora Virtual
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Simule impressões térmicas profissionais para testes e desenvolvimento
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {printers.map(printer => (
            <Card key={printer.id} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{printer.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {printer.model}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Network className="h-3 w-3" />
                      <span>{printer.ipAddress}:{printer.port}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge 
                      className={`${getStatusColor(printer.status, printer.powered)} text-white flex items-center gap-1`}
                    >
                      {getStatusIcon(printer.status, printer.powered)}
                      {printer.powered ? printer.status : 'offline'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      onClick={() => openConfigModal(printer, true)}
                      title="Editar impressora"
                    >
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => deletePrinter(printer)}
                      title="Excluir impressora"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Power Button */}
                <div className="mb-4">
                  <button
                    onClick={() => togglePower(printer)}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      printer.powered 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {printer.powered ? (
                        <>
                          <Power className="h-4 w-4" />
                          Ligada
                        </>
                      ) : (
                        <>
                          <PowerOff className="h-4 w-4" />
                          Desligada
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs">
                    <span className="text-gray-500">Total Jobs:</span>
                    <p className="font-semibold">{printer.stats.totalJobs}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Sucesso:</span>
                    <p className="font-semibold text-green-600">
                      {printer.stats.successfulJobs}
                    </p>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Papel usado:</span>
                    <p className="font-semibold">{printer.stats.paperUsed.toFixed(1)}m</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Uptime:</span>
                    <p className="font-semibold">{printer.stats.uptime}min</p>
                  </div>
                </div>

                {/* Config Info */}
                <div className="text-xs space-y-1 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between">
                    <span>Papel:</span>
                    <span className="font-medium">{printer.config.paperSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DPI:</span>
                    <span className="font-medium">{printer.config.dpi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Corte:</span>
                    <span className="font-medium">
                      {printer.config.cutPaper ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gaveta:</span>
                    <span className="font-medium">
                      {printer.config.drawerKick ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {/* Queue */}
                {printer.queue.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Fila de Impressão:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => clearQueue(printer.id)}
                        className="h-6 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {printer.queue.slice(-3).map(job => (
                        <div 
                          key={job.id} 
                          className="flex items-center justify-between text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <span>{job.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPrint(printer, 'test')}
                      disabled={processing === printer.id || !printer.powered}
                    >
                      {processing === printer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <PrinterIcon className="h-4 w-4 mr-1" />
                          Teste
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPrint(printer, 'order')}
                      disabled={processing === printer.id || !printer.powered}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Pedido
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testPrint(printer, 'receipt')}
                      disabled={processing === printer.id || !printer.powered}
                    >
                      <File className="h-4 w-4 mr-1" />
                      Cupom
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfigModal(printer, false)}
                      disabled={!printer.powered}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Config
                    </Button>
                  </div>
                  {printer.queue.length > 0 && (
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => openPreview(
                        printer.queue[printer.queue.length - 1].content
                      )}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Última Impressão
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {printers.length === 0 && (
          <div className="text-center py-16">
            <Monitor className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              Nenhuma impressora virtual criada
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Impressora Virtual
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => {
        setCreateModalOpen(open);
        if (!open) {
          // Reset form when closing
          setNewPrinter({
            name: '',
            model: PRINTER_MODELS[0],
            ipAddress: generateLocalIP(),
            port: '9100'
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Impressora Virtual</DialogTitle>
            <DialogDescription>
              Crie uma nova impressora virtual para testes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="printer-name">Nome da Impressora *</Label>
              <Input
                id="printer-name"
                value={newPrinter.name}
                onChange={(e) => setNewPrinter(prev => ({...prev, name: e.target.value}))}
                placeholder="Ex: Virtual Delivery"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="printer-model">Modelo</Label>
              <Select
                value={newPrinter.model}
                onValueChange={(value) => setNewPrinter(prev => ({...prev, model: value}))}
              >
                <SelectTrigger id="printer-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINTER_MODELS.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="printer-ip">Endereço IP *</Label>
              <div className="flex gap-2">
                <Input
                  id="printer-ip"
                  value={newPrinter.ipAddress}
                  onChange={(e) => setNewPrinter(prev => ({...prev, ipAddress: e.target.value}))}
                  placeholder="192.168.1.100"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewPrinter(prev => ({...prev, ipAddress: generateLocalIP()}))}
                  title="Gerar IP aleatório"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="printer-port">Porta</Label>
              <Input
                id="printer-port"
                value={newPrinter.port}
                onChange={(e) => setNewPrinter(prev => ({...prev, port: e.target.value}))}
                placeholder="9100"
              />
              <p className="text-xs text-gray-500">Porta padrão: 9100</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCreateModalOpen(false);
                setNewPrinter({
                  name: '',
                  model: PRINTER_MODELS[0],
                  ipAddress: generateLocalIP(),
                  port: '9100'
                });
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={createPrinter}
              disabled={!newPrinter.name || !newPrinter.ipAddress}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Config Modal */}
      <Dialog open={configModalOpen} onOpenChange={(open) => {
        if (!open) {
          setConfigModalOpen(false);
          setEditingPrinter(null);
          setSelectedPrinter(null);
          setTempConfig(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? 'Editar Impressora Virtual' : 'Configurações de Impressão'}
            </DialogTitle>
            <DialogDescription>
              {editingPrinter 
                ? 'Edite as informações e configurações da impressora'
                : 'Ajuste os parâmetros de impressão'}
            </DialogDescription>
          </DialogHeader>
          
          {(editingPrinter || selectedPrinter) && tempConfig && (
            <Tabs defaultValue={editingPrinter ? "info" : "general"} className="w-full">
              <TabsList className={`grid w-full ${editingPrinter ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {editingPrinter && <TabsTrigger value="info">Informações</TabsTrigger>}
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="paper">Papel</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>
              
              {editingPrinter && (
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div>
                    <Label>Nome da Impressora</Label>
                    <Input
                      value={editingPrinter.name}
                      onChange={(e) => setEditingPrinter({
                        ...editingPrinter,
                        name: e.target.value
                      })}
                      placeholder="Nome da impressora"
                    />
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Select
                      value={editingPrinter.model}
                      onValueChange={(value) => setEditingPrinter({
                        ...editingPrinter,
                        model: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRINTER_MODELS.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Endereço IP</Label>
                    <Input
                      value={editingPrinter.ipAddress}
                      onChange={(e) => setEditingPrinter({
                        ...editingPrinter,
                        ipAddress: e.target.value
                      })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label>Porta</Label>
                    <Input
                      value={editingPrinter.port}
                      onChange={(e) => setEditingPrinter({
                        ...editingPrinter,
                        port: e.target.value
                      })}
                      placeholder="9100"
                    />
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tamanho do Papel</Label>
                    <Select
                      value={tempConfig.paperSize}
                      onValueChange={(value) => setTempConfig({
                        ...tempConfig,
                        paperSize: value as any
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal-80mm">Térmica 80mm</SelectItem>
                        <SelectItem value="thermal-58mm">Térmica 58mm</SelectItem>
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="letter">Carta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>DPI (Resolução)</Label>
                    <Select
                      value={tempConfig.dpi.toString()}
                      onValueChange={(value) => setTempConfig({
                        ...tempConfig,
                        dpi: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="203">203 DPI (Padrão)</SelectItem>
                        <SelectItem value="300">300 DPI (Alta)</SelectItem>
                        <SelectItem value="600">600 DPI (Muito Alta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="cutPaper">Corte Automático</Label>
                    </div>
                    <Switch
                      id="cutPaper"
                      checked={tempConfig.cutPaper}
                      onCheckedChange={(checked) => setTempConfig({
                        ...tempConfig,
                        cutPaper: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="beep">Beep ao Imprimir</Label>
                    </div>
                    <Switch
                      id="beep"
                      checked={tempConfig.beep}
                      onCheckedChange={(checked) => setTempConfig({
                        ...tempConfig,
                        beep: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="drawerKick">Abrir Gaveta</Label>
                    </div>
                    <Switch
                      id="drawerKick"
                      checked={tempConfig.drawerKick}
                      onCheckedChange={(checked) => setTempConfig({
                        ...tempConfig,
                        drawerKick: checked
                      })}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="paper" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Margem Superior (mm)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[tempConfig.topMargin]}
                        onValueChange={([value]) => setTempConfig({
                          ...tempConfig,
                          topMargin: value
                        })}
                        min={0}
                        max={30}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{tempConfig.topMargin}mm</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Margem Inferior (mm)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[tempConfig.bottomMargin]}
                        onValueChange={([value]) => setTempConfig({
                          ...tempConfig,
                          bottomMargin: value
                        })}
                        min={0}
                        max={30}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{tempConfig.bottomMargin}mm</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Margem Esquerda (mm)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[tempConfig.leftMargin]}
                        onValueChange={([value]) => setTempConfig({
                          ...tempConfig,
                          leftMargin: value
                        })}
                        min={0}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{tempConfig.leftMargin}mm</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Margem Direita (mm)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[tempConfig.rightMargin]}
                        onValueChange={([value]) => setTempConfig({
                          ...tempConfig,
                          rightMargin: value
                        })}
                        min={0}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{tempConfig.rightMargin}mm</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fonte</Label>
                    <Select
                      value={tempConfig.font}
                      onValueChange={(value) => setTempConfig({
                        ...tempConfig,
                        font: value as any
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="sans-serif">Sans-serif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Tamanho da Fonte</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[tempConfig.fontSize]}
                        onValueChange={([value]) => setTempConfig({
                          ...tempConfig,
                          fontSize: value
                        })}
                        min={8}
                        max={24}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{tempConfig.fontSize}pt</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Charset</Label>
                  <Select
                    value={tempConfig.charset}
                    onValueChange={(value) => setTempConfig({
                      ...tempConfig,
                      charset: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utf-8">UTF-8</SelectItem>
                      <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                      <SelectItem value="windows-1252">Windows-1252</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="logoEnabled">Exibir Logo</Label>
                  <Switch
                    id="logoEnabled"
                    checked={tempConfig.logoEnabled}
                    onCheckedChange={(checked) => setTempConfig({
                      ...tempConfig,
                      logoEnabled: checked
                    })}
                  />
                </div>
                
                <div>
                  <Label>Texto do Rodapé</Label>
                  <Input
                    value={tempConfig.footerText}
                    onChange={(e) => setTempConfig({
                      ...tempConfig,
                      footerText: e.target.value
                    })}
                    placeholder="Mensagem personalizada no rodapé"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setConfigModalOpen(false);
              setEditingPrinter(null);
              setSelectedPrinter(null);
              setTempConfig(null);
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                if (editingPrinter) {
                  updatePrinter();
                } else if (selectedPrinter) {
                  saveConfig();
                }
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Impressora Virtual</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a impressora "{printerToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPrinterToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview da Impressão</DialogTitle>
            <DialogDescription>
              Visualização do documento como seria impresso
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className="bg-white p-4 rounded border-2 border-dashed border-gray-300 font-mono text-xs whitespace-pre overflow-x-auto max-h-[60vh] overflow-y-auto"
            style={{ fontFamily: 'monospace', lineHeight: '1.4' }}
          >
            {previewContent}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(previewContent);
                toast.success('Copiado para área de transferência!');
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}