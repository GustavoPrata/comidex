import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/client";

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
         PEDIDO MESA
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
================================`
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const supabase = createClient();
  const { type } = await params;
  console.log('✅ Getting template for type:', type);

  try {
    // Para itens de pedido, usar template kitchen
    let templateType = type;
    if (!templateType || templateType === 'undefined') {
      templateType = 'kitchen'; // Default para kitchen
    }
    if (templateType === 'order' || templateType === 'items') {
      templateType = 'kitchen';
    }

    // Buscar template do banco
    const { data, error } = await supabase
      .from('print_templates')
      .select('*')
      .eq('template_type', templateType)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching template:', error);
      // Se houver erro, retornar template padrão
      return NextResponse.json({
        template: defaultTemplates[templateType] || defaultTemplates.kitchen,
        isDefault: true
      });
    }

    // Se encontrou template customizado
    if (data) {
      let template;
      
      // PRIORIDADE 1: Usar sections se existir (novo formato)
      if (data.sections) {
        // O campo sections pode ser JSON string ou array
        const sections = typeof data.sections === 'string' 
          ? JSON.parse(data.sections) 
          : data.sections;
        
        if (Array.isArray(sections) && sections.length > 0) {
          // Extrair header, items, footer das sections
          const headerSection = sections.find((s: any) => 
            s.name && s.name.toLowerCase().includes('cabeça')
          ) || sections[0];
          
          const itemsSection = sections.find((s: any) => 
            s.type === 'items'
          );
          
          const footerSection = sections.find((s: any) => 
            s.name && s.name.toLowerCase().includes('rodap')
          ) || sections[sections.length - 1];
          
          template = {
            header: headerSection?.content || '',
            items: itemsSection?.content || '',
            footer: footerSection?.content || ''
          };
        } else {
          // Fallback para campos individuais se sections não for um array válido
          template = {
            header: data.custom_header || defaultTemplates[templateType]?.header || '',
            items: data.items_content || defaultTemplates[templateType]?.items || '',
            footer: data.custom_footer || defaultTemplates[templateType]?.footer || ''
          };
        }
      } else {
        // PRIORIDADE 2: Usar campos individuais (formato antigo)
        template = {
          header: data.custom_header || defaultTemplates[templateType]?.header || '',
          items: data.items_content || defaultTemplates[templateType]?.items || '',
          footer: data.custom_footer || defaultTemplates[templateType]?.footer || ''
        };
      }
      
      console.log('Template carregado do banco:', template);
      
      return NextResponse.json({
        template,
        isDefault: false
      });
    }

    // Se não encontrou, retornar template padrão
    return NextResponse.json({
      template: defaultTemplates[templateType] || defaultTemplates.kitchen,
      isDefault: true
    });

  } catch (error) {
    console.error('Error in template route:', error);
    // Em caso de erro, retornar template padrão
    return NextResponse.json({
      template: defaultTemplates.kitchen,
      isDefault: true
    });
  }
}