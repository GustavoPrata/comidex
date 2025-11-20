'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PrintPreviewProps {
  open: boolean;
  onClose: () => void;
  job: any;
}

export function PrintPreview({ open, onClose, job }: PrintPreviewProps) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && job) {
      // Limpar template anterior para forçar nova busca
      setTemplate(null);
      fetchTemplate();
    }
  }, [open, job]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      // Usar o template "kitchen" para itens de pedido
      // Os templates disponíveis no banco são: "receipt", "kitchen", e "bill"
      const templateType = 'kitchen';
      
      console.log('Buscando template tipo:', templateType);
      
      // Adicionar timestamp para evitar cache
      const response = await fetch(`/api/templates/${templateType}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Template carregado:', data.template);
        setTemplate(data.template); // Acessar o template dentro do objeto
      }
    } catch (error) {
      console.error('Erro ao buscar template:', error);
    } finally {
      setLoading(false);
    }
  };

  // Processar tags de formatação como [[size:18]], [[bold]], etc
  const processFormatting = (text: string): React.ReactNode => {
    const parts = [];
    let lastIndex = 0;
    
    // Regex para capturar tags de formatação
    const formatRegex = /\[\[(size|bold|italic|underline|align):?([^\]]*)\]\](.*?)\[\[\/\1\]\]/g;
    const simpleFormatRegex = /\[\[(size|bold|italic|underline|align):(\d+|left|center|right)\]\]/g;
    
    // Processar tags com conteúdo [[tag:value]]content[[/tag]]
    let processedText = text.replace(formatRegex, (match, tag, value, content) => {
      const id = `format_${Math.random().toString(36).substr(2, 9)}`;
      
      let style: any = {};
      let className = '';
      
      switch(tag) {
        case 'size':
          const size = parseInt(value);
          if (size) {
            style.fontSize = `${size}px`;
            style.lineHeight = '1.2';
          }
          break;
        case 'bold':
          style.fontWeight = 'bold';
          break;
        case 'italic':
          style.fontStyle = 'italic';
          break;
        case 'underline':
          style.textDecoration = 'underline';
          break;
        case 'align':
          style.textAlign = value;
          style.display = 'block';
          break;
      }
      
      return `<span id="${id}" style="${Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')}">${content}</span>`;
    });
    
    // Processar tags simples [[size:18]] que afetam o texto seguinte
    processedText = processedText.replace(simpleFormatRegex, (match, tag, value) => {
      let style = '';
      
      switch(tag) {
        case 'size':
          const size = parseInt(value);
          if (size) {
            style = `font-size:${size}px;line-height:1.2;`;
          }
          break;
        case 'bold':
          style = 'font-weight:bold;';
          break;
        case 'align':
          style = `text-align:${value};display:block;`;
          break;
      }
      
      return style ? `<span style="${style}">` : '';
    });
    
    // Converter para JSX seguro
    return <div dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  const applyTemplate = (templateStr: string, data: any): string => {
    let result = templateStr || '';
    
    // Substituir variáveis simples
    Object.keys(data).forEach(key => {
      if (key !== 'items') {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        result = result.replace(regex, data[key] || '');
      }
    });
    
    // Processar loops {{#each items}}
    const eachRegex = /{{#each\s+items}}([\s\S]*?){{\/each}}/g;
    result = result.replace(eachRegex, (match, content) => {
      if (!data.items || data.items.length === 0) return '';
      
      return data.items.map((item: any) => {
        let itemContent = content;
        
        // Substituir variáveis do item
        Object.keys(item).forEach(key => {
          const itemRegex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          itemContent = itemContent.replace(itemRegex, item[key] || '');
        });
        
        // Processar condicionais {{#if field}}
        const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
        itemContent = itemContent.replace(ifRegex, (match: string, field: string, ifContent: string) => {
          return item[field] ? ifContent : '';
        });
        
        return itemContent;
      }).join('');
    });
    
    return result;
  };

  const getRenderedContent = () => {
    if (!job) return 'Nenhum trabalho selecionado';
    if (!template) return 'Template não carregado';

    console.log('Renderizando com template:', template);
    console.log('Dados do job:', job);

    // Preparar dados do pedido
    const items = [];
    
    if (job.order_items) {
      const orderItem = job.order_items;
      const item = orderItem.items;
      if (item) {
        items.push({
          quantity: orderItem.quantity || 1,
          name: item.name || 'Item sem nome',
          price: item.price === 0 ? 'Incluso' : `${(item.price * (orderItem.quantity || 1)).toFixed(2)}`,
          observation: orderItem.notes || '',
        });
      }
    } else if (job.document_type === 'order' && job.document_data) {
      const orderItems = job.document_data.items || [];
      orderItems.forEach((item: any) => {
        items.push({
          quantity: item.quantity || 1,
          name: item.name || item.item_name || 'Item',
          price: item.price === 0 ? 'Incluso' : `${(item.price * (item.quantity || 1)).toFixed(2)}`,
          observation: item.notes || '',
        });
      });
    }

    const totalPrice = items.reduce((sum: number, item: any) => {
      const price = item.price === 'Incluso' ? 0 : parseFloat(item.price);
      return sum + price;
    }, 0);

    const now = new Date();
    const tableId = job.order_items?.orders?.table_id || job.document_data?.table_id || 'N/A';

    const templateData = {
      company_name: 'COMIDEX RESTAURANTE',
      company_address: 'Rua Principal, 123 - Centro',
      company_phone: '(11) 1234-5678',
      order_number: job.id.toString(),
      table_number: tableId,
      customer_name: job.document_data?.customer_name || '',  // Deixar vazio para o template controlar
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items: items,
      subtotal: totalPrice.toFixed(2),
      discount: '0.00',
      service_fee: '0.00',
      total: totalPrice.toFixed(2),
      payment_method: 'A definir'
    };

    // Aplicar template
    const header = applyTemplate(template.header || '', templateData);
    const itemsContent = applyTemplate(template.items || '', templateData);
    const footer = applyTemplate(template.footer || '', templateData);
    
    return `${header}\n${itemsContent}\n${footer}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle className="sr-only">Visualização da Impressão</AlertDialogTitle>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Visualização da Impressão</h2>
        </div>

        {/* Container do Papel Térmico */}
        <div className="flex justify-center">
          <div 
            className="relative"
            style={{
              width: '320px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Rolo de papel superior */}
            <div className="h-8 bg-gradient-to-b from-gray-300 to-gray-200 rounded-t-lg border-x-2 border-t-2 border-gray-400" />
            
            {/* Papel com Cupom */}
            <div 
              className="relative"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 50%, #f5f5f0 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(0,0,0,0.05)',
                padding: '16px',
                minHeight: '400px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}
            >
              {/* Textura do Papel */}
              <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect fill='%23000000' x='0' y='0' width='1' height='1' opacity='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '2px 2px'
                }}
              />
              
              {/* Conteúdo do Cupom */}
              <div className="relative text-gray-900 font-mono text-xs leading-5" 
                style={{ fontSize: '11px', letterSpacing: '0.5px', lineHeight: '1.3' }}>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Carregando template...</p>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{processFormatting(getRenderedContent())}</div>
                )}
              </div>
            </div>
            
            {/* Serrilha do papel */}
            <div className="h-4 bg-gradient-to-b from-gray-100 to-gray-200 relative">
              <div 
                className="absolute bottom-0 left-0 right-0 h-2"
                style={{
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, #ccc 3px, #ccc 4px)',
                }}
              />
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}