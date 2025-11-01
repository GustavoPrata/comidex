"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Settings,
  Printer,
  Loader2,
  Save,
  Filter,
  ChefHat,
  Receipt,
  GlassWater,
  Fish
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();
import type { Item, Group, Printer as PrinterType, Category } from "@/types/supabase";

interface ItemPrintConfig {
  item_id: number;
  printer_configs: {
    cozinha: boolean;
    caixa: boolean;
    bar: boolean;
    sushi: boolean;
  };
}

// Printer types with icons and colors
const PRINTER_TYPES = [
  { id: 'cozinha', label: 'Cozinha', icon: ChefHat, color: 'bg-orange-500' },
  { id: 'caixa', label: 'Caixa', icon: Receipt, color: 'bg-green-500' },
  { id: 'bar', label: 'Bar', icon: GlassWater, color: 'bg-blue-500' },
  { id: 'sushi', label: 'Sushi', icon: Fish, color: 'bg-purple-500' }
];

export default function PrintConfigPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [configs, setConfigs] = useState<Map<number, ItemPrintConfig>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectAllStates, setSelectAllStates] = useState({
    cozinha: false,
    caixa: false,
    bar: false,
    sushi: false
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load items with groups and categories
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(`
          *,
          group:groups(*),
          category:categories(*)
        `)
        .order('name', { ascending: true });

      if (itemsError) throw itemsError;

      // Load groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('sort_order', { ascending: true });

      if (groupsError) throw groupsError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Load printers
      const { data: printersData, error: printersError } = await supabase
        .from('printers')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (printersError) throw printersError;

      // Load existing print configs
      const { data: configData, error: configError } = await supabase
        .from('print_config')
        .select('*')
        .eq('config_type', 'item_printer');

      if (configError && configError.code !== 'PGRST116') throw configError;

      setItems(itemsData || []);
      setGroups(groupsData || []);
      setCategories(categoriesData || []);
      setPrinters(printersData || []);

      // Parse configs
      const configMap = new Map<number, ItemPrintConfig>();
      (itemsData || []).forEach(item => {
        const existingConfig = (configData || []).find(c => 
          c.settings?.item_id === item.id
        );
        
        configMap.set(item.id, {
          item_id: item.id,
          printer_configs: existingConfig?.settings?.printer_configs || {
            cozinha: false,
            caixa: false,
            bar: false,
            sushi: false
          }
        });
      });
      setConfigs(configMap);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search, group and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "all" || 
      item.group_id?.toString() === selectedGroup;
    const matchesCategory = selectedCategory === "all" || 
      item.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesGroup && matchesCategory;
  });

  // Get categories for selected group
  const filteredCategories = selectedGroup === "all" 
    ? categories 
    : categories.filter(cat => cat.group_id?.toString() === selectedGroup);

  // Toggle printer for an item
  const togglePrinter = (itemId: number, printerType: string) => {
    setConfigs(prev => {
      const newConfigs = new Map(prev);
      const config = newConfigs.get(itemId) || {
        item_id: itemId,
        printer_configs: { cozinha: false, caixa: false, bar: false, sushi: false }
      };
      
      config.printer_configs[printerType as keyof typeof config.printer_configs] = 
        !config.printer_configs[printerType as keyof typeof config.printer_configs];
      
      newConfigs.set(itemId, config);
      return newConfigs;
    });
  };

  // Toggle all items for a printer type
  const toggleAllForPrinter = (printerType: string) => {
    const newState = !selectAllStates[printerType as keyof typeof selectAllStates];
    
    setSelectAllStates(prev => ({
      ...prev,
      [printerType]: newState
    }));

    setConfigs(prev => {
      const newConfigs = new Map(prev);
      filteredItems.forEach(item => {
        const config = newConfigs.get(item.id) || {
          item_id: item.id,
          printer_configs: { cozinha: false, caixa: false, bar: false, sushi: false }
        };
        
        config.printer_configs[printerType as keyof typeof config.printer_configs] = newState;
        newConfigs.set(item.id, config);
      });
      return newConfigs;
    });
  };

  // Save all configs
  const saveConfigs = async () => {
    try {
      setSaving(true);

      // Delete existing configs
      await supabase
        .from('print_config')
        .delete()
        .eq('config_type', 'item_printer');

      // Prepare configs to save
      const configsToSave = Array.from(configs.values())
        .filter(config => 
          Object.values(config.printer_configs).some(v => v === true)
        )
        .map(config => ({
          name: `Item ${config.item_id} Print Config`,
          config_type: 'item_printer',
          settings: {
            item_id: config.item_id,
            printer_configs: config.printer_configs
          },
          active: true
        }));

      if (configsToSave.length > 0) {
        const { error } = await supabase
          .from('print_config')
          .insert(configsToSave);

        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error('Error saving configs:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  // Get status badge for item
  const getItemStatus = (itemId: number) => {
    const config = configs.get(itemId);
    if (!config) return null;

    const activeConfigs = Object.entries(config.printer_configs)
      .filter(([_, v]) => v)
      .map(([k, _]) => k);
      
    if (activeConfigs.length === 0) {
      return <Badge variant="secondary" className="text-xs">Nenhum</Badge>;
    }

    if (activeConfigs.length === 4) {
      return <Badge className="bg-green-500 text-white text-xs">Todas</Badge>;
    }

    return activeConfigs.map(printer => {
      const printerInfo = PRINTER_TYPES.find(p => p.id === printer);
      return (
        <Badge key={printer} className={`${printerInfo?.color} text-white text-xs mr-1`}>
          {printerInfo?.label}
        </Badge>
      );
    });
  };

  // Count items for printer
  const countItemsForPrinter = (printerType: string) => {
    return filteredItems.filter(item => {
      const config = configs.get(item.id);
      return config?.printer_configs[printerType as keyof typeof config.printer_configs];
    }).length;
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
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuração de Impressão</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Pesquisar produto..."
                  className="w-64 pr-10 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full p-1">
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
              <Button 
                onClick={saveConfigs}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Configure qual impressora cada item deve usar - {items.length} {items.length === 1 ? 'item configurado' : 'itens configurados'}
          </p>

          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Group Filter */}
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Todos os Grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Grupos</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                    {group.type === 'rodizio' && ' (Rodízio)'}
                    {group.type === 'bebidas' && ' (Bebidas)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={filteredCategories.length === 0}
            >
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={filteredItems.length > 0 && 
                        filteredItems.every(item => {
                          const config = configs.get(item.id);
                          return config && Object.values(config.printer_configs).some(v => v);
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">
                      Selecionar todos os itens
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {filteredItems.length} itens encontrados
                    </Badge>
                  </th>
                  <th className="p-4 text-center">
                    <span className="text-sm font-medium">Grupo / Categoria</span>
                  </th>
                  {PRINTER_TYPES.map(printer => (
                    <th key={printer.id} className="p-4 text-center">
                      <span className="text-sm font-medium">{printer.label}</span>
                    </th>
                  ))}
                  <th className="p-4 text-center">
                    <span className="text-sm font-medium">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const config = configs.get(item.id);
                  
                  return (
                    <tr 
                      key={item.id}
                      className={`border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">
                              {item.quantity && `${item.quantity} • `}
                              {item.price && `R$ ${item.price.toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm">
                          <Badge variant="outline" className="mr-1">
                            {item.group?.name || 'Sem grupo'}
                          </Badge>
                          {item.category && (
                            <Badge variant="secondary">
                              {item.category.name}
                            </Badge>
                          )}
                        </div>
                      </td>
                      {PRINTER_TYPES.map(printer => (
                        <td key={printer.id} className="p-4 text-center">
                          <Checkbox
                            checked={config?.printer_configs[printer.id as keyof typeof config.printer_configs] || false}
                            onCheckedChange={() => togglePrinter(item.id, printer.id)}
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                        </td>
                      ))}
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {getItemStatus(item.id)}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Nenhum item encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>

          {/* Footer Summary */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredItems.length} itens encontrados
            </div>
            <div className="flex gap-4">
              {PRINTER_TYPES.map(printer => (
                <div key={printer.id} className="text-sm">
                  <span className="font-medium">{printer.label}:</span>
                  <Badge variant="outline" className="ml-2">
                    {countItemsForPrinter(printer.id)} itens
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}