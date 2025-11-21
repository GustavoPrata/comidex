// Configuration file for the Tablet App
export const config = {
  // API URL - using the real backend
  API_URL: 'https://0cf83c93-8147-42e6-967b-30b169de3e65-00-1uqldc8o7pfpx.spock.replit.dev/api/mobile',
  
  // For local development
  // API_URL: 'http://localhost:5000/api/mobile',
  
  // App settings
  ADMIN_PASSWORD: '0000',
  
  // Theme colors
  colors: {
    primary: '#FF6366',          // Coral Pink - Main accent color
    secondary: '#FFA726',        // Orange - Secondary accent
    tertiary: '#AB47BC',         // Purple - Tertiary accent
    success: '#66BB6A',          // Green
    warning: '#FFA726',          // Orange
    error: '#EF5350',            // Red
    info: '#42A5F5',             // Blue
    
    // Background colors
    background: '#FFFFFF',       // White
    surface: '#F8F9FA',          // Light Gray
    card: '#FFFFFF',             // White cards
    
    // Text colors
    textPrimary: '#2C3E50',      // Dark Blue-Gray
    textSecondary: '#64748B',    // Medium Gray
    textTertiary: '#94A3B8',     // Light Gray
    textOnPrimary: '#FFFFFF',    // White text on primary
    
    // Gradients
    gradientStart: '#FF6366',    // Pink
    gradientEnd: '#FFA726',      // Orange
    
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
    rodizioColor: '#FF6366',     // Pink for Rodízio
    carteColor: '#42A5F5',       // Blue for À La Carte
  },
  
  // Animation durations
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  }
};