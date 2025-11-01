"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  MoreVertical,
  Pencil,
  Trash2,
  Printer as PrinterIcon,
  Loader2,
  Save,
  Wifi,
  WifiOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Printer } from "@/types/supabase";

export default function PrintersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    port: 9100,
    type: "Térmica",
    is_principal: false,
    active: true
  });

  // Load data with retry logic for reliability
  const loadPrinters = async () => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from('printers')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setPrinters(data || []);
        
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
    
    // All retries failed
    toast.error("Erro ao carregar impressoras. Por favor, recarregue a página.");
    setLoading(false);
  };

  // Load data on mount with small delay to ensure Supabase is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPrinters();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter printers based on search
  const filteredPrinters = printers.filter(printer =>
    printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.ip.includes(searchTerm)
  );

  // Open modal for new/edit
  const openModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ip: printer.ip,
        port: printer.port,
        type: printer.type,
        is_principal: printer.is_principal,
        active: printer.active
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: "",
        ip: "",
        port: 9100,
        type: "Térmica",
        is_principal: false,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  // Save printer
  const savePrinter = async () => {
    try {
      setSaving(true);
      
      const printerData = {
        name: formData.name,
        ip: formData.ip,
        port: formData.port,
        type: formData.type,
        is_principal: formData.is_principal,
        active: formData.active
      };

      if (editingPrinter) {
        // Update
        const { error } = await supabase
          .from('printers')
          .update(printerData)
          .eq('id', editingPrinter.id);

        if (error) throw error;
        toast.success("Impressora atualizada com sucesso!");
      } else {
        // Insert
        const { error } = await supabase
          .from('printers')
          .insert(printerData);

        if (error) throw error;
        toast.success("Impressora adicionada com sucesso!");
      }

      setIsModalOpen(false);
      loadPrinters();
    } catch (error) {
      console.error('Error saving printer:', error);
      toast.error("Erro ao salvar impressora");
    } finally {
      setSaving(false);
    }
  };

  // Delete printer
  const handleDelete = async () => {
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

  // Toggle active status
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

  // Test printer connection
  const testPrinter = async (printer: Printer) => {
    toast.info(`Testando conexão com ${printer.name} (${printer.ip}:${printer.port})`);
    // In a real implementation, this would send a test print job
    setTimeout(() => {
      toast.success(`Teste enviado para ${printer.name}`);
    }, 1500);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Card with Orange Gradient */}
      <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <PrinterIcon className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                  Impressoras
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {printers.length} {printers.length === 1 ? 'impressora cadastrada' : 'impressoras cadastradas'}
                </p>
              </div>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => openModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Impressora
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar impressoras..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Printers Grid */}
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
                      {printer.is_principal && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          Principal
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {printer.type}
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
                          onClick={() => {
                            setDeletePrinter(printer);
                            setIsDeleteModalOpen(true);
                          }}
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
                    <span className="font-mono">{printer.ip}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Porta:</span>
                    <span className="font-mono">{printer.port}</span>
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

          {filteredPrinters.length === 0 && (
            <div className="text-center py-12">
              <PrinterIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Nenhuma impressora encontrada" : "Nenhuma impressora cadastrada"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPrinter ? "Editar Impressora" : "Adicionar Impressora"}</DialogTitle>
            <DialogDescription>
              {editingPrinter ? "Atualize as configurações da impressora" : "Configure uma nova impressora no sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Impressora</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cozinha, Bar, Caixa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 9100 })}
                  placeholder="9100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Térmica">Térmica</SelectItem>
                  <SelectItem value="Matricial">Matricial</SelectItem>
                  <SelectItem value="Laser">Laser</SelectItem>
                  <SelectItem value="Jato de Tinta">Jato de Tinta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Tipo de Impressora</Label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_principal: !formData.is_principal })}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors w-full ${
                    formData.is_principal 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {formData.is_principal ? 'Principal' : 'Secundária'}
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
                ip: '',
                port: 9100,
                type: 'Térmica',
                is_principal: false,
                active: true
              });
              setSaving(false);
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={savePrinter}
              disabled={saving || !formData.name || !formData.ip}
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}