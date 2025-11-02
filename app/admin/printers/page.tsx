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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Clock
} from "lucide-react";

interface Printer {
  id: number;
  name: string;
  ip_address: string;
  port: string;
  printer_type: 'thermal' | 'laser' | 'inkjet' | 'other';
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
    { value: "Epson TM-T88VI", label: "Epson TM-T88VI", description: "Mais popular em restaurantes, alta velocidade, USB/Ethernet" },
    { value: "Epson TM-T88V", label: "Epson TM-T88V", description: "Versão anterior, muito confiável, USB/Ethernet" },
    { value: "Epson TM-T20X", label: "Epson TM-T20X", description: "Modelo econômico, ideal para pequenos negócios" },
    { value: "Bematech MP-4200 TH", label: "Bematech MP-4200 TH", description: "Nacional, excelente custo-benefício" },
    { value: "Bematech MP-5100 TH", label: "Bematech MP-5100 TH", description: "Nacional, alta performance" },
    { value: "Elgin i9", label: "Elgin i9", description: "Nacional, compacta e eficiente" },
    { value: "Elgin i8", label: "Elgin i8", description: "Nacional, modelo básico confiável" },
    { value: "Star TSP143III", label: "Star TSP143III", description: "Japonesa, design compacto, alta qualidade" },
    { value: "Star TSP654II", label: "Star TSP654II", description: "Japonesa, alta velocidade, Bluetooth/WiFi" },
    { value: "Citizen CT-S310II", label: "Citizen CT-S310II", description: "Japonesa, robusta, ideal para alto volume" },
    { value: "Daruma DR800", label: "Daruma DR800", description: "Nacional, guilhotina automática" },
    { value: "Sweda SI-300S", label: "Sweda SI-300S", description: "Nacional, boa velocidade de impressão" }
  ],
  laser: [
    { value: "HP LaserJet Pro", label: "HP LaserJet Pro", description: "Para relatórios e documentos" },
    { value: "Brother HL-L2350DW", label: "Brother HL-L2350DW", description: "Compacta, WiFi, duplex" }
  ],
  inkjet: [
    { value: "Epson L3250", label: "Epson L3250", description: "Tanque de tinta, econômica" },
    { value: "Canon G3110", label: "Canon G3110", description: "Tanque de tinta, WiFi" }
  ],
  other: [
    { value: "Personalizado", label: "Outro Modelo", description: "Modelo não listado" }
  ]
};

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '9100',
    type: 'thermal' as 'thermal' | 'laser' | 'inkjet' | 'other',
    printer_model: 'Epson TM-T88VI',
    is_main: false,
    active: true,
    description: '',
    sort_order: 0
  });
  const supabase = createClient();

  useEffect(() => {
    loadPrinters();
    // Verificar status das impressoras a cada 30 segundos
    const interval = setInterval(() => {
      checkAllPrintersStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPrinters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading printers:', error);
        toast.error("Erro ao carregar impressoras");
        return;
      }

      setPrinters(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao carregar impressoras");
    } finally {
      setLoading(false);
    }
  };

  const checkAllPrintersStatus = async () => {
    const activePrinters = printers.filter(p => p.active);
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

      // Atualizar status local
      setPrinters(prev => prev.map(p => 
        p.id === printerId 
          ? { ...p, connection_status: result.status }
          : p
      ));
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
      toast(`Enviando teste de impressão para ${printer.name}...`);
      
      const response = await fetch('/api/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId: printer.id })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        // Recarregar para mostrar último teste
        await loadPrinters();
      } else {
        toast.error(`Falha no teste: ${result.error}`);
        console.error('Detalhes do erro:', result.details);
      }
    } catch (error) {
      toast.error("Erro ao testar impressora");
      console.error('Erro:', error);
    } finally {
      setTesting(null);
    }
  };

  const openModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ip_address: printer.ip_address,
        port: printer.port,
        type: printer.printer_type,
        printer_model: printer.printer_model || 'Epson TM-T88VI',
        is_main: printer.is_main,
        active: printer.active,
        description: printer.description || '',
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
        description: '',
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
        printer_type: formData.type,
        printer_model: formData.printer_model,
        is_main: formData.is_main,
        active: formData.active,
        description: formData.description,
        sort_order: formData.sort_order,
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
        description: '',
        sort_order: 0
      });
      loadPrinters();
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
      loadPrinters();
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
      loadPrinters();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error("Erro ao alterar status");
    }
  };

  const filteredPrinters = printers.filter(printer =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.ip_address.includes(searchTerm) ||
    (printer.printer_model && printer.printer_model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getConnectionStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConnectionStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return { text: 'Online', color: 'text-green-600' };
      case 'offline':
        return { text: 'Offline', color: 'text-red-600' };
      case 'error':
        return { text: 'Erro', color: 'text-yellow-600' };
      default:
        return { text: 'Desconhecido', color: 'text-gray-500' };
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          {/* Top Row: Title and Actions */}
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
                onClick={() => openModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Impressora
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie impressoras térmicas para comandas e cupons
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrinters.map((printer) => (
              <Card 
                key={printer.id} 
                className={`border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow ${!printer.active ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {printer.name}
                        {printer.is_main && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            Principal
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                        {printer.printer_model || 'Modelo não especificado'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tipo: {printer.printer_type === 'thermal' ? 'Térmica' :
                         printer.printer_type === 'laser' ? 'Laser' :
                         printer.printer_type === 'inkjet' ? 'Jato de Tinta' : 
                         'Outro'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConnectionStatusIcon(printer.connection_status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-500 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => testPrinter(printer)}
                            disabled={testing === printer.id}
                          >
                            {testing === printer.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Testando...
                              </>
                            ) : (
                              <>
                                <TestTube className="h-4 w-4 mr-2" />
                                Testar Impressão
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => checkPrinterStatus(printer.id)}
                            disabled={checkingStatus === printer.id}
                          >
                            {checkingStatus === printer.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                <Activity className="h-4 w-4 mr-2" />
                                Verificar Status
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModal(printer)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-500"
                            onClick={() => handleDelete(printer)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Connection Info */}
                  <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">IP:</span>
                      <span className="font-mono">{printer.ip_address}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Porta:</span>
                      <span className="font-mono">{printer.port}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`font-medium ${getConnectionStatusText(printer.connection_status).color}`}>
                        {getConnectionStatusText(printer.connection_status).text}
                      </span>
                    </div>
                  </div>

                  {/* Last Test Info */}
                  {printer.last_test_at && (
                    <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1 text-xs">
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            Último teste: {new Date(printer.last_test_at).toLocaleString('pt-BR')}
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

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Badge variant={printer.active ? "default" : "secondary"} className="text-xs">
                      {printer.active ? "Ativa" : "Inativa"}
                    </Badge>
                    <button
                      onClick={() => toggleActive(printer)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        printer.active 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {printer.active ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPrinters.length === 0 && !loading && (
          <div className="text-center py-16">
            <PrinterIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm 
                ? 'Nenhuma impressora encontrada com esses critérios'
                : 'Nenhuma impressora cadastrada ainda'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => openModal()}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Impressora
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? 'Editar Impressora' : 'Nova Impressora'}
            </DialogTitle>
            <DialogDescription>
              Configure uma impressora térmica para comandas e cupons
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Impressora *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Impressora Cozinha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Impressora</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    type: value as any,
                    printer_model: PRINTER_MODELS[value as keyof typeof PRINTER_MODELS][0].value
                  })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermal">Térmica (Cupom)</SelectItem>
                    <SelectItem value="laser">Laser</SelectItem>
                    <SelectItem value="inkjet">Jato de Tinta</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo da Impressora</Label>
              <Select
                value={formData.printer_model}
                onValueChange={(value) => setFormData({ ...formData, printer_model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {PRINTER_MODELS[formData.type].map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-gray-500">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP *</Label>
                <Input
                  id="ip"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                />
                <p className="text-xs text-gray-500">IP da impressora na rede local</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="9100"
                />
                <p className="text-xs text-gray-500">Padrão: 9100 para impressoras de rede</p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p className="font-medium mb-1">Configuração de Rede:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• A impressora deve estar na mesma rede que este servidor</li>
                    <li>• Verifique o IP na configuração da impressora (geralmente no menu ou imprimindo teste)</li>
                    <li>• A porta 9100 é padrão para a maioria das impressoras térmicas de rede</li>
                    <li>• Para USB, use software como "Virtual Printer Port" para criar porta de rede</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_main: !formData.is_main })}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  formData.is_main 
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' 
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                }`}
              >
                {formData.is_main ? (
                  <>
                    <Star className="h-4 w-4" />
                    Impressora Principal
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    Impressora Secundária
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  formData.active 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                }`}
              >
                {formData.active ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Ativa
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Inativa
                  </>
                )}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
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
                description: '',
                sort_order: 0
              });
              setSaving(false);
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={savePrinter}
              disabled={saving || !formData.name || !formData.ip_address}
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

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => setIsDeleteModalOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a impressora "{deletePrinter?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteModalOpen(false);
              setDeletePrinter(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}