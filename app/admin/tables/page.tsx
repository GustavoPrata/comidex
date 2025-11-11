"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  LayoutGrid,
  Plus,
  Users,
  Loader2,
  Save,
  Trash2,
  Pencil,
  MoreVertical,
  Search,
  Utensils
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
import type { RestaurantTable } from "@/types/supabase";

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [deleteTable, setDeleteTable] = useState<RestaurantTable | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state for single table
  const [formData, setFormData] = useState({
    number: "",
    capacity: 4,
    type: "table" as "table" | "counter",
    active: true
  });

  // Form state for batch creation
  const [batchFormData, setBatchFormData] = useState({
    startNumber: "",
    endNumber: "",
    capacity: 4,
    type: "table" as "table" | "counter"
  });

  // Load data with retry logic for reliability
  const loadTables = async () => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*')
          .order('number', { ascending: true });

        if (error) throw error;
        setTables(data || []);
        
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
    toast.error("Erro ao carregar mesas. Por favor, recarregue a página.");
    setLoading(false);
  };

  // Load data on mount with small delay to ensure Supabase is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTables();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter tables by search term
  const filteredTables = tables.filter(table => 
    searchTerm === '' || 
    table.number.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (table.type === 'table' ? 'mesa' : 'balcão').includes(searchTerm.toLowerCase())
  );

  // Group tables by type
  const tablesByType = {
    mesa: filteredTables.filter(t => t.type === 'table'),
    balcao: filteredTables.filter(t => t.type === 'counter')
  };

  // Calculate statistics
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
  const activeCount = tables.filter(t => t.active).length;

  // Open modal for new/edit
  const openModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number.toString(),
        capacity: table.capacity,
        type: table.type,
        active: table.active
      });
    } else {
      setEditingTable(null);
      setFormData({
        number: "",
        capacity: 4,
        type: "table",
        active: true
      });
    }
    setIsModalOpen(true);
  };

  // Save single table
  const saveTable = async () => {
    try {
      setSaving(true);
      
      const tableData = {
        name: formData.type === 'table' ? `Mesa ${formData.number}` : `Balcão ${formData.number}`,
        number: parseInt(formData.number),
        capacity: formData.type === 'counter' ? 1 : formData.capacity,
        type: formData.type,
        active: formData.active
      };

      if (editingTable) {
        // Update
        const { error } = await supabase
          .from('restaurant_tables')
          .update(tableData)
          .eq('id', editingTable.id);

        if (error) throw error;
        toast.success("Mesa atualizada com sucesso!");
      } else {
        // Insert
        const { error } = await supabase
          .from('restaurant_tables')
          .insert(tableData);

        if (error) throw error;
        toast.success("Mesa criada com sucesso!");
      }

      setIsModalOpen(false);
      loadTables();
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error("Erro ao salvar mesa");
    } finally {
      setSaving(false);
    }
  };

  // Save batch tables
  const saveBatchTables = async () => {
    try {
      setSaving(true);
      
      const start = parseInt(batchFormData.startNumber);
      const end = parseInt(batchFormData.endNumber);
      
      if (start > end) {
        toast.error("Número inicial deve ser menor que o final");
        return;
      }

      const newTables = [];
      for (let i = start; i <= end; i++) {
        newTables.push({
          name: batchFormData.type === 'table' ? `Mesa ${i}` : `Balcão ${i}`,
          number: i,
          capacity: batchFormData.type === 'counter' ? 1 : batchFormData.capacity,
          type: batchFormData.type,
          active: true
        });
      }

      const { error } = await supabase
        .from('restaurant_tables')
        .insert(newTables);

      if (error) throw error;
      
      toast.success(`${newTables.length} mesas criadas com sucesso!`);
      setIsBatchModalOpen(false);
      setBatchFormData({
        startNumber: "",
        endNumber: "",
        capacity: 4,
        type: "table"
      });
      loadTables();
    } catch (error) {
      console.error('Error creating batch tables:', error);
      toast.error("Erro ao criar mesas em lote");
    } finally {
      setSaving(false);
    }
  };

  // Delete table
  const handleDelete = async () => {
    if (!deleteTable) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', deleteTable.id);

      if (error) throw error;
      
      toast.success("Mesa excluída com sucesso!");
      setIsDeleteModalOpen(false);
      setDeleteTable(null);
      loadTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error("Erro ao excluir mesa");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const toggleActive = async (table: RestaurantTable) => {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ active: !table.active })
        .eq('id', table.id);

      if (error) throw error;
      
      toast.success(`Mesa ${!table.active ? 'ativada' : 'desativada'}`);
      loadTables();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error("Erro ao alterar status");
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
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mesas e Balcões</h1>
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
                onClick={() => setIsBatchModalOpen(true)}
                className="rounded-full px-6"
              >
                <Users className="h-4 w-4 mr-2" />
                Criação em Lote
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                onClick={() => openModal()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Individual
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-500">
                  {tables.length}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Mesas</p>
              </CardContent>
            </Card>
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-500">
                  {activeCount}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mesas Ativas</p>
              </CardContent>
            </Card>
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-500">
                  {totalCapacity}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Capacidade Total</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Tables Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-orange-500" />
            Mesas ({tablesByType.mesa.length})
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {tablesByType.mesa.map((table) => (
              <Card 
                key={table.id}
                className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 shadow-sm ${!table.active ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    {table.number}
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {table.capacity} lugares
                  </Badge>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => toggleActive(table)}
                      className={`w-14 px-2 py-1 text-[10px] font-medium rounded-full transition-colors ${
                        table.active 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {table.active ? 'Ativa' : 'Inativa'}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-orange-500 transition-colors">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => openModal(table)}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-500"
                          onClick={() => {
                            setDeleteTable(table);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Counter Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Balcão ({tablesByType.balcao.length})
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {tablesByType.balcao.map((table) => (
              <Card 
                key={table.id}
                className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 shadow-sm ${!table.active ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    {table.number.startsWith('10') ? table.number.substring(2) : table.number}
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    1 lugar
                  </Badge>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => toggleActive(table)}
                      className={`w-14 px-2 py-1 text-[10px] font-medium rounded-full transition-colors ${
                        table.active 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {table.active ? 'Ativa' : 'Inativa'}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-orange-500 transition-colors">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => openModal(table)}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-500"
                          onClick={() => {
                            setDeleteTable(table);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Editar Mesa" : "Adicionar Mesa"}</DialogTitle>
            <DialogDescription>
              {editingTable ? "Atualize as informações da mesa" : "Configure uma nova mesa ou balcão"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">
                  Capacidade {formData.type === 'counter' && '(1 lugar fixo)'}
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.type === 'counter' ? 1 : formData.capacity}
                  onChange={(e) => {
                    if (formData.type !== 'counter') {
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                    }
                  }}
                  placeholder="4"
                  disabled={formData.type === 'counter'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "table" | "counter") => {
                    // Se mudar para balcão, força capacidade para 1
                    if (value === 'counter') {
                      setFormData({ ...formData, type: value, capacity: 1 })
                    } else {
                      setFormData({ ...formData, type: value })
                    }
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Mesa</SelectItem>
                    <SelectItem value="counter">Balcão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingTable(null);
              setFormData({
                number: '',
                capacity: 4,
                type: 'table',
                active: true
              });
              setSaving(false);
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={saveTable}
              disabled={saving || !formData.number}
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

      {/* Batch Creation Modal */}
      <Dialog open={isBatchModalOpen} onOpenChange={(open) => setIsBatchModalOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criação em Lote</DialogTitle>
            <DialogDescription>
              Crie múltiplas mesas ou lugares no balcão de uma vez
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-number">Número Inicial</Label>
                <Input
                  id="start-number"
                  type="number"
                  value={batchFormData.startNumber}
                  onChange={(e) => setBatchFormData({ ...batchFormData, startNumber: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-number">Número Final</Label>
                <Input
                  id="end-number"
                  type="number"
                  value={batchFormData.endNumber}
                  onChange={(e) => setBatchFormData({ ...batchFormData, endNumber: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-capacity">
                  Capacidade {batchFormData.type === 'counter' && '(1 lugar fixo)'}
                </Label>
                <Input
                  id="batch-capacity"
                  type="number"
                  value={batchFormData.type === 'counter' ? 1 : batchFormData.capacity}
                  onChange={(e) => {
                    if (batchFormData.type !== 'counter') {
                      setBatchFormData({ ...batchFormData, capacity: parseInt(e.target.value) || 1 })
                    }
                  }}
                  placeholder="4"
                  disabled={batchFormData.type === 'counter'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-type">Tipo</Label>
                <Select
                  value={batchFormData.type}
                  onValueChange={(value: "table" | "counter") => {
                    // Se mudar para balcão, força capacidade para 1
                    if (value === 'counter') {
                      setBatchFormData({ ...batchFormData, type: value, capacity: 1 })
                    } else {
                      setBatchFormData({ ...batchFormData, type: value })
                    }
                  }}
                >
                  <SelectTrigger id="batch-type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Mesa</SelectItem>
                    <SelectItem value="counter">Balcão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBatchModalOpen(false);
              setBatchFormData({
                startNumber: '',
                endNumber: '',
                capacity: 4,
                type: 'table'
              });
              setSaving(false);
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={saveBatchTables}
              disabled={saving || !batchFormData.startNumber || !batchFormData.endNumber}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Mesas
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
              Tem certeza que deseja excluir a {deleteTable?.type === 'table' ? 'mesa' : 'posição do balcão'} #{deleteTable?.number}?
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