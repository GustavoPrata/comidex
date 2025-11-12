"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Pencil,
  Trash2,
  Layers,
  Loader2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Copy,
  ShoppingBag,
  FolderOpen,
  X,
  Edit,
  Download,
  Camera
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { IconSelector } from "../../../client/src/components/IconSelector";
import { menuIconLibrary, getIconByName } from "../../../lib/menu-icons-library";

const supabase = createClient();
import type { Group, Category } from "@/types/supabase";

interface ExtendedGroup extends Group {
  categories?: ExtendedCategory[];
  itemCount?: number;
}

interface ExtendedCategory extends Category {
  itemCount?: number;
}

type ModalType = 'group' | 'category';

// Sortable Group Component
function SortableGroupItem({ 
  group, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleActive,
  onAddCategory,
  children,
  isDragging 
}: {
  group: ExtendedGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  onAddCategory: () => void;
  children: React.ReactNode;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ 
    id: `group-${group.id}`,
    disabled: isDragging 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: sortableIsDragging ? 1000 : 1,
    userSelect: sortableIsDragging ? 'none' : 'auto' as any,
  };

  const categoriesCount = group.categories?.length || 0;
  const itemsCount = group.itemCount || 0;

  const getTypeBadge = (type: string) => {
    const badges = {
      rodizio: { label: "Rodízio", className: "bg-orange-600 text-white" },
      a_la_carte: { label: "À la carte", className: "bg-orange-500 text-white" },
      bebidas: { label: "Bebidas", className: "bg-orange-400 text-white" }
    };
    const badge = badges[type as keyof typeof badges] || { label: type, className: "bg-gray-500 text-white" };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  // Event handlers com proteção
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  const handleToggleActive = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleActive();
  }, [onToggleActive]);

  const handleAddCategory = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddCategory();
  }, [onAddCategory]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDuplicate();
  }, [onDuplicate]);

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="border-gray-800 bg-white dark:bg-black rounded-2xl overflow-hidden"
    >
      {/* Group Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <div className={`flex items-center justify-between ${!group.active ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-3">
            {/* Drag Handle - Área redonda em volta do ícone */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-move p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full touch-none group select-none transition-all hover:shadow-sm flex items-center justify-center"
              style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
              onMouseDown={(e) => e.preventDefault()}
              title="Arraste para reordenar"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </div>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggle}
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-orange-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </Button>

            {/* Group Info */}
            <div>
              <div className="flex items-center gap-2">
                {/* Group Icon */}
                {(() => {
                  const iconName = (group as any).icon;
                  if (iconName) {
                    const Icon = getIconByName(iconName);
                    if (Icon) {
                      return (
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                          <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                <h3 className="text-lg font-semibold">{group.name}</h3>
                {getTypeBadge(group.type)}
                {group.price && (
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                    <DollarSign className="h-3 w-3 mr-1" />
                    R$ {group.price.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Group Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddCategory}
              className="px-4 py-1.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center text-gray-500 hover:text-orange-500 text-sm"
              type="button"
            >
              <span className="font-medium">+ Adicionar Categoria</span>
            </button>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {categoriesCount} categoria{categoriesCount !== 1 && 's'}
            </Badge>
            <button
              onClick={handleDuplicate}
              className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
              type="button"
              title="Duplicar"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
              type="button"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
              type="button"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleToggleActive}
              className={`w-20 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                group.active 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              {group.active ? 'Visível' : 'Invisível'}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {children}
        </div>
      )}
    </Card>
  );
}

// Sortable Category Component
function SortableCategoryItem({ 
  category, 
  onEdit, 
  onDelete,
  onDuplicate,
  onToggleActive,
  isDragging,
  groupActive 
}: {
  category: ExtendedCategory;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  isDragging?: boolean;
  groupActive?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ 
    id: `category-${category.id}`,
    disabled: isDragging 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: sortableIsDragging ? 1000 : 1,
    userSelect: sortableIsDragging ? 'none' : 'auto' as any,
  };

  // Event handlers com proteção
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  const handleToggleActive = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleActive();
  }, [onToggleActive]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDuplicate();
  }, [onDuplicate]);

  const isInvisible = !category.active || groupActive === false;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
    >
      <div className={`flex items-center gap-3 ${isInvisible ? 'opacity-60' : ''}`}>
        {/* Drag Handle - Área redonda em volta do ícone */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full touch-none group select-none transition-all hover:shadow-sm flex items-center justify-center"
          style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
          onMouseDown={(e) => e.preventDefault()}
          title="Arraste para reordenar"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
          </svg>
        </div>
        
        {/* Image Preview - Show placeholder if no image (EXACTLY like products) */}
        <div 
          className="relative w-24 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 cursor-pointer transition-all hover:ring-2 hover:ring-orange-500"
          onClick={(e) => {
            e.stopPropagation();
            // Se tem imagem, visualiza; se não tem, edita para adicionar
            if (category.image) {
              (window as any).viewCategoryImage?.(category);
            } else {
              // Sinaliza para abrir seletor de arquivo automaticamente
              (window as any).autoOpenImageSelector = true;
              onEdit();
            }
          }}
          onDragOver={(e) => {
            if (!category.image) {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('ring-2', 'ring-orange-500');
            }
          }}
          onDragLeave={(e) => {
            if (!category.image) {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('ring-2', 'ring-orange-500');
            }
          }}
          onDrop={(e) => {
            if (!category.image) {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('ring-2', 'ring-orange-500');
              
              // Abrir modal de edição com a imagem arrastada
              const files = Array.from(e.dataTransfer.files);
              const imageFile = files.find(f => f.type.startsWith('image/'));
              if (imageFile) {
                // Armazenar o arquivo temporariamente e abrir modal de edição
                (window as any).draggedImageFile = imageFile;
                onEdit();
              }
            }
          }}
          title={category.image ? "Clique para visualizar" : "Clique ou arraste uma imagem para adicionar"}
        >
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/fotos/placeholder/placeholder.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/fotos/placeholder/placeholder.png"
                alt="Placeholder"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <p className="font-medium">{category.name}</p>
          {category.description && (
            <p className="text-sm text-gray-500">{category.description}</p>
          )}
        </div>
      </div>
      
      <div className={`flex items-center gap-2 ${isInvisible ? 'opacity-60' : ''}`}>
        {category.itemCount !== undefined && (
          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />
            {category.itemCount || 0} {category.itemCount === 1 ? 'produto' : 'produtos'}
          </Badge>
        )}
        <button
          onClick={handleDuplicate}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          type="button"
          title="Duplicar"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={handleEdit}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          type="button"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          type="button"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleToggleActive}
          className={`w-20 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            category.active 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {category.active ? 'Visível' : 'Invisível'}
        </button>
      </div>
    </div>
  );
}

// Main Component
export default function GripStructurePage() {
  const [groups, setGroups] = useState<ExtendedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('group');
  const [editingItem, setEditingItem] = useState<Group | Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ 
    id: string; 
    type: ModalType; 
    name: string; 
    categoryCount?: number;
    itemCount?: number;
  } | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    categoryName: string;
    categoryId: string;
  } | null>(null);

  // Form data
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    type: "a_la_carte" as 'rodizio' | 'a_la_carte' | 'bebidas' | 'outros',
    price: "",
    half_price: "",
    active: false,
    sort_order: 0,
    icon: null as string | null
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    image: "",
    group_id: "",
    active: true,
    sort_order: 0
  });

  // Enhanced drag sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data with retry logic for reliability
  const loadData = async () => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .order("sort_order");

        if (groupsError) throw groupsError;

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order");

        if (categoriesError) throw categoriesError;

        // Buscar contagem de itens
        const { data: itemsData } = await supabase
          .from("items")
          .select("category_id, id");

        const categoryItemCounts: Record<string, number> = {};
        
        // Contar itens por categoria
        itemsData?.forEach((item: any) => {
          if (item.category_id) {
            categoryItemCounts[item.category_id] = (categoryItemCounts[item.category_id] || 0) + 1;
          }
        });

        // Montar grupos com categorias e calcular contagem de itens
        const groupsWithCategories = groupsData?.map((group: any) => {
          const groupCategories = categoriesData
            ?.filter((cat: any) => cat.group_id === group.id)
            .map((cat: any) => ({
              ...cat,
              itemCount: categoryItemCounts[cat.id] || 0
            })) || [];
          
          // Calcular total de itens do grupo somando os itens de todas as suas categorias
          const groupItemCount = groupCategories.reduce((total: number, cat: any) => total + (cat.itemCount || 0), 0);
          
          return {
            ...group,
            itemCount: groupItemCount,
            categories: groupCategories
          };
        }) || [];

        setGroups(groupsWithCategories);
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
    toast.error("Erro ao carregar estrutura do menu. Por favor, recarregue a página.");
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Register global function for viewing images
  useEffect(() => {
    (window as any).viewCategoryImage = (category: Category) => {
      setViewingImage({
        url: category.image || '/fotos/placeholder/placeholder.png',
        categoryName: category.name,
        categoryId: category.id.toString()
      });
    };
    
    return () => {
      delete (window as any).viewCategoryImage;
    };
  }, []);

  // Auto-expand groups when searching for categories or when filtering by group
  useEffect(() => {
    const groupsToExpand: string[] = [];
    
    // Expand group when it's selected in the filter
    if (selectedGroup !== "all") {
      if (!groupsToExpand.includes(selectedGroup)) {
        groupsToExpand.push(selectedGroup);
      }
    }
    
    // Expand groups that have matching categories when searching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      groups.forEach(group => {
        // If any category in this group matches the search, expand the group
        const hasMatchingCategory = group.categories?.some(cat => 
          cat.name.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
        );
        
        if (hasMatchingCategory && !groupsToExpand.includes(group.id.toString())) {
          groupsToExpand.push(group.id.toString());
        }
      });
    }
    
    // Add groups to expanded list
    if (groupsToExpand.length > 0) {
      setExpandedGroups(prev => {
        const newExpanded = [...prev];
        groupsToExpand.forEach(groupId => {
          if (!newExpanded.includes(groupId)) {
            newExpanded.push(groupId);
          }
        });
        return newExpanded;
      });
    }
  }, [searchTerm, selectedGroup, groups]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setEditingItem(null);
      setGroupFormData({
        name: "",
        type: "a_la_carte",
        price: "",
        half_price: "",
        active: false,
        sort_order: 0,
        icon: null
      });
      setCategoryFormData({
        name: "",
        description: "",
        image: "",
        group_id: "",
        active: true,
        sort_order: 0
      });
      setSaving(false);
      setModalType('group');
    }
  }, [isModalOpen]);

  // Reset state when delete dialog closes
  useEffect(() => {
    if (!deleteDialogOpen) {
      setDeletingItem(null);
      setSaving(false);
    }
  }, [deleteDialogOpen]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    try {
      setActiveId(event.active.id as string);
      setIsDragging(true);
      // Prevent text selection globally during drag
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } catch (error) {
      console.error("Erro ao iniciar drag:", error);
      setIsDragging(false);
    }
  }, []);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setIsDragging(false);
    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  // Handle drag end with improved error handling
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    try {
      setIsDragging(false);
      setActiveId(null);
      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      if (!over || active.id === over.id) {
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if it's a group reorder
      if (activeId.startsWith('group-') && overId.startsWith('group-')) {
        // Calculate filtered groups if needed
        let groupsToReorder = groups;
        if (selectedGroup !== "all") {
          // Filter groups by selected group
          groupsToReorder = groups.filter(g => g.id.toString() === selectedGroup);
        }
        
        const oldIndex = groupsToReorder.findIndex(g => `group-${g.id}` === activeId);
        const newIndex = groupsToReorder.findIndex(g => `group-${g.id}` === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Reorder the filtered groups
          const reorderedFilteredGroups = arrayMove(groupsToReorder, oldIndex, newIndex);
          
          // Update the sort_order for all groups in the correct order
          if (selectedGroup === "all") {
            // No filter: reorder all groups
            // Update local state immediately with new sort_order values
            const updatedGroups = reorderedFilteredGroups.map((group, index) => ({
              ...group,
              sort_order: index
            }));
            
            setGroups(updatedGroups);
            
            // Update database in background
            const updates = updatedGroups.map((group, index) => ({
              id: group.id,
              sort_order: index
            }));
            
            // Update database asynchronously (no await)
            Promise.all(
              updates.map(update =>
                supabase
                  .from("groups")
                  .update({ sort_order: update.sort_order })
                  .eq("id", update.id)
              )
            ).then(results => {
              const hasError = results.some(r => r.error);
              if (hasError) {
                console.error("Erro ao atualizar ordem no banco");
                toast.error("Erro ao salvar ordem no banco");
                loadData(); // Reload on error
              }
            });
          } else {
            // Filter is active: update only the filtered groups' sort orders
            // Calculate base sort_order offset for filtered groups
            const minSortOrder = Math.min(...groupsToReorder.map(g => g.sort_order || 0));
            
            // Create new groups array with updated sort orders
            const updatedGroups = groups.map(group => {
              const reorderedGroup = reorderedFilteredGroups.find(g => g.id === group.id);
              if (reorderedGroup) {
                const index = reorderedFilteredGroups.indexOf(reorderedGroup);
                return { ...group, sort_order: minSortOrder + index };
              }
              return group;
            });
            
            // Update local state immediately
            setGroups(updatedGroups.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
            
            // Create updates for the reordered filtered groups
            const updates = reorderedFilteredGroups.map((group, index) => ({
              id: group.id,
              sort_order: minSortOrder + index
            }));
            
            // Update database asynchronously (no await)
            Promise.all(
              updates.map(update =>
                supabase
                  .from("groups")
                  .update({ sort_order: update.sort_order })
                  .eq("id", update.id)
              )
            ).then(results => {
              const hasError = results.some(r => r.error);
              if (hasError) {
                console.error("Erro ao atualizar ordem no banco");
                toast.error("Erro ao salvar ordem no banco");
                loadData(); // Reload on error
              }
            });
          }

          toast.success("Ordem dos grupos atualizada");
        }
      }

      // Check if it's a category reorder within the same group
      if (activeId.startsWith('category-') && overId.startsWith('category-')) {
        const activeCatId = activeId.replace('category-', '');
        const overCatId = overId.replace('category-', '');

        // Find which group contains these categories
        let targetGroup: ExtendedGroup | undefined;
        let oldIndex = -1;
        let newIndex = -1;

        for (const group of groups) {
          const catOldIndex = group.categories?.findIndex(c => c.id.toString() === activeCatId) ?? -1;
          const catNewIndex = group.categories?.findIndex(c => c.id.toString() === overCatId) ?? -1;

          if (catOldIndex !== -1 && catNewIndex !== -1) {
            targetGroup = group;
            oldIndex = catOldIndex;
            newIndex = catNewIndex;
            break;
          }
        }

        if (targetGroup && oldIndex !== -1 && newIndex !== -1) {
          const newCategories = arrayMove(targetGroup.categories || [], oldIndex, newIndex);
          
          // Update local state
          const newGroups = groups.map(g => 
            g.id === targetGroup!.id 
              ? { ...g, categories: newCategories }
              : g
          );
          setGroups(newGroups);

          // Ensure the group stays expanded after reordering categories
          const targetGroupId = targetGroup.id.toString();
          if (!expandedGroups.includes(targetGroupId)) {
            setExpandedGroups(prev => [...prev, targetGroupId]);
          }

          // Update database
          const updates = newCategories.map((cat, index) => ({
            id: cat.id,
            sort_order: index
          }));

          for (const update of updates) {
            await supabase
              .from("categories")
              .update({ sort_order: update.sort_order })
              .eq("id", update.id);
          }

          toast.success("Ordem das categorias atualizada");
        }
      }
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      toast.error("Erro ao reordenar itens");
      setIsDragging(false);
      setActiveId(null);
      // Restore text selection on error
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
  }, [groups, selectedGroup, loadData, expandedGroups]);

  // Toggle group expansion
  const toggleGroup = (groupId: number | string) => {
    const groupIdStr = groupId.toString();
    setExpandedGroups(prev => 
      prev.includes(groupIdStr) 
        ? prev.filter(id => id !== groupIdStr)
        : [...prev, groupIdStr]
    );
  };

  // Toggle group active status
  const toggleGroupActive = async (group: ExtendedGroup) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("groups")
        .update({ active: !group.active })
        .eq("id", group.id);

      if (error) throw error;

      await loadData();
      toast.success(`Grupo ${!group.active ? 'visível' : 'invisível'}`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do grupo");
    } finally {
      setSaving(false);
    }
  };

  // Toggle category active status
  const toggleCategoryActive = async (category: ExtendedCategory) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("categories")
        .update({ active: !category.active })
        .eq("id", category.id);

      if (error) throw error;

      await loadData();
      toast.success(`Categoria ${!category.active ? 'visível' : 'invisível'}`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da categoria");
    } finally {
      setSaving(false);
    }
  };

  // Duplicate group
  const duplicateGroup = async (group: ExtendedGroup) => {
    try {
      setSaving(true);
      
      // First, get all groups that need to be shifted
      const { data: groupsToShift, error: fetchError } = await supabase
        .from("groups")
        .select("id, sort_order")
        .gt("sort_order", group.sort_order)
        .order("sort_order", { ascending: false });

      if (fetchError) throw fetchError;

      // Update each group's sort_order
      for (const g of groupsToShift || []) {
        await supabase
          .from("groups")
          .update({ sort_order: g.sort_order + 1 })
          .eq("id", g.id);
      }

      // Insert the duplicated group right after the original
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: `${group.name} (Cópia)`,
          type: group.type,
          price: group.price,
          active: group.active,
          sort_order: group.sort_order + 1
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Duplicate all categories from the original group
      if (group.categories && group.categories.length > 0) {
        const categoriesToDuplicate = group.categories.map((cat, index) => ({
          name: cat.name, // Keep original name for categories
          description: cat.description,
          group_id: newGroup.id,
          active: cat.active,
          sort_order: index
        }));

        const { error: catError } = await supabase
          .from("categories")
          .insert(categoriesToDuplicate);

        if (catError) throw catError;
      }

      await loadData();
      toast.success(`Grupo duplicado com sucesso!`);
    } catch (error) {
      console.error("Erro ao duplicar grupo:", error);
      toast.error("Erro ao duplicar o grupo");
    } finally {
      setSaving(false);
    }
  };

  // Duplicate category
  const duplicateCategory = async (category: ExtendedCategory) => {
    try {
      setSaving(true);
      
      // First, get all categories that need to be shifted
      const { data: categoriesToShift, error: fetchError } = await supabase
        .from("categories")
        .select("id, sort_order")
        .eq("group_id", category.group_id)
        .gt("sort_order", category.sort_order)
        .order("sort_order", { ascending: false });

      if (fetchError) throw fetchError;

      // Update each category's sort_order
      for (const cat of categoriesToShift || []) {
        await supabase
          .from("categories")
          .update({ sort_order: cat.sort_order + 1 })
          .eq("id", cat.id);
      }

      // Generate new category name
      const newCategoryName = `${category.name} (Cópia)`;
      
      // Insert the duplicated category right after the original
      const { data: newCategory, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName,
          description: category.description,
          group_id: category.group_id,
          active: category.active,
          sort_order: category.sort_order + 1,
          image: category.image // Initially copy the same image path
        })
        .select()
        .single();

      if (error) throw error;

      // If there's an image, copy it with a new filename
      if (category.image && newCategory) {
        try {
          const response = await fetch("/api/copy-category-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceImage: category.image,
              newCategoryId: newCategory.id,
              newCategoryName: newCategoryName
            })
          });

          if (response.ok) {
            const { imagePath } = await response.json();
            
            // Update the category with the new image path
            await supabase
              .from("categories")
              .update({ image: imagePath })
              .eq("id", newCategory.id);
          }
        } catch (imageError) {
          console.error("Error copying image:", imageError);
          // Continue even if image copy fails
        }
      }

      await loadData();
      toast.success(`Categoria duplicada com sucesso!`);
    } catch (error) {
      console.error("Erro ao duplicar categoria:", error);
      toast.error("Erro ao duplicar a categoria");
    } finally {
      setSaving(false);
    }
  };

  // Modal functions
  const openGroupModal = (group?: ExtendedGroup) => {
    setModalType('group');
    if (group) {
      setEditingItem(group);
      setGroupFormData({
        name: group.name,
        type: group.type,
        price: group.price !== null && group.price !== undefined ? group.price.toString() : "",
        half_price: (group as any).half_price !== null && (group as any).half_price !== undefined ? (group as any).half_price.toString() : "",
        active: group.active,
        sort_order: group.sort_order,
        icon: (group as any).icon || null
      });
    } else {
      setEditingItem(null);
      setGroupFormData({
        name: "",
        type: "a_la_carte",
        price: "",
        half_price: "",
        active: true,
        sort_order: groups.length,
        icon: null
      });
    }
    setIsModalOpen(true);
  };

  const openCategoryModal = (category?: Category, defaultGroupId?: string | number) => {
    setModalType('category');
    if (category) {
      setEditingItem(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        group_id: category.group_id ? category.group_id.toString() : "",
        active: category.active,
        sort_order: category.sort_order
      });
    } else {
      setEditingItem(null);
      const groupId = defaultGroupId ? defaultGroupId.toString() : groups[0]?.id.toString() || "";
      const targetGroup = groups.find(g => g.id.toString() === groupId);
      setCategoryFormData({
        name: "",
        description: "",
        image: "",
        group_id: groupId,
        active: false, // Sempre criar inativa
        sort_order: targetGroup?.categories?.length || 0
      });
    }
    setIsModalOpen(true);
  };

  // Save group
  const saveGroup = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setSaving(true);
      const data = {
        ...groupFormData,
        price: groupFormData.price ? parseFloat(groupFormData.price) : null,
        half_price: groupFormData.half_price ? parseFloat(groupFormData.half_price) : null
      };

      if (editingItem) {
        // Update existing group using API
        const response = await fetch("/api/groups", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: editingItem.id,
            ...data
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao atualizar grupo");
        }
        
        toast.success("Grupo atualizado com sucesso");
      } else {
        // Create new group using API
        const response = await fetch("/api/groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao criar grupo");
        }
        
        toast.success("Grupo criado com sucesso");
      }

      // Reset state and close modal
      setIsModalOpen(false);
      setEditingItem(null);
      setGroupFormData({
        name: "",
        type: "a_la_carte",
        price: "",
        half_price: "",
        active: false,
        sort_order: 0,
        icon: null
      });
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar grupo");
      setSaving(false); // Reset saving state on error
    } finally {
      setSaving(false);
    }
  }, [groupFormData, editingItem]);

  // Save category
  const saveCategory = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setSaving(true);
      
      // Handle image upload if it's a base64 string
      let imageUrl = categoryFormData.image;
      if (categoryFormData.image && categoryFormData.image.startsWith('data:')) {
        try {
          // Convert base64 to blob
          const response = await fetch(categoryFormData.image);
          const blob = await response.blob();
          
          // Create FormData for upload
          const uploadFormData = new FormData();
          uploadFormData.append('file', blob, 'category-image.jpg');
          uploadFormData.append('categoryName', categoryFormData.name);
          if (editingItem) {
            uploadFormData.append('categoryId', editingItem.id.toString());
          }
          
          // Upload to server
          const uploadResponse = await fetch('/api/upload-category-image', {
            method: 'POST',
            body: uploadFormData,
          });
          
          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.error || 'Erro ao fazer upload da imagem');
          }
          
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url; // Use the server-provided URL
        } catch (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          toast.error("Erro ao fazer upload da imagem");
          setSaving(false);
          return;
        }
      }
      
      const categoryData = {
        ...categoryFormData,
        image: imageUrl
      };

      if (editingItem) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Categoria atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(categoryData);

        if (error) throw error;
        toast.success("Categoria criada com sucesso");
      }

      // Reset state and close modal
      setIsModalOpen(false);
      setEditingItem(null);
      setCategoryFormData({
        name: "",
        description: "",
        image: "",
        group_id: "",
        active: true,
        sort_order: 0
      });
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
      setSaving(false); // Reset saving state on error
    } finally {
      setSaving(false);
    }
  }, [categoryFormData, editingItem]);

  // Open delete dialog
  const openDeleteDialog = (id: string | number, type: ModalType, name: string) => {
    const idStr = id.toString();
    // Se for grupo, buscar quantos itens e categorias serão deletados
    if (type === 'group') {
      const group = groups.find(g => g.id.toString() === idStr);
      const categoryCount = group?.categories?.length || 0;
      const itemCount = group?.itemCount || 0;
      setDeletingItem({ id: idStr, type, name, categoryCount, itemCount });
    } 
    // Se for categoria, buscar quantos itens serão deletados
    else if (type === 'category') {
      const category = groups
        .flatMap(g => g.categories || [])
        .find(c => c.id.toString() === idStr);
      const itemCount = category?.itemCount || 0;
      setDeletingItem({ id: idStr, type, name, itemCount });
    } else {
      setDeletingItem({ id: idStr, type, name });
    }
    setDeleteDialogOpen(true);
  };

  // Delete item
  const deleteItem = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!deletingItem) return;

    try {
      setSaving(true);
      const table = deletingItem.type === 'group' ? 'groups' : 'categories';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", deletingItem.id);

      if (error) throw error;

      toast.success(`${deletingItem.type === 'group' ? 'Grupo' : 'Categoria'} excluído com sucesso`);
      
      // Reset state and close dialog
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error(`Erro ao excluir ${deletingItem.type === 'group' ? 'grupo' : 'categoria'}`);
      setSaving(false); // Reset saving state on error
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false); // Ensure dialog is closed
      setDeletingItem(null); // Ensure state is cleared
    }
  }, [deletingItem]);

  // Filter groups by search and selected group
  const filteredGroups = groups.map(group => {
    const searchLower = searchTerm.toLowerCase();
    
    // Check if group matches selected filter
    if (selectedGroup !== "all" && group.id.toString() !== selectedGroup) {
      return { ...group, show: false };
    }
    
    // Check if group name matches search
    const groupMatch = !searchTerm || group.name.toLowerCase().includes(searchLower);
    
    // Filter categories that match the search
    let filteredCategories = group.categories || [];
    
    // Apply search filter to categories
    if (searchTerm) {
      filteredCategories = filteredCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Show group if no filters or matches search/filter
    if (!searchTerm && selectedGroup === "all") {
      return { ...group, show: true };
    }
    
    if (searchTerm) {
      // Show group if either group name matches or has matching categories
      if (groupMatch || filteredCategories.length > 0) {
        // If only categories match (not group name), show only matching categories
        if (!groupMatch && filteredCategories.length > 0) {
          return { ...group, categories: filteredCategories, show: true };
        }
        // If group name matches, show all categories
        return { ...group, show: true };
      }
      return { ...group, show: false };
    }
    
    // Default: show group if it matches selected filter
    return { ...group, show: true };
  }).filter(group => group.show);

  // Get active item for drag overlay
  const activeItem = activeId ? (() => {
    if (activeId.startsWith('group-')) {
      return groups.find(g => `group-${g.id}` === activeId);
    }
    for (const group of groups) {
      const cat = group.categories?.find(c => `category-${c.id}` === activeId);
      if (cat) return cat;
    }
    return null;
  })() : null;


  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          {/* Top Row: Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grupos e Categorias</h1>
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
                onClick={() => openGroupModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                type="button"
                disabled={saving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Gerencie grupos e categorias do cardápio
          </p>

          {/* Groups Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <ShoppingBag className="inline h-4 w-4 mr-1" />
                Grupos
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedGroup === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedGroup("all");
                  // Only close groups when explicitly clicking "Todos os Grupos"
                  if (selectedGroup !== "all") {
                    setExpandedGroups([]);
                  }
                }}
                className={selectedGroup === "all" ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full" : "rounded-full"}
              >
                Todos os Grupos
              </Button>
              {groups
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((group) => (
                  <Button
                    key={group.id}
                    variant={selectedGroup === group.id.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGroup(group.id.toString())}
                    className={selectedGroup === group.id.toString() ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full" : "rounded-full"}
                  >
                    {group.name}
                  </Button>
                ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedGroup !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filtros ativos:</span>
              {searchTerm && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  Pesquisa: "{searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-orange-700 dark:hover:text-orange-300" 
                    onClick={() => setSearchTerm("")}
                  />
                </div>
              )}
              {selectedGroup !== "all" && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  Grupo: {groups.find(g => g.id.toString() === selectedGroup)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-orange-700 dark:hover:text-orange-300" 
                    onClick={() => setSelectedGroup("all")}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Groups and Categories with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={filteredGroups.map(g => `group-${g.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {filteredGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.id.toString());
                return (
                  <SortableGroupItem
                    key={group.id}
                    group={group}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(group.id)}
                    onEdit={() => openGroupModal(group)}
                    onDelete={() => openDeleteDialog(group.id, 'group', group.name)}
                    onDuplicate={() => duplicateGroup(group)}
                    onToggleActive={() => toggleGroupActive(group)}
                    onAddCategory={() => openCategoryModal(undefined, group.id)}
                    isDragging={isDragging}
                  >
                    {isExpanded && (
                      <>
                        {group.categories && group.categories.length > 0 && (
                          <SortableContext
                            items={group.categories.map(c => `category-${c.id}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            {group.categories.map((category) => (
                              <SortableCategoryItem
                                key={category.id}
                                category={category}
                                onEdit={() => openCategoryModal(category)}
                                onDelete={() => openDeleteDialog(category.id, 'category', category.name)}
                                onDuplicate={() => duplicateCategory(category)}
                                onToggleActive={() => toggleCategoryActive(category)}
                                isDragging={isDragging}
                                groupActive={group.active}
                              />
                            ))}
                          </SortableContext>
                        )}
                        
                        {(!group.categories || group.categories.length === 0) && (
                          <div className="text-center py-4 text-gray-500">
                            <p className="text-sm mb-2">Nenhuma categoria cadastrada</p>
                          </div>
                        )}
                        
                        {/* Botão de Adicionar Categoria - apenas quando não está pesquisando */}
                        {!searchTerm && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openCategoryModal(undefined, group.id);
                            }}
                            className="w-full mt-2 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-orange-500"
                            type="button"
                          >
                            <span className="text-sm font-medium">+ Adicionar Categoria</span>
                          </button>
                        )}
                      </>
                    )}
                  </SortableGroupItem>
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem && (
              <div className="opacity-80">
                {'type' in activeItem ? (
                  <Card className="border-gray-800 bg-white dark:bg-black rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-300 hover:text-orange-400 transition-colors duration-200" style={{opacity: 0.7}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
                      <div>
                        <h3 className="text-lg font-semibold">{activeItem.name}</h3>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <svg className="w-4 h-4 text-gray-300 transition-colors duration-200" style={{opacity: 0.7}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
            </svg>
                    <div>
                      <p className="font-medium">{activeItem.name}</p>
                      {activeItem.description && (
                        <p className="text-sm text-gray-500">{activeItem.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <Card className="border-gray-800 bg-white dark:bg-black rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Nenhum grupo encontrado</p>
              <Button 
                onClick={() => openGroupModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Grupo
            </Button>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Modal for Create/Edit */}
      <Dialog 
        open={isModalOpen} 
        onOpenChange={(open) => setIsModalOpen(open)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'group' 
                ? (editingItem ? 'Editar Grupo' : 'Novo Grupo')
                : (editingItem ? 'Editar Categoria' : 'Nova Categoria')
              }
            </DialogTitle>
            <DialogDescription>
              {modalType === 'group'
                ? 'Grupos organizam as categorias do seu cardápio'
                : 'Categorias organizam os itens dentro dos grupos'
              }
            </DialogDescription>
          </DialogHeader>

          {modalType === 'group' ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Left column - Basic info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Grupo *</Label>
                  <Input
                    id="name"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    placeholder="Ex: Rodízio Premium"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo do Grupo *</Label>
                  <Select 
                    value={groupFormData.type}
                    onValueChange={(value: 'rodizio' | 'a_la_carte' | 'bebidas') => 
                      setGroupFormData({...groupFormData, type: value})
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rodizio">Rodízio</SelectItem>
                      <SelectItem value="a_la_carte">À la carte</SelectItem>
                      <SelectItem value="bebidas">Bebidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={groupFormData.price}
                    onChange={(e) => setGroupFormData({...groupFormData, price: e.target.value})}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Opcional - usado para rodízios com preço fixo
                  </p>
                </div>

                <div>
                  <Label htmlFor="half_price">Preço Médio - Crianças (R$)</Label>
                  <Input
                    id="half_price"
                    type="number"
                    step="0.01"
                    value={groupFormData.half_price}
                    onChange={(e) => setGroupFormData({...groupFormData, half_price: e.target.value})}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Opcional - valor para crianças (normalmente metade do preço)
                  </p>
                </div>
              </div>

              {/* Right column - Icon, Status and info */}
              <div className="space-y-4">
                {/* Icon section at the top */}
                <div>
                  <Label htmlFor="icon">Ícone do Grupo</Label>
                  <IconSelector
                    value={groupFormData.icon || undefined}
                    onChange={(iconName: string | null) => setGroupFormData({...groupFormData, icon: iconName})}
                    placeholder="Buscar ícone..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Escolha um ícone para identificar visualmente este grupo
                  </p>
                </div>
                
                {/* Status section */}
                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">Status do Grupo</Label>
                    <div className="space-y-3">
                      {/* Visibilidade */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Visibilidade</p>
                        <button
                          type="button"
                          onClick={() => setGroupFormData({...groupFormData, active: !groupFormData.active})}
                          className={`w-full px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                            groupFormData.active 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {groupFormData.active ? 'Visível' : 'Invisível'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info text */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Dica:</span> Grupos invisíveis não aparecem no cardápio, 
                      assim como todas as categorias e produtos dentro deles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Left column - Basic info and image */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cat-name">Nome da Categoria *</Label>
                  <Input
                    id="cat-name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    placeholder="Ex: Sushi Especial"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cat-description">Descrição</Label>
                  <Textarea
                    id="cat-description"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                    placeholder="Descrição detalhada da categoria..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Imagem da Categoria (16:9)</Label>
                  <ImageUpload
                    value={categoryFormData.image}
                    onChange={(value) => setCategoryFormData({...categoryFormData, image: value})}
                    aspectRatio={16/9}
                    categoryName={categoryFormData.name}
                    categoryId={editingItem?.id?.toString()}
                  />
                </div>
              </div>

              {/* Right column - Group selection and status */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group">Grupo *</Label>
                  <Select 
                    value={categoryFormData.group_id}
                    onValueChange={(value) => setCategoryFormData({...categoryFormData, group_id: value})}
                  >
                    <SelectTrigger id="group">
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                          {group.type === 'rodizio' && (
                            <span className="ml-2 text-xs text-orange-600">
                              (Rodízio)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status section with better spacing */}
                <div className="pt-4 space-y-4">
                  <div>
                    <Label className="mb-3 block">Status da Categoria</Label>
                    <div className="space-y-3">
                      {/* Visibilidade */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Visibilidade</p>
                        <button
                          type="button"
                          onClick={() => setCategoryFormData({...categoryFormData, active: !categoryFormData.active})}
                          className={`w-full px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                            categoryFormData.active 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {categoryFormData.active ? 'Visível' : 'Invisível'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info text */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Dica:</span> Categorias invisíveis não aparecem no cardápio, 
                      assim como todos os produtos dentro delas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
                setGroupFormData({
                  name: "",
                  type: "a_la_carte",
                  price: "",
                  half_price: "",
                  active: true,
                  sort_order: 0,
                  icon: null
                });
                setCategoryFormData({
                  name: "",
                  description: "",
                  group_id: "",
                  active: false,
                  sort_order: 0,
                  image: ""
                });
                setSaving(false);
                setModalType('group');
              }}
              className="rounded-full"
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              onClick={modalType === 'group' ? saveGroup : saveCategory} 
              disabled={saving || (modalType === 'group' ? !groupFormData.name : (!categoryFormData.name || !categoryFormData.group_id))}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              type="button"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => setDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Tem certeza que deseja excluir {deletingItem?.type === 'group' ? 'o grupo' : 'a categoria'} "{deletingItem?.name}"? 
                </p>
                {deletingItem?.type === 'group' && (
                  <>
                    {((deletingItem.categoryCount || 0) > 0 || (deletingItem.itemCount || 0) > 0) ? (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-2">
                        <p className="text-red-600 dark:text-red-400 font-semibold">⚠️ Atenção: Esta ação irá apagar:</p>
                        <ul className="text-red-600 dark:text-red-400 text-sm mt-1 ml-4">
                          {(deletingItem.categoryCount || 0) > 0 && (
                            <li>• {deletingItem.categoryCount} {deletingItem.categoryCount === 1 ? 'categoria' : 'categorias'}</li>
                          )}
                          {(deletingItem.itemCount || 0) > 0 && (
                            <li>• {deletingItem.itemCount} {deletingItem.itemCount === 1 ? 'produto' : 'produtos'} do cardápio</li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mt-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Este grupo está vazio e pode ser excluído com segurança.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {deletingItem?.type === 'category' && (
                  <>
                    {(deletingItem?.itemCount || 0) > 0 ? (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-2">
                        <p className="text-red-600 dark:text-red-400 font-semibold">⚠️ Atenção:</p>
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          Esta categoria contém {deletingItem.itemCount} {deletingItem.itemCount === 1 ? 'produto' : 'produtos'} que {deletingItem.itemCount === 1 ? 'será' : 'serão'} excluído{deletingItem.itemCount === 1 ? '' : 's'} permanentemente.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mt-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Esta categoria está vazia e pode ser excluída com segurança.
                        </p>
                      </div>
                    )}
                  </>
                )}
                <p className="text-sm text-gray-500 mt-2">Esta ação não pode ser desfeita.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteItem}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Visualizando: {viewingImage.categoryName}</DialogTitle>
            </DialogHeader>
            
            <div className="relative">
              {/* Responsive image with max height */}
              <img 
                src={viewingImage.url} 
                alt={viewingImage.categoryName}
                className="w-full h-auto max-h-[60vh] object-contain rounded-xl"
              />
              
              {/* Actions */}
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Procurar a categoria em todos os grupos
                      let foundCategory: Category | undefined;
                      for (const group of groups) {
                        if (group.categories) {
                          foundCategory = group.categories.find(c => c.id.toString() === viewingImage.categoryId);
                          if (foundCategory) break;
                        }
                      }
                      
                      if (foundCategory) {
                        setViewingImage(null);
                        // Sinaliza para abrir o editor de foto diretamente
                        (window as any).autoOpenImageEditor = true;
                        openCategoryModal(foundCategory);
                      }
                    }}
                    className="rounded-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Foto
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Criar um link temporário para download
                      const link = document.createElement('a');
                      link.href = viewingImage.url;
                      link.download = `${viewingImage.categoryName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="rounded-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setViewingImage(null)}
                  className="rounded-full"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}