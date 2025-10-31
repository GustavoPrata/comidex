"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  ChevronDown,
  X,
  Save,
  Loader2,
  CheckCircle,
  ShoppingBag,
  FolderOpen,
  Camera,
  Edit,
  Download,
  Layers,
  Utensils,
  Wine,
  Coffee,
  ShoppingCart,
  MenuSquare,
  GlassWater,
  Package
} from "lucide-react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const supabase = createClient();
import type { Item, Category, Group, AdditionalCategory, Additional } from "@/types/supabase";

// Extended Item type with additional categories
type ItemWithAdditionalCategories = Item & {
  additional_categories?: string[];
};

// Sortable Product Row Component
function SortableProductRow({ 
  item, 
  toggleStatus, 
  toggleAvailability, 
  duplicateItem, 
  openModal, 
  setDeleteItem, 
  setIsDeleteModalOpen,
  setUnitEditItem,
  setIsUnitModalOpen,
  setPriceEditItem,
  setIsPriceModalOpen
}: { 
  item: ItemWithAdditionalCategories;
  toggleStatus: (item: Item) => void;
  toggleAvailability: (item: Item) => void;
  duplicateItem: (item: Item) => void;
  openModal: (item?: Item) => void;
  setDeleteItem: (item: Item | null) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setUnitEditItem: (item: Item | null) => void;
  setIsUnitModalOpen: (open: boolean) => void;
  setPriceEditItem: (item: Item | null) => void;
  setIsPriceModalOpen: (open: boolean) => void;
}) {
  const [viewImageOpen, setViewImageOpen] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [draggedImage, setDraggedImage] = useState<File | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle image drag & drop
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingImage(true);
    }
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Set the dragged file in window for ImageUpload to pick up
      (window as any).draggedImageFile = imageFile;
      openModal(item);
    }
  };

  // Handle image click
  const handleImageClick = () => {
    if (!item.image) {
      // If no image, signal to open file selector automatically
      (window as any).autoOpenImageSelector = true;
      openModal(item);
    } else {
      // If has image, open viewer
      setViewImageOpen(true);
    }
  };

  return (
    <>
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl ${!item.active ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
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

        {/* Image */}
        <div 
          className={`relative w-24 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
            isDraggingImage ? 'ring-2 ring-orange-500 ring-offset-2' : 'hover:ring-2 hover:ring-orange-500'
          }`}
          onClick={handleImageClick}
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
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

        {/* Name & Description */}
        <div className="flex-1">
          <p className="font-medium">{item.name}</p>
          {item.description && (
            <p className="text-sm text-gray-500">{item.description}</p>
          )}
          {item.additional_categories && item.additional_categories.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Plus className="h-3 w-3 text-orange-500" />
              <div className="flex flex-wrap gap-1">
                {item.additional_categories.map((catName, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  >
                    {catName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quantity & Price - Stacked */}
        <div className="flex flex-col gap-1">
          {item.quantity && (
            <Badge 
              className="bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors text-xs px-2 py-0.5 font-medium min-w-[90px] text-center inline-block"
              onClick={() => {
                setUnitEditItem(item);
                setIsUnitModalOpen(true);
              }}
            >
              {item.quantity}
            </Badge>
          )}
          {item.price !== null && item.price !== undefined && item.price > 0 && (
            <Badge 
              className="bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors text-xs px-2 py-0.5 font-medium min-w-[90px] text-center inline-block"
              onClick={() => {
                setPriceEditItem(item);
                setIsPriceModalOpen(true);
              }}
            >
              R$ {item.price.toFixed(2).replace('.', ',')}
            </Badge>
          )}
        </div>
        

        {/* Status Buttons - Stacked */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => toggleStatus(item)}
            className={`w-20 px-3 py-0.5 rounded-full text-xs font-medium transition-all text-center ${
              item.active 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {item.active ? 'Visível' : 'Invisível'}
          </button>

          <button
            onClick={() => toggleAvailability(item)}
            className={`w-20 px-3 py-0.5 rounded-full text-xs font-medium transition-all text-center ${
              item.available 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {item.available ? 'Disponível' : 'Esgotado'}
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => duplicateItem(item)}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          title="Duplicar"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => openModal(item)}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setDeleteItem(item);
            setIsDeleteModalOpen(true);
          }}
          className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    
    {/* Image Viewer Modal */}
    {viewImageOpen && item.image && (
      <Dialog open={viewImageOpen} onOpenChange={setViewImageOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Visualizando: {item.name}</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            {/* Responsive image with max height */}
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-auto max-h-[60vh] object-contain rounded-xl"
            />
            
            {/* Actions */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewImageOpen(false);
                    openModal(item);
                  }}
                  className="rounded-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Foto
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Create temporary download link
                    const link = document.createElement('a');
                    link.href = item.image!;
                    link.download = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
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
                onClick={() => setViewImageOpen(false)}
                className="rounded-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [items, setItems] = useState<ItemWithAdditionalCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [additionalCategories, setAdditionalCategories] = useState<AdditionalCategory[]>([]);
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [unitEditItem, setUnitEditItem] = useState<Item | null>(null);
  const [priceEditItem, setPriceEditItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [unitFormData, setUnitFormData] = useState({
    quantity: "",
    quantityValue: ""
  });
  const [priceFormData, setPriceFormData] = useState({
    price: ""
  });
  
  // State for additionals modal
  const [isAdditionalsModalOpen, setIsAdditionalsModalOpen] = useState(false);
  const [additionalsItem, setAdditionalsItem] = useState<Item | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    quantityValue: "", // Novo campo para o valor numérico
    price: "",
    category_id: "",
    group_id: "",
    active: true,
    available: true,
    image: "",
    additional_category_ids: [] as number[]
  });

  // Load data with retry logic for reliability
  const loadData = async () => {
    setLoading(true);
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async (): Promise<boolean> => {
      try {
        // Load items with relationships
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select(`
            *,
            category:categories(*),
            item_additional_categories (
              additional_category_id,
              additional_categories (
                id,
                name
              )
            )
          `)
          .order('sort_order', { ascending: true });

        if (itemsError) {
          console.error('Items error:', itemsError);
          throw itemsError;
        }

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (categoriesError) {
          console.error('Categories error:', categoriesError);
          throw categoriesError;
        }

        // Load groups
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .order('sort_order', { ascending: true });

        if (groupsError) {
          console.error('Groups error:', groupsError);
          throw groupsError;
        }
        
        // Load additional categories
        const { data: additionalCategoriesData, error: additionalCategoriesError } = await supabase
          .from('additional_categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (additionalCategoriesError) {
          console.error('Additional categories error:', additionalCategoriesError);
          throw additionalCategoriesError;
        }
        
        // Load additionals
        const { data: additionalsData, error: additionalsError } = await supabase
          .from('additionals')
          .select('*')
          .order('sort_order', { ascending: true });

        if (additionalsError) {
          console.error('Additionals error:', additionalsError);
          throw additionalsError;
        }
        
        // Process items to include additional category names
        const processedItems: ItemWithAdditionalCategories[] = (itemsData || []).map((item: any) => ({
          ...item,
          additional_categories: item.item_additional_categories?.map(
            (iac: any) => iac.additional_categories?.name
          ).filter(Boolean) || []
        }));
        
        setItems(processedItems);
        setCategories(categoriesData || []);
        setGroups(groupsData || []);
        setAdditionalCategories(additionalCategoriesData || []);
        setAdditionals(additionalsData || []);
        
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
    
    // All retries failed - set empty data to prevent infinite loading
    toast.error("Erro ao carregar produtos. Por favor, recarregue a página.");
    setItems([]);
    setCategories([]);
    setGroups([]);
    setAdditionalCategories([]);
    setAdditionals([]);
    setLoading(false);
  };

  // Load data on mount with small delay to ensure Supabase is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Set unit form data when opening unit modal
  useEffect(() => {
    if (unitEditItem && isUnitModalOpen) {
      const quantityParts = unitEditItem.quantity?.trim() || "";
      let quantity = "";
      let quantityValue = "";
      
      if (quantityParts.includes("gramas")) {
        quantity = "gramas";
        quantityValue = quantityParts.replace(" gramas", "").trim();
      } else if (quantityParts.includes("peças")) {
        quantity = "pecas";
        quantityValue = quantityParts.replace(" peças", "").trim();
      } else if (quantityParts.includes("ml")) {
        quantity = "ml";
        quantityValue = quantityParts.replace(" ml", "").trim();
      } else if (quantityParts === "Porção") {
        quantity = "porcao";
        quantityValue = "";
      }
      
      setUnitFormData({
        quantity,
        quantityValue
      });
    }
  }, [unitEditItem, isUnitModalOpen]);

  // Set price form data when opening price modal
  useEffect(() => {
    if (priceEditItem && isPriceModalOpen) {
      setPriceFormData({
        price: priceEditItem.price ? priceEditItem.price.toFixed(2).replace('.', ',') : ""
      });
    }
  }, [priceEditItem, isPriceModalOpen]);

  // Filter items based on search, group and category
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGroup = selectedGroup === "all" || 
                        (item.group_id && item.group_id.toString() === selectedGroup);
    
    const matchesCategory = selectedCategory === "all" || 
                           (item.category_id && item.category_id.toString() === selectedCategory);
    
    return matchesSearch && matchesGroup && matchesCategory;
  });

  // Group items by group and then by category (respecting sort_order)
  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = groups.find(g => g.id === item.group_id);
    const category = categories.find(c => c.id === item.category_id);
    
    // Skip items without valid group or category
    if (!group || !category) return acc;
    
    const groupName = group.name;
    const categoryName = category.name;
    
    if (!acc[groupName]) {
      acc[groupName] = {
        sortOrder: group.sort_order !== undefined && group.sort_order !== null ? group.sort_order : 9999,
        categories: {}
      };
    }
    if (!acc[groupName].categories[categoryName]) {
      acc[groupName].categories[categoryName] = {
        sortOrder: category.sort_order !== undefined && category.sort_order !== null ? category.sort_order : 9999,
        items: []
      };
    }
    acc[groupName].categories[categoryName].items.push(item);
    return acc;
  }, {} as Record<string, { sortOrder: number; categories: Record<string, { sortOrder: number; items: Item[] }> }>);

  // Sort groups and categories by sort_order (fallback to 9999 for undefined)
  const sortedGroupedItems = Object.entries(groupedItems)
    .sort(([, a], [, b]) => {
      const orderA = a.sortOrder !== undefined ? a.sortOrder : 9999;
      const orderB = b.sortOrder !== undefined ? b.sortOrder : 9999;
      return orderA - orderB;
    })
    .map(([groupName, groupData]) => ({
      groupName,
      categories: Object.entries(groupData.categories)
        .sort(([, a], [, b]) => {
          const orderA = a.sortOrder !== undefined ? a.sortOrder : 9999;
          const orderB = b.sortOrder !== undefined ? b.sortOrder : 9999;
          return orderA - orderB;
        })
        .map(([categoryName, categoryData]) => ({
          categoryName,
          items: categoryData.items.sort((a, b) => {
            const orderA = a.sort_order !== undefined && a.sort_order !== null ? a.sort_order : 9999;
            const orderB = b.sort_order !== undefined && b.sort_order !== null ? b.sort_order : 9999;
            return orderA - orderB;
          })
        }))
    }));

  // Open modal for new/edit
  const openModal = async (item?: Item) => {
    // Check if there are no groups or categories when trying to add a new product
    if (!item && (groups.length === 0 || categories.length === 0)) {
      setEditingItem(null);
      setIsModalOpen(true);
      return;
    }
    
    if (item) {
      setEditingItem(item);
      
      // Load additional categories for this item
      const { data: itemAdditionalCategories } = await supabase
        .from('item_additional_categories')
        .select('additional_category_id')
        .eq('item_id', item.id);
      
      // Parse quantity to separate value and unit
      let quantityUnit = "";
      let quantityValue = "";
      
      if (item.quantity) {
        if (item.quantity.toLowerCase() === "porção") {
          quantityUnit = "porcao";
        } else if (item.quantity.includes("gramas")) {
          quantityUnit = "gramas";
          quantityValue = item.quantity.replace(/\s*gramas/i, "").trim();
        } else if (item.quantity.includes("peças") || item.quantity.includes("pecas")) {
          quantityUnit = "pecas";
          quantityValue = item.quantity.replace(/\s*(peças|pecas)/i, "").trim();
        } else if (item.quantity.includes("ml")) {
          quantityUnit = "ml";
          quantityValue = item.quantity.replace(/\s*ml/i, "").trim();
        }
      }
      
      setFormData({
        name: item.name,
        description: item.description || "",
        quantity: quantityUnit,
        quantityValue: quantityValue,
        price: item.price && item.price > 0 ? item.price.toString() : "",
        category_id: item.category_id.toString(),
        group_id: item.group_id.toString(),
        active: item.active,
        available: item.available,
        image: item.image || "",
        additional_category_ids: itemAdditionalCategories?.map((ac: any) => ac.additional_category_id) || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        quantity: "",
        quantityValue: "",
        price: "",
        category_id: "",
        group_id: "",
        active: true,
        available: true,
        image: "",
        additional_category_ids: []
      });
    }
    setIsModalOpen(true);
  };

  // Save item
  const saveItem = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setSaving(true);
      
      console.log('Form Data:', formData);
      console.log('Parsed IDs:', {
        category_id: formData.category_id,
        category_parsed: parseInt(formData.category_id),
        group_id: formData.group_id, 
        group_parsed: parseInt(formData.group_id)
      });
      
      // Check if group is rodizio type
      const selectedGroup = groups.find(g => g.id.toString() === formData.group_id);
      const isRodizio = selectedGroup?.type === 'rodizio';
      
      // Handle image upload if it's a base64 string
      let imageUrl = formData.image;
      if (formData.image && formData.image.startsWith('data:')) {
        try {
          // Convert base64 to blob
          const response = await fetch(formData.image);
          const blob = await response.blob();
          
          // Create FormData for upload
          const uploadFormData = new FormData();
          uploadFormData.append('file', blob, 'product-image.jpg');
          uploadFormData.append('productName', formData.name);
          if (editingItem) {
            uploadFormData.append('productId', editingItem.id.toString());
          }
          
          // Upload to server
          const uploadResponse = await fetch('/api/upload-product-image', {
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
      
      // Build quantity string based on unit type
      let quantityString = null;
      if (formData.quantity === "porcao") {
        quantityString = "Porção";
      } else if (formData.quantity === "gramas" && formData.quantityValue) {
        quantityString = `${formData.quantityValue} gramas`;
      } else if (formData.quantity === "pecas" && formData.quantityValue) {
        quantityString = `${formData.quantityValue} peças`;
      } else if (formData.quantity === "ml" && formData.quantityValue) {
        quantityString = `${formData.quantityValue} ml`;
      }

      const itemData = {
        name: formData.name,
        description: formData.description || null,
        quantity: quantityString,
        price: isRodizio ? 0 : (formData.price ? parseFloat(formData.price) : 0),
        category_id: formData.category_id,  // Keep as string UUID
        group_id: formData.group_id,        // Keep as string UUID
        active: formData.active,
        available: formData.available,
        image: imageUrl || null
      };

      if (editingItem) {
        // Update
        const { data: updatedItem, error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', editingItem.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update additional categories
        // First, delete existing associations
        await supabase
          .from('item_additional_categories')
          .delete()
          .eq('item_id', editingItem.id);
        
        // Then, insert new associations
        if (formData.additional_category_ids && formData.additional_category_ids.length > 0) {
          const associations = formData.additional_category_ids.map(categoryId => ({
            item_id: editingItem.id,
            additional_category_id: categoryId
          }));
          
          await supabase
            .from('item_additional_categories')
            .insert(associations);
        }
        
        // Atualizar estado local sem recarregar página
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === editingItem.id ? updatedItem : item
          )
        );
        toast.success("Produto atualizado com sucesso!");
      } else {
        // Insert
        const { data: newItem, error } = await supabase
          .from('items')
          .insert(itemData)
          .select()
          .single();

        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }
        
        // Insert additional categories associations
        if (newItem && formData.additional_category_ids && formData.additional_category_ids.length > 0) {
          const associations = formData.additional_category_ids.map(categoryId => ({
            item_id: newItem.id,
            additional_category_id: categoryId
          }));
          
          await supabase
            .from('item_additional_categories')
            .insert(associations);
        }
        
        // Adicionar ao estado local sem recarregar página
        setItems(prevItems => [...prevItems, newItem]);
        toast.success("Produto criado com sucesso!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving item:', error);
      const errorMessage = error?.message || "Erro ao salvar produto";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!deleteItem) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', deleteItem.id);

      if (error) throw error;
      
      // Remover do estado local sem recarregar página
      setItems(prevItems => prevItems.filter(item => item.id !== deleteItem.id));
      
      toast.success("Produto excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Erro ao excluir produto");
    } finally {
      setSaving(false);
    }
  };

  // Save only price
  const handleSavePrice = async () => {
    if (!priceEditItem) return;

    try {
      setSaving(true);
      
      const priceValue = priceFormData.price ? parseFloat(priceFormData.price.replace(',', '.')) : 0;
      
      const { error } = await supabase
        .from('items')
        .update({ price: priceValue })
        .eq('id', priceEditItem.id);

      if (error) throw error;
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === priceEditItem.id 
            ? { ...item, price: priceValue }
            : item
        )
      );
      
      toast.success("Preço atualizado com sucesso!");
      setIsPriceModalOpen(false);
      setPriceEditItem(null);
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error("Erro ao atualizar preço");
    } finally {
      setSaving(false);
    }
  };

  // Save only unit
  const handleSaveUnit = async () => {
    if (!unitEditItem) return;

    try {
      setSaving(true);
      
      // Build the quantity string based on form values
      let quantityString = "";
      if (unitFormData.quantity === "gramas" || unitFormData.quantity === "pecas" || unitFormData.quantity === "ml") {
        if (unitFormData.quantityValue) {
          let unitLabel = "";
          if (unitFormData.quantity === "gramas") unitLabel = "gramas";
          else if (unitFormData.quantity === "pecas") unitLabel = "peças";
          else if (unitFormData.quantity === "ml") unitLabel = "ml";
          quantityString = `${unitFormData.quantityValue} ${unitLabel}`;
        }
      } else if (unitFormData.quantity === "porcao") {
        quantityString = "Porção";
      }
      
      const { error } = await supabase
        .from('items')
        .update({ quantity: quantityString })
        .eq('id', unitEditItem.id);

      if (error) throw error;
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === unitEditItem.id 
            ? { ...item, quantity: quantityString }
            : item
        )
      );
      
      toast.success("Unidade atualizada com sucesso!");
      setIsUnitModalOpen(false);
      setUnitEditItem(null);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error("Erro ao atualizar unidade");
    } finally {
      setSaving(false);
    }
  };

  // Toggle availability
  // Toggle status (active)
  const toggleStatus = async (item: Item) => {
    try {
      const { data: updatedItem, error } = await supabase
        .from('items')
        .update({ 
          active: !item.active
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar estado local sem recarregar página
      setItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id ? updatedItem : i
        )
      );
      
      toast.success(`Produto ${!item.active ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error("Erro ao alterar status");
    }
  };

  const toggleAvailability = async (item: Item) => {
    try {
      const { data: updatedItem, error } = await supabase
        .from('items')
        .update({ available: !item.available })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar estado local sem recarregar página
      setItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id ? updatedItem : i
        )
      );
      
      toast.success(`Produto marcado como ${!item.available ? 'disponível' : 'indisponível'}`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error("Erro ao alterar disponibilidade");
    }
  };

  // Duplicate item
  const duplicateItem = async (item: Item) => {
    try {
      // Criar novo item apenas com campos válidos da tabela items
      const newItem = {
        name: `${item.name} (Cópia)`,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        category_id: item.category_id,
        group_id: item.group_id,
        active: item.active,
        available: item.available,
        sort_order: item.sort_order,
        printer_id: item.printer_id
      };

      const { data: duplicatedItem, error } = await supabase
        .from('items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      
      // Adicionar ao estado local sem recarregar página
      setItems(prevItems => [...prevItems, duplicatedItem]);
      
      toast.success("Produto duplicado com sucesso!");
    } catch (error) {
      console.error('Error duplicating item:', error);
      toast.error("Erro ao duplicar produto");
    }
  };

  // Get categories for selected group
  // Note: Supabase returns bigint fields as strings, so we need to compare as strings
  const availableCategories = selectedGroup === "all" 
    ? categories
    : categories.filter(c => c.group_id?.toString() === selectedGroup);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    try {
      setActiveId(event.active.id as string);
      setIsDragging(true);
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } catch (error) {
      console.error("Erro ao iniciar drag:", error);
      setIsDragging(false);
    }
  }, []);

  // Handle drag end - reorder items within category
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    try {
      setIsDragging(false);
      setActiveId(null);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      if (!over || active.id === over.id) {
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find the items in the same category
      const activeItem = items.find(item => item.id.toString() === activeId);
      const overItem = items.find(item => item.id.toString() === overId);

      if (!activeItem || !overItem) return;

      // Only allow reordering within the same category
      if (activeItem.category_id !== overItem.category_id) {
        toast.error("Não é possível mover produtos entre categorias diferentes");
        return;
      }

      // Get items from the same category
      const categoryItems = items
        .filter(item => item.category_id === activeItem.category_id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const oldIndex = categoryItems.findIndex(item => item.id.toString() === activeId);
      const newIndex = categoryItems.findIndex(item => item.id.toString() === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder items
        const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex);
        
        // Update sort_order for all reordered items
        const updatedCategoryItems = reorderedItems.map((item, index) => ({
          ...item,
          sort_order: index
        }));

        // Update local state immediately
        const updatedItems = items.map(item => {
          const updatedItem = updatedCategoryItems.find(ui => ui.id === item.id);
          return updatedItem || item;
        });
        
        setItems(updatedItems);

        // Update database in background
        const updates = updatedCategoryItems.map((item, index) => ({
          id: item.id,
          sort_order: index
        }));

        // Update database asynchronously
        Promise.all(
          updates.map(update =>
            supabase
              .from("items")
              .update({ sort_order: update.sort_order })
              .eq("id", update.id)
          )
        ).then(results => {
          const hasError = results.some(r => r.error);
          if (hasError) {
            console.error("Erro ao atualizar ordem no banco");
            toast.error("Erro ao salvar ordem no banco");
            loadData(); // Reload on error
          } else {
            toast.success("Ordem dos produtos atualizada");
          }
        });
      }
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      setActiveId(null);
      setIsDragging(false);
    }
  }, [items]);


  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          {/* Top Row: Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Produtos</h1>
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
                Adicionar Produto
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Gerencie todos os itens organizados por grupos e categorias
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
                  setSelectedCategory("all");
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
                    onClick={() => {
                      setSelectedGroup(group.id.toString());
                      setSelectedCategory("all");
                    }}
                    className={selectedGroup === group.id.toString() ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full" : "rounded-full"}
                  >
                    {group.name}
                  </Button>
                ))}
            </div>
          </div>

          {/* Categories Section - Only show when a group is selected */}
          {selectedGroup !== "all" && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  <FolderOpen className="inline h-4 w-4 mr-1" />
                  Categorias
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full" : "rounded-full"}
                >
                  Todas as Categorias
                </Button>
                {availableCategories
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={selectedCategory === category.id.toString() ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full" : "rounded-full"}
                    >
                      {category.name}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || selectedGroup !== "all" || selectedCategory !== "all") && (
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
                    onClick={() => {
                      setSelectedGroup("all");
                      setSelectedCategory("all");
                    }}
                  />
                </div>
              )}
              {selectedCategory !== "all" && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm">
                  Categoria: {categories.find(c => c.id.toString() === selectedCategory)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-orange-700 dark:hover:text-orange-300" 
                    onClick={() => setSelectedCategory("all")}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-8">
          {sortedGroupedItems.map(({ groupName, categories: groupCategories }, groupIndex) => {
            const totalGroupItems = groupCategories.reduce((sum, cat) => sum + cat.items.length, 0);
            const groupObj = groups.find(g => g.name === groupName);
            const isRodizio = groupObj?.type === 'rodizio';
            
            return (
              <div key={groupName}>
                {/* Group Separator for non-first groups */}
                {groupIndex > 0 && (
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-600 to-transparent"></div>
                  </div>
                )}
                
                {/* Group Container */}
                <div className="space-y-6">
                  {/* Group Header - Minimal and Elegant */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-3xl"></div>
                    <div className="relative flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full">
                          {(() => {
                            // Escolhe ícone baseado no tipo ou nome do grupo
                            const groupNameLower = groupName.toLowerCase();
                            if (groupObj?.type === 'rodizio' || groupNameLower.includes('rodízio') || groupNameLower.includes('rodizio')) {
                              return <Utensils className="h-6 w-6" />;
                            } else if (groupObj?.type === 'a_la_carte' || groupNameLower.includes('carte')) {
                              return <MenuSquare className="h-6 w-6" />;
                            } else if (groupNameLower.includes('bebida') && groupNameLower.includes('alcoól')) {
                              return <Wine className="h-6 w-6" />;
                            } else if (groupNameLower.includes('vinho')) {
                              return <Wine className="h-6 w-6" />;
                            } else if (groupNameLower.includes('bebida')) {
                              return <Coffee className="h-6 w-6" />;
                            } else {
                              return <ShoppingCart className="h-6 w-6" />;
                            }
                          })()}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {groupName}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        {isRodizio && groupObj?.price && (
                          <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-sm font-bold">
                            R$ {groupObj.price.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {totalGroupItems > 0 && (
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                            <ShoppingBag className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">{totalGroupItems}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {totalGroupItems === 1 ? 'produto' : 'produtos'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="pl-16 space-y-4">
                    {groupCategories.map(({ categoryName, items: categoryItems }, categoryIndex) => {
                      // Find category and group info from the loaded data
                      const categoryObj = categories.find(c => c.name === categoryName);
                      const groupObj = groups.find(g => g.name === groupName);
                      
                      return (
                        <div key={categoryName}>
                          {/* Category Header - Clean and Subtle */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-px bg-orange-300 dark:bg-orange-600"></div>
                              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                                {categoryName}
                              </h3>
                              {categoryItems.length > 0 && (
                                <Badge variant="secondary" className="ml-2 scale-90">
                                  {categoryItems.length}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Products Container */}
                          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={categoryItems.map(item => item.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2">
                                  {categoryItems.map((item) => (
                                      <SortableProductRow
                                        key={item.id}
                                        item={item}
                                        toggleStatus={toggleStatus}
                                        toggleAvailability={toggleAvailability}
                                        duplicateItem={duplicateItem}
                                        openModal={openModal}
                                        setDeleteItem={setDeleteItem}
                                        setIsDeleteModalOpen={setIsDeleteModalOpen}
                                        setUnitEditItem={setUnitEditItem}
                                        setIsUnitModalOpen={setIsUnitModalOpen}
                                        setPriceEditItem={setPriceEditItem}
                                        setIsPriceModalOpen={setIsPriceModalOpen}
                                      />
                                    ))}
                                  
                                  {/* Botão de Adicionar Produto - apenas quando não está pesquisando */}
                                  {!searchTerm && (
                                    <div className="px-2 pb-2">
                                      <button
                                        onClick={() => {
                                          // Use category and group objects to get IDs
                                          if (categoryObj && groupObj) {
                                            setFormData({
                                              name: "",
                                              description: "",
                                              quantity: "",
                                              quantityValue: "",
                                              price: "",
                                              category_id: categoryObj.id.toString(),
                                              group_id: groupObj.id.toString(),
                                              active: true,
                                              available: true,
                                              image: "",
                                              additional_category_ids: []
                                            });
                                            setEditingItem(null);
                                            setIsModalOpen(true);
                                          } else if (categoryItems.length > 0) {
                                            // Fallback to using first item if objects not found
                                            const firstItem = categoryItems[0];
                                            setFormData({
                                              name: "",
                                              description: "",
                                              quantity: "",
                                              quantityValue: "",
                                              price: "",
                                              category_id: firstItem.category_id.toString(),
                                              group_id: firstItem.group_id.toString(),
                                              active: true,
                                              available: true,
                                              image: "",
                                              additional_category_ids: []
                                            });
                                            setEditingItem(null);
                                            setIsModalOpen(true);
                                          }
                                        }}
                                        className="w-full py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-orange-500"
                                        type="button"
                                      >
                                        <Plus className="h-4 w-4" />
                                        <span className="text-sm font-medium">Adicionar Produto</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </SortableContext>
                            </DndContext>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {sortedGroupedItems.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedGroup !== "all" || selectedCategory !== "all" 
                  ? "Nenhum produto encontrado com os filtros aplicados" 
                  : "Nenhum produto cadastrado"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {searchTerm || selectedGroup !== "all" || selectedCategory !== "all"
                  ? "Tente ajustar os filtros ou termo de busca" 
                  : (groups.length === 0 
                      ? "Primeiro, cadastre um grupo na aba 'Grupos e Categorias'"
                      : categories.length === 0 
                        ? "Primeiro, cadastre uma categoria na aba 'Grupos e Categorias'"
                        : "Clique em 'Adicionar Produto' para começar")}
              </p>
              {(groups.length === 0 || categories.length === 0) && !searchTerm && selectedGroup === "all" && selectedCategory === "all" && (
                <a
                  href="/admin/menu-structure"
                  className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Ir para Grupos e Categorias
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="max-w-4xl bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60">
          <DialogHeader>
            <DialogTitle>
              {!editingItem && (groups.length === 0 || categories.length === 0) 
                ? "Configuração Necessária" 
                : editingItem ? "Editar Produto" : "Adicionar Produto"}
            </DialogTitle>
            <DialogDescription>
              {!editingItem && (groups.length === 0 || categories.length === 0)
                ? "Para adicionar produtos, primeiro você precisa criar grupos e categorias."
                : editingItem ? "Atualize as informações do produto" : "Preencha as informações do novo produto"}
            </DialogDescription>
          </DialogHeader>

          {/* Show setup message if no groups or categories */}
          {!editingItem && (groups.length === 0 || categories.length === 0) ? (
            <div className="py-8">
              <div className="text-center space-y-4">
                {groups.length === 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                    <h3 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                      📁 Nenhum grupo cadastrado
                    </h3>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      Grupos organizam as categorias do cardápio (ex: Rodízio, À la Carte, Bebidas)
                    </p>
                  </div>
                )}
                
                {categories.length === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                      📋 Nenhuma categoria cadastrada
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Categorias organizam os produtos (ex: Sushis, Temakis, Sobremesas)
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {groups.length === 0 && categories.length === 0 
                      ? "Você precisa criar grupos E categorias para poder adicionar produtos"
                      : groups.length === 0 
                        ? "Você ainda precisa criar pelo menos um grupo"
                        : "Você ainda precisa criar pelo menos uma categoria"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Clique no botão abaixo para configurar
                  </p>
                  
                  <a
                    href="/admin/menu-structure"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors"
                  >
                    <FolderOpen className="h-5 w-5" />
                    Ir para Grupos e Categorias
                  </a>
                </div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left column - Basic info and image */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sushi de Salmão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do produto..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem do Produto (16:9)</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  aspectRatio={16/9}
                  categoryName={formData.name}
                  categoryId={editingItem?.id?.toString()}
                  isProduct={true}
                />
              </div>
            </div>

            {/* Right column - Category, pricing and status */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group">Grupo *</Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(value) => {
                    // Check if new group is rodizio and clear price if it is
                    const newGroup = groups.find(g => g.id.toString() === value);
                    if (newGroup?.type === 'rodizio') {
                      setFormData({ ...formData, group_id: value, category_id: '', price: '' });
                    } else {
                      setFormData({ ...formData, group_id: value, category_id: '' });
                    }
                  }}
                >
                  <SelectTrigger id="group" data-testid="select-group">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
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

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  disabled={!formData.group_id}
                >
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => cat.group_id?.toString() === formData.group_id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  {groups.find(g => g.id.toString() === formData.group_id)?.type === 'rodizio' ? (
                    <div className="flex items-center justify-center min-h-[2.5rem] px-4 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                      <span className="text-orange-600 dark:text-orange-400 font-medium text-sm whitespace-nowrap">
                        Incluso Rodízio
                      </span>
                    </div>
                  ) : (
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  )}
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="quantity">Unidade</Label>
                  <div className="flex gap-2">
                    {(formData.quantity === "gramas" || formData.quantity === "pecas" || formData.quantity === "ml") && (
                      <Input
                        type="number"
                        placeholder="Quantidade"
                        value={formData.quantityValue}
                        onChange={(e) => setFormData({ ...formData, quantityValue: e.target.value })}
                        className="flex-1"
                      />
                    )}
                    <Select
                      value={formData.quantity || ""}
                      onValueChange={(value) => setFormData({ ...formData, quantity: value })}
                    >
                      <SelectTrigger id="quantity" data-testid="select-quantity" className={formData.quantity === "gramas" || formData.quantity === "pecas" || formData.quantity === "ml" ? "w-32" : "w-full"}>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gramas">Gramas</SelectItem>
                        <SelectItem value="ml">ML</SelectItem>
                        <SelectItem value="pecas">Peças</SelectItem>
                        <SelectItem value="porcao">Porção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Categories Button */}
              <div className="space-y-2">
                <Label>Adicionais</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                  onClick={() => {
                    setAdditionalsItem(editingItem || {
                      id: 0,
                      name: formData.name,
                      description: formData.description,
                      price: parseFloat(formData.price) || 0,
                      category_id: parseInt(formData.category_id),
                      group_id: parseInt(formData.group_id),
                      active: formData.active,
                      available: formData.available,
                      quantity: formData.quantity,
                      image: formData.image,
                      sort_order: 0
                    } as Item);
                    setIsAdditionalsModalOpen(true);
                  }}
                >
                  <span className="flex items-center gap-2">
                    Configurar Adicionais
                  </span>
                  {formData.additional_category_ids.length > 0 && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                      {formData.additional_category_ids.length} selecionada{formData.additional_category_ids.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Status section with better spacing */}
              <div className="pt-4 space-y-4">
                <div>
                  <Label className="mb-3 block">Status do Produto</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Visibilidade */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Visibilidade</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          active: !formData.active
                        })}
                        className={`w-full px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                          formData.active 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {formData.active ? 'Visível' : 'Invisível'}
                      </button>
                    </div>

                    {/* Disponibilidade */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Disponibilidade</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, available: !formData.available })}
                        className={`w-full px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                          formData.available 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                              : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {formData.available ? 'Disponível' : 'Indisponível'}
                        </button>
                      </div>
                  </div>
                </div>

                {/* Info text */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Dica:</span> Produtos invisíveis não aparecem no cardápio. 
                    Produtos indisponíveis aparecem mas não podem ser pedidos.
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}

          {(groups.length === 0 || categories.length === 0) ? null : (
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  group_id: '',
                  category_id: '',
                  quantity: '',
                  quantityValue: '',
                  image: '',
                  active: true,
                  available: true,
                  additional_category_ids: []
                });
                setSaving(false);
              }}
              type="button"
              data-testid="button-cancel-item"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={saveItem}
              disabled={
                saving || 
                !formData.name || 
                !formData.group_id || 
                !formData.category_id ||
                (groups.find(g => g.id.toString() === formData.group_id)?.type !== 'rodizio' && 
                  (!formData.price || parseFloat(formData.price) <= 0))
              }
              type="button"
              data-testid="button-save-item"
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
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => setIsDeleteModalOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{deleteItem?.name}"? Esta ação não pode ser desfeita.
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

      {/* Unit Edit Modal */}
      <Dialog open={isUnitModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsUnitModalOpen(false);
          setUnitEditItem(null);
          setUnitFormData({ quantity: "", quantityValue: "" });
        } else {
          setIsUnitModalOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Unidade</DialogTitle>
            <DialogDescription>
              Altere a unidade do produto "{unitEditItem?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-quantity">Unidade</Label>
              <div className="flex gap-2">
                {(unitFormData.quantity === "gramas" || unitFormData.quantity === "pecas" || unitFormData.quantity === "ml") && (
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={unitFormData.quantityValue}
                    onChange={(e) => setUnitFormData({ ...unitFormData, quantityValue: e.target.value })}
                    className="flex-1"
                  />
                )}
                <Select
                  value={unitFormData.quantity || ""}
                  onValueChange={(value) => setUnitFormData({ ...unitFormData, quantity: value })}
                >
                  <SelectTrigger id="unit-quantity" className={unitFormData.quantity === "gramas" || unitFormData.quantity === "pecas" || unitFormData.quantity === "ml" ? "w-32" : "w-full"}>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gramas">Gramas</SelectItem>
                    <SelectItem value="ml">ML</SelectItem>
                    <SelectItem value="pecas">Peças</SelectItem>
                    <SelectItem value="porcao">Porção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUnitModalOpen(false);
                setUnitEditItem(null);
                setUnitFormData({ quantity: "", quantityValue: "" });
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleSaveUnit}
              disabled={saving || !unitFormData.quantity}
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

      {/* Price Edit Modal */}
      <Dialog open={isPriceModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsPriceModalOpen(false);
          setPriceEditItem(null);
          setPriceFormData({ price: "" });
        } else {
          setIsPriceModalOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Preço</DialogTitle>
            <DialogDescription>
              Altere o preço do produto "{priceEditItem?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (R$)</Label>
              <Input
                id="edit-price"
                type="text"
                placeholder="0,00"
                value={priceFormData.price}
                onChange={(e) => {
                  // Allow only numbers, comma and dot
                  const value = e.target.value.replace(/[^\d,\.]/g, '');
                  setPriceFormData({ price: value });
                }}
                className="text-lg font-semibold"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPriceModalOpen(false);
                setPriceEditItem(null);
                setPriceFormData({ price: "" });
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleSavePrice}
              disabled={saving || !priceFormData.price}
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
      
      {/* Additionals Configuration Modal */}
      <Dialog open={isAdditionalsModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAdditionalsModalOpen(false);
          setAdditionalsItem(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Adicionais</DialogTitle>
            <DialogDescription>
              Selecione categorias de adicionais para {additionalsItem?.name || formData.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            {/* Quick Actions */}
            {additionalCategories.length > 0 && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      additional_category_ids: additionalCategories.map(c => c.id)
                    });
                  }}
                  className="text-xs h-7"
                >
                  Marcar Todas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      additional_category_ids: []
                    });
                  }}
                  className="text-xs h-7"
                >
                  Limpar
                </Button>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              {additionalCategories.length > 0 ? (
                <>
                  {additionalCategories.map((category) => {
                    const isChecked = formData.additional_category_ids.includes(category.id);
                    const categoryAdditionals = additionals.filter(a => a.additional_category_id === category.id);
                    return (
                      <label
                        key={category.id}
                        className={`
                          block p-3 rounded-lg border cursor-pointer transition-all
                          ${isChecked 
                            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600' 
                            : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 border-gray-300 dark:border-gray-600"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  additional_category_ids: [...formData.additional_category_ids, category.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  additional_category_ids: formData.additional_category_ids.filter(id => id !== category.id)
                                });
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{category.name}</p>
                          </div>
                          {isChecked && (
                            <Badge variant="secondary" className="text-xs">
                              Selecionado
                            </Badge>
                          )}
                        </div>
                        {categoryAdditionals.length > 0 && (
                          <div className="mt-2 ml-7 text-xs text-gray-600 dark:text-gray-400">
                            {categoryAdditionals.map((additional, idx) => (
                              <span key={additional.id}>
                                {additional.name}
                                {additional.price > 0 && ` (+R$ ${additional.price.toFixed(2)})`}
                                {idx < categoryAdditionals.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </label>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Nenhuma categoria de adicionais cadastrada
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdditionalsModalOpen(false);
                      window.location.href = '/admin/additionals';
                    }}
                  >
                    Criar Categorias
                  </Button>
                </div>
              )}
            </div>
            
            {/* Status */}
            {formData.additional_category_ids.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {formData.additional_category_ids.length} de {additionalCategories.length} selecionadas
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdditionalsModalOpen(false);
                setAdditionalsItem(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                setIsAdditionalsModalOpen(false);
                setAdditionalsItem(null);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}