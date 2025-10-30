"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Loader2,
  Save
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
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [categories, setCategories] = useState<AdditionalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAdditional, setEditingAdditional] = useState<Additional | null>(null);
  const [deleteAdditional, setDeleteAdditional] = useState<Additional | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state for additional
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    active: true
  });

  // Form state for category
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    color: "#FF6B00"
  });

  // Load data with retry logic for reliability
  const loadData = async () => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        // Load categories first
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('additional_categories')
          .select('*')
          .order('name', { ascending: true });

        if (categoriesError) {
          console.error("Erro ao carregar categorias:", categoriesError);
          throw categoriesError;
        }

        // Load additionals without joins
        const { data: additionalsData, error: additionalsError } = await supabase
          .from('additionals')
          .select('*')
          .order('name', { ascending: true });

        if (additionalsError) {
          console.error("Erro ao carregar adicionais:", additionalsError);
          throw additionalsError;
        }

        setAdditionals(additionalsData || []);
        setCategories(categoriesData || []);
        
        return true;
      } catch (error) {
        console.error(`Erro ao carregar dados (tentativa ${retryCount + 1}/${maxRetries}):`, error);
        if (error instanceof Error) {
          console.error("Mensagem do erro:", error.message);
        }
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
    toast.error("Erro ao carregar adicionais. Por favor, recarregue a página.");
    setLoading(false);
  };

  // Load data on mount with small delay to ensure Supabase is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter additionals based on search
  const filteredAdditionals = additionals.filter(additional =>
    additional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    additional.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Open modal for new/edit additional
  const openModal = (additional?: Additional) => {
    if (additional) {
      setEditingAdditional(additional);
      setFormData({
        name: additional.name,
        description: additional.description || "",
        price: additional.price,
        category_id: additional.additional_category_id?.toString() || "",
        active: additional.active
      });
    } else {
      setEditingAdditional(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        active: true
      });
    }
    setIsModalOpen(true);
  };

  // Save additional
  const saveAdditional = async () => {
    try {
      setSaving(true);
      
      const additionalData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        active: formData.active
      };

      if (editingAdditional) {
        // Update
        const { error } = await supabase
          .from('additionals')
          .update(additionalData)
          .eq('id', editingAdditional.id);

        if (error) throw error;
        toast.success("Adicional atualizado com sucesso!");
      } else {
        // Insert
        const { error } = await supabase
          .from('additionals')
          .insert(additionalData);

        if (error) throw error;
        toast.success("Adicional criado com sucesso!");
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving additional:', error);
      toast.error("Erro ao salvar adicional");
    } finally {
      setSaving(false);
    }
  };

  // Save category
  const saveCategory = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('additional_categories')
        .insert({
          name: categoryFormData.name,
          color: categoryFormData.color
        });

      if (error) throw error;
      
      toast.success("Categoria criada com sucesso!");
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: "", color: "#FF6B00" });
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
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
      
      toast.success("Adicional excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setDeleteAdditional(null);
      loadData();
    } catch (error) {
      console.error('Error deleting additional:', error);
      toast.error("Erro ao excluir adicional");
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
      console.error('Error toggling active status:', error);
      toast.error("Erro ao alterar status");
    }
  };


  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          {/* Top Row: Title and Actions */}
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
                onClick={() => setIsCategoryModalOpen(true)}
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

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Gerencie os itens adicionais e extras do cardápio
          </p>

          {/* Active Filters */}
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
                        <Badge variant="outline" className="text-xs">
                          R$ {additional.price.toFixed(2)}
                        </Badge>
                        {additional.price === 0 && (
                          <Badge className="bg-green-500 text-white text-xs">
                            Grátis
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-500 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openModal(additional)}>
                            <Pencil className="h-3 w-3 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-500"
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

                {group.items.length === 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    Nenhum item nesta categoria
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(groupedAdditionals).length === 0 && (
          <div className="text-center py-12">
            <Plus className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Nenhum adicional encontrado" : "Nenhum adicional cadastrado"}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Additional Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAdditional ? "Editar Adicional" : "Adicionar Adicional"}</DialogTitle>
            <DialogDescription>
              {editingAdditional ? "Atualize as informações do adicional" : "Preencha as informações do novo adicional"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cream Cheese"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do adicional..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors w-32 ${
                  formData.active 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {formData.active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingAdditional(null);
              setFormData({
                name: '',
                description: '',
                price: 0,
                category_id: '',
                active: true
              });
              setSaving(false);
            }}>
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

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={(open) => setIsCategoryModalOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para agrupar adicionais
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Ex: Bebidas, Extras"
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCategoryModalOpen(false);
              setCategoryFormData({
                name: '',
                color: '#FF6B00'
              });
              setSaving(false);
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

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => setIsDeleteModalOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o adicional "{deleteAdditional?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}