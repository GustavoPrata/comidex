"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Plus, 
  Copy,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Tag,
  Gift,
  Percent,
  ShoppingBag,
  Clock,
  Calendar,
  Users,
  Package,
  X,
  Check,
  Filter,
  Image as ImageIcon
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getIconByName } from "@/lib/menu-icons-library";

const supabase = createClient();

type PromotionType = 'free_item' | 'group_discount' | 'buy_x_get_y' | 'item_discount';

interface PromotionConfig {
  freeItems?: number[];
  groupId?: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  targetGender?: 'all' | 'male' | 'female';
  buyQuantity?: number;
  getQuantity?: number;
  itemId?: number;
  itemIds?: number[];
  discountPercentage?: number;
  fixedPrice?: number;
}

interface Promotion {
  id: number;
  name: string;
  type: PromotionType;
  weekdays: number[];
  config: PromotionConfig;
  active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

const weekDays = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" }
];

const promotionTypes = [
  { value: 'free_item', label: 'Item Grátis', icon: Gift, color: 'bg-green-500' },
  { value: 'group_discount', label: 'Desconto em Rodízio', icon: Tag, color: 'bg-blue-500' },
  { value: 'buy_x_get_y', label: 'Compre X Leve Y', icon: ShoppingBag, color: 'bg-purple-500' },
  { value: 'item_discount', label: 'Desconto em Item', icon: Percent, color: 'bg-orange-500' }
];

export default function PromocoesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletePromotion, setDeletePromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "free_item" as PromotionType,
    weekdays: [] as number[],
    config: {} as PromotionConfig,
    active: true,
    valid_from: "",
    valid_until: ""
  });

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load promotions
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (promotionsError) throw promotionsError;

      // Load items for selection with images
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, price, image, group_id, category_id, active')
        .eq('active', true)
        .order('name');

      if (itemsError) throw itemsError;

      // Load groups (only rodizio type for group discount)
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('sort_order');

      if (groupsError) throw groupsError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      setPromotions(promotionsData || []);
      setItems(itemsData || []);
      setGroups(groupsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "free_item",
      weekdays: [],
      config: {},
      active: true,
      valid_from: "",
      valid_until: ""
    });
    setSelectedItems([]);
    setEditingPromotion(null);
    setSelectedGroup(null);
    setSelectedCategory(null);
  };

  // Open modal
  const openModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        name: promotion.name,
        type: promotion.type,
        weekdays: promotion.weekdays || [],
        config: promotion.config || {},
        active: promotion.active,
        valid_from: promotion.valid_from ? promotion.valid_from.split('T')[0] : "",
        valid_until: promotion.valid_until ? promotion.valid_until.split('T')[0] : ""
      });
      
      // Set selected items based on type
      if (promotion.type === 'free_item' && promotion.config.freeItems) {
        setSelectedItems(promotion.config.freeItems);
      } else if (promotion.type === 'item_discount' && promotion.config.itemIds) {
        setSelectedItems(promotion.config.itemIds);
      } else if (promotion.type === 'buy_x_get_y' && promotion.config.itemId) {
        setSelectedItems([promotion.config.itemId]);
      }
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Save promotion
  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório!");
      return;
    }

    setSaving(true);
    try {
      // Build config based on type
      let config: PromotionConfig = {};
      
      switch (formData.type) {
        case 'free_item':
          config.freeItems = selectedItems;
          break;
        case 'group_discount':
          config = {
            groupId: formData.config.groupId,
            discountType: formData.config.discountType || 'percentage',
            discountValue: formData.config.discountValue || 0,
            targetGender: formData.config.targetGender || 'all'
          };
          break;
        case 'buy_x_get_y':
          config = {
            itemId: selectedItems[0] || undefined,
            buyQuantity: formData.config.buyQuantity || 1,
            getQuantity: formData.config.getQuantity || 1
          };
          break;
        case 'item_discount':
          config = {
            itemIds: selectedItems,
            discountPercentage: formData.config.discountPercentage,
            fixedPrice: formData.config.fixedPrice
          };
          break;
      }

      const promotionData = {
        name: formData.name,
        type: formData.type,
        weekdays: formData.weekdays,
        config,
        active: formData.active,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null
      };

      if (editingPromotion) {
        const { error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editingPromotion.id);

        if (error) throw error;
        toast.success("Promoção atualizada!");
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert(promotionData);

        if (error) throw error;
        toast.success("Promoção criada!");
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar promoção");
    } finally {
      setSaving(false);
    }
  };

  // Delete promotion
  const handleDelete = async () => {
    if (!deletePromotion) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', deletePromotion.id);

      if (error) throw error;
      
      toast.success("Promoção excluída!");
      setIsDeleteModalOpen(false);
      setDeletePromotion(null);
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error("Erro ao excluir promoção");
    }
  };

  // Toggle active status
  const toggleActive = async (promotion: Promotion) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ active: !promotion.active })
        .eq('id', promotion.id);

      if (error) throw error;
      
      toast.success(promotion.active ? "Promoção desativada" : "Promoção ativada");
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  // Duplicate promotion
  const handleDuplicate = async (promotion: Promotion) => {
    try {
      const duplicatedPromotion = {
        name: `${promotion.name} (cópia)`,
        type: promotion.type,
        discount_percentage: promotion.discount_percentage,
        min_value: promotion.min_value,
        weekdays: promotion.weekdays,
        conditions: promotion.conditions,
        config: promotion.config,
        item_groups: promotion.item_groups,
        item_id: promotion.item_id,
        active: false
      };
      
      const { error } = await supabase
        .from('promotions')
        .insert([duplicatedPromotion]);

      if (error) throw error;
      
      toast.success("Promoção duplicada com sucesso!");
      await loadData();
    } catch (error) {
      console.error('Erro ao duplicar promoção:', error);
      toast.error("Erro ao duplicar promoção");
    }
  };

  // Toggle weekday selection
  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day]
    }));
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Filter items based on search, group and category
  const getFilteredItemsForSelector = () => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
      const matchesGroup = !selectedGroup || item.group_id === selectedGroup;
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
      return matchesSearch && matchesGroup && matchesCategory;
    });
  };

  // Filter promotions
  const filteredPromotions = promotions.filter(promo =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate discount display
  const getDiscountDisplay = (promotion: Promotion) => {
    if (promotion.type === 'group_discount' && promotion.config.groupId) {
      const group = groups.find(g => g.id === promotion.config.groupId);
      if (group && group.type === 'rodizio' && group.price) {
        const originalPrice = group.price;
        let finalPrice = originalPrice;
        
        if (promotion.config.discountType === 'percentage') {
          finalPrice = originalPrice - (originalPrice * (promotion.config.discountValue || 0) / 100);
        } else {
          finalPrice = promotion.config.discountValue || originalPrice;
        }
        
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="line-through text-gray-400">R$ {originalPrice.toFixed(2)}</span>
            <span className="text-green-600 font-semibold">R$ {finalPrice.toFixed(2)}</span>
            <Badge className="bg-green-100 text-green-600">
              {promotion.config.discountType === 'percentage' 
                ? `-${promotion.config.discountValue}%`
                : `Valor fixo`}
            </Badge>
          </div>
        );
      }
    }
    return null;
  };

  // Check if promotion is valid today
  const isValidToday = (promotion: Promotion) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (promotion.weekdays && promotion.weekdays.length > 0) {
      if (!promotion.weekdays.includes(dayOfWeek)) {
        return false;
      }
    }
    
    if (promotion.valid_from && new Date(promotion.valid_from) > today) {
      return false;
    }
    
    if (promotion.valid_until && new Date(promotion.valid_until) < today) {
      return false;
    }
    
    return true;
  };

  // Get rodizio groups only
  const rodizioGroups = groups.filter(g => g.type === 'rodizio');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
                <Tag className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Promoções</h1>
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
                Nova Promoção
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Gerencie promoções e ofertas especiais do restaurante
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPromotions.map((promotion) => {
          const typeInfo = promotionTypes.find(t => t.value === promotion.type);
          const Icon = typeInfo?.icon || Gift;
          const validToday = isValidToday(promotion);
          
          return (
            <div 
              key={promotion.id} 
              className={`bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md ${!promotion.active ? 'opacity-60' : ''}`}
            >
              <div className="p-5">
                {/* Header with icon and title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-3 rounded-xl ${typeInfo?.color || 'bg-gray-500'} bg-opacity-10`}>
                      <Icon className={`h-5 w-5 ${typeInfo?.color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{promotion.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo?.label}
                        </Badge>
                        {validToday && promotion.active && (
                          <Badge className="bg-green-500 text-white text-xs">
                            Ativa Hoje
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-3">
                  {/* Discount Display */}
                  {promotion.discount_percentage > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-3 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Desconto</span>
                        <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {promotion.discount_percentage}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item Info for item_discount */}
                  {promotion.type === 'item_discount' && promotion.item_id && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Item da promoção</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {items.find(item => item.id === promotion.item_id)?.name || 'Item não encontrado'}
                      </p>
                    </div>
                  )}
                  
                  {/* Groups for group_discount */}
                  {promotion.type === 'group_discount' && promotion.item_groups && promotion.item_groups.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">Grupos aplicados</p>
                      <div className="flex flex-wrap gap-1">
                        {promotion.item_groups.map((group, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300">
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Free items count */}
                  {promotion.type === 'free_item' && promotion.config.freeItems && promotion.config.freeItems.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {promotion.config.freeItems.length} {promotion.config.freeItems.length === 1 ? 'item grátis' : 'itens grátis'}
                      </p>
                    </div>
                  )}
                  
                  {/* Happy Hour times */}
                  {promotion.type === 'happy_hour' && promotion.conditions?.happy_hour_start && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Horário</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {promotion.conditions.happy_hour_start} - {promotion.conditions.happy_hour_end}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Minimum value */}
                  {promotion.min_value > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-300 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Pedido mínimo</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          R$ {promotion.min_value.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Weekdays */}
                  {promotion.weekdays && promotion.weekdays.length > 0 && (
                    <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                      <p className="text-xs text-sky-600 dark:text-sky-400 mb-2">Dias da semana</p>
                      <div className="flex gap-1">
                        {weekDays.map(day => (
                          <div
                            key={day.value}
                            className={`
                              px-2 py-1 rounded-lg text-xs font-medium
                              ${promotion.weekdays.includes(day.value) 
                                ? 'bg-sky-500 text-white' 
                                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700'
                              }
                            `}
                          >
                            {day.short}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validity Period - compact */}
                  {(promotion.valid_from || promotion.valid_until) && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {promotion.valid_from ? new Date(promotion.valid_from).toLocaleDateString('pt-BR') : 'Sempre'} 
                          {' - '}
                          {promotion.valid_until ? new Date(promotion.valid_until).toLocaleDateString('pt-BR') : 'Sempre'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>


                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-gray-800 -mx-5 my-4"></div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  {/* Status Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <Switch
                      checked={promotion.active}
                      onCheckedChange={() => toggleActive(promotion)}
                    />
                    <span className="text-sm font-medium">
                      {promotion.active ? 
                        <span className="text-green-600 dark:text-green-400">Ativa</span> : 
                        <span className="text-red-600 dark:text-red-400">Inativa</span>
                      }
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(promotion)}
                      className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(promotion)}
                      className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors inline-flex items-center justify-center"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletePromotion(promotion);
                        setIsDeleteModalOpen(true);
                      }}
                      className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors inline-flex items-center justify-center"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Empty State */}
        {filteredPromotions.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {searchTerm 
                  ? "Nenhuma promoção encontrada" 
                  : "Nenhuma promoção cadastrada"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchTerm
                  ? "Tente ajustar o termo de busca" 
                  : "Clique em 'Nova Promoção' para começar"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>


      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Refri Grátis às Segundas"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Tipo de Promoção</Label>
                <Select 
                  value={formData.type}
                  onValueChange={(value: PromotionType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {promotionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type-specific configuration */}
            {formData.type === 'free_item' && (
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Itens Grátis</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2 justify-start dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                  onClick={() => setIsItemSelectorOpen(true)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Selecionar Itens ({selectedItems.length} selecionados)
                </Button>
                {selectedItems.length > 0 && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {selectedItems.map(itemId => {
                      const item = items.find(i => i.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <div key={itemId} className="relative group flex flex-col">
                          <div className="relative">
                            <img 
                              src={item.image || '/fotos/placeholder/placeholder.png'}
                              alt={item.name}
                              className={`w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 ${!item.image ? 'opacity-50' : ''}`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/fotos/placeholder/placeholder.png';
                              }}
                            />
                            <button
                              onClick={() => toggleItemSelection(itemId)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-700 dark:text-gray-300 mt-1 max-w-[80px] truncate text-center">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {formData.type === 'group_discount' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Grupo de Rodízio</Label>
                  <Select 
                    value={formData.config.groupId?.toString() || ''}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      config: { ...formData.config, groupId: parseInt(value) } 
                    })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Selecione o rodízio" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                      {rodizioGroups.map(group => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name} - R$ {group.price?.toFixed(2) || '0.00'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Tipo de Desconto</Label>
                    <Select
                      value={formData.config.discountType || 'percentage'}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        config: { ...formData.config, discountType: value as 'percentage' | 'fixed' }
                      })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                        <SelectItem value="percentage">Porcentagem</SelectItem>
                        <SelectItem value="fixed">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      {formData.config.discountType === 'percentage' ? 'Desconto (%)' : 'Valor (R$)'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.config.discountValue || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, discountValue: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder={formData.config.discountType === 'percentage' ? '20' : '50.00'}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>

                {/* Show price preview */}
                {formData.config.groupId && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Label className="text-gray-700 dark:text-gray-300">Prévia do Desconto</Label>
                    {(() => {
                      const group = rodizioGroups.find(g => g.id === formData.config.groupId);
                      if (group && group.price) {
                        const originalPrice = group.price;
                        let finalPrice = originalPrice;
                        
                        if (formData.config.discountType === 'percentage') {
                          finalPrice = originalPrice - (originalPrice * (formData.config.discountValue || 0) / 100);
                        } else {
                          finalPrice = formData.config.discountValue || originalPrice;
                        }
                        
                        return (
                          <div className="mt-2">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 dark:text-gray-400 line-through">
                                De: R$ {originalPrice.toFixed(2)}
                              </span>
                              <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                                Por: R$ {finalPrice.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Economia de R$ {(originalPrice - finalPrice).toFixed(2)} 
                              ({((originalPrice - finalPrice) / originalPrice * 100).toFixed(1)}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                <div>
                  <Label>Aplicar para</Label>
                  <Select
                    value={formData.config.targetGender || 'all'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      config: { ...formData.config, targetGender: value as 'all' | 'male' | 'female' }
                    })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="male">Apenas Homens</SelectItem>
                      <SelectItem value="female">Apenas Mulheres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.type === 'buy_x_get_y' && (
              <div className="space-y-4">
                <div>
                  <Label>Item da Promoção</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 justify-start"
                    onClick={() => setIsItemSelectorOpen(true)}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {selectedItems.length > 0
                      ? `Item selecionado: ${items.find(i => i.id === selectedItems[0])?.name}`
                      : 'Selecionar Item'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Compre (quantidade)</Label>
                    <Input
                      type="number"
                      value={formData.config.buyQuantity || 1}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, buyQuantity: parseInt(e.target.value) || 1 }
                      })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Leve (quantidade)</Label>
                    <Input
                      type="number"
                      value={formData.config.getQuantity || 1}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, getQuantity: parseInt(e.target.value) || 1 }
                      })}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'item_discount' && (
              <div className="space-y-4">
                <div>
                  <Label>Itens com Desconto</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 justify-start"
                    onClick={() => setIsItemSelectorOpen(true)}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Selecionar Itens ({selectedItems.length} selecionados)
                  </Button>
                  {selectedItems.length > 0 && (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {selectedItems.map(itemId => {
                        const item = items.find(i => i.id === itemId);
                        if (!item) return null;
                        
                        return (
                          <div key={itemId} className="relative group flex flex-col">
                            <div className="relative">
                              <img 
                                src={item.image || '/fotos/placeholder/placeholder.png'}
                                alt={item.name}
                                className={`w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 ${!item.image ? 'opacity-50' : ''}`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/fotos/placeholder/placeholder.png';
                                }}
                              />
                              <button
                                onClick={() => toggleItemSelection(itemId)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300 mt-1 max-w-[80px] truncate text-center">
                              {item.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Desconto (%)</Label>
                    <Input
                      type="number"
                      value={formData.config.discountPercentage || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { 
                          ...formData.config, 
                          discountPercentage: parseFloat(e.target.value) || undefined,
                          fixedPrice: undefined 
                        }
                      })}
                      placeholder="Ex: 20"
                    />
                  </div>
                  <div>
                    <Label>OU Preço Fixo (R$)</Label>
                    <Input
                      type="number"
                      value={formData.config.fixedPrice || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { 
                          ...formData.config, 
                          fixedPrice: parseFloat(e.target.value) || undefined,
                          discountPercentage: undefined 
                        }
                      })}
                      placeholder="Ex: 15.90"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            <div>
              <Label>Dias da Semana</Label>
              <div className="flex gap-2 mt-2">
                {weekDays.map(day => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={formData.weekdays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleWeekday(day.value)}
                  >
                    {day.short}
                  </Button>
                ))}
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Válida de</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label>Válida até</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div></div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label>Ativa</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPromotion ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Selector Modal */}
      <Dialog open={isItemSelectorOpen} onOpenChange={setIsItemSelectorOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Selecionar Itens</DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col">
            {/* Filters */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Grupo</Label>
                <Select 
                  value={selectedGroup?.toString() || ''}
                  onValueChange={(value) => setSelectedGroup(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300">Categoria</Label>
                <Select 
                  value={selectedCategory?.toString() || 'all'}
                  onValueChange={(value) => setSelectedCategory(value === 'all' ? null : parseInt(value))}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300">Buscar</Label>
                <Input
                  placeholder="Nome do item..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Items List */}
            <ScrollArea className="flex-1 min-h-0 border rounded-lg overflow-auto">
              <div className="space-y-2 p-3 h-full">
                {getFilteredItemsForSelector().map(item => {
                  return (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm ${
                        selectedItems.includes(item.id) 
                          ? 'bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 dark:border-orange-600' 
                          : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      {/* Image with 16:9 aspect ratio */}
                      <div className="relative w-32 h-18 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/fotos/placeholder/placeholder.png';
                            }}
                          />
                        ) : (
                          <img
                            src="/fotos/placeholder/placeholder.png"
                            alt="Placeholder"
                            className="w-full h-full object-cover opacity-50"
                          />
                        )}
                      </div>
                    
                    {/* Item details */}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{item.description}</p>
                      )}
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
                        R$ {item.price?.toFixed(2).replace('.', ',') || '0,00'}
                      </p>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedItems.includes(item.id)
                          ? 'bg-orange-500 border-orange-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedItems.includes(item.id) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Selected count */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsItemSelectorOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => setIsItemSelectorOpen(false)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Confirmar Seleção
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a promoção "{deletePromotion?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}