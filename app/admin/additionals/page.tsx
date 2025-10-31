"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Copy,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Package
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

const supabase = createClient();
import type { Additional, AdditionalCategory } from "@/types/supabase";

// Sortable Additional Item Component
function SortableAdditionalItem({ 
  additional, 
  onDuplicate,
  onEdit,
  onDelete,
  onToggleActive 
}: { 
  additional: Additional;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: additional.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 ${!additional.active ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-2 flex-1">
        {/* Drag Handle - Original */}
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
        
        <div className="flex-1">
          <p className="font-medium text-sm">{additional.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-sm font-medium ${additional.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {additional.price === 0 ? 'Grátis' : `R$ ${additional.price.toFixed(2).replace('.', ',')}`}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Status button */}
        <button
          onClick={onToggleActive}
          className={`w-16 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            additional.active 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {additional.active ? 'Ativo' : 'Inativo'}
        </button>
        
        {/* Action buttons */}
        <button
          onClick={onDuplicate}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          title="Duplicar"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdditionalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [categories, setCategories] = useState<AdditionalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [editingAdditional, setEditingAdditional] = useState<Additional | null>(null);
  const [editingCategory, setEditingCategory] = useState<AdditionalCategory | null>(null);
  const [deleteAdditional, setDeleteAdditional] = useState<Additional | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<AdditionalCategory | null>(null);
  const [saving, setSaving] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Form state for additional
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    additional_category_id: "",
    active: true,
    sort_order: 0
  });

  // Form state for category
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    sort_order: 0
  });

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('additional_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error("Erro ao carregar categorias:", categoriesError);
        throw categoriesError;
      }

      // Load additionals
      const { data: additionalsData, error: additionalsError } = await supabase
        .from('additionals')
        .select('*')
        .order('sort_order', { ascending: true });

      if (additionalsError) {
        console.error("Erro ao carregar adicionais:", additionalsError);
        throw additionalsError;
      }

      setCategories(categoriesData || []);
      setAdditionals(additionalsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter additionals based on search
  const filteredAdditionals = additionals.filter(additional =>
    additional.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group additionals by category - including empty categories
  const groupedAdditionals = categories.reduce((acc, category) => {
    const categoryName = category.name;
    const categoryItems = filteredAdditionals.filter(a => 
      a.additional_category_id === category.id
    );
    
    acc[categoryName] = {
      category,
      items: categoryItems
    };
    
    return acc;
  }, {} as Record<string, { category?: AdditionalCategory, items: Additional[] }>);
  
  // Add items without category
  const itemsWithoutCategory = filteredAdditionals.filter(a => 
    !a.additional_category_id || !categories.find(c => c.id === a.additional_category_id)
  );
  
  if (itemsWithoutCategory.length > 0) {
    groupedAdditionals["Sem Categoria"] = {
      category: undefined,
      items: itemsWithoutCategory
    };
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const categoryAdditionals = additionals
        .filter(a => a.additional_category_id?.toString() === categoryId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
      const oldIndex = categoryAdditionals.findIndex(item => item.id === active.id);
      const newIndex = categoryAdditionals.findIndex(item => item.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(categoryAdditionals, oldIndex, newIndex);
        
        // Update local state immediately for smooth UX
        const otherAdditionals = additionals.filter(a => a.additional_category_id?.toString() !== categoryId);
        const updatedCategoryAdditionals = newOrder.map((item, index) => ({
          ...item,
          sort_order: index
        }));
        
        const newAdditionals = [...otherAdditionals, ...updatedCategoryAdditionals]
          .sort((a, b) => {
            if (a.additional_category_id === b.additional_category_id) {
              return (a.sort_order || 0) - (b.sort_order || 0);
            }
            return 0;
          });
        
        setAdditionals(newAdditionals);
        
        // Update database
        try {
          const updates = newOrder.map((item, index) => 
            supabase
              .from('additionals')
              .update({ sort_order: index })
              .eq('id', item.id)
          );
          
          await Promise.all(updates);
          toast.success("Ordem atualizada com sucesso!");
        } catch (error) {
          console.error('Erro ao atualizar ordem:', error);
          toast.error("Erro ao atualizar ordem");
          loadData(); // Reload on error
        }
      }
    }
  };

  // Open modal for new/edit additional
  const openModal = (additional?: Additional) => {
    if (additional) {
      setEditingAdditional(additional);
      setFormData({
        name: additional.name,
        price: additional.price || 0,
        additional_category_id: additional.additional_category_id ? String(additional.additional_category_id) : "",
        active: additional.active !== false,
        sort_order: additional.sort_order || 0
      });
    } else {
      setEditingAdditional(null);
      const firstCategoryId = categories.length > 0 && categories[0]?.id ? String(categories[0].id) : "";
      setFormData({
        name: "",
        price: 0,
        additional_category_id: firstCategoryId,
        active: true,
        sort_order: 0
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for category
  const openCategoryModal = (category?: AdditionalCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        sort_order: category.sort_order || 0
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        sort_order: 0
      });
    }
    setIsCategoryModalOpen(true);
  };


  // Duplicate category
  const duplicateCategory = async (category: AdditionalCategory) => {
    try {
      // Step 1: Create the new category
      const newCategory = {
        name: `${category.name} (Cópia)`,
        sort_order: (categories.reduce((max, c) => Math.max(max, c.sort_order || 0), 0)) + 1
      };

      const { data: newCategoryData, error: categoryError } = await supabase
        .from('additional_categories')
        .insert(newCategory)
        .select()
        .single();

      if (categoryError) {
        throw categoryError;
      }
      
      // Step 2: Get all additionals from the original category
      const categoryAdditionals = additionals.filter(a => 
        a.additional_category_id === category.id
      );
      
      // Step 3: Duplicate all additionals for the new category
      if (categoryAdditionals.length > 0) {
        const newAdditionals = categoryAdditionals.map((additional, index) => ({
          name: additional.name,
          price: additional.price,
          additional_category_id: newCategoryData.id,
          active: additional.active,
          sort_order: additional.sort_order || index
        }));
        
        const { data: newAdditionalsData, error: additionalsError } = await supabase
          .from('additionals')
          .insert(newAdditionals)
          .select();
        
        if (additionalsError) {
          console.error('Erro ao duplicar adicionais:', additionalsError);
          toast.error("Erro ao duplicar alguns adicionais");
        } else if (newAdditionalsData) {
          // Update local state with new additionals
          setAdditionals(prev => [...prev, ...newAdditionalsData].sort((a, b) => {
            if (a.additional_category_id === b.additional_category_id) {
              return (a.sort_order || 0) - (b.sort_order || 0);
            }
            return 0;
          }));
        }
      }
      
      // Update local state with new category
      setCategories(prev => [...prev, newCategoryData].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      
      toast.success(`Categoria "${category.name}" duplicada com ${categoryAdditionals.length} itens!`);
    } catch (error) {
      console.error('Erro ao duplicar categoria:', error);
      toast.error("Erro ao duplicar categoria");
    }
  };

  // Save additional
  const saveAdditional = async () => {
    try {
      setSaving(true);
      
      // Get the category ID (UUID) or null
      const categoryId = formData.additional_category_id && formData.additional_category_id !== "none" ? 
        formData.additional_category_id : null;
      
      // Calculate sort_order for new items
      let sort_order = formData.sort_order || 0;
      if (!editingAdditional) {
        // Get max sort_order for this category and add 1
        const categoryAdditionals = additionals.filter(a => a.additional_category_id === categoryId);
        const maxOrder = categoryAdditionals.reduce((max, a) => Math.max(max, a.sort_order || 0), 0);
        sort_order = maxOrder + 1;
      }
      
      const additionalData = {
        name: formData.name,
        price: parseFloat(String(formData.price)) || 0,
        additional_category_id: categoryId,
        active: formData.active,
        sort_order: sort_order
      };

      if (editingAdditional) {
        const { data, error } = await supabase
          .from('additionals')
          .update(additionalData)
          .eq('id', editingAdditional.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setAdditionals(prev => prev.map(item => 
          item.id === editingAdditional.id ? data : item
        ).sort((a, b) => {
          if (a.additional_category_id === b.additional_category_id) {
            return (a.sort_order || 0) - (b.sort_order || 0);
          }
          return 0;
        }));
        
        toast.success("Adicional atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('additionals')
          .insert(additionalData)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setAdditionals(prev => [...prev, data].sort((a, b) => {
          if (a.additional_category_id === b.additional_category_id) {
            return (a.sort_order || 0) - (b.sort_order || 0);
          }
          return 0;
        }));
        
        toast.success("Adicional criado com sucesso!");
      }

      setIsModalOpen(false);
      // Reset form data
      setFormData({
        name: "",
        price: 0,
        additional_category_id: "",
        active: true,
        sort_order: 0
      });
      setEditingAdditional(null);
    } catch (error: any) {
      console.error('Erro ao salvar adicional:', error);
      const errorMessage = error?.message || error?.details || "Erro ao salvar adicional";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Save category
  const saveCategory = async () => {
    try {
      setSaving(true);
      
      // Calculate sort_order for new categories
      let sort_order = categoryFormData.sort_order || 0;
      if (!editingCategory) {
        // Get max sort_order and add 1
        const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
        sort_order = maxOrder + 1;
      }
      
      const categoryData = {
        name: categoryFormData.name,
        sort_order: sort_order
      };

      if (editingCategory) {
        const { data, error } = await supabase
          .from('additional_categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setCategories(prev => prev.map(item => 
          item.id === editingCategory.id ? data : item
        ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('additional_categories')
          .insert(categoryData)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setCategories(prev => [...prev, data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        
        toast.success("Categoria criada com sucesso!");
      }
      
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: "", sort_order: 0 });
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  // Delete additional
  const handleDelete = async () => {
    if (!deleteAdditional) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('additionals')
        .delete()
        .eq('id', deleteAdditional.id);

      if (error) throw error;
      
      // Update local state
      setAdditionals(prev => prev.filter(item => item.id !== deleteAdditional.id));
      
      toast.success("Adicional excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setDeleteAdditional(null);
    } catch (error) {
      console.error('Erro ao excluir adicional:', error);
      toast.error("Erro ao excluir adicional");
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;

    try {
      setSaving(true);
      
      // Get all additionals in this category
      const additionalsInCategory = additionals.filter(a => a.additional_category_id === deleteCategory.id);
      
      // First delete all additionals in this category
      if (additionalsInCategory.length > 0) {
        const { error: deleteAdditionalsError } = await supabase
          .from('additionals')
          .delete()
          .eq('additional_category_id', deleteCategory.id);
          
        if (deleteAdditionalsError) {
          console.error('Erro ao excluir adicionais:', deleteAdditionalsError);
          throw deleteAdditionalsError;
        }
        
        // Update local state - remove additionals
        setAdditionals(prev => prev.filter(a => a.additional_category_id !== deleteCategory.id));
      }
      
      // Then delete the category
      const { error } = await supabase
        .from('additional_categories')
        .delete()
        .eq('id', deleteCategory.id);

      if (error) throw error;
      
      // Update local state - remove category
      setCategories(prev => prev.filter(item => item.id !== deleteCategory.id));
      
      if (additionalsInCategory.length > 0) {
        toast.success(`Categoria "${deleteCategory.name}" e ${additionalsInCategory.length} itens excluídos!`);
      } else {
        toast.success("Categoria excluída com sucesso!");
      }
      
      setIsDeleteCategoryModalOpen(false);
      setDeleteCategory(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error("Erro ao excluir categoria");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const toggleActive = async (additional: Additional) => {
    try {
      const newStatus = !additional.active;
      
      const { error } = await supabase
        .from('additionals')
        .update({ active: newStatus })
        .eq('id', additional.id);

      if (error) throw error;
      
      // Update local state
      setAdditionals(prev => prev.map(item => 
        item.id === additional.id ? { ...item, active: newStatus } : item
      ));
      
      toast.success(`Adicional ${newStatus ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error("Erro ao alterar status");
    }
  };

  // Duplicate additional - Insert right below original
  const duplicateAdditional = async (additional: Additional) => {
    try {
      // Find all items in the same category sorted by sort_order
      const categoryAdditionals = additionals
        .filter(a => a.additional_category_id === additional.additional_category_id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
      // Find the index of the current item
      const currentIndex = categoryAdditionals.findIndex(a => a.id === additional.id);
      
      // Calculate sort_order to place it right after the original
      let newSortOrder: number;
      if (currentIndex < categoryAdditionals.length - 1) {
        // There's an item after, place between current and next
        const currentOrder = additional.sort_order || 0;
        const nextOrder = categoryAdditionals[currentIndex + 1].sort_order || 0;
        // Use average for placement between items
        newSortOrder = (currentOrder + nextOrder) / 2;
      } else {
        // It's the last item, add 1 to its sort_order
        newSortOrder = (additional.sort_order || 0) + 1;
      }
      
      const newAdditional = {
        name: `${additional.name} (cópia)`,
        price: additional.price,
        active: additional.active,
        additional_category_id: additional.additional_category_id,
        sort_order: newSortOrder
      };

      const { data, error } = await supabase
        .from('additionals')
        .insert(newAdditional)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state - insert at the right position
      setAdditionals(prev => {
        const updated = [...prev];
        // Find where to insert based on sort_order and category
        const insertIndex = updated.findIndex((a, idx) => {
          // If same category and item comes after original
          if (a.additional_category_id === additional.additional_category_id) {
            // Find the original item index
            const origIdx = updated.findIndex(x => x.id === additional.id);
            // Insert right after the original
            return idx > origIdx && (a.sort_order || 0) > newSortOrder;
          }
          return false;
        });
        
        if (insertIndex === -1) {
          // If no position found, find original and insert after it
          const origIndex = updated.findIndex(a => a.id === additional.id);
          if (origIndex !== -1) {
            updated.splice(origIndex + 1, 0, data);
          } else {
            updated.push(data);
          }
        } else {
          // Insert at the correct position
          updated.splice(insertIndex, 0, data);
        }
        return updated;
      });
      
      toast.success("Adicional duplicado com sucesso!");
    } catch (error) {
      console.error('Erro ao duplicar adicional:', error);
      toast.error("Erro ao duplicar adicional");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Adicionais</h1>
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
                onClick={() => openCategoryModal()}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                onClick={() => openModal()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Gerencie os itens adicionais e extras do cardápio
          </p>

          {searchTerm && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filtros ativos:</span>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                Pesquisa: "{searchTerm}"
                <Trash2 
                  className="h-3 w-3 cursor-pointer hover:text-orange-700 dark:hover:text-orange-300" 
                  onClick={() => setSearchTerm("")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(groupedAdditionals).map(([categoryName, group]) => (
              <Card key={categoryName} className="overflow-hidden h-fit">
                <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {categoryName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                    {group.category && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateCategory(group.category!)}
                          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                          title="Duplicar"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openCategoryModal(group.category)}
                          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteCategory(group.category || null);
                            setIsDeleteCategoryModalOpen(true);
                          }}
                          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="h-[280px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, group.category?.id?.toString() || '')}
                    >
                      <SortableContext
                        items={group.items.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {group.items.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm text-gray-500">
                              Nenhum adicional nesta categoria
                            </div>
                          ) : (
                            group.items.map((additional) => (
                              <SortableAdditionalItem
                                key={additional.id}
                                additional={additional}
                                onDuplicate={() => duplicateAdditional(additional)}
                                onEdit={() => openModal(additional)}
                                onDelete={() => {
                                  setDeleteAdditional(additional);
                                  setIsDeleteModalOpen(true);
                                }}
                                onToggleActive={() => toggleActive(additional)}
                              />
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                  
                  {/* Add new additional button */}
                  <button
                    onClick={() => {
                      setFormData({
                        name: "",
                        price: 0,
                        additional_category_id: group.category?.id ? String(group.category.id) : "",
                        active: true,
                        sort_order: 0
                      });
                      setEditingAdditional(null);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-orange-500"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Adicionar Item</span>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Additional Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAdditional ? 'Editar Adicional' : 'Novo Adicional'}
            </DialogTitle>
            <DialogDescription>
              {editingAdditional ? 'Edite as informações do adicional' : 'Adicione um novo item adicional ao cardápio'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Gelo, Limão"
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.additional_category_id || "none"}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    additional_category_id: value === "none" ? "" : value 
                  })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 space-y-2">
                <Label>Status</Label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    formData.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {formData.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={saveAdditional}
              disabled={saving || !formData.name}
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

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Edite as informações da categoria' : 'Crie uma nova categoria para agrupar adicionais'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome</Label>
              <Input
                id="category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Ex: Refrigerante, Extras"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCategoryModalOpen(false);
              setCategoryFormData({ name: '', sort_order: 0 });
              setEditingCategory(null);
            }}>
              Cancelar
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={saveCategory}
              disabled={saving || !categoryFormData.name}
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

      {/* Delete Additional Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Adicional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o adicional "{deleteAdditional?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteModalOpen(false);
              setDeleteAdditional(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Modal */}
      <AlertDialog open={isDeleteCategoryModalOpen} onOpenChange={setIsDeleteCategoryModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deleteCategory?.name}"?
              {deleteCategory && (() => {
                const count = additionals.filter(a => a.additional_category_id === deleteCategory.id).length;
                return count > 0 ? (
                  <span className="block mt-2 font-semibold text-destructive">
                    ⚠️ Todos os {count} {count === 1 ? 'item' : 'itens'} dentro desta categoria também serão excluídos!
                  </span>
                ) : null;
              })()}
              <span className="block mt-2">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteCategoryModalOpen(false);
              setDeleteCategory(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCategory}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Tudo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}