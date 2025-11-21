// Configuration file for the Tablet App

// Determina a URL base dependendo do ambiente
const getApiUrl = () => {
  // URL do backend do Replit (sempre use HTTPS para Expo)
  return 'https://0cf83c93-8147-42e6-967b-30b169de3e65-00-1uqldc8o7pfpx.spock.replit.dev/api/mobile';
};

export const config = {
  // API URL - using the real backend
  API_URL: getApiUrl(),
  
  // App settings
  ADMIN_PASSWORD: '0000',
  
  // Theme colors - Dark Mode
  colors: {
    primary: '#FF6B35',          // Orange - Main accent color
    secondary: '#FFA726',        // Lighter Orange - Secondary accent
    tertiary: '#FF8C42',         // Medium Orange - Tertiary accent
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
    gradientStart: '#FF6B35',    // Orange
    gradientEnd: '#FF8C42',      // Lighter Orange
    
    // Category colors
    categoryColors: [
      '#FF6366',  // Pink
      '#FFA726',  // Orange
      '#AB47BC',  // Purple
      '#5C6BC0',  // Indigo
      '#42A5F5',  // Blue
      '#26C6DA',  // Cyan
      '#66BB6A',  // Green
      '#9CCC65',  // Light Green
    ],
    
    // Mode colors
    rodizioColor: '#FF6B35',     // Orange for Rodízio
    carteColor: '#FF8C42',       // Lighter Orange for À La Carte
  },
  
  // Animation durations
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  }
};