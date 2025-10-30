"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  Layers,
  Loader2,
  Save,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown
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
import type { Category, Group } from "@/types/supabase";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    group_id: "",
    active: true,
    sort_order: 0,
    image: ""
  });

  // Load data with retry logic for reliability
  const loadData = async () => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        // Load groups (all groups, not just active ones for management)
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .order('sort_order', { ascending: true });

        if (groupsError) throw groupsError;

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (categoriesError) throw categoriesError;

        setGroups(groupsData || []);
        setCategories(categoriesData || []);
        
        // Auto-expand all groups initially
        setExpandedGroups((groupsData || []).map((g: any) => g.id));
        
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
    toast.error("Erro ao carregar categorias. Por favor, recarregue a página.");
    setLoading(false);
  };

  // Load data on mount with small delay to ensure Supabase is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle group expansion
  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Get categories by group
  const getCategoriesByGroup = (groupId: number) => {
    return categories
      .filter(cat => cat.group_id === groupId)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  // Filter categories based on search
  const getFilteredGroups = () => {
    if (!searchTerm) return groups;
    
    return groups.filter(group => {
      const groupMatch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = getCategoriesByGroup(group.id).some(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return groupMatch || categoryMatch;
    });
  };

  // Open modal for new/edit
  const openModal = (category?: Category, groupId?: number) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        group_id: category.group_id?.toString() || "",
        active: category.active,
        sort_order: category.sort_order,
        image: category.image || ""
      });
    } else {
      setEditingCategory(null);
      const selectedGroupId = groupId?.toString() || groups[0]?.id.toString() || "";
      const maxOrder = categories
        .filter(c => c.group_id?.toString() === selectedGroupId)
        .reduce((max, c) => Math.max(max, c.sort_order), 0);
      
      setFormData({
        name: "",
        description: "",
        group_id: selectedGroupId,
        active: true,
        sort_order: maxOrder + 1,
        image: ""
      });
    }
    setIsModalOpen(true);
  };

  // Save category
  const saveCategory = async () => {
    try {
      setSaving(true);
      
      if (!formData.group_id) {
        toast.error("Selecione um grupo!");
        setSaving(false);
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        group_id: parseInt(formData.group_id),
        active: formData.active,
        sort_order: formData.sort_order,
        image: formData.image || null
      };

      console.log('Saving category:', categoryData);

      if (editingCategory) {
        // Update
        const { data, error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Updated category:', data);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // Insert
        const { data, error } = await supabase
          .from('categories')
          .insert([categoryData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Created category:', data);
        toast.success("Categoria criada com sucesso!");
      }

      setIsModalOpen(false);
      // Force reload after successful save
      await loadData();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error?.message || "Erro ao salvar categoria";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const deleteCategoryFunc = async () => {
    if (!deleteCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteCategory.id);

      if (error) throw error;
      
      toast.success("Categoria excluída com sucesso!");
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Erro ao excluir categoria");
    }
  };

  // Toggle active status
  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ active: !category.active })
        .eq('id', category.id);

      if (error) throw error;
      
      toast.success(`Categoria ${!category.active ? 'ativada' : 'desativada'}`);
      loadData();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error("Erro ao alterar status");
    }
  };

  // Update sort order within group
  const updateSortOrder = async (category: Category, direction: 'up' | 'down') => {
    try {
      const groupCategories = getCategoriesByGroup(category.group_id!);
      const currentIndex = groupCategories.findIndex(c => c.id === category.id);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= groupCategories.length) return;

      const targetCategory = groupCategories[newIndex];
      
      // Swap sort orders
      await supabase
        .from('categories')
        .update({ sort_order: targetCategory.sort_order })
        .eq('id', category.id);
        
      await supabase
        .from('categories')
        .update({ sort_order: category.sort_order })
        .eq('id', targetCategory.id);

      loadData();
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast.error("Erro ao alterar ordem");
    }
  };

  // Duplicate category
  const duplicateCategory = async (category: Category) => {
    try {
      const maxOrder = categories
        .filter(c => c.group_id === category.group_id)
        .reduce((max, c) => Math.max(max, c.sort_order), 0);
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name: `${category.name} (Cópia)`,
          description: category.description,
          group_id: category.group_id,
          active: false,
          sort_order: maxOrder + 1,
          image: category.image
        });

      if (error) throw error;
      
      toast.success("Categoria duplicada com sucesso!");
      loadData();
    } catch (error) {
      console.error('Error duplicating category:', error);
      toast.error("Erro ao duplicar categoria");
    }
  };

  // Get group type badge
  const getGroupTypeBadge = (group: Group) => {
    const colors = {
      rodizio: "bg-purple-500 text-white",
      bebidas: "bg-blue-500 text-white",
      a_la_carte: "bg-gray-500 text-white"
    };
    const labels = {
      rodizio: "Rodízio",
      bebidas: "Bebidas",
      a_la_carte: "À la carte"
    };
    return (
      <Badge className={colors[group.type] || colors.a_la_carte}>
        {labels[group.type] || group.type}
      </Badge>
    );
  };


  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="bg-black text-white p-6 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
              <p className="text-gray-400">Organize as categorias dentro dos grupos</p>
            </div>
          </div>
          <Button 
            onClick={() => openModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Categoria
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar categorias..."
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Groups and Categories */}
      <div className="space-y-4">
        {getFilteredGroups().map(group => {
          const groupCategories = getCategoriesByGroup(group.id);
          const isExpanded = expandedGroups.includes(group.id);

          return (
            <Card key={group.id} className="border-gray-800 bg-white dark:bg-black rounded-2xl overflow-hidden">
              {/* Group Header */}
              <div 
                className="p-4 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    {getGroupTypeBadge(group)}
                    {group.price && (
                      <Badge variant="outline">
                        R$ {group.price.toFixed(2)}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {groupCategories.length} categorias
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(undefined, group.id);
                    }}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Categories List */}
              {isExpanded && (
                <CardContent className="p-4 space-y-2">
                  {groupCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma categoria neste grupo</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal(undefined, group.id)}
                        className="mt-2 rounded-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Primeira Categoria
                      </Button>
                    </div>
                  ) : (
                    groupCategories.map((category, index) => (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl ${!category.active ? 'opacity-60' : ''}`}
                      >
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                          {/* Sort buttons */}
                          <div className="flex flex-col gap-0 group">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5"
                              onClick={() => updateSortOrder(category, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronRight className="h-3 w-3 rotate-[-90deg]" />
                            </Button>
                            <svg 
                              className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors duration-200" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                              />
                            </svg>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5"
                              onClick={() => updateSortOrder(category, 'down')}
                              disabled={index === groupCategories.length - 1}
                            >
                              <ChevronRight className="h-3 w-3 rotate-90" />
                            </Button>
                          </div>

                          {/* Category image - Always show image (placeholder if no image) */}
                          <img 
                            src={category.image || '/fotos/placeholder/placeholder.png'} 
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              // Se a imagem falhar, usa o placeholder
                              (e.target as HTMLImageElement).src = '/fotos/placeholder/placeholder.png';
                            }}
                          />

                          {/* Category info */}
                          <div>
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-gray-500">{category.description}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              Ordem: {category.sort_order}
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(category)}
                            className={`w-16 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              category.active 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                            }`}
                          >
                            {category.active ? 'Ativa' : 'Inativa'}
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-500 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openModal(category)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateCategory(category)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setDeleteCategory(category);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhum grupo encontrado</p>
            <p className="text-sm text-gray-400">Crie grupos primeiro em Cardápio → Grupos</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="bg-white dark:bg-black rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da categoria
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group">Grupo *</Label>
              <Select
                value={formData.group_id}
                onValueChange={(value) => setFormData({ ...formData, group_id: value })}
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name} ({group.type === 'rodizio' ? 'Rodízio' : group.type === 'bebidas' ? 'Bebidas' : 'À la carte'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Sushi, Sashimi, Temaki"
                className="rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da categoria..."
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="rounded-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordem</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors w-full ${
                    formData.active 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {formData.active ? 'Ativa' : 'Inativa'}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingCategory(null);
                setFormData({
                  name: '',
                  description: '',
                  group_id: '',
                  image: '',
                  active: true,
                  sort_order: 0
                });
                setSaving(false);
              }}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveCategory} 
              disabled={saving || !formData.name || !formData.group_id}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => setIsDeleteModalOpen(open)}>
        <AlertDialogContent className="bg-white dark:bg-black rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deleteCategory?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteCategoryFunc}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}