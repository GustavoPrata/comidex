// Configura opções de memória para o Node.js
// Aumenta o limite de memória heap para 8GB
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('max-old-space-size')) {
  process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --max-old-space-size=8192';
}

// Log da configuração de memória
console.log('🚀 Node.js memory limit set to 8GB');
console.log('📊 Current memory usage:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');