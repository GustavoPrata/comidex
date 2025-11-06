'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { 
  DndContext, 
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
  restrictToWindowEdges
} from '@dnd-kit/modifiers';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  FileText, 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Loader2, 
  Search,
  Type,
  Hash,
  Calendar,
  Clock,
  Image,
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Move,
  Copy,
  Settings2,
  Eye,
  EyeOff,
  Download,
  Upload,
  Code,
  Smartphone,
  Monitor,
  Printer as PrinterIcon,
  QrCode,
  BarChart,
  DollarSign,
  Percent,
  Divide,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
  ShoppingBag,
  Receipt,
  CheckSquare,
  Square,
  Circle,
  Star,
  Heart,
  AlertTriangle,
  Info,
  HelpCircle,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Layers,
  Layout,
  Grid3x3,
  Columns,
  Rows,
  Palette,
  Brush,
  Zap
} from "lucide-react";
import useSWR, { mutate } from 'swr';

// Fix missing import
const Tag = Package;

// Tipos de templates disponíveis
const templateTypes = [
  { value: 'receipt', label: 'Cupom Fiscal', icon: Receipt },
  { value: 'order', label: 'Comanda', icon: FileText },
  { value: 'kitchen', label: 'Pedido Cozinha', icon: Package },
  { value: 'report', label: 'Relatório', icon: BarChart },
  { value: 'label', label: 'Etiqueta', icon: Tag },
  { value: 'invoice', label: 'Nota Fiscal', icon: CreditCard }
];

// Elementos disponíveis para arrastar
const elementLibrary = [
  {
    category: 'Texto',
    elements: [
      { id: 'text', type: 'text', icon: Type, label: 'Texto', defaultContent: 'Texto aqui', style: { fontSize: '12px' } },
      { id: 'title', type: 'text', icon: Type, label: 'Título', defaultContent: 'TÍTULO', style: { fontSize: '16px', fontWeight: 'bold', textAlign: 'center' } },
      { id: 'subtitle', type: 'text', icon: Type, label: 'Subtítulo', defaultContent: 'Subtítulo', style: { fontSize: '14px', textAlign: 'center' } }
    ]
  },
  {
    category: 'Dados',
    elements: [
      { id: 'date', type: 'variable', icon: Calendar, label: 'Data', defaultContent: '{{date}}' },
      { id: 'time', type: 'variable', icon: Clock, label: 'Hora', defaultContent: '{{time}}' },
      { id: 'order_number', type: 'variable', icon: Hash, label: 'Nº Pedido', defaultContent: '{{order_number}}' },
      { id: 'customer_name', type: 'variable', icon: User, label: 'Cliente', defaultContent: '{{customer_name}}' },
      { id: 'total', type: 'variable', icon: DollarSign, label: 'Total', defaultContent: '{{total}}' },
      { id: 'table_number', type: 'variable', icon: Square, label: 'Mesa', defaultContent: '{{table_number}}' }
    ]
  },
  {
    category: 'Elementos',
    elements: [
      { id: 'line', type: 'line', icon: Minus, label: 'Linha', defaultContent: '--------------------------------', style: { fontSize: '12px', letterSpacing: '-1px' } },
      { id: 'double_line', type: 'line', icon: Divide, label: 'Linha Dupla', defaultContent: '================================', style: { fontSize: '12px', letterSpacing: '-1px' } },
      { id: 'qrcode', type: 'qrcode', icon: QrCode, label: 'QR Code', defaultContent: '{{qrcode}}' },
      { id: 'barcode', type: 'barcode', icon: BarChart, label: 'Código de Barras', defaultContent: '{{barcode}}' },
      { id: 'logo', type: 'image', icon: Image, label: 'Logo', defaultContent: '{{logo}}' },
      { id: 'spacer', type: 'spacer', icon: Maximize2, label: 'Espaço', defaultContent: ' ' }
    ]
  },
  {
    category: 'Tabelas',
    elements: [
      { id: 'items_table', type: 'table', icon: Grid3x3, label: 'Tabela de Itens', defaultContent: '{{items_table}}' },
      { id: 'totals_table', type: 'table', icon: Grid3x3, label: 'Tabela de Totais', defaultContent: '{{totals_table}}' }
    ]
  }
];

// Componente de elemento arrastável
function DraggableElement({ id, element, isPreview = false }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: id,
    data: element
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isPreview ? 'default' : 'move'
  };

  const Icon = element.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isPreview ? {} : listeners)}
      {...(isPreview ? {} : attributes)}
      className={`
        p-2 bg-white dark:bg-gray-800 border rounded-lg
        ${isPreview ? '' : 'hover:border-orange-500 hover:shadow-md'}
        transition-all duration-200 select-none
        ${isDragging ? 'z-50 shadow-xl' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-500" />
        <span className="text-xs font-medium">{element.label}</span>
      </div>
    </div>
  );
}

// Componente principal da página de templates
export default function TemplatesPage() {
  const supabase = createClient();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateType, setTemplateType] = useState('receipt');
  const [templateName, setTemplateName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Canvas state
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [elementProperties, setElementProperties] = useState<any>({
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    textDecoration: 'none',
    color: '#000000',
    backgroundColor: 'transparent',
    width: 'auto',
    height: 'auto',
    padding: 0,
    margin: 0
  });

  // Canvas dimensions - 80mm thermal printer
  const [canvasWidth, setCanvasWidth] = useState(302); // 80mm width at screen resolution
  const [canvasHeight, setCanvasHeight] = useState(800); // Variable height for continuous paper

  // Fetch templates from database
  const { data: templates, isLoading } = useSWR('templates', async () => {
    const { data, error } = await supabase
      .from('print_templates')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Erro ao carregar templates');
      return [];
    }
    return data || [];
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveElementId(event.active.id as string);
    setDraggedElement(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta, activatorEvent } = event;

    if (!over) {
      setActiveElementId(null);
      setDraggedElement(null);
      return;
    }

    if (over.id === 'canvas') {
      // Adding new element to canvas
      const element = active.data.current;
      if (element && !active.id.toString().startsWith('canvas_element_')) {
        // Get mouse position relative to canvas
        let x = 10;
        let y = 10;
        
        // Try to get the drop position from the event
        if (activatorEvent && 'clientX' in activatorEvent) {
          const canvasRect = document.getElementById('template-canvas')?.getBoundingClientRect();
          if (canvasRect) {
            x = Math.max(10, Math.min((activatorEvent as MouseEvent).clientX - canvasRect.left + delta.x, canvasWidth - 100));
            y = Math.max(10, Math.min((activatorEvent as MouseEvent).clientY - canvasRect.top + delta.y, canvasHeight - 50));
          }
        } else {
          // Fallback: position based on existing elements
          y = canvasElements.length * 40 + 10;
        }
        
        const newElement = {
          id: `element_${Date.now()}`,
          ...element,
          position: { x, y },
          style: element.style || {}
        };
        setCanvasElements([...canvasElements, newElement]);
      } else if (active.id.toString().startsWith('canvas_element_')) {
        // Moving existing element - update its position
        const elementId = active.id.toString().replace('canvas_element_', '');
        const currentElement = canvasElements.find(e => e.id === elementId);
        
        if (currentElement) {
          const newX = Math.max(0, Math.min((currentElement.position?.x || 0) + delta.x, canvasWidth - 100));
          const newY = Math.max(0, Math.min((currentElement.position?.y || 0) + delta.y, canvasHeight - 50));
          
          setCanvasElements(elements =>
            elements.map(e =>
              e.id === elementId
                ? { ...e, position: { x: newX, y: newY } }
                : e
            )
          );
        }
      }
    }

    setActiveElementId(null);
    setDraggedElement(null);
  };

  // Canvas drop area
  function CanvasDropArea() {
    const { setNodeRef } = useDroppable({
      id: 'canvas'
    });

    return (
      <div
        id="template-canvas"
        ref={setNodeRef}
        className="relative overflow-hidden"
        style={{ 
          width: canvasWidth, 
          height: canvasHeight,
          minHeight: 400,
          background: 'linear-gradient(to bottom, #fdfdf8, #f9f9f4)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)'
        }}
      >
        {/* Thermal paper texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="2" height="2" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="2" height="2" fill="%23000" /%3E%3C/svg%3E")',
            backgroundSize: '2px 2px'
          }}
        />
        
        {/* Grid helper lines - very subtle */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" stroke-width="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)" /%3E%3C/svg%3E")'
          }}
        />

        {/* Canvas elements */}
        {canvasElements.map((element, index) => (
          <CanvasElement
            key={element.id}
            element={element}
            index={index}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => setSelectedElement(element)}
            onUpdate={(updatedElement: any) => {
              setCanvasElements(elements =>
                elements.map(e => e.id === updatedElement.id ? updatedElement : e)
              );
            }}
            onDelete={() => {
              setCanvasElements(elements => elements.filter(e => e.id !== element.id));
              setSelectedElement(null);
            }}
          />
        ))}

        {/* Empty state */}
        {canvasElements.length === 0 && !activeElementId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <PrinterIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                Arraste elementos para criar
              </p>
              <p className="text-xs text-gray-300 mt-1">
                seu template de impressão
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Canvas element component
  function CanvasElement({ element, index, isSelected, onSelect, onUpdate, onDelete }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(element.defaultContent);
    const elementRef = useRef<HTMLDivElement>(null);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging
    } = useDraggable({
      id: `canvas_element_${element.id}`,
      data: element
    });

    const style = {
      position: 'absolute' as const,
      left: element.position?.x || 10,
      top: element.position?.y || (index * 30 + 10),
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.5 : 1,
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#000',
      ...element.style
    };

    const Icon = element.icon;

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onSelect}
        className={`
          group relative p-1 rounded cursor-move
          ${isSelected ? 'ring-1 ring-orange-500 bg-orange-50/50' : 'hover:bg-gray-100/50'}
          transition-all duration-200
        `}
        {...listeners}
        {...attributes}
      >
        {/* Move handle */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="h-4 w-4 text-gray-400" />
        </div>

        {/* Content */}
        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              onUpdate({ ...element, defaultContent: editContent });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(false);
                onUpdate({ ...element, defaultContent: editContent });
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditContent(element.defaultContent);
              }
            }}
            className="px-1 py-0.5 border border-orange-500 rounded text-sm bg-white dark:bg-gray-900"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-orange-500 flex-shrink-0" />}
            <span 
              className="text-sm"
              onDoubleClick={() => {
                if (element.type === 'text') {
                  setIsEditing(true);
                }
              }}
            >
              {element.defaultContent}
            </span>
          </div>
        )}

        {/* Actions */}
        {isSelected && (
          <div className="absolute -right-24 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 bg-white dark:bg-gray-800 border rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
              title="Editar"
            >
              <Edit className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 bg-white dark:bg-gray-800 border rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Excluir"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Save template
  const saveTemplate = async () => {
    if (!templateName) {
      toast.error('Digite um nome para o template');
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name: templateName,
        type: templateType,
        content: JSON.stringify({
          elements: canvasElements,
          settings: {
            width: canvasWidth,
            height: canvasHeight
          }
        }),
        active: true
      };

      if (selectedTemplate) {
        // Update existing
        const { error } = await supabase
          .from('print_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Template atualizado com sucesso!');
      } else {
        // Create new
        const { error } = await supabase
          .from('print_templates')
          .insert([templateData]);

        if (error) throw error;
        toast.success('Template criado com sucesso!');
      }

      mutate('templates');
      setSelectedTemplate(null);
      setCanvasElements([]);
      setTemplateName('');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  // Load template
  const loadTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateType(template.type);
    
    try {
      const content = JSON.parse(template.content);
      setCanvasElements(content.elements || []);
      if (content.settings) {
        setCanvasWidth(content.settings.width || 384);
        setCanvasHeight(content.settings.height || 600);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Erro ao carregar template');
    }
  };

  // Delete template
  const deleteTemplate = async (template: any) => {
    if (!confirm(`Confirma a exclusão do template "${template.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('print_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      toast.success('Template excluído com sucesso!');
      mutate('templates');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  // Filter templates
  const filteredTemplates = templates?.filter((t: any) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Editor de Templates
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Crie e edite templates de impressão
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="rounded-full"
                >
                  {previewMode ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveTemplate}
                  disabled={saving || !templateName}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-5rem)]">
          {/* Sidebar - Template List */}
          <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Templates Salvos</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setCanvasElements([]);
                    setTemplateName('');
                  }}
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates?.map((template: any) => (
                    <div
                      key={template.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${selectedTemplate?.id === template.id 
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                      `}
                      onClick={() => loadTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {templateTypes.find(t => t.value === template.type)?.label || template.type}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Element Library */}
            <div className="w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-4">
              <h3 className="font-semibold text-sm mb-4">Biblioteca de Elementos</h3>
              
              <div className="space-y-6">
                {elementLibrary.map(category => (
                  <div key={category.category}>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      {category.category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.elements.map(element => (
                        <DraggableElement
                          key={element.id}
                          id={element.id}
                          element={element}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950">
              <div className="p-8">
                {/* Template Settings */}
                <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Ex: Cupom Fiscal Padrão"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Tipo</Label>
                      <Select value={templateType} onValueChange={setTemplateType}>
                        <SelectTrigger id="template-type" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateTypes.map(type => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <PrinterIcon className="h-4 w-4" />
                      <span>Papel Térmico: 80mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4" />
                      <span>Altura: {canvasHeight}px (contínuo)</span>
                    </div>
                  </div>
                </div>

                {/* Canvas Container with Thermal Paper Look */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Paper Shadow */}
                    <div className="absolute -inset-4 bg-black/5 dark:bg-black/20 rounded-lg blur-xl" />
                    
                    {/* Paper Roll Effect */}
                    <div className="relative bg-white rounded-lg shadow-2xl p-8">
                      {/* Perforation marks at top */}
                      <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-center">
                        <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
                      </div>
                      
                      {/* Canvas */}
                      <CanvasDropArea />
                      
                      {/* Perforation marks at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-center">
                        <div className="w-full border-b-2 border-dashed border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            {selectedElement && (
              <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Propriedades</h3>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Text Properties */}
                  {selectedElement.type === 'text' && (
                    <>
                      <div>
                        <Label>Tamanho da Fonte</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[elementProperties.fontSize]}
                            onValueChange={([value]) => {
                              setElementProperties({ ...elementProperties, fontSize: value });
                              // Update element
                            }}
                            min={8}
                            max={48}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500 w-8">{elementProperties.fontSize}</span>
                        </div>
                      </div>

                      <div>
                        <Label>Estilo</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            size="sm"
                            variant={elementProperties.fontWeight === 'bold' ? 'default' : 'outline'}
                            onClick={() => {
                              setElementProperties({
                                ...elementProperties,
                                fontWeight: elementProperties.fontWeight === 'bold' ? 'normal' : 'bold'
                              });
                            }}
                            className="flex-1"
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={elementProperties.fontStyle === 'italic' ? 'default' : 'outline'}
                            onClick={() => {
                              setElementProperties({
                                ...elementProperties,
                                fontStyle: elementProperties.fontStyle === 'italic' ? 'normal' : 'italic'
                              });
                            }}
                            className="flex-1"
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={elementProperties.textDecoration === 'underline' ? 'default' : 'outline'}
                            onClick={() => {
                              setElementProperties({
                                ...elementProperties,
                                textDecoration: elementProperties.textDecoration === 'underline' ? 'none' : 'underline'
                              });
                            }}
                            className="flex-1"
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Alinhamento</Label>
                        <div className="flex gap-2 mt-1">
                          {[
                            { value: 'left', icon: AlignLeft },
                            { value: 'center', icon: AlignCenter },
                            { value: 'right', icon: AlignRight },
                            { value: 'justify', icon: AlignJustify }
                          ].map(align => {
                            const Icon = align.icon;
                            return (
                              <Button
                                key={align.value}
                                size="sm"
                                variant={elementProperties.textAlign === align.value ? 'default' : 'outline'}
                                onClick={() => {
                                  setElementProperties({ ...elementProperties, textAlign: align.value });
                                }}
                                className="flex-1"
                              >
                                <Icon className="h-4 w-4" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Color Properties */}
                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={elementProperties.color}
                        onChange={(e) => {
                          setElementProperties({ ...elementProperties, color: e.target.value });
                        }}
                        className="w-16 h-8 p-1"
                      />
                      <Input
                        value={elementProperties.color}
                        onChange={(e) => {
                          setElementProperties({ ...elementProperties, color: e.target.value });
                        }}
                        className="flex-1"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Spacing */}
                  <div>
                    <Label>Espaçamento</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs">Padding</Label>
                        <Input
                          type="number"
                          value={elementProperties.padding}
                          onChange={(e) => {
                            setElementProperties({ ...elementProperties, padding: e.target.value });
                          }}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Margem</Label>
                        <Input
                          type="number"
                          value={elementProperties.margin}
                          onChange={(e) => {
                            setElementProperties({ ...elementProperties, margin: e.target.value });
                          }}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeElementId && draggedElement ? (
            <div className="p-2 bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-lg shadow-xl">
              <div className="flex items-center gap-2">
                {draggedElement.icon && <draggedElement.icon className="h-4 w-4 text-orange-500" />}
                <span className="text-sm font-medium">{draggedElement.label}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}