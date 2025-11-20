'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { 
  FileText, 
  Save, 
  Loader2,
  Receipt,
  Package,
  CreditCard,
  Plus,
  Trash2,
  Copy,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Hash,
  Calendar,
  Clock,
  User,
  DollarSign,
  Printer as PrinterIcon,
  ChevronUp,
  ChevronDown,
  Settings2
} from "lucide-react";
import useSWR, { mutate } from 'swr';

// Template types
const templateTypes = [
  { id: 'receipt', label: 'Cupom Fiscal', icon: Receipt },
  { id: 'kitchen', label: 'Pedido Produto', icon: Package },
  { id: 'bill', label: 'Conta Cliente', icon: CreditCard }
];

// Template sections
const templateSections = {
  header: 'Cabeçalho',
  items: 'Itens',
  footer: 'Rodapé'
};

// Variables available
const availableVariables = [
  { id: 'company_name', label: 'Nome da Empresa', icon: Type, value: '{{company_name}}' },
  { id: 'company_address', label: 'Endereço', icon: Type, value: '{{company_address}}' },
  { id: 'company_phone', label: 'Telefone', icon: Type, value: '{{company_phone}}' },
  { id: 'order_number', label: 'Número do Pedido', icon: Hash, value: '{{order_number}}' },
  { id: 'table_number', label: 'Mesa', icon: Hash, value: '{{table_number}}' },
  { id: 'customer_name', label: 'Cliente', icon: User, value: '{{customer_name}}' },
  { id: 'date', label: 'Data', icon: Calendar, value: '{{date}}' },
  { id: 'time', label: 'Hora', icon: Clock, value: '{{time}}' },
  { id: 'each_items', label: 'Loop de Itens', icon: Package, value: '{{#each items}}...{{/each}}' },
  { id: 'item_qty', label: 'Qtd do Item', icon: Hash, value: '{{quantity}}' },
  { id: 'item_name', label: 'Nome do Item', icon: Package, value: '{{name}}' },
  { id: 'item_price', label: 'Preço do Item', icon: DollarSign, value: '{{price}}' },
  { id: 'item_obs', label: 'Observação Item', icon: Type, value: '{{observation}}' },
  { id: 'item_group', label: 'Grupo/Categoria', icon: Package, value: '{{item_group}}' },
  { id: 'if_group', label: 'Se tem Grupo', icon: Package, value: '{{#if item_group}}...{{/if}}' },
  { id: 'subtotal', label: 'Subtotal', icon: DollarSign, value: '{{subtotal}}' },
  { id: 'discount', label: 'Desconto', icon: DollarSign, value: '{{discount}}' },
  { id: 'service_fee', label: 'Taxa Serviço', icon: DollarSign, value: '{{service_fee}}' },
  { id: 'total', label: 'Total', icon: DollarSign, value: '{{total}}' },
  { id: 'payment_method', label: 'Forma Pagamento', icon: CreditCard, value: '{{payment_method}}' }
];

// Default templates
const defaultTemplates: any = {
  receipt: {
    header: `{{company_name}}
{{company_address}}
Tel: {{company_phone}}
--------------------------------
       CUPOM FISCAL
--------------------------------
Data: {{date}}  Hora: {{time}}
Pedido: #{{order_number}}
Mesa: {{table_number}}
--------------------------------`,
    items: `QTD  DESCRIÇÃO         VALOR
--------------------------------
{{#each items}}
{{quantity}}x   {{name}}
                    R$ {{price}}
{{/each}}`,
    footer: `--------------------------------
Subtotal:         R$ {{subtotal}}
Desconto:         R$ {{discount}}
--------------------------------
TOTAL:            R$ {{total}}
--------------------------------
Pagamento: {{payment_method}}
--------------------------------
    Obrigado pela preferência!
        Volte sempre!
--------------------------------`
  },
  kitchen: {
    header: `================================
       PEDIDO COZINHA
================================
Mesa: {{table_number}}
Pedido: #{{order_number}}
Hora: {{time}}
================================`,
    items: `{{#each items}}
{{#if item_group}}
--- CATEGORIA: {{item_group}} ---
{{/if}}
{{quantity}}x {{name}}
   {{#if observation}}
   OBS: {{observation}}
   {{/if}}
--------------------------------
{{/each}}`,
    footer: `================================
Atendente: {{customer_name}}
================================`
  },
  bill: {
    header: `{{company_name}}
--------------------------------
           CONTA
--------------------------------
Mesa: {{table_number}}
Cliente: {{customer_name}}
Data: {{date}}  Hora: {{time}}
--------------------------------`,
    items: `ITEM                     VALOR
--------------------------------
{{#each items}}
{{quantity}}x {{name}}
                    R$ {{price}}
{{/each}}`,
    footer: `--------------------------------
SUBTOTAL:         R$ {{subtotal}}
TAXA SERVIÇO:     R$ {{service_fee}}
--------------------------------
TOTAL A PAGAR:    R$ {{total}}
--------------------------------
        Obrigado!`
  },
  order: {
    header: `================================
         COMANDA MESA
================================
Mesa: {{table_number}}
Atendente: {{customer_name}}
Pedido: #{{order_number}}
--------------------------------`,
    items: `{{#each items}}
[ ] {{quantity}}x {{name}}
    {{#if observation}}
    OBS: {{observation}}
    {{/if}}
{{/each}}`,
    footer: `--------------------------------
Hora: {{time}}
================================
    Assinatura do Cliente:
    
    _____________________`
  }
};

interface TemplateSection {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'items';
  fontSize?: number;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export default function TemplatesPage() {
  const supabase = createClient();
  const [selectedType, setSelectedType] = useState('receipt');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [sections, setSections] = useState<TemplateSection[]>([
    { id: '1', name: 'Cabeçalho', content: '', type: 'text', fontSize: 12, fontFamily: 'mono', align: 'center', bold: false },
    { id: '2', name: 'Itens', content: '', type: 'items', fontSize: 11, fontFamily: 'mono', align: 'left', bold: false },
    { id: '3', name: 'Rodapé', content: '', type: 'text', fontSize: 10, fontFamily: 'mono', align: 'center', bold: false }
  ]);
  
  // Printer state for templates
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinters, setSelectedPrinters] = useState<any>({
    receipt: null,  // Nota Fiscal
    bill: null      // Conta Cliente
    // kitchen (Pedido Produto) não precisa - usa configuração individual
  });
  
  // Restaurant data state
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'xxxxxx',
    address: 'xxxxxx',
    phone: 'xxxxxx'
  });

  // Load templates from database
  const { data: dbTemplates, isLoading } = useSWR('templates', async () => {
    const { data, error } = await supabase
      .from('print_templates')
      .select('*');
    
    if (error) {
      console.error('Error loading templates:', error);
      return {};
    }
    
    console.log('🔥 Templates carregados do banco:', data);
    
    // Convert array to object by type
    const templatesObj: any = {};
    data?.forEach((template: any) => {
      const templateType = template.template_type;
      if (templateType) {
        console.log(`🔥 Template ${templateType}:`, {
          id: template.id,
          sections: template.sections,
          custom_header: template.custom_header,
          items_content: template.items_content,
          custom_footer: template.custom_footer
        });
        
        templatesObj[templateType] = {
          id: template.id,
          header: template.custom_header || defaultTemplates[templateType]?.header || '',
          items: template.items_content || defaultTemplates[templateType]?.items || '',
          footer: template.custom_footer || defaultTemplates[templateType]?.footer || '',
          sections: template.sections || null, // Store sections config
          printer_id: template.printer_id || null // Store printer config
        };
      }
    });
    
    return templatesObj;
  });

  // Initialize templates with defaults if not in database
  // Fetch restaurant data and printers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant data
        const response = await fetch('/api/restaurant');
        if (response.ok) {
          const data = await response.json();
          setRestaurantInfo({
            name: data.name || 'xxxxxx',
            address: data.full_address || 'xxxxxx',
            phone: data.phone || 'xxxxxx'
          });
        }
        
        // Fetch printers
        const { data: printersData, error: printersError } = await supabase
          .from('printers')
          .select('id, name, active')
          .eq('active', true)
          .order('name');
        
        if (!printersError && printersData) {
          setPrinters(printersData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && dbTemplates) {
      const mergedTemplates: any = {};
      const printerConfig: any = {};
      
      templateTypes.forEach(type => {
        mergedTemplates[type.id] = dbTemplates[type.id] || {
          header: defaultTemplates[type.id].header,
          items: defaultTemplates[type.id].items,
          footer: defaultTemplates[type.id].footer,
          printer_id: null
        };
        
        // Load printer configuration for each template
        if (type.id === 'receipt' || type.id === 'bill') {
          printerConfig[type.id] = dbTemplates[type.id]?.printer_id || null;
        }
      });
      
      setTemplates(mergedTemplates);
      setSelectedPrinters(printerConfig);
      
      // Convert to sections format
      const template = mergedTemplates[selectedType] || defaultTemplates[selectedType];
      
      // Use saved sections if available, otherwise use defaults
      if (template.sections) {
        // Parse sections if it's a string
        const parsedSections = typeof template.sections === 'string' 
          ? JSON.parse(template.sections) 
          : template.sections;
        
        if (Array.isArray(parsedSections)) {
          setSections(parsedSections);
        } else {
          setSections([
            { id: '1', name: 'Cabeçalho', content: template.header || '', type: 'text', fontSize: 12, fontFamily: 'mono', align: 'center', bold: false },
            { id: '2', name: 'Itens', content: template.items || '', type: 'items', fontSize: 11, fontFamily: 'mono', align: 'left', bold: false },
            { id: '3', name: 'Rodapé', content: template.footer || '', type: 'text', fontSize: 10, fontFamily: 'mono', align: 'center', bold: false }
          ]);
        }
      } else {
        setSections([
          { id: '1', name: 'Cabeçalho', content: template.header || '', type: 'text', fontSize: 12, fontFamily: 'mono', align: 'center', bold: false },
          { id: '2', name: 'Itens', content: template.items || '', type: 'items', fontSize: 11, fontFamily: 'mono', align: 'left', bold: false },
          { id: '3', name: 'Rodapé', content: template.footer || '', type: 'text', fontSize: 10, fontFamily: 'mono', align: 'center', bold: false }
        ]);
      }
    }
  }, [dbTemplates, isLoading, selectedType]);

  // Handle template type change
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const template = templates[type] || defaultTemplates[type];
    
    // Use saved sections if available, otherwise use defaults
    if (template.sections) {
      // Parse sections if it's a string
      const parsedSections = typeof template.sections === 'string' 
        ? JSON.parse(template.sections) 
        : template.sections;
      
      if (Array.isArray(parsedSections)) {
        setSections(parsedSections);
      } else {
        setSections([
          { id: '1', name: 'Cabeçalho', content: template.header || '', type: 'text', fontSize: 12, fontFamily: 'mono', align: 'center', bold: false },
          { id: '2', name: 'Itens', content: template.items || '', type: 'items', fontSize: 11, fontFamily: 'mono', align: 'left', bold: false },
          { id: '3', name: 'Rodapé', content: template.footer || '', type: 'text', fontSize: 10, fontFamily: 'mono', align: 'center', bold: false }
        ]);
      }
    } else {
      setSections([
        { id: '1', name: 'Cabeçalho', content: template.header || '', type: 'text', fontSize: 12, fontFamily: 'mono', align: 'center', bold: false },
        { id: '2', name: 'Itens', content: template.items || '', type: 'items', fontSize: 11, fontFamily: 'mono', align: 'left', bold: false },
        { id: '3', name: 'Rodapé', content: template.footer || '', type: 'text', fontSize: 10, fontFamily: 'mono', align: 'center', bold: false }
      ]);
    }
    setEditingSection(null);
  };
  
  // Add new section
  const addSection = (type: 'text' | 'items' = 'text') => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      name: type === 'items' ? 'Nova Área de Itens' : 'Nova Seção',
      content: type === 'items' ? '{{#each items}}\n{{quantity}}x {{name}}\n{{/each}}' : '',
      type,
      fontSize: 11,
      fontFamily: 'mono',
      align: type === 'items' ? 'left' : 'center',
      bold: false
    };
    setSections([...sections, newSection]);
  };

  // Duplicate section
  const duplicateSection = (section: TemplateSection) => {
    const newSection: TemplateSection = {
      ...section,
      id: Date.now().toString(),
      name: `${section.name} (Cópia)`
    };
    const index = sections.findIndex(s => s.id === section.id);
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== sectionId));
    } else {
      toast.error('Deve ter pelo menos uma seção');
    }
  };

  // Update section content
  const updateSection = (sectionId: string, content: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, content } : s
    ));
  };

  // Update section name
  const updateSectionName = (sectionId: string, name: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, name } : s
    ));
    setEditingSectionName(null);
  };

  // Copy variable to clipboard
  const copyVariable = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${value} copiado!`);
  };

  // Move section up
  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      setSections(newSections);
    }
  };

  // Move section down
  const moveSectionDown = (index: number) => {
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections);
    }
  };

  // Update section config
  const updateSectionConfig = (sectionId: string, config: Partial<TemplateSection>) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, ...config } : s
    ));
  };

  // Save template
  const saveTemplate = async () => {
    setSaving(true);
    try {
      // Look for existing template in database for this type - pegar o mais recente
      const { data: existingTemplates, error: fetchError } = await supabase
        .from('print_templates')
        .select('id')
        .eq('template_type', selectedType)
        .order('id', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;
      
      // Extract header, items, footer from sections
      const headerSection = sections.find(s => s.name.toLowerCase().includes('cabeça'));
      const itemsSection = sections.find(s => s.type === 'items');
      const footerSection = sections.find(s => s.name.toLowerCase().includes('rodap'));
      
      console.log('🔥 Salvando template:', {
        selectedType,
        sections: sections,
        headerSection: headerSection?.content,
        itemsSection: itemsSection?.content,
        footerSection: footerSection?.content
      });
      
      // Validar que sections é serializável como JSON
      const validatedSections = sections.map(section => ({
        id: section.id,
        name: section.name,
        content: section.content,
        type: section.type,
        fontSize: section.fontSize,
        fontFamily: section.fontFamily,
        align: section.align,
        bold: section.bold
      }));
      
      const templateData = {
        name: `Template ${templateTypes.find(t => t.id === selectedType)?.label}`,
        template_type: selectedType,
        custom_header: headerSection?.content || sections[0]?.content || '',
        items_content: itemsSection?.content || '',
        custom_footer: footerSection?.content || sections[sections.length - 1]?.content || '',
        sections: validatedSections, // Enviar objeto validado para JSONB
        description: `Template para ${templateTypes.find(t => t.id === selectedType)?.label}`,
        header_enabled: true,
        footer_enabled: true,
        show_logo: false,
        cut_paper: true,
        active: true,
        // Adicionar impressora apenas para templates que precisam
        ...(selectedType === 'receipt' || selectedType === 'bill' ? {
          printer_id: selectedPrinters[selectedType] || null
        } : {})
      };
      
      console.log('🔥 Template data para salvar:', templateData);

      if (existingTemplates && existingTemplates.length > 0) {
        // Update existing
        const { error } = await supabase
          .from('print_templates')
          .update(templateData)
          .eq('id', existingTemplates[0].id);

        if (error) throw error;
        
        // Update local state
        setTemplates({
          ...templates,
          [selectedType]: {
            id: existingTemplates[0].id,
            header: templateData.custom_header,
            items: templateData.items_content,
            footer: templateData.custom_footer,
            sections: sections // Save sections config
          }
        });
      } else {
        // Create new
        const { data: newTemplate, error } = await supabase
          .from('print_templates')
          .insert([templateData])
          .select()
          .single();

        if (error) throw error;
        
        // Update local state with new ID
        if (newTemplate) {
          setTemplates({
            ...templates,
            [selectedType]: {
              id: newTemplate.id,
              header: templateData.custom_header,
              items: templateData.items_content,
              footer: templateData.custom_footer,
              sections: sections // Save sections config
            }
          });
        }
      }

      toast.success('Template salvo com sucesso!');
      mutate('templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const resetToDefault = () => {
    if (confirm('Restaurar template padrão? Isso apagará suas alterações.')) {
      const template = defaultTemplates[selectedType];
      setSections([
        { id: '1', name: 'Cabeçalho', content: template.header || '', type: 'text', fontSize: 12, fontFamily: 'mono', align: 'center', bold: false },
        { id: '2', name: 'Itens', content: template.items || '', type: 'items', fontSize: 11, fontFamily: 'mono', align: 'left', bold: false },
        { id: '3', name: 'Rodapé', content: template.footer || '', type: 'text', fontSize: 10, fontFamily: 'mono', align: 'center', bold: false }
      ]);
      toast.success('Template restaurado ao padrão');
    }
  };

  // Preview render
  const renderPreview = (content: string, section?: TemplateSection) => {
    // Sample items data com grupo/categoria
    const sampleItems = [
      { quantity: '2', name: 'Sushi Especial', price: '45,00', observation: '', item_group: 'RODÍZIO PREMIUM' },
      { quantity: '1', name: 'Temaki Salmão', price: '18,00', observation: 'Sem wasabi', item_group: 'RODÍZIO PREMIUM' },
      { quantity: '2', name: 'Coca-Cola 350ml', price: '8,00', observation: '', item_group: 'BEBIDAS' }
    ];

    // Replace variables with sample data
    const sampleData: any = {
      company_name: restaurantInfo.name,
      company_address: restaurantInfo.address,
      company_phone: restaurantInfo.phone,
      order_number: '00123',
      table_number: '05',
      customer_name: 'João Silva',
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      subtotal: '103,00',
      service_fee: '10,30',
      discount: '0,00',
      total: '113,30',
      payment_method: 'Cartão Crédito'
    };

    let preview = content;
    
    // Handle {{#each items}} loops
    const eachPattern = /\{\{#each items\}\}([\s\S]*?)\{\{\/each\}\}/g;
    preview = preview.replace(eachPattern, (match, itemTemplate) => {
      return sampleItems.map(item => {
        let itemStr = itemTemplate;
        
        // Handle {{#if field}} condicionais genéricas
        const ifPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        itemStr = itemStr.replace(ifPattern, (ifMatch: string, field: string, ifContent: string) => {
          const fieldValue = (item as any)[field];
          // Só mostra o conteúdo se o campo existe e não é vazio
          if (fieldValue && fieldValue !== '') {
            return ifContent;
          }
          return '';
        });
        
        // Replace item variables
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          itemStr = itemStr.replace(regex, (item as any)[key]);
        });
        
        return itemStr;
      }).join('');
    });
    
    // Replace remaining variables
    Object.keys(sampleData).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, sampleData[key]);
    });
    
    return preview;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Templates de Impressão
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure os modelos de impressão do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="rounded-full"
              >
                Restaurar Padrão
              </Button>
              <Button
                onClick={saveTemplate}
                disabled={saving}
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

      <div className="p-6">
        {/* Template Type Selector */}
        <div className="mb-6">
          <div className="flex gap-3 items-end">
            <div className="flex gap-3">
              {templateTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                      ${selectedType === type.id 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Printer Selection for Receipt and Bill templates */}
            {(selectedType === 'receipt' || selectedType === 'bill') && (
              <div className="ml-auto">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Impressora:</Label>
                  <Select
                    value={selectedPrinters[selectedType] || 'none'}
                    onValueChange={(value) => {
                      setSelectedPrinters({
                        ...selectedPrinters,
                        [selectedType]: value === 'none' ? null : value
                      });
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione a impressora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {printers.map((printer) => (
                        <SelectItem key={printer.id} value={printer.id.toString()}>
                          {printer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Editor Column */}
            <div className="col-span-2 space-y-4">
              {/* Add Section Button */}
              <div className="flex gap-2">
                <Button
                  onClick={() => addSection('text')}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Seção
                </Button>
                <Button
                  onClick={() => addSection('items')}
                  variant="outline"
                  className="rounded-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Área de Itens
                </Button>
              </div>

              {/* Dynamic Sections */}
              {sections.map((section, index) => (
                <Card key={section.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {editingSectionName === section.id ? (
                        <Input
                          value={section.name}
                          onChange={(e) => updateSectionName(section.id, e.target.value)}
                          onBlur={() => setEditingSectionName(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingSectionName(null);
                            }
                          }}
                          className="h-8 w-48"
                          autoFocus
                        />
                      ) : (
                        <h3 
                          className="font-semibold cursor-pointer hover:text-orange-500"
                          onClick={() => setEditingSectionName(section.id)}
                        >
                          {section.name}
                        </h3>
                      )}
                      {section.type === 'items' && (
                        <Badge variant="secondary" className="text-xs">
                          Área de Itens
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        title="Mover para cima"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSectionDown(index)}
                        disabled={index === sections.length - 1}
                        title="Mover para baixo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => duplicateSection(section)}
                        title="Duplicar seção"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSection(section.id)}
                        title="Excluir seção"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Font and Style Controls */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Select
                      value={section.fontSize?.toString() || '11'}
                      onValueChange={(value) => updateSectionConfig(section.id, { fontSize: parseInt(value) })}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8px</SelectItem>
                        <SelectItem value="9">9px</SelectItem>
                        <SelectItem value="10">10px</SelectItem>
                        <SelectItem value="11">11px</SelectItem>
                        <SelectItem value="12">12px</SelectItem>
                        <SelectItem value="14">14px</SelectItem>
                        <SelectItem value="16">16px</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={section.fontFamily || 'mono'}
                      onValueChange={(value) => updateSectionConfig(section.id, { fontFamily: value })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mono">Mono</SelectItem>
                        <SelectItem value="sans">Sans</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-1 border rounded px-1">
                      <Button
                        size="sm"
                        variant={section.align === 'left' ? 'default' : 'ghost'}
                        onClick={() => updateSectionConfig(section.id, { align: 'left' })}
                        className="h-8 w-8 p-0"
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={section.align === 'center' ? 'default' : 'ghost'}
                        onClick={() => updateSectionConfig(section.id, { align: 'center' })}
                        className="h-8 w-8 p-0"
                      >
                        <AlignCenter className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={section.align === 'right' ? 'default' : 'ghost'}
                        onClick={() => updateSectionConfig(section.id, { align: 'right' })}
                        className="h-8 w-8 p-0"
                      >
                        <AlignRight className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant={section.bold ? 'default' : 'outline'}
                      onClick={() => updateSectionConfig(section.id, { bold: !section.bold })}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                  </div>

                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    className="font-mono text-xs h-32 resize-none"
                    placeholder={section.type === 'items' 
                      ? "{{#each items}}\n{{quantity}}x {{name}}\n            R$ {{price}}\n{{/each}}"
                      : "Digite o conteúdo da seção..."
                    }
                  />
                </Card>
              ))}

              {/* Variables Helper */}
              <Card className="p-4 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800">
                <h4 className="text-sm font-semibold mb-3 text-orange-700 dark:text-orange-400">
                  Variáveis Disponíveis (Clique para Copiar)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableVariables.map(variable => {
                    const Icon = variable.icon;
                    return (
                      <button
                        key={variable.id}
                        onClick={() => copyVariable(variable.value)}
                        className="flex items-center justify-between gap-2 p-2 text-xs bg-white dark:bg-gray-800 rounded hover:bg-orange-100 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Icon className="h-3 w-3 text-orange-500 flex-shrink-0" />
                          <span className="truncate text-left">{variable.label}</span>
                        </div>
                        <code className="text-[10px] text-gray-500 group-hover:text-orange-600 font-mono">
                          {variable.value.length > 15 ? variable.value.slice(0, 15) + '...' : variable.value}
                        </code>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-400">
                  💡 <strong>Dica:</strong> Clique em qualquer variável para copiá-la e colar no template
                </div>
              </Card>

              {/* Inline Formatting Helper */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold mb-3 text-blue-700 dark:text-blue-400">
                  Formatação Inline (Clique para Copiar)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('[[big]]texto maior[[/big]]');
                        toast.success('Tag copiada!');
                      }}
                      className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-left"
                    >
                      <code className="text-blue-600">[[big]]texto[[/big]]</code>
                      <div className="text-gray-500 text-[10px]">Texto maior</div>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('[[small]]texto menor[[/small]]');
                        toast.success('Tag copiada!');
                      }}
                      className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-left"
                    >
                      <code className="text-blue-600">[[small]]texto[[/small]]</code>
                      <div className="text-gray-500 text-[10px]">Texto menor</div>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('[[bold]]negrito[[/bold]]');
                        toast.success('Tag copiada!');
                      }}
                      className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-left"
                    >
                      <code className="text-blue-600">[[bold]]texto[[/bold]]</code>
                      <div className="text-gray-500 text-[10px]">Negrito</div>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('[[size:16]]tamanho 16px[[/size]]');
                        toast.success('Tag copiada!');
                      }}
                      className="p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-left"
                    >
                      <code className="text-blue-600">[[size:16]]texto[[/size]]</code>
                      <div className="text-gray-500 text-[10px]">Tamanho específico</div>
                    </button>
                  </div>
                  
                  <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                    <p className="text-blue-700 dark:text-blue-400 text-[11px]">
                      <strong>Exemplo:</strong> [[big]]TOTAL:[[/big]] [[bold]]R$ 50,00[[/bold]]
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Preview Column */}
            <div className="space-y-4">
              <div className="sticky top-4">
                <Card className="overflow-hidden bg-gray-900">
                  <div className="p-4 border-b border-gray-800 bg-gray-800">
                    <h3 className="font-semibold flex items-center gap-2 text-gray-100">
                      <PrinterIcon className="h-4 w-4 text-orange-500" />
                      Preview - Impressora Térmica 80mm
                    </h3>
                  </div>
                  <div 
                    className="p-6 overflow-auto bg-gradient-to-br from-gray-900 to-gray-950"
                    style={{
                      maxHeight: '700px'
                    }}
                  >
                    {/* Thermal Printer Frame */}
                    <div className="relative mx-auto" style={{ width: '320px' }}>
                      {/* Paper Roll Top */}
                      <div className="h-8 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-lg relative">
                        <div className="absolute inset-x-0 top-2 flex justify-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        </div>
                      </div>
                      
                      {/* Paper with Receipt */}
                      <div 
                        className="relative"
                        style={{
                          background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 50%, #f5f5f0 100%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(0,0,0,0.05)',
                          padding: '16px',
                          minHeight: '400px'
                        }}
                      >
                        {/* Paper texture overlay */}
                        <div 
                          className="absolute inset-0 opacity-[0.03]"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect fill='%23000000' x='0' y='0' width='1' height='1' opacity='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '2px 2px'
                          }}
                        />
                        
                        {/* Receipt Content */}
                        <div className="relative text-gray-900">
                          {sections.map(section => {
                            const content = renderPreview(section.content, section);
                            if (!content) return null;
                            
                            const fontFamilyMap: Record<string, string> = {
                              'mono': '"Courier New", Courier, monospace',
                              'sans': 'Arial, sans-serif',
                              'serif': 'Georgia, serif'
                            };
                            
                            // Check for inline formatting
                            const hasInlineFormat = /\[\[(size:\d+|bold|big|small)\]\]/.test(content);
                            
                            if (hasInlineFormat) {
                              // Parse and render with inline formatting
                              const renderFormattedContent = (text: string) => {
                                const parts = [];
                                let lastIndex = 0;
                                const regex = /\[\[(size:\d+|bold|big|small)\]\](.*?)\[\[\/(?:size|bold|big|small)\]\]/g;
                                let match;
                                
                                while ((match = regex.exec(text)) !== null) {
                                  // Add text before match
                                  if (match.index > lastIndex) {
                                    parts.push(
                                      <span key={`text-${lastIndex}`}>
                                        {text.substring(lastIndex, match.index)}
                                      </span>
                                    );
                                  }
                                  
                                  const [, tag, innerText] = match;
                                  const style: any = {
                                    fontFamily: fontFamilyMap[section.fontFamily || 'mono'],
                                  };
                                  
                                  if (tag.startsWith('size:')) {
                                    style.fontSize = `${parseInt(tag.replace('size:', ''))}px`;
                                  } else if (tag === 'bold') {
                                    style.fontWeight = 'bold';
                                  } else if (tag === 'big') {
                                    style.fontSize = `${(section.fontSize || 11) + 4}px`;
                                  } else if (tag === 'small') {
                                    style.fontSize = `${(section.fontSize || 11) - 2}px`;
                                  }
                                  
                                  parts.push(
                                    <span key={`format-${match.index}`} style={style}>
                                      {innerText}
                                    </span>
                                  );
                                  
                                  lastIndex = match.index + match[0].length;
                                }
                                
                                // Add remaining text
                                if (lastIndex < text.length) {
                                  parts.push(
                                    <span key={`text-${lastIndex}-end`}>
                                      {text.substring(lastIndex)}
                                    </span>
                                  );
                                }
                                
                                return parts;
                              };
                              
                              return (
                                <div
                                  key={section.id}
                                  className="whitespace-pre-wrap break-all mb-1"
                                  style={{
                                    fontFamily: fontFamilyMap[section.fontFamily || 'mono'],
                                    fontSize: `${section.fontSize || 11}px`,
                                    textAlign: section.align || 'left',
                                    fontWeight: section.bold ? 'bold' : 'normal',
                                    letterSpacing: '0.5px',
                                    lineHeight: '1.3'
                                  }}
                                >
                                  {renderFormattedContent(content)}
                                </div>
                              );
                            } else {
                              // Render without inline formatting
                              return (
                                <pre 
                                  key={section.id}
                                  className="whitespace-pre-wrap break-all mb-1"
                                  style={{
                                    fontFamily: fontFamilyMap[section.fontFamily || 'mono'],
                                    fontSize: `${section.fontSize || 11}px`,
                                    textAlign: section.align || 'left',
                                    fontWeight: section.bold ? 'bold' : 'normal',
                                    letterSpacing: '0.5px',
                                    lineHeight: '1.3'
                                  }}
                                >
                                  {content}
                                </pre>
                              );
                            }
                          })}
                        </div>
                      </div>
                      
                      {/* Paper Tear Edge */}
                      <div 
                        className="h-4 relative"
                        style={{
                          background: 'linear-gradient(to bottom, #f5f5f0, #e8e8e8)',
                          clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}