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
  MoreVertical,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
        valid_from: promotion.valid_from || "",
        valid_until: promotion.valid_until || ""
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promoções</h1>
          <p className="text-muted-foreground">Gerencie as promoções do restaurante</p>
        </div>
        <Button onClick={() => openModal()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Nova Promoção
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar promoção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPromotions.map((promotion) => {
          const typeInfo = promotionTypes.find(t => t.value === promotion.type);
          const Icon = typeInfo?.icon || Gift;
          const validToday = isValidToday(promotion);
          
          return (
            <Card key={promotion.id} className={!promotion.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${typeInfo?.color || 'bg-gray-500'} bg-opacity-20`}>
                      <Icon className={`h-4 w-4 ${typeInfo?.color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{promotion.name}</h3>
                      <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {validToday && promotion.active && (
                      <Badge className="bg-green-500">Indicado</Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal(promotion)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setDeletePromotion(promotion);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Show discount calculation for rodizio */}
                {getDiscountDisplay(promotion)}

                {/* Show selected items with images */}
                {promotion.type === 'free_item' && promotion.config.freeItems && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {promotion.config.freeItems.slice(0, 3).map(itemId => {
                      const item = items.find(i => i.id === itemId);
                      return item ? (
                        <div key={itemId} className="relative group">
                          <img 
                            src={item.image || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs text-center px-1">{item.name}</span>
                          </div>
                        </div>
                      ) : null;
                    })}
                    {promotion.config.freeItems.length > 3 && (
                      <div className="w-12 h-12 rounded border flex items-center justify-center bg-gray-100 text-sm">
                        +{promotion.config.freeItems.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Weekdays */}
                {promotion.weekdays && promotion.weekdays.length > 0 && (
                  <div className="flex gap-1 mb-3">
                    {weekDays.map(day => (
                      <Badge 
                        key={day.value}
                        variant={promotion.weekdays.includes(day.value) ? "default" : "outline"}
                        className="px-1.5 py-0.5 text-xs"
                      >
                        {day.short}
                      </Badge>
                    ))}
                  </div>
                )}


                {/* Status */}
                <div className="flex items-center justify-between">
                  <Switch
                    checked={promotion.active}
                    onCheckedChange={() => toggleActive(promotion)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredPromotions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma promoção encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira promoção para atrair mais clientes
            </p>
            <Button onClick={() => openModal()} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Criar Promoção
            </Button>
          </CardContent>
        </Card>
      )}

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
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedItems.map(itemId => {
                      const item = items.find(i => i.id === itemId);
                      return item ? (
                        <div key={itemId} className="relative group">
                          <img 
                            src={item.image || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover border"
                          />
                          <button
                            onClick={() => toggleItemSelection(itemId)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
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
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {selectedItems.map(itemId => {
                        const item = items.find(i => i.id === itemId);
                        return item ? (
                          <div key={itemId} className="relative group">
                            <img 
                              src={item.image || '/placeholder-food.jpg'}
                              alt={item.name}
                              className="w-16 h-16 rounded object-cover border"
                            />
                            <button
                              onClick={() => toggleItemSelection(itemId)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null;
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Selecionar Itens</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Grupo</Label>
                <Select 
                  value={selectedGroup?.toString() || 'all'}
                  onValueChange={(value) => setSelectedGroup(value === 'all' ? null : parseInt(value))}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Todos os grupos" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <SelectItem value="all">Todos os grupos</SelectItem>
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

            {/* Items Grid */}
            <ScrollArea className="flex-1 border rounded-lg p-4">
              <div className="grid grid-cols-4 gap-3">
                {getFilteredItemsForSelector().map(item => (
                  <button
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                      selectedItems.includes(item.id) 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-600' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    <div className="relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      {selectedItems.includes(item.id) && (
                        <div className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-sm text-left line-clamp-2 text-gray-900 dark:text-gray-100">{item.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                      R$ {item.price?.toFixed(2) || '0.00'}
                    </p>
                  </button>
                ))}
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