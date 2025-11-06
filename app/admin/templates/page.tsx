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
  { id: 'items_list', label: 'Lista de Itens', icon: Package, value: '{{items}}' },
  { id: 'subtotal', label: 'Subtotal', icon: DollarSign, value: '{{subtotal}}' },
  { id: 'discount', label: 'Desconto', icon: DollarSign, value: '{{discount}}' },
  { id: 'total', label: 'Total', icon: DollarSign, value: '{{total}}' },
  { id: 'payment_method', label: 'Forma de Pagamento', icon: CreditCard, value: '{{payment_method}}' }
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
--------------------------------`,
    items: `{{items}}`,
    footer: `--------------------------------
Subtotal: {{subtotal}}
Desconto: {{discount}}
TOTAL: {{total}}
--------------------------------
Pagamento: {{payment_method}}
--------------------------------
Obrigado pela preferência!
Volte sempre!`
  },
  kitchen: {
    header: `================================
       PEDIDO COZINHA
================================
Mesa: {{table_number}}
Pedido: #{{order_number}}
Hora: {{time}}
================================`,
    items: `{{items}}`,
    footer: `================================
Observações do pedido
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
    items: `{{items}}`,
    footer: `--------------------------------
TOTAL A PAGAR: {{total}}
--------------------------------
Obrigado!`
  },
  order: {
    header: `================================
         COMANDA
================================
Mesa: {{table_number}}
Atendente: {{customer_name}}
Pedido: #{{order_number}}
--------------------------------`,
    items: `{{items}}`,
    footer: `--------------------------------
Hora: {{time}}
================================`
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
    // Replace variables with sample data
    const sampleData: any = {
      company_name: 'RESTAURANTE JAPONÊS',
      company_address: 'Rua das Flores, 123',
      company_phone: '(11) 1234-5678',
      order_number: '00123',
      table_number: '05',
      customer_name: 'João Silva',
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items: `1x Sushi Especial     R$ 45,00
2x Temaki Salmão      R$ 36,00
1x Coca-Cola          R$ 8,00`,
      subtotal: 'R$ 89,00',
      discount: 'R$ 0,00',
      total: 'R$ 89,00',
      payment_method: 'Cartão Crédito'
    };

    let preview = content;
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
                  <p className="text-xs text-gray-500">Use {`{{items}}`} para listar produtos</p>
                </div>
                <Textarea
                  value={sectionContent.items || ''}
                  onChange={(e) => setSectionContent({ ...sectionContent, items: e.target.value })}
                  className="font-mono text-xs h-20 resize-none"
                  placeholder="{{items}}"
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
              <Card className="sticky top-4">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold flex items-center gap-2">
                    <PrinterIcon className="h-4 w-4" />
                    Preview (80mm)
                  </h3>
                </div>
                <div 
                  className="p-4 overflow-auto"
                  style={{
                    maxHeight: '600px',
                    background: 'linear-gradient(to bottom, #fdfdf8, #f9f9f4)'
                  }}
                >
                  <div 
                    className="font-mono text-[10px] leading-tight whitespace-pre-wrap break-all"
                    style={{
                      width: '280px',
                      padding: '10px',
                      background: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      color: '#000'
                    }}
                  >
                    {renderPreview(sectionContent.header || '')}
                    {sectionContent.items && (
                      <>
                        {'\n'}
                        {renderPreview(sectionContent.items)}
                      </>
                    )}
                    {sectionContent.footer && (
                      <>
                        {'\n'}
                        {renderPreview(sectionContent.footer)}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}