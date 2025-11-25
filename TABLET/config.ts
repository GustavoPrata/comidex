// Configuration file for the Tablet App

// ARQUITETURA: POS é o single source of truth
// Tablet APENAS lê estados do POS e envia pedidos
// Nunca cria ou gerencia sessões diretamente

// URL do backend do Replit
const BACKEND_URL = 'https://0cf83c93-8147-42e6-967b-30b169de3e65-00-1uqldc8o7pfpx.spock.replit.dev';

// APIs do POS - Single Source of Truth para operações
const POS_API_URL = `${BACKEND_URL}/api/pos`;

// APIs de Catálogo - Read-only para produtos e categorias
const CATALOG_API_URL = `${BACKEND_URL}/api/mobile`;

export const config = {
  // Base URL for all API calls
  API_BASE_URL: BACKEND_URL,
  
  // POS APIs - Autoridade sobre mesas, sessões e pedidos
  POS_API: {
    tables: `${POS_API_URL}/tables`,      // GET: listar mesas com status real
    session: `${POS_API_URL}/session`,    // GET: buscar sessão, POST: abrir mesa (apenas POS UI)
    order: `${POS_API_URL}/order`,        // POST: lançar pedido (tablet pode usar)
    serviceTypes: `${POS_API_URL}/service-types` // GET: tipos de serviço (rodízio)
  },
  
  // Catalog APIs - Dados read-only do catálogo
  CATALOG_API: {
    categories: `${CATALOG_API_URL}/categories`,    // GET: listar categorias
    products: `${CATALOG_API_URL}/products`,        // GET: listar produtos
    serviceTypes: `${CATALOG_API_URL}/service-types`, // GET: tipos de serviço (rodízio)
    callWaiter: `${CATALOG_API_URL}/call-waiter`    // POST: chamar garçom
  },
  
  // Legacy - será removido após migração completa
  API_URL: CATALOG_API_URL, // Mantido temporariamente para compatibilidade
  
  // App settings
  ADMIN_PASSWORD: '0000',
  
  // Theme colors - Dark Mode (matching ComideX official logo)
  colors: {
    primary: '#FF7043',          // ComideX Orange - Main accent color
    secondary: '#FFA166',        // Lighter Orange - Secondary accent
    tertiary: '#FF8557',         // Medium Orange - Tertiary accent
    success: '#4CAF50',          // Green
    warning: '#FFA726',          // Orange
    error: '#F44336',            // Red
    info: '#2196F3',             // Blue
    
    // Background colors - Dark Mode
    background: '#000000',       // Pure Black
    surface: '#1A1A1A',          // Very Dark Gray
    card: '#1F1F1F',             // Dark Gray cards
    
    // Text colors - Dark Mode
    textPrimary: '#FFFFFF',      // White
    textSecondary: '#B0B0B0',    // Light Gray
    textTertiary: '#808080',     // Medium Gray
    textOnPrimary: '#FFFFFF',    // White text on primary
    
    // Gradients
    gradientStart: '#FF7043',    // ComideX Orange
    gradientEnd: '#FF8557',      // Lighter Orange
    
    // Category colors
    categoryColors: [
      '#FF6366',  // Pink
      '#FF7043',  // ComideX Orange
      '#AB47BC',  // Purple
      '#5C6BC0',  // Indigo
      '#42A5F5',  // Blue
      '#26C6DA',  // Cyan
      '#66BB6A',  // Green
      '#9CCC65',  // Light Green
    ],
    
    // Mode colors
    rodizioColor: '#FF7043',     // ComideX Orange for Rodízio
    carteColor: '#FF8557',       // Lighter Orange for À La Carte
  },
  
  // Animation durations
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  }
};