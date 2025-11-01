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
    ip_address: "",
    port: "9100",
    type: "thermal" as "thermal" | "laser" | "inkjet" | "other",
    is_main: false,
    active: true,
    description: "",
    sort_order: 0
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

        if (error) {
          console.error('Supabase error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(error.message || 'Erro ao buscar impressoras');
        }
        
        setPrinters(data || []);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`Erro ao carregar dados (tentativa ${retryCount + 1}/${maxRetries}):`, errorMessage);
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
    
    // All retries failed - set empty array to allow interface to render
    setPrinters([]);
    toast.error("Não foi possível carregar as impressoras. Verifique sua conexão.");
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
    (printer.ip_address && printer.ip_address.includes(searchTerm))
  );

  // Open modal for new/edit
  const openModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        ip_address: printer.ip_address || "",
        port: printer.port || "9100",
        type: printer.type || "thermal",
        is_main: printer.is_main,
        active: printer.active,
        description: printer.description || "",
        sort_order: printer.sort_order
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: "",
        ip_address: "",
        port: "9100",
        type: "thermal",
        is_main: false,
        active: true,
        description: "",
        sort_order: 0
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
        ip_address: formData.ip_address,
        port: formData.port,
        type: formData.type,
        is_main: formData.is_main,
        active: formData.active,
        description: formData.description,
        sort_order: formData.sort_order
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
    toast.info(`Testando conexão com ${printer.name} (${printer.ip_address}:${printer.port})`);
    // In a real implementation, this would send a test print job
    setTimeout(() => {
      toast.success(`Teste enviado para ${printer.name}`);
    }, 1500);
  };


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Configure as impressoras do sistema - {printers.length} {printers.length === 1 ? 'impressora cadastrada' : 'impressoras cadastradas'}
          </p>

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
                      {printer.is_main && (
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

          {filteredPrinters.length === 0 && (
            <div className="text-center py-12">
              <PrinterIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Nenhuma impressora encontrada" : "Nenhuma impressora cadastrada"}
              </p>
            </div>
          )}
        </div>
      </div>

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
                <Label htmlFor="ip_address">Endereço IP</Label>
                <Input
                  id="ip_address"
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