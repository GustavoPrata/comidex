import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  
  try {
    console.log('🚀 Iniciando criação das tabelas de adicionais...');
    
    // Inserir categorias de exemplo
    const categoriesData = [
      { name: 'Extras', color: '#FF6B00', sort_order: 1 },
      { name: 'Substituições', color: '#4CAF50', sort_order: 2 },
      { name: 'Acompanhamentos', color: '#2196F3', sort_order: 3 },
      { name: 'Molhos', color: '#9C27B0', sort_order: 4 }
    ];
    
    // Inserir categorias uma por uma
    for (const cat of categoriesData) {
      const { error } = await supabase
        .from('additional_categories')
        .upsert(cat, { onConflict: 'name' });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erro ao inserir categoria:', cat.name, error);
      }
    }
    
    // Buscar as categorias inseridas
    const { data: categories } = await supabase
      .from('additional_categories')
      .select('*');
    
    if (categories && categories.length > 0) {
      const extrasId = categories.find((c: any) => c.name === 'Extras')?.id;
      const substituicoesId = categories.find((c: any) => c.name === 'Substituições')?.id;
      const acompanhamentosId = categories.find((c: any) => c.name === 'Acompanhamentos')?.id;
      const molhosId = categories.find((c: any) => c.name === 'Molhos')?.id;
      
      // Inserir adicionais
      const additionalsData = [
        // Extras
        { name: 'Cream Cheese Extra', description: 'Porção adicional de cream cheese', price: 5.00, additional_category_id: extrasId, active: true, sort_order: 1 },
        { name: 'Salmão Extra', description: 'Porção adicional de salmão', price: 12.00, additional_category_id: extrasId, active: true, sort_order: 2 },
        { name: 'Shimeji Extra', description: 'Porção adicional de shimeji', price: 8.00, additional_category_id: extrasId, active: true, sort_order: 3 },
        { name: 'Gengibre Extra', description: 'Porção adicional de gengibre', price: 2.00, additional_category_id: extrasId, active: true, sort_order: 4 },
        { name: 'Wasabi Extra', description: 'Porção adicional de wasabi', price: 3.00, additional_category_id: extrasId, active: true, sort_order: 5 },
        
        // Substituições
        { name: 'Trocar por Salmão', description: 'Substituir proteína por salmão', price: 8.00, additional_category_id: substituicoesId, active: true, sort_order: 1 },
        { name: 'Trocar por Atum', description: 'Substituir proteína por atum', price: 6.00, additional_category_id: substituicoesId, active: true, sort_order: 2 },
        { name: 'Sem Cream Cheese', description: 'Remover cream cheese', price: 0.00, additional_category_id: substituicoesId, active: true, sort_order: 3 },
        { name: 'Sem Cebolinha', description: 'Remover cebolinha', price: 0.00, additional_category_id: substituicoesId, active: true, sort_order: 4 },
        { name: 'Sem Gergelim', description: 'Remover gergelim', price: 0.00, additional_category_id: substituicoesId, active: true, sort_order: 5 },
        
        // Acompanhamentos
        { name: 'Gohan', description: 'Arroz japonês', price: 8.00, additional_category_id: acompanhamentosId, active: true, sort_order: 1 },
        { name: 'Sunomono', description: 'Salada de pepino agridoce', price: 12.00, additional_category_id: acompanhamentosId, active: true, sort_order: 2 },
        { name: 'Missoshiru', description: 'Sopa de missô', price: 10.00, additional_category_id: acompanhamentosId, active: true, sort_order: 3 },
        { name: 'Edamame', description: 'Soja verde cozida', price: 15.00, additional_category_id: acompanhamentosId, active: true, sort_order: 4 },
        { name: 'Gyoza', description: '5 unidades de guioza', price: 18.00, additional_category_id: acompanhamentosId, active: true, sort_order: 5 },
        
        // Molhos
        { name: 'Molho Tarê', description: 'Molho doce tradicional', price: 2.00, additional_category_id: molhosId, active: true, sort_order: 1 },
        { name: 'Molho Shoyu', description: 'Molho de soja', price: 0.00, additional_category_id: molhosId, active: true, sort_order: 2 },
        { name: 'Molho Spicy Mayo', description: 'Maionese picante', price: 3.00, additional_category_id: molhosId, active: true, sort_order: 3 },
        { name: 'Molho Ponzu', description: 'Molho cítrico japonês', price: 3.50, additional_category_id: molhosId, active: true, sort_order: 4 },
        { name: 'Molho Teriyaki', description: 'Molho agridoce', price: 3.50, additional_category_id: molhosId, active: true, sort_order: 5 }
      ].filter(item => item.additional_category_id);
      
      // Inserir adicionais um por um
      for (const additional of additionalsData) {
        const { error } = await supabase
          .from('additionals')
          .upsert(additional, { onConflict: 'name' });
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Erro ao inserir adicional:', additional.name, error);
        }
      }
    }
    
    // Verificar o resultado
    const { data: finalCategories, count: catCount } = await supabase
      .from('additional_categories')
      .select('*', { count: 'exact' });
    
    const { data: finalAdditionals, count: addCount } = await supabase
      .from('additionals')
      .select('*', { count: 'exact' });
    
    return NextResponse.json({
      success: true,
      message: 'Tabelas criadas com sucesso!',
      categories: catCount || 0,
      additionals: addCount || 0,
      data: {
        categories: finalCategories,
        additionals: finalAdditionals
      }
    });
    
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}