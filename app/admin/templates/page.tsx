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
  Printer as PrinterIcon
} from "lucide-react";
import useSWR, { mutate } from 'swr';

// Template types
const templateTypes = [
  { id: 'receipt', label: 'Cupom Fiscal', icon: Receipt },
  { id: 'kitchen', label: 'Pedido Cozinha', icon: Package },
  { id: 'bill', label: 'Conta Cliente', icon: CreditCard },
  { id: 'order', label: 'Comanda Mesa', icon: FileText }
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

export default function TemplatesPage() {
  const supabase = createClient();
  const [selectedType, setSelectedType] = useState('receipt');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState<any>({
    header: '',
    items: '',
    footer: ''
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
    
    // Convert array to object by type
    const templatesObj: any = {};
    data?.forEach((template: any) => {
      templatesObj[template.type] = {
        id: template.id,
        header: template.header_content || defaultTemplates[template.type]?.header || '',
        items: template.items_content || defaultTemplates[template.type]?.items || '',
        footer: template.footer_content || defaultTemplates[template.type]?.footer || ''
      };
    });
    
    return templatesObj;
  });

  // Initialize templates with defaults if not in database
  useEffect(() => {
    if (!isLoading && dbTemplates) {
      const mergedTemplates: any = {};
      
      templateTypes.forEach(type => {
        mergedTemplates[type.id] = dbTemplates[type.id] || {
          header: defaultTemplates[type.id].header,
          items: defaultTemplates[type.id].items,
          footer: defaultTemplates[type.id].footer
        };
      });
      
      setTemplates(mergedTemplates);
      setSectionContent(mergedTemplates[selectedType] || defaultTemplates[selectedType]);
    }
  }, [dbTemplates, isLoading, selectedType]);

  // Handle template type change
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSectionContent(templates[type] || defaultTemplates[type]);
    setEditingSection(null);
  };

  // Save template
  const saveTemplate = async () => {
    setSaving(true);
    try {
      const currentTemplate = templates[selectedType];
      const templateData = {
        name: `Template ${templateTypes.find(t => t.id === selectedType)?.label}`,
        type: selectedType,
        header_content: sectionContent.header,
        items_content: sectionContent.items,
        footer_content: sectionContent.footer,
        content: JSON.stringify({
          header: sectionContent.header,
          items: sectionContent.items,
          footer: sectionContent.footer
        }),
        active: true
      };

      if (currentTemplate?.id) {
        // Update existing
        const { error } = await supabase
          .from('print_templates')
          .update(templateData)
          .eq('id', currentTemplate.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('print_templates')
          .insert([templateData]);

        if (error) throw error;
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
      setSectionContent(defaultTemplates[selectedType]);
      toast.success('Template restaurado ao padrão');
    }
  };

  // Insert variable at cursor
  const insertVariable = (variable: string, section: string) => {
    const currentContent = sectionContent[section] || '';
    setSectionContent({
      ...sectionContent,
      [section]: currentContent + variable
    });
  };

  // Preview render
  const renderPreview = (content: string) => {
    // Sample items data
    const sampleItems = [
      { quantity: '2', name: 'Sushi Especial', price: '45,00', observation: '' },
      { quantity: '1', name: 'Temaki Salmão', price: '18,00', observation: 'Sem wasabi' },
      { quantity: '3', name: 'Hot Roll', price: '32,00', observation: '' },
      { quantity: '1', name: 'Coca-Cola 350ml', price: '8,00', observation: '' }
    ];

    // Replace variables with sample data
    const sampleData: any = {
      company_name: 'RESTAURANTE JAPONÊS SAKURA',
      company_address: 'Rua das Flores, 123 - Centro',
      company_phone: '(11) 1234-5678',
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
    const eachPattern = /{{#each items}}([\s\S]*?){{\/each}}/g;
    preview = preview.replace(eachPattern, (match, itemTemplate) => {
      return sampleItems.map(item => {
        let itemStr = itemTemplate;
        
        // Handle {{#if observation}}
        const ifPattern = /{{#if observation}}([\s\S]*?){{\/if}}/g;
        itemStr = itemStr.replace(ifPattern, (ifMatch, ifContent) => {
          return item.observation ? ifContent.replace('{{observation}}', item.observation) : '';
        });
        
        // Replace item variables
        Object.keys(item).forEach(key => {
          itemStr = itemStr.replace(new RegExp(`{{${key}}}`, 'g'), (item as any)[key]);
        });
        
        return itemStr;
      }).join('');
    });
    
    // Replace remaining variables
    Object.keys(sampleData).forEach(key => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), sampleData[key]);
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
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Editor Column */}
            <div className="col-span-2 space-y-4">
              {/* Header Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Cabeçalho</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSectionContent({ ...sectionContent, header: '' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={sectionContent.header || ''}
                  onChange={(e) => setSectionContent({ ...sectionContent, header: e.target.value })}
                  className="font-mono text-xs h-32 resize-none"
                  placeholder="Digite o conteúdo do cabeçalho..."
                />
              </Card>

              {/* Items Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Área de Itens</h3>
                  <p className="text-xs text-gray-500">Customize o formato dos itens</p>
                </div>
                <Textarea
                  value={sectionContent.items || ''}
                  onChange={(e) => setSectionContent({ ...sectionContent, items: e.target.value })}
                  className="font-mono text-xs h-32 resize-none"
                  placeholder="{{#each items}}
{{quantity}}x {{name}}
            R$ {{price}}
{{/each}}"
                />
              </Card>

              {/* Footer Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Rodapé</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSectionContent({ ...sectionContent, footer: '' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={sectionContent.footer || ''}
                  onChange={(e) => setSectionContent({ ...sectionContent, footer: e.target.value })}
                  className="font-mono text-xs h-32 resize-none"
                  placeholder="Digite o conteúdo do rodapé..."
                />
              </Card>

              {/* Variables Helper */}
              <Card className="p-4 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800">
                <h4 className="text-sm font-semibold mb-3 text-orange-700 dark:text-orange-400">
                  Variáveis Disponíveis
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {availableVariables.map(variable => {
                    const Icon = variable.icon;
                    return (
                      <button
                        key={variable.id}
                        onClick={() => {
                          navigator.clipboard.writeText(variable.value);
                          toast.success(`${variable.value} copiado!`);
                        }}
                        className="flex items-center gap-2 p-2 text-xs bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Icon className="h-3 w-3 text-orange-500" />
                        <span className="truncate">{variable.label}</span>
                      </button>
                    );
                  })}
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
                        <pre 
                          className="relative font-mono text-[11px] leading-[1.3] text-gray-900 whitespace-pre-wrap break-all"
                          style={{
                            fontFamily: '"Courier New", Courier, monospace',
                            letterSpacing: '0.5px'
                          }}
                        >
{renderPreview(sectionContent.header || '')}
{sectionContent.items && renderPreview(sectionContent.items)}
{sectionContent.footer && renderPreview(sectionContent.footer)}
                        </pre>
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