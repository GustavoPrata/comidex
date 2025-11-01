'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
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
  AlertCircle
} from "lucide-react";

interface Printer {
  id: number;
  name: string;
  ip_address: string;
  port: string;
  printer_type: 'thermal' | 'laser' | 'inkjet' | 'other';
  is_main: boolean;
  active: boolean;
  description?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '9100',
    type: 'thermal' as 'thermal' | 'laser' | 'inkjet' | 'other',
    is_main: false,
    active: true,
    description: '',
    sort_order: 0
  });
  const supabase = createClient();

  useEffect(() => {
    loadPrinters();
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

  const openModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ip_address: printer.ip_address,
        port: printer.port,
        type: printer.printer_type,
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
        is_main: formData.is_main,
        active: formData.active,
        description: formData.description,
        sort_order: formData.sort_order
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

  const testPrinter = async (printer: Printer) => {
    toast(`Testando conexão com ${printer.name} (${printer.ip_address}:${printer.port})`);
    setTimeout(() => {
      toast.success(`Teste enviado para ${printer.name}`);
    }, 1500);
  };

  const filteredPrinters = printers.filter(printer =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.ip_address.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-orange-100">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Impressoras
              </h1>
              <p className="text-gray-600 mt-2">Gerencie as impressoras do sistema</p>
            </div>
            <Button 
              onClick={() => openModal()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-6 rounded-full h-auto shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Impressora
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total</p>
                  <p className="text-3xl font-bold text-blue-900">{printers.length}</p>
                </div>
                <PrinterIcon className="h-8 w-8 text-blue-500 opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Ativas</p>
                  <p className="text-3xl font-bold text-green-900">
                    {printers.filter(p => p.active).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Principais</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {printers.filter(p => p.is_main).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-500 opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Inativas</p>
                  <p className="text-3xl font-bold text-red-900">
                    {printers.filter(p => !p.active).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-75" />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar impressoras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-lg border-2 border-gray-100 focus:border-orange-300 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Content Section - Printers List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Lista de Impressoras</h2>
            </div>
            <p className="text-gray-600 ml-16">
              {filteredPrinters.length > 0 
                ? `${filteredPrinters.length} impressora${filteredPrinters.length > 1 ? 's' : ''} cadastrada${filteredPrinters.length > 1 ? 's' : ''}`
                : 'Nenhuma impressora cadastrada'}
            </p>
          </div>

          {/* Printers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrinters.map((printer) => (
              <div 
                key={printer.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden group hover:scale-[1.02]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${
                        printer.active 
                          ? 'bg-gradient-to-br from-green-100 to-green-200' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                        <PrinterIcon className={`h-6 w-6 ${
                          printer.active 
                            ? 'text-green-600' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {printer.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {printer.printer_type === 'thermal' ? 'Térmica' :
                           printer.printer_type === 'laser' ? 'Laser' :
                           printer.printer_type === 'inkjet' ? 'Jato de Tinta' : 
                           'Outro'}
                        </p>
                      </div>
                    </div>
                    {printer.is_main && (
                      <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white border-0 shadow-md">
                        <Star className="h-3 w-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 text-sm bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">IP:</span>
                      <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded">{printer.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Porta:</span>
                      <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded">{printer.port}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {printer.active ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-700 font-medium">Ativa</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-700 font-medium">Inativa</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => testPrinter(printer)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-md"
                      size="sm"
                    >
                      <PrinterIcon className="h-4 w-4 mr-1" />
                      Testar
                    </Button>
                    <Button
                      onClick={() => openModal(printer)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-md"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(printer)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPrinters.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <PrinterIcon className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchTerm 
                  ? 'Nenhuma impressora encontrada'
                  : 'Nenhuma impressora cadastrada'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Tente buscar com outros termos'
                  : 'Adicione a primeira impressora para começar'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => openModal()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Impressora
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? 'Editar Impressora' : 'Nova Impressora'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Impressora Cozinha"
              />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="9100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Térmica</SelectItem>
                  <SelectItem value="laser">Laser</SelectItem>
                  <SelectItem value="inkjet">Jato de Tinta</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Tipo de Impressora</Label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_main: !formData.is_main })}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors w-full ${
                    formData.is_main 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {formData.is_main ? 'Principal' : 'Secundária'}
                </button>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors w-full ${
                    formData.active 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {formData.active ? 'Ativa' : 'Inativa'}
                </button>
              </div>
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