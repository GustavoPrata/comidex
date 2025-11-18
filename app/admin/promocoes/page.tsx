"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Check
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
  description: string;
  type: PromotionType;
  weekdays: number[];
  start_time?: string;
  end_time?: string;
  config: PromotionConfig;
  active: boolean;
  priority: number;
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
  { value: 'group_discount', label: 'Desconto no Grupo', icon: Tag, color: 'bg-blue-500' },
  { value: 'buy_x_get_y', label: 'Compre X Leve Y', icon: ShoppingBag, color: 'bg-purple-500' },
  { value: 'item_discount', label: 'Desconto em Item', icon: Percent, color: 'bg-orange-500' }
];

export default function PromocoesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletePromotion, setDeletePromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "free_item" as PromotionType,
    weekdays: [] as number[],
    start_time: "",
    end_time: "",
    config: {} as PromotionConfig,
    active: true,
    priority: 0,
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
        .order('priority', { ascending: false });

      if (promotionsError) throw promotionsError;

      // Load items for selection
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, price, image, group_id, category_id')
        .eq('active', true)
        .order('name');

      if (itemsError) throw itemsError;

      // Load groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('sort_order');

      if (groupsError) throw groupsError;

      setPromotions(promotionsData || []);
      setItems(itemsData || []);
      setGroups(groupsData || []);
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
      description: "",
      type: "free_item",
      weekdays: [],
      start_time: "",
      end_time: "",
      config: {},
      active: true,
      priority: 0,
      valid_from: "",
      valid_until: ""
    });
    setSelectedItems([]);
    setEditingPromotion(null);
  };

  // Open modal
  const openModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        name: promotion.name,
        description: promotion.description || "",
        type: promotion.type,
        weekdays: promotion.weekdays || [],
        start_time: promotion.start_time || "",
        end_time: promotion.end_time || "",
        config: promotion.config || {},
        active: promotion.active,
        priority: promotion.priority || 0,
        valid_from: promotion.valid_from || "",
        valid_until: promotion.valid_until || ""
      });
      
      // Set selected items based on promotion type
      if (promotion.config.freeItems) {
        setSelectedItems(promotion.config.freeItems);
      } else if (promotion.config.itemIds) {
        setSelectedItems(promotion.config.itemIds);
      } else if (promotion.config.itemId) {
        setSelectedItems([promotion.config.itemId]);
      }
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Save promotion
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);
    try {
      // Prepare config based on promotion type
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
            itemId: selectedItems[0] || null,
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
        description: formData.description,
        type: formData.type,
        weekdays: formData.weekdays,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        config,
        active: formData.active,
        priority: formData.priority,
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

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Get promotion type info
  const getPromotionTypeInfo = (type: PromotionType) => {
    return promotionTypes.find(pt => pt.value === type);
  };

  // Check if promotion is valid today
  const isValidToday = (promotion: Promotion) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Check weekdays
    if (promotion.weekdays && promotion.weekdays.length > 0) {
      if (!promotion.weekdays.includes(dayOfWeek)) {
        return false;
      }
    }
    
    // Check time
    if (promotion.start_time && promotion.end_time) {
      const now = today.toTimeString().slice(0, 5);
      if (now < promotion.start_time || now > promotion.end_time) {
        return false;
      }
    }
    
    // Check date range
    if (promotion.valid_from && new Date(promotion.valid_from) > today) {
      return false;
    }
    if (promotion.valid_until && new Date(promotion.valid_until) < today) {
      return false;
    }
    
    return true;
  };

  // Filter promotions based on search
  const filteredPromotions = promotions.filter(promo =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Promoções</h2>
        <p className="text-muted-foreground">
          Gerencie as promoções e descontos do restaurante
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar promoções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => openModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Promoção
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPromotions.map((promotion) => {
          const typeInfo = getPromotionTypeInfo(promotion.type);
          const validToday = isValidToday(promotion);
          
          return (
            <Card key={promotion.id} className={`${!promotion.active && 'opacity-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {typeInfo && (
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <typeInfo.icon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{promotion.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {typeInfo?.label}
                      </p>
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

                {promotion.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {promotion.description}
                  </p>
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

                {/* Time range */}
                {(promotion.start_time || promotion.end_time) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-3 w-3" />
                    {promotion.start_time || '00:00'} - {promotion.end_time || '23:59'}
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge variant={promotion.active ? "default" : "secondary"}>
                    {promotion.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Prioridade: {promotion.priority}
                  </span>
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
            <h3 className="font-semibold text-lg mb-1">
              Nenhuma promoção encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Tente ajustar sua busca"
                : "Comece criando sua primeira promoção"}
            </p>
            {!searchTerm && (
              <Button onClick={() => openModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Promoção
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes da promoção
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Refri Grátis às Segundas"
                />
              </div>
              <div>
                <Label>Tipo de Promoção</Label>
                <Select 
                  value={formData.type}
                  onValueChange={(value: PromotionType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a promoção..."
                rows={3}
              />
            </div>

            {/* Type-specific configuration */}
            {formData.type === 'free_item' && (
              <div>
                <Label>Itens Grátis</Label>
                <ScrollArea className="h-48 border rounded-lg p-2 mt-2">
                  <Input
                    placeholder="Buscar itens..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="space-y-2">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedItems.includes(item.id) ? 'bg-orange-50 border-orange-300 border' : ''
                        }`}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            R$ {item.price?.toFixed(2)}
                          </p>
                        </div>
                        {selectedItems.includes(item.id) && (
                          <Check className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {formData.type === 'group_discount' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grupo</Label>
                    <Select
                      value={formData.config.groupId?.toString()}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        config: { ...formData.config, groupId: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Gênero Alvo</Label>
                    <Select
                      value={formData.config.targetGender || 'all'}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        config: { ...formData.config, targetGender: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={formData.config.discountType || 'percentage'}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        config: { ...formData.config, discountType: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem</SelectItem>
                        <SelectItem value="fixed">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      {formData.config.discountType === 'percentage' ? 'Desconto (%)' : 'Preço Final (R$)'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.config.discountValue || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, discountValue: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'buy_x_get_y' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Comprar Quantidade</Label>
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
                    <Label>Ganhar Quantidade</Label>
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
                <div>
                  <Label>Item Específico (opcional)</Label>
                  <ScrollArea className="h-48 border rounded-lg p-2 mt-2">
                    <Input
                      placeholder="Buscar itens..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="space-y-2">
                      <div
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedItems.length === 0 ? 'bg-orange-50 border-orange-300 border' : ''
                        }`}
                        onClick={() => setSelectedItems([])}
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Qualquer Item</p>
                          <p className="text-xs text-muted-foreground">
                            Aplica para qualquer produto
                          </p>
                        </div>
                        {selectedItems.length === 0 && (
                          <Check className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedItems.includes(item.id) ? 'bg-orange-50 border-orange-300 border' : ''
                          }`}
                          onClick={() => setSelectedItems([item.id])}
                        >
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              R$ {item.price?.toFixed(2)}
                            </p>
                          </div>
                          {selectedItems.includes(item.id) && (
                            <Check className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {formData.type === 'item_discount' && (
              <div className="space-y-4">
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
                          discountPercentage: parseFloat(e.target.value) || 0,
                          fixedPrice: undefined
                        }
                      })}
                      placeholder="Ex: 20"
                      disabled={!!formData.config.fixedPrice}
                    />
                  </div>
                  <div>
                    <Label>Ou Preço Fixo (R$)</Label>
                    <Input
                      type="number"
                      value={formData.config.fixedPrice || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { 
                          ...formData.config, 
                          fixedPrice: parseFloat(e.target.value) || 0,
                          discountPercentage: undefined
                        }
                      })}
                      placeholder="Ex: 99.00"
                      disabled={!!formData.config.discountPercentage}
                    />
                  </div>
                </div>
                <div>
                  <Label>Itens com Desconto</Label>
                  <ScrollArea className="h-48 border rounded-lg p-2 mt-2">
                    <Input
                      placeholder="Buscar itens..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="space-y-2">
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedItems.includes(item.id) ? 'bg-orange-50 border-orange-300 border' : ''
                          }`}
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              R$ {item.price?.toFixed(2)}
                            </p>
                          </div>
                          {selectedItems.includes(item.id) && (
                            <Check className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* Schedule */}
            <div>
              <Label>Dias da Semana</Label>
              <div className="flex gap-2 mt-2">
                {weekDays.map(day => (
                  <Badge
                    key={day.value}
                    variant={formData.weekdays.includes(day.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newWeekdays = formData.weekdays.includes(day.value)
                        ? formData.weekdays.filter(d => d !== day.value)
                        : [...formData.weekdays, day.value];
                      setFormData({ ...formData, weekdays: newWeekdays });
                    }}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horário Início</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Horário Fim</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prioridade</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>Promoção Ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}