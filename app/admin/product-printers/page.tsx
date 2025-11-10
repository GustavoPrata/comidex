'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { 
  Printer,
  Search,
  Filter,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Link2,
  Unlink,
  Save,
  Loader2,
  RefreshCw,
  ChevronDown,
  Settings,
  Layers,
  ShoppingBag,
  FileQuestion
} from "lucide-react";

const supabase = createClient();

interface Item {
  id: number;
  name: string;
  category_id: number;
  group_id: number;
  printer_id: number | null;
  active: boolean;
  available: boolean;
  price: number | null;
  quantity: string | null;
}

interface Category {
  id: number;
  name: string;
  group_id: number;
  active: boolean;
}

interface Group {
  id: number;
  name: string;
  type: string;
  active: boolean;
  sort_order: number;
}

interface PrinterItem {
  id: number;
  name: string;
  active: boolean;
  is_main: boolean;
  ip_address?: string;
}

export default function ProductPrintersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrinter, setSelectedPrinter] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-printer' | 'without-printer'>('all');
  
  // Selection states
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkPrinter, setBulkPrinter] = useState('');

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .order('name');
      
      if (itemsError) throw itemsError;
      
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesError) throw categoriesError;
      
      // Load groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('sort_order');
      
      if (groupsError) throw groupsError;
      
      // Load printers
      const { data: printersData, error: printersError } = await supabase
        .from('printers')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      
      if (printersError) throw printersError;
      
      setItems(itemsData || []);
      setCategories(categoriesData || []);
      setGroups(groupsData || []);
      setPrinters(printersData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items
  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Group filter
    const matchesGroup = selectedGroup === 'all' || 
      item.group_id.toString() === selectedGroup;
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      item.category_id.toString() === selectedCategory;
    
    // Printer filter
    const matchesPrinter = selectedPrinter === 'all' || 
      (selectedPrinter === 'none' && !item.printer_id) ||
      (item.printer_id && item.printer_id.toString() === selectedPrinter);
    
    // Status filter
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'with-printer' && item.printer_id) ||
      (filterStatus === 'without-printer' && !item.printer_id);
    
    return matchesSearch && matchesGroup && matchesCategory && matchesPrinter && matchesStatus;
  });

  // Get categories for selected group
  const filteredCategories = selectedGroup === 'all' 
    ? categories 
    : categories.filter(cat => cat.group_id.toString() === selectedGroup);

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all filtered items
  const selectAllFiltered = () => {
    const filteredIds = filteredItems.map(item => item.id);
    setSelectedItems(filteredIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Update single item printer
  const updateItemPrinter = async (itemId: number, printerId: number | null) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('items')
        .update({ printer_id: printerId })
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state
      setItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, printer_id: printerId }
            : item
        )
      );
      
      toast.success('Impressora atualizada!');
    } catch (error) {
      console.error('Error updating printer:', error);
      toast.error('Erro ao atualizar impressora');
    } finally {
      setSaving(false);
    }
  };

  // Bulk update printers
  const bulkUpdatePrinters = async () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }
    
    if (bulkPrinter === '') {
      toast.error('Selecione uma impressora');
      return;
    }
    
    try {
      setSaving(true);
      
      const printerId = bulkPrinter === 'none' ? null : parseInt(bulkPrinter);
      
      const { error } = await supabase
        .from('items')
        .update({ printer_id: printerId })
        .in('id', selectedItems);
      
      if (error) throw error;
      
      // Update local state
      setItems(prev => 
        prev.map(item => 
          selectedItems.includes(item.id)
            ? { ...item, printer_id: printerId }
            : item
        )
      );
      
      toast.success(`${selectedItems.length} produtos atualizados!`);
      setSelectedItems([]);
      setBulkPrinter('');
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Erro ao atualizar produtos');
    } finally {
      setSaving(false);
    }
  };

  // Remove printer from selected items
  const removePrinterFromSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('items')
        .update({ printer_id: null })
        .in('id', selectedItems);
      
      if (error) throw error;
      
      // Update local state
      setItems(prev => 
        prev.map(item => 
          selectedItems.includes(item.id)
            ? { ...item, printer_id: null }
            : item
        )
      );
      
      toast.success(`Impressora removida de ${selectedItems.length} produtos!`);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error removing printer:', error);
      toast.error('Erro ao remover impressora');
    } finally {
      setSaving(false);
    }
  };

  // Apply printer to entire group
  const applyPrinterToGroup = async (groupId: number, printerId: number | null) => {
    try {
      setSaving(true);
      
      const groupItems = items.filter(item => item.group_id === groupId);
      const itemIds = groupItems.map(item => item.id);
      
      if (itemIds.length === 0) {
        toast.error('Nenhum produto neste grupo');
        return;
      }
      
      const { error } = await supabase
        .from('items')
        .update({ printer_id: printerId })
        .in('id', itemIds);
      
      if (error) throw error;
      
      // Update local state
      setItems(prev => 
        prev.map(item => 
          itemIds.includes(item.id)
            ? { ...item, printer_id: printerId }
            : item
        )
      );
      
      toast.success(`${itemIds.length} produtos do grupo atualizados!`);
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Erro ao atualizar grupo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Statistics
  const totalItems = items.length;
  const itemsWithPrinter = items.filter(item => item.printer_id).length;
  const itemsWithoutPrinter = items.filter(item => !item.printer_id).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-orange-500">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Associação Produto-Impressora
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                Configure em qual impressora cada produto será impresso
              </p>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="border-gray-200 dark:border-gray-700/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Produtos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {totalItems}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-700/60 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Com Impressora</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {itemsWithPrinter}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 dark:border-red-700/60 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Sem Impressora</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {itemsWithoutPrinter}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-700/60 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Impressoras</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {printers.length}
                    </p>
                  </div>
                  <Printer className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedGroup} onValueChange={(value) => {
              setSelectedGroup(value);
              setSelectedCategory('all'); // Reset categoria quando mudar o grupo
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={selectedGroup === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedGroup === 'all' ? "Selecione um grupo primeiro" : "Todas as categorias"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as impressoras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as impressoras</SelectItem>
                <SelectItem value="none">Sem impressora</SelectItem>
                {printers.map(printer => (
                  <SelectItem key={printer.id} value={printer.id.toString()}>
                    {printer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="with-printer">Com impressora</SelectItem>
                <SelectItem value="without-printer">Sem impressora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-orange-500 text-white">
                    {selectedItems.length} selecionado(s)
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Select value={bulkPrinter} onValueChange={setBulkPrinter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione impressora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma impressora</SelectItem>
                        {printers.map(printer => (
                          <SelectItem key={printer.id} value={printer.id.toString()}>
                            {printer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      size="sm"
                      onClick={bulkUpdatePrinters}
                      disabled={saving || !bulkPrinter}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Aplicar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={removePrinterFromSelected}
                    disabled={saving}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Remover Impressora
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Limpar Seleção
                </Button>
              </div>
            </div>
          )}

          {/* Selection Actions */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllFiltered}
              >
                Selecionar Todos Filtrados ({filteredItems.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Limpar Seleção
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredItems.length} de {items.length} produtos
            </p>
          </div>

          {/* Items Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3 text-left">
                      <Checkbox
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllFiltered();
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Produto
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Grupo
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categoria
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Impressora Atual
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map(item => {
                    const category = categories.find(c => c.id === item.category_id);
                    const group = groups.find(g => g.id === item.group_id);
                    const printer = item.printer_id 
                      ? printers.find(p => p.id === item.printer_id)
                      : null;
                    
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </span>
                            {!item.active && (
                              <Badge variant="secondary" className="text-xs">
                                Inativo
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {group?.name || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {category?.name || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {printer ? (
                            <div className="flex items-center gap-2">
                              <Printer className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {printer.name}
                              </span>
                              {printer.is_main && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                  Principal
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FileQuestion className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                Sem impressora
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <Select 
                            value={item.printer_id?.toString() || 'none'}
                            onValueChange={(value) => {
                              const printerId = value === 'none' ? null : parseInt(value);
                              updateItemPrinter(item.id, printerId);
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {printers.map(printer => (
                                <SelectItem key={printer.id} value={printer.id.toString()}>
                                  {printer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum produto encontrado com os filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}