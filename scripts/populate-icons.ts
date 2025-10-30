import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const icons = [
  // Japanese specific - 11 ícones
  { id: 'sushi', name: 'Sushi', category: 'japanese', emoji: '🍣' },
  { id: 'rice-cooker', name: 'Arroz', category: 'japanese', emoji: '🍚' },
  { id: 'noodles', name: 'Lámen', category: 'japanese', emoji: '🍜' },
  { id: 'rice-bowl', name: 'Tigela de Arroz', category: 'japanese', emoji: '🍚' },
  { id: 'chopsticks', name: 'Hashi', category: 'japanese', emoji: '🥢' },
  { id: 'teapot', name: 'Bule de Chá', category: 'japanese', emoji: '🍵' },
  { id: 'dumpling', name: 'Gyoza', category: 'japanese', emoji: '🥟' },
  { id: 'boba', name: 'Bubble Tea', category: 'japanese', emoji: '🧋' },
  { id: 'bowl-spiral', name: 'Ramen Bowl', category: 'japanese', emoji: '🍜' },
  { id: 'fish-cooked', name: 'Peixe Grelhado', category: 'japanese', emoji: '🐟' },
  { id: 'fish-bucket', name: 'Balde de Peixe', category: 'japanese', emoji: '🪣' },
  
  // Seafood - 11 ícones
  { id: 'fish', name: 'Peixe', category: 'seafood', emoji: '🐟' },
  { id: 'octopus', name: 'Polvo', category: 'seafood', emoji: '🐙' },
  { id: 'shrimp', name: 'Camarão', category: 'seafood', emoji: '🦐' },
  { id: 'crab', name: 'Caranguejo', category: 'seafood', emoji: '🦀' },
  { id: 'fish-eggs', name: 'Ovas', category: 'seafood', emoji: '🍱' },
  { id: 'salmon', name: 'Salmão', category: 'seafood', emoji: '🐟' },
  { id: 'sea-dragon', name: 'Cavalo Marinho', category: 'seafood', emoji: '🐉' },
  { id: 'squid', name: 'Lula', category: 'seafood', emoji: '🦑' },
  { id: 'oyster', name: 'Ostra', category: 'seafood', emoji: '🦪' },
  { id: 'mussel', name: 'Mexilhão', category: 'seafood', emoji: '🐚' },
  { id: 'lobster', name: 'Lagosta', category: 'seafood', emoji: '🦞' },
  
  // Drinks - 15 ícones
  { id: 'wine', name: 'Vinho', category: 'drinks', emoji: '🍷' },
  { id: 'coffee', name: 'Café', category: 'drinks', emoji: '☕' },
  { id: 'beer', name: 'Cerveja', category: 'drinks', emoji: '🍺' },
  { id: 'beer-bottle', name: 'Garrafa de Cerveja', category: 'drinks', emoji: '🍺' },
  { id: 'wine-bottle', name: 'Garrafa de Vinho', category: 'drinks', emoji: '🍾' },
  { id: 'martini', name: 'Martini', category: 'drinks', emoji: '🍸' },
  { id: 'soda', name: 'Refrigerante', category: 'drinks', emoji: '🥤' },
  { id: 'milk', name: 'Leite', category: 'drinks', emoji: '🥛' },
  { id: 'coffee-cup', name: 'Xícara de Café', category: 'drinks', emoji: '☕' },
  { id: 'coffee-beans', name: 'Grãos de Café', category: 'drinks', emoji: '☕' },
  { id: 'glass-shot', name: 'Shot', category: 'drinks', emoji: '🥃' },
  { id: 'champagne', name: 'Champagne', category: 'drinks', emoji: '🥂' },
  { id: 'tea-pot2', name: 'Chá Verde', category: 'drinks', emoji: '🍵' },
  { id: 'juice', name: 'Suco Natural', category: 'drinks', emoji: '🧃' },
  { id: 'smoothie', name: 'Smoothie', category: 'drinks', emoji: '🥤' },
  
  // Vegetables - 15 ícones
  { id: 'tomato', name: 'Tomate', category: 'vegetables', emoji: '🍅' },
  { id: 'mushroom', name: 'Cogumelo', category: 'vegetables', emoji: '🍄' },
  { id: 'garlic', name: 'Alho', category: 'vegetables', emoji: '🧄' },
  { id: 'chili', name: 'Pimenta', category: 'vegetables', emoji: '🌶️' },
  { id: 'broccoli', name: 'Brócolis', category: 'vegetables', emoji: '🥦' },
  { id: 'avocado', name: 'Abacate', category: 'vegetables', emoji: '🥑' },
  { id: 'carrot', name: 'Cenoura', category: 'vegetables', emoji: '🥕' },
  { id: 'salad', name: 'Salada', category: 'vegetables', emoji: '🥗' },
  { id: 'corn', name: 'Milho', category: 'vegetables', emoji: '🌽' },
  { id: 'potato', name: 'Batata', category: 'vegetables', emoji: '🥔' },
  { id: 'radish', name: 'Rabanete', category: 'vegetables', emoji: '🌰' },
  { id: 'pumpkin', name: 'Abóbora', category: 'vegetables', emoji: '🎃' },
  { id: 'olive', name: 'Azeitona', category: 'vegetables', emoji: '🫒' },
  { id: 'herbs', name: 'Ervas', category: 'vegetables', emoji: '🌿' },
  { id: 'spices', name: 'Temperos', category: 'vegetables', emoji: '🧂' },
  
  // Fruits - 15 ícones
  { id: 'coconut', name: 'Coco', category: 'fruits', emoji: '🥥' },
  { id: 'orange', name: 'Laranja', category: 'fruits', emoji: '🍊' },
  { id: 'strawberry', name: 'Morango', category: 'fruits', emoji: '🍓' },
  { id: 'watermelon', name: 'Melancia', category: 'fruits', emoji: '🍉' },
  { id: 'cherry', name: 'Cereja', category: 'fruits', emoji: '🍒' },
  { id: 'apple', name: 'Maçã', category: 'fruits', emoji: '🍎' },
  { id: 'grape', name: 'Uva', category: 'fruits', emoji: '🍇' },
  { id: 'banana', name: 'Banana', category: 'fruits', emoji: '🍌' },
  { id: 'pineapple', name: 'Abacaxi', category: 'fruits', emoji: '🍍' },
  { id: 'pear', name: 'Pera', category: 'fruits', emoji: '🍐' },
  { id: 'grapes', name: 'Cachos de Uva', category: 'fruits', emoji: '🍇' },
  { id: 'lemon', name: 'Limão', category: 'fruits', emoji: '🍋' },
  { id: 'fruit-bowl', name: 'Tigela de Frutas', category: 'fruits', emoji: '🍑' },
  { id: 'berries', name: 'Frutas Vermelhas', category: 'fruits', emoji: '🫐' },
  { id: 'acorn', name: 'Castanha', category: 'fruits', emoji: '🌰' },
  
  // Desserts - 11 ícones
  { id: 'cookie', name: 'Biscoito', category: 'desserts', emoji: '🍪' },
  { id: 'cake', name: 'Bolo', category: 'desserts', emoji: '🎂' },
  { id: 'ice-cream', name: 'Sorvete', category: 'desserts', emoji: '🍨' },
  { id: 'croissant', name: 'Croissant', category: 'desserts', emoji: '🥐' },
  { id: 'candy', name: 'Doce', category: 'desserts', emoji: '🍬' },
  { id: 'donut', name: 'Donuts', category: 'desserts', emoji: '🍩' },
  { id: 'cupcake', name: 'Cupcake', category: 'desserts', emoji: '🧁' },
  { id: 'chocolate', name: 'Chocolate', category: 'desserts', emoji: '🍫' },
  { id: 'candy-canes', name: 'Bengala Doce', category: 'desserts', emoji: '🍭' },
  { id: 'honey', name: 'Mel', category: 'desserts', emoji: '🍯' },
  { id: 'pretzel', name: 'Pretzel', category: 'desserts', emoji: '🥨' },
  
  // General food - 27 ícones
  { id: 'soup', name: 'Sopa', category: 'general', emoji: '🍲' },
  { id: 'pizza', name: 'Pizza', category: 'general', emoji: '🍕' },
  { id: 'beef', name: 'Carne', category: 'general', emoji: '🥩' },
  { id: 'sandwich', name: 'Sanduíche', category: 'general', emoji: '🥪' },
  { id: 'utensils', name: 'Talheres', category: 'general', emoji: '🍴' },
  { id: 'chef-hat', name: 'Chapéu de Chef', category: 'general', emoji: '👨‍🍳' },
  { id: 'egg', name: 'Ovo', category: 'general', emoji: '🥚' },
  { id: 'wheat', name: 'Trigo', category: 'general', emoji: '🌾' },
  { id: 'flame', name: 'Grelhado', category: 'general', emoji: '🔥' },
  { id: 'popcorn', name: 'Pipoca', category: 'general', emoji: '🍿' },
  { id: 'tacos', name: 'Tacos', category: 'general', emoji: '🌮' },
  { id: 'hot-dog', name: 'Hot Dog', category: 'general', emoji: '🌭' },
  { id: 'bread', name: 'Pão', category: 'general', emoji: '🍞' },
  { id: 'butter', name: 'Manteiga', category: 'general', emoji: '🧈' },
  { id: 'steak', name: 'Bife', category: 'general', emoji: '🥩' },
  { id: 'chicken-leg', name: 'Coxa de Frango', category: 'general', emoji: '🍗' },
  { id: 'roast-chicken', name: 'Frango Assado', category: 'general', emoji: '🍗' },
  { id: 'meat-cleaver', name: 'Açougue', category: 'general', emoji: '🔪' },
  { id: 'knife-fork', name: 'Garfo e Faca', category: 'general', emoji: '🍴' },
  { id: 'spoon', name: 'Colher', category: 'general', emoji: '🥄' },
  { id: 'ladle', name: 'Concha', category: 'general', emoji: '🥄' },
  { id: 'sauce-pan', name: 'Panela', category: 'general', emoji: '🍳' },
  { id: 'cooking-pot', name: 'Caldeirão', category: 'general', emoji: '🍲' },
  { id: 'peanut', name: 'Amendoim', category: 'general', emoji: '🥜' },
  { id: 'almond', name: 'Amêndoa', category: 'general', emoji: '🌰' },
  { id: 'food-can', name: 'Enlatado', category: 'general', emoji: '🥫' },
  { id: 'carnivore', name: 'Churrasco', category: 'general', emoji: '🍖' },
  
  // Special - 20 ícones
  { id: 'star', name: 'Estrela', category: 'special', emoji: '⭐' },
  { id: 'crown', name: 'Coroa Premium', category: 'special', emoji: '👑' },
  { id: 'gem', name: 'Diamante', category: 'special', emoji: '💎' },
  { id: 'trophy', name: 'Troféu', category: 'special', emoji: '🏆' },
  { id: 'medal', name: 'Medalha', category: 'special', emoji: '🏅' },
  { id: 'award', name: 'Prêmio', category: 'special', emoji: '🎖️' },
  { id: 'sparkles', name: 'Brilho', category: 'special', emoji: '✨' },
  { id: 'zap', name: 'Energia', category: 'special', emoji: '⚡' },
  { id: 'heart', name: 'Favorito', category: 'special', emoji: '❤️' },
  { id: 'shield', name: 'Qualidade', category: 'special', emoji: '🛡️' },
  { id: 'target', name: 'Seleção', category: 'special', emoji: '🎯' },
  { id: 'circle-check', name: 'Aprovado', category: 'special', emoji: '✅' },
  { id: 'badge-check', name: 'Certificado', category: 'special', emoji: '📛' },
  { id: 'crown-coin', name: 'Rodízio Premium', category: 'special', emoji: '👑' },
  { id: 'diamonds', name: 'Luxo', category: 'special', emoji: '💎' },
  { id: 'crystal', name: 'Cristal', category: 'special', emoji: '💠' },
  { id: 'round-star', name: 'Tradicional', category: 'special', emoji: '🌟' },
  { id: 'flame-special', name: 'Hot', category: 'special', emoji: '🔥' },
  { id: 'sparkle-gi', name: 'Especial', category: 'special', emoji: '✨' },
  { id: 'all-you-can-eat', name: 'Rodízio', category: 'special', emoji: '🍜' }
];

async function populateIcons() {
  console.log('Starting to populate icons table...');
  
  try {
    // Clear existing icons
    const { error: deleteError } = await supabase
      .from('icons')
      .delete()
      .neq('id', '');
    
    if (deleteError) {
      console.log('Note: Could not clear existing icons:', deleteError.message);
    }
    
    // Insert icons in batches to avoid timeout
    const batchSize = 20;
    for (let i = 0; i < icons.length; i += batchSize) {
      const batch = icons.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('icons')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} icons)`);
      }
    }
    
    // Verify total count
    const { count } = await supabase
      .from('icons')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Total icons in database: ${count}`);
    console.log('✅ Icons population completed!');
    
  } catch (error) {
    console.error('Failed to populate icons:', error);
    process.exit(1);
  }
}

populateIcons();