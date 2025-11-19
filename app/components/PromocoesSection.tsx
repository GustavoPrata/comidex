"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Gift,
  Tag,
  Percent,
  ShoppingBag,
  Calendar,
  Clock,
  Users,
  Star,
  Check,
  X,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const supabase = createClient();

interface Promotion {
  id: number;
  name: string;
  type: 'free_item' | 'group_discount' | 'buy_x_get_y' | 'item_discount';
  weekdays: number[];
  start_time?: string;
  end_time?: string;
  config: {
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
  };
  active: boolean;
  priority: number;
  valid_from?: string;
  valid_until?: string;
}

interface PromotionApplication {
  promotionId: number;
  discount: number;
  affectedItems: number[];
}

interface PromocoesSectionProps {
  cart: any[];
  groups: any[];
  onPromotionToggle?: (promotion: Promotion, applied: boolean) => void;
  appliedPromotions: PromotionApplication[];
  setAppliedPromotions: (promotions: PromotionApplication[]) => void;
}

export default function PromocoesSection({
  cart,
  groups,
  onPromotionToggle,
  appliedPromotions,
  setAppliedPromotions
}: PromocoesSectionProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingPromotion, setApplyingPromotion] = useState<number | null>(null);
  
  // Filter for rodizio groups only
  const rodizioGroups = groups.filter(g => g.type === 'rodizio');

  // Load promotions
  const loadPromotions = async () => {
    try {
      const response = await fetch('/api/promocoes?active=true');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort by priority
        const sortedData = data.sort((a, b) => b.priority - a.priority);
        setPromotions(sortedData);
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      toast.error('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // Check if promotion is applicable to current cart
  const isPromotionApplicable = (promotion: Promotion): boolean => {
    switch (promotion.type) {
      case 'free_item':
        // Check if any of the free items are in the cart
        if (!promotion.config.freeItems) return false;
        return cart.some(item => 
          promotion.config.freeItems?.includes(item.item_id) && 
          item.status === 'delivered'
        );
        
      case 'group_discount':
        // Check if there are items from the specified group AND group is rodizio
        if (!promotion.config.groupId) return false;
        const group = rodizioGroups.find(g => g.id === promotion.config.groupId);
        if (!group) return false; // Not a rodizio group
        return cart.some(item => 
          item.item?.group_id === promotion.config.groupId && 
          item.status === 'delivered'
        );
        
      case 'buy_x_get_y':
        // Check if the specific item or any item meets the quantity
        const buyQuantity = promotion.config.buyQuantity || 1;
        if (promotion.config.itemId) {
          const itemCount = cart.filter(item => 
            item.item_id === promotion.config.itemId && 
            item.status === 'delivered'
          ).reduce((sum, item) => sum + item.quantity, 0);
          return itemCount >= buyQuantity;
        } else {
          // Check if any item has enough quantity
          const itemGroups = new Map();
          cart.filter(item => item.status === 'delivered').forEach(item => {
            const count = itemGroups.get(item.item_id) || 0;
            itemGroups.set(item.item_id, count + item.quantity);
          });
          return Array.from(itemGroups.values()).some(count => count >= buyQuantity);
        }
        
      case 'item_discount':
        // Check if any of the discounted items are in the cart
        if (!promotion.config.itemIds) return false;
        return cart.some(item => 
          promotion.config.itemIds?.includes(item.item_id) && 
          item.status === 'delivered'
        );
        
      default:
        return false;
    }
  };

  // Calculate discount for a promotion
  const calculatePromotionDiscount = (promotion: Promotion): number => {
    let discount = 0;
    
    switch (promotion.type) {
      case 'free_item':
        // Calculate value of free items
        if (promotion.config.freeItems) {
          cart.filter(item => 
            promotion.config.freeItems?.includes(item.item_id) && 
            item.status === 'delivered'
          ).forEach(item => {
            discount += item.unit_price * Math.min(item.quantity, 1); // Usually one free item
          });
        }
        break;
        
      case 'group_discount':
        // Calculate discount on group items (only for rodizio groups)
        if (promotion.config.groupId) {
          const group = rodizioGroups.find(g => g.id === promotion.config.groupId);
          if (!group) break; // Not a rodizio group, no discount
          
          const groupItems = cart.filter(item => 
            item.item?.group_id === promotion.config.groupId && 
            item.status === 'delivered'
          );
          
          if (promotion.config.discountType === 'percentage') {
            const groupTotal = groupItems.reduce((sum, item) => sum + item.total_price, 0);
            discount = groupTotal * (promotion.config.discountValue || 0) / 100;
          } else {
            // Fixed price means each item in the group costs this fixed price
            const fixedPrice = promotion.config.discountValue || 0;
            groupItems.forEach(item => {
              const normalPrice = item.unit_price * item.quantity;
              const promotionalPrice = fixedPrice * item.quantity;
              discount += Math.max(0, normalPrice - promotionalPrice);
            });
          }
        }
        break;
        
      case 'buy_x_get_y':
        // Calculate value of free items
        const buyQuantity = promotion.config.buyQuantity || 1;
        const getQuantity = promotion.config.getQuantity || 1;
        
        if (promotion.config.itemId) {
          const items = cart.filter(item => 
            item.item_id === promotion.config.itemId && 
            item.status === 'delivered'
          );
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
          const setsEligible = Math.floor(totalQuantity / (buyQuantity + getQuantity));
          const unitPrice = items[0]?.unit_price || 0;
          discount = setsEligible * getQuantity * unitPrice;
        }
        break;
        
      case 'item_discount':
        // Calculate discount on specific items
        if (promotion.config.itemIds) {
          const eligibleItems = cart.filter(item => 
            promotion.config.itemIds?.includes(item.item_id) && 
            item.status === 'delivered'
          );
          
          eligibleItems.forEach(item => {
            if (promotion.config.discountPercentage) {
              discount += item.total_price * promotion.config.discountPercentage / 100;
            } else if (promotion.config.fixedPrice) {
              // Item should cost fixed price
              const shouldCost = promotion.config.fixedPrice * item.quantity;
              discount += Math.max(0, item.total_price - shouldCost);
            }
          });
        }
        break;
    }
    
    return discount;
  };

  // Toggle promotion application
  const togglePromotion = async (promotion: Promotion) => {
    setApplyingPromotion(promotion.id);
    
    try {
      const isApplied = appliedPromotions.some(p => p.promotionId === promotion.id);
      
      if (isApplied) {
        // Remove promotion
        const newApplied = appliedPromotions.filter(p => p.promotionId !== promotion.id);
        setAppliedPromotions(newApplied);
        toast.success(`Promoção "${promotion.name}" removida`);
        
        if (onPromotionToggle) {
          onPromotionToggle(promotion, false);
        }
      } else {
        // Apply promotion
        const discount = calculatePromotionDiscount(promotion);
        const affectedItems = getAffectedItems(promotion);
        
        const newApplication: PromotionApplication = {
          promotionId: promotion.id,
          discount,
          affectedItems
        };
        
        setAppliedPromotions([...appliedPromotions, newApplication]);
        toast.success(`Promoção "${promotion.name}" aplicada! Desconto: ${formatCurrency(discount)}`);
        
        if (onPromotionToggle) {
          onPromotionToggle(promotion, true);
        }
      }
    } finally {
      setApplyingPromotion(null);
    }
  };

  // Get affected items for a promotion
  const getAffectedItems = (promotion: Promotion): number[] => {
    const affectedItems: number[] = [];
    
    switch (promotion.type) {
      case 'free_item':
        if (promotion.config.freeItems) {
          cart.filter(item => 
            promotion.config.freeItems?.includes(item.item_id)
          ).forEach(item => affectedItems.push(item.id));
        }
        break;
        
      case 'group_discount':
        if (promotion.config.groupId) {
          cart.filter(item => 
            item.item?.group_id === promotion.config.groupId
          ).forEach(item => affectedItems.push(item.id));
        }
        break;
        
      case 'buy_x_get_y':
        if (promotion.config.itemId) {
          cart.filter(item => 
            item.item_id === promotion.config.itemId
          ).forEach(item => affectedItems.push(item.id));
        }
        break;
        
      case 'item_discount':
        if (promotion.config.itemIds) {
          cart.filter(item => 
            promotion.config.itemIds?.includes(item.item_id)
          ).forEach(item => affectedItems.push(item.id));
        }
        break;
    }
    
    return affectedItems;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Get promotion icon
  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'free_item': return Gift;
      case 'group_discount': return Tag;
      case 'buy_x_get_y': return ShoppingBag;
      case 'item_discount': return Percent;
      default: return Gift;
    }
  };

  // Check if promotion is valid today
  const isValidToday = (promotion: Promotion): boolean => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Check weekdays
    if (promotion.weekdays && promotion.weekdays.length > 0) {
      return promotion.weekdays.includes(dayOfWeek);
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // Mostra todas as promoções ativas, não apenas as aplicáveis ao carrinho
  if (promotions.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <div className="p-4 text-center text-gray-500 text-sm">
          Nenhuma promoção disponível
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {promotions.map(promotion => {
        const Icon = getPromotionIcon(promotion.type);
        const isApplied = appliedPromotions.some(p => p.promotionId === promotion.id);
        const discount = isApplied 
          ? appliedPromotions.find(p => p.promotionId === promotion.id)?.discount || 0
          : calculatePromotionDiscount(promotion);
        const validToday = isValidToday(promotion);
        
        return (
          <Card 
            key={promotion.id} 
            className={`bg-gray-800/50 border-gray-700 transition-all ${
              isApplied ? 'ring-2 ring-orange-500 bg-orange-900/20' : ''
            }`}
          >
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className={`p-1.5 rounded ${
                    isApplied ? 'bg-orange-500' : 'bg-gray-700'
                  }`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        {promotion.name}
                      </h4>
                      {validToday && (
                        <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs px-1 py-0">
                          <Star className="h-3 w-3 mr-1" />
                          Indicado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show original and discounted values for group discount */}
                    {promotion.type === 'group_discount' && promotion.config.groupId && (
                      <div className="mt-2">
                        {(() => {
                          const group = rodizioGroups.find(g => g.id === promotion.config.groupId);
                          if (group && group.price) {
                            const originalPrice = group.price;
                            let finalPrice = originalPrice;
                            
                            if (promotion.config.discountType === 'percentage') {
                              finalPrice = originalPrice - (originalPrice * (promotion.config.discountValue || 0) / 100);
                            } else {
                              finalPrice = promotion.config.discountValue || originalPrice;
                            }
                            
                            return (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400 line-through">
                                  De: {formatCurrency(originalPrice)}
                                </span>
                                <span className="text-green-400 font-semibold">
                                  Por: {formatCurrency(finalPrice)}
                                </span>
                                <Badge className="bg-green-900/50 hover:bg-green-900/50 text-green-400 text-xs">
                                  -{promotion.config.discountType === 'percentage' 
                                    ? `${promotion.config.discountValue}%`
                                    : formatCurrency(originalPrice - finalPrice)}
                                </Badge>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-orange-400 font-medium">
                        Desconto Total: {formatCurrency(discount)}
                      </span>
                      {promotion.weekdays && promotion.weekdays.length > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {promotion.weekdays.map(d => 
                            ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]
                          ).join(', ')}
                        </span>
                      )}
                      {promotion.start_time && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {promotion.start_time} - {promotion.end_time || '23:59'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {applyingPromotion === promotion.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Switch
                      checked={isApplied}
                      onCheckedChange={() => togglePromotion(promotion)}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      
    </div>
  );
}