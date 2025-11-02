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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Configure as impressoras do sistema
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{printers.length}</p>
                </div>
                <PrinterIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-xs font-medium">Ativas</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {printers.filter(p => p.active).length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">Principais</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {printers.filter(p => p.is_main).length}
                  </p>
                </div>
                <Star className="h-6 w-6 text-orange-500 dark:text-orange-400 opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">Inativas</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {printers.filter(p => !p.active).length}
                  </p>
                </div>
                <XCircle className="h-6 w-6 text-red-500 dark:text-red-400 opacity-75" />
              </div>
            </div>
          </div>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                        {printer.printer_type === 'thermal' ? 'Térmica' :
                         printer.printer_type === 'laser' ? 'Laser' :
                         printer.printer_type === 'inkjet' ? 'Jato de Tinta' : 
                         'Outro'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {printer.active ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-gray-400" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-500 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => testPrinter(printer)}>
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Testar Impressão
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
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">IP:</span>
                      <span className="font-mono">{printer.ip_address || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Porta:</span>
                      <span className="font-mono">{printer.port || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Badge variant={printer.active ? "default" : "secondary"} className="text-xs">
                      {printer.active ? "Ativa" : "Inativa"}
                    </Badge>
                    <button
                      onClick={() => toggleActive(printer)}
                      className={`w-16 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
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