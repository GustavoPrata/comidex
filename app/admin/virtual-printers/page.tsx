'use client';

import { useState, useEffect, useRef } from 'react';
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
  Zap,
  Save,
  Copy,
  File,
  X
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface VirtualPrinter {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'printing' | 'error';
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

export default function VirtualPrintersPage() {
  const [printers, setPrinters] = useState<VirtualPrinter[]>([
    {
      id: '1',
      name: 'Virtual Cozinha',
      model: 'Epson TM-T88VI (Virtual)',
      status: 'online',
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
      model: 'Bematech MP-4200 TH (Virtual)',
      status: 'online',
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
      model: 'Elgin i9 (Virtual)',
      status: 'online',
      queue: [],
      config: { ...DEFAULT_CONFIG, drawerKick: true },
      stats: {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        paperUsed: 0,
        uptime: 0
      }
    }
  ]);

  const [selectedPrinter, setSelectedPrinter] = useState<VirtualPrinter | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [processing, setProcessing] = useState<string | null>(null);
  const printPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simular uptime das impressoras
    const interval = setInterval(() => {
      setPrinters(prev => prev.map(p => ({
        ...p,
        stats: {
          ...p.stats,
          uptime: p.stats.uptime + 1
        }
      })));
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const generateReceiptContent = (printer: VirtualPrinter, type: string = 'test'): string => {
    const date = new Date().toLocaleString('pt-BR');
    const config = printer.config;
    
    let content = '';
    const width = config.paperSize === 'thermal-80mm' ? 48 : 32; // caracteres por linha
    
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
              paperUsed: p.stats.paperUsed + 0.3, // 30cm por impressão
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
      format: [80, 297] // Papel térmico 80mm
    });
    
    pdf.setFont('courier');
    pdf.setFontSize(10);
    
    const lines = previewContent.split('\n');
    let y = 10;
    
    lines.forEach(line => {
      pdf.text(line, 5, y);
      y += 4;
    });
    
    pdf.save(`impressao_${Date.now()}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  const updateConfig = (printerId: string, config: PrinterConfig) => {
    setPrinters(prev => prev.map(p => 
      p.id === printerId 
        ? { ...p, config }
        : p
    ));
    setConfigModalOpen(false);
    toast.success('Configurações salvas!');
  };

  const openPreview = (content: string) => {
    setPreviewContent(content);
    setPreviewModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'printing': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'printing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'offline': return <X className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
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
                  </div>
                  <Badge 
                    className={`${getStatusColor(printer.status)} text-white flex items-center gap-1`}
                  >
                    {getStatusIcon(printer.status)}
                    {printer.status}
                  </Badge>
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
                      disabled={processing === printer.id}
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
                      disabled={processing === printer.id}
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
                      disabled={processing === printer.id}
                    >
                      <File className="h-4 w-4 mr-1" />
                      Cupom
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPrinter(printer);
                        setConfigModalOpen(true);
                      }}
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
      </div>

      {/* Config Modal */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configurações - {selectedPrinter?.name}
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros de impressão virtual
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrinter && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="paper">Papel</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tamanho do Papel</Label>
                    <Select
                      value={selectedPrinter.config.paperSize}
                      onValueChange={(value) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { ...selectedPrinter.config, paperSize: value as any }
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
                      value={selectedPrinter.config.dpi.toString()}
                      onValueChange={(value) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { ...selectedPrinter.config, dpi: parseInt(value) }
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
                    <Label>Corte Automático de Papel</Label>
                    <button
                      onClick={() => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          cutPaper: !selectedPrinter.config.cutPaper 
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        selectedPrinter.config.cutPaper ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        selectedPrinter.config.cutPaper ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Beep ao Imprimir</Label>
                    <button
                      onClick={() => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          beep: !selectedPrinter.config.beep 
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        selectedPrinter.config.beep ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        selectedPrinter.config.beep ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Abertura de Gaveta</Label>
                    <button
                      onClick={() => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          drawerKick: !selectedPrinter.config.drawerKick 
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        selectedPrinter.config.drawerKick ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        selectedPrinter.config.drawerKick ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="paper" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Margem Superior (mm)</Label>
                    <Input
                      type="number"
                      value={selectedPrinter.config.topMargin}
                      onChange={(e) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          topMargin: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Margem Inferior (mm)</Label>
                    <Input
                      type="number"
                      value={selectedPrinter.config.bottomMargin}
                      onChange={(e) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          bottomMargin: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Margem Esquerda (mm)</Label>
                    <Input
                      type="number"
                      value={selectedPrinter.config.leftMargin}
                      onChange={(e) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          leftMargin: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Margem Direita (mm)</Label>
                    <Input
                      type="number"
                      value={selectedPrinter.config.rightMargin}
                      onChange={(e) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          rightMargin: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fonte</Label>
                    <Select
                      value={selectedPrinter.config.font}
                      onValueChange={(value) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { ...selectedPrinter.config, font: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="monospace">Monoespaçada</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="sans-serif">Sans-serif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Tamanho da Fonte</Label>
                    <Input
                      type="number"
                      value={selectedPrinter.config.fontSize}
                      onChange={(e) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { 
                          ...selectedPrinter.config, 
                          fontSize: parseInt(e.target.value) || 12
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Charset</Label>
                    <Select
                      value={selectedPrinter.config.charset}
                      onValueChange={(value) => setSelectedPrinter({
                        ...selectedPrinter,
                        config: { ...selectedPrinter.config, charset: value as any }
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
                </div>
                
                <div>
                  <Label>Texto do Rodapé</Label>
                  <Input
                    value={selectedPrinter.config.footerText}
                    onChange={(e) => setSelectedPrinter({
                      ...selectedPrinter,
                      config: { 
                        ...selectedPrinter.config, 
                        footerText: e.target.value
                      }
                    })}
                    placeholder="Ex: Obrigado pela preferência!"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Mostrar Logo</Label>
                  <button
                    onClick={() => setSelectedPrinter({
                      ...selectedPrinter,
                      config: { 
                        ...selectedPrinter.config, 
                        logoEnabled: !selectedPrinter.config.logoEnabled 
                      }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      selectedPrinter.config.logoEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      selectedPrinter.config.logoEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => selectedPrinter && updateConfig(selectedPrinter.id, selectedPrinter.config)}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            ref={printPreviewRef}
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