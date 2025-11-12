"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Square,
  Plus,
  Loader2,
  Save,
  Trash2,
  Pencil,
  Search,
  ChefHat
} from "lucide-react";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [deleteTable, setDeleteTable] = useState<RestaurantTable | null>(null);
  const [saving, setSaving] = useState(false);
  const [numberExists, setNumberExists] = useState(false);
  
  // Form state for single table
  const [formData, setFormData] = useState({
    number: "",
    capacity: 4,
    type: "table" as "table" | "counter",
    active: true
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
          .select('*');

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

  // Sort tables numerically by number
  const sortedTables = [...filteredTables].sort((a, b) => {
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    return numA - numB;
  });

  // Group tables by type
  const tablesByType = {
    mesa: sortedTables.filter(t => t.type === 'table'),
    balcao: sortedTables.filter(t => t.type === 'counter')
  };

  // Calculate next available numbers
  const getNextNumber = (type: 'table' | 'counter') => {
    const filtered = tables.filter(t => t.type === type);
    if (filtered.length === 0) return '1';
    
    const numbers = filtered.map(t => parseInt(t.number) || 0);
    const maxNumber = Math.max(...numbers);
    return (maxNumber + 1).toString();
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
    setNumberExists(false);
    setIsModalOpen(true);
  };

  // Save single table
  const saveTable = async () => {
    try {
      setSaving(true);
      
      // Verificar se o número já existe (exceto quando estiver editando a mesma mesa)
      const existingTable = tables.find(t => 
        t.number === formData.number && 
        (!editingTable || t.id !== editingTable.id)
      );
      
      if (existingTable) {
        toast.error(`Já existe uma ${existingTable.type === 'table' ? 'mesa' : 'posição no balcão'} com o número ${formData.number}!`);
        setSaving(false);
        return;
      }
      
      const tableData = {
        number: formData.number, // Campo number é string no banco de dados
        capacity: formData.type === 'counter' ? 1 : formData.capacity,
        type: formData.type,
        status: 'available',
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
                <Square className="h-5 w-5 text-white" />
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
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                onClick={() => openModal()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Mesa/Balcão
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
            <Square className="h-5 w-5 text-orange-500" />
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
                  <div className="flex flex-col items-center gap-1">
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(table)}
                        className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400 hover:text-orange-500" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTable(table);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Next Table Card */}
            <Card 
              className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                setFormData({
                  number: getNextNumber('table'),
                  capacity: 4,
                  type: 'table',
                  active: true
                });
                setEditingTable(null);
                setNumberExists(false);
                setIsModalOpen(true);
              }}
            >
              <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Adicionar Mesa #{getNextNumber('table')}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Counter Section */}
        <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-500" />
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
                    {table.number}
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    1 lugar
                  </Badge>
                  <div className="flex flex-col items-center gap-1">
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(table)}
                        className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-400 hover:text-orange-500" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTable(table);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Next Counter Card */}
            <Card 
              className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                setFormData({
                  number: getNextNumber('counter'),
                  capacity: 1,
                  type: 'counter',
                  active: true
                });
                setEditingTable(null);
                setNumberExists(false);
                setIsModalOpen(true);
              }}
            >
              <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Adicionar Balcão #{getNextNumber('counter')}
                </span>
              </CardContent>
            </Card>
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
              <Label htmlFor="number">
                Número 
                {numberExists && (
                  <span className="text-red-500 text-xs ml-2">
                    (Número já existe!)
                  </span>
                )}
              </Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => {
                  const newNumber = e.target.value;
                  setFormData({ ...formData, number: newNumber });
                  
                  // Verificar se o número já existe
                  const exists = tables.some(t => 
                    t.number === newNumber && 
                    (!editingTable || t.id !== editingTable.id)
                  );
                  setNumberExists(exists);
                }}
                placeholder="1"
                className={numberExists ? "border-red-500 focus:ring-red-500" : ""}
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
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Ativa
              </Label>
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
              setNumberExists(false);
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={saveTable}
              disabled={saving || !formData.number || numberExists}
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