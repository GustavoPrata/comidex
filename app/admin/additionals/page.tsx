"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  Loader2,
  Save,
  FolderPlus,
  Settings2,
  Package
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
import type { Additional, AdditionalCategory } from "@/types/supabase";

export default function AdditionalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("additionals");
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
  
  // Form state for additional
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    additional_category_id: "",
    active: true,
    sort_order: 0
  });

  // Form state for category
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    color: "#FF6B00",
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

  // Filter additionals
  const filteredAdditionals = additionals.filter(additional =>
    additional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    additional.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group additionals by category
  const groupedAdditionals = filteredAdditionals.reduce((acc, additional) => {
    const category = categories.find(c => c.id === additional.additional_category_id);
    const categoryName = category?.name || "Sem Categoria";
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category,
        items: []
      };
    }
    acc[categoryName].items.push(additional);
    return acc;
  }, {} as Record<string, { category?: AdditionalCategory, items: Additional[] }>);

  // Open modal for additional
  const openAdditionalModal = (additional?: Additional) => {
    if (additional) {
      setEditingAdditional(additional);
      setFormData({
        name: additional.name,
        description: additional.description || "",
        price: additional.price,
        additional_category_id: additional.additional_category_id?.toString() || "",
        active: additional.active,
        sort_order: additional.sort_order || 0
      });
    } else {
      setEditingAdditional(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        additional_category_id: categories[0]?.id?.toString() || "",
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
        color: category.color || "#FF6B00",
        sort_order: category.sort_order || 0
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        color: "#FF6B00",
        sort_order: 0
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Save additional
  const saveAdditional = async () => {
    try {
      setSaving(true);
      
      const additionalData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        additional_category_id: formData.additional_category_id || null,
        active: formData.active,
        sort_order: formData.sort_order
      };

      if (editingAdditional) {
        const { error } = await supabase
          .from('additionals')
          .update(additionalData)
          .eq('id', editingAdditional.id);

        if (error) throw error;
        toast.success("Adicional atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('additionals')
          .insert(additionalData);

        if (error) throw error;
        toast.success("Adicional criado com sucesso!");
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar adicional:', error);
      toast.error("Erro ao salvar adicional");
    } finally {
      setSaving(false);
    }
  };

  // Save category
  const saveCategory = async () => {
    try {
      setSaving(true);
      
      const categoryData = {
        name: categoryFormData.name,
        color: categoryFormData.color,
        sort_order: categoryFormData.sort_order
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('additional_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('additional_categories')
          .insert(categoryData);

        if (error) throw error;
        toast.success("Categoria criada com sucesso!");
      }
      
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: "", color: "#FF6B00", sort_order: 0 });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  // Delete additional
  const handleDeleteAdditional = async () => {
    if (!deleteAdditional) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('additionals')
        .delete()
        .eq('id', deleteAdditional.id);

      if (error) throw error;
      
      toast.success("Adicional excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setDeleteAdditional(null);
      loadData();
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
      
      // Check if category has additionals
      const additionalsInCategory = additionals.filter(a => a.additional_category_id === deleteCategory.id);
      
      if (additionalsInCategory.length > 0) {
        toast.error(`Não é possível excluir categoria com ${additionalsInCategory.length} adicionais. Remova os adicionais primeiro.`);
        setIsDeleteCategoryModalOpen(false);
        setSaving(false);
        return;
      }
      
      const { error } = await supabase
        .from('additional_categories')
        .delete()
        .eq('id', deleteCategory.id);

      if (error) throw error;
      
      toast.success("Categoria excluída com sucesso!");
      setIsDeleteCategoryModalOpen(false);
      setDeleteCategory(null);
      loadData();
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
      const { error } = await supabase
        .from('additionals')
        .update({ active: !additional.active })
        .eq('id', additional.id);

      if (error) throw error;
      
      toast.success(`Adicional ${!additional.active ? 'ativado' : 'desativado'}`);
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error("Erro ao alterar status");
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
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Gerencie as categorias e itens adicionais do cardápio
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6">
            <TabsTrigger value="additionals" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Adicionais
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* Additionals Tab */}
          <TabsContent value="additionals" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                onClick={() => openAdditionalModal()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Adicional
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedAdditionals).map(([categoryName, group]) => (
                  <Card key={categoryName} className="overflow-hidden">
                    <CardHeader 
                      className="pb-3"
                      style={{ backgroundColor: group.category?.color || '#6B7280' }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          {categoryName}
                        </h3>
                        <Badge className="bg-white/20 text-white border-white/20">
                          {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {group.items.map((additional) => (
                        <div 
                          key={additional.id} 
                          className={`flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 ${!additional.active ? 'opacity-60' : ''}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{additional.name}</p>
                            {additional.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {additional.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {additional.price === 0 ? (
                                <Badge className="bg-green-500 text-white text-xs">
                                  Grátis
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  R$ {additional.price.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleActive(additional)}
                              className={`w-16 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                additional.active 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-500 hover:bg-gray-600 text-white'
                              }`}
                            >
                              {additional.active ? 'Ativo' : 'Inativo'}
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openAdditionalModal(additional)}>
                                  <Pencil className="h-3 w-3 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setDeleteAdditional(additional);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                onClick={() => openCategoryModal()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => {
                  const categoryAdditionals = additionals.filter(a => a.additional_category_id === category.id);
                  return (
                    <Card key={category.id} className="overflow-hidden">
                      <div 
                        className="h-2"
                        style={{ backgroundColor: category.color || '#FF6B00' }}
                      />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {categoryAdditionals.length} {categoryAdditionals.length === 1 ? 'adicional' : 'adicionais'}
                              </Badge>
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: category.color }}
                                title="Cor da categoria"
                              />
                            </div>
                            {category.sort_order !== undefined && (
                              <p className="text-xs text-gray-500 mt-2">
                                Ordem: {category.sort_order}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openCategoryModal(category)}>
                                <Pencil className="h-3 w-3 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setDeleteCategory(category);
                                  setIsDeleteCategoryModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Gelo, Limão"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Para refrescar"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="sort">Ordem</Label>
                <Input
                  id="sort"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.additional_category_id}
                onValueChange={(value) => setFormData({ ...formData, additional_category_id: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Ativo</Label>
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

            <div className="space-y-2">
              <Label htmlFor="category-color">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  placeholder="#FF6B00"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-sort">Ordem</Label>
              <Input
                id="category-sort"
                type="number"
                min="0"
                value={categoryFormData.sort_order}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCategoryModalOpen(false);
              setCategoryFormData({ name: '', color: '#FF6B00', sort_order: 0 });
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
              onClick={handleDeleteAdditional}
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
              {additionals.filter(a => a.additional_category_id === deleteCategory?.id).length > 0 && (
                <span className="block mt-2 text-red-600">
                  Esta categoria possui adicionais. Remova os adicionais primeiro.
                </span>
              )}
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
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}