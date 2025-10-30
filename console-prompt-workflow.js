const express = require('express');
const app = express();
const PORT = 3001;

// Middleware para processar JSON
app.use(express.json());

// Armazenar mensagens temporariamente
let messages = [];

// Função auxiliar para limpar console completamente
function clearConsoleCompletely() {
  // Usa escape sequences para limpar tela e histórico
  process.stdout.write('\x1Bc');
  // Move cursor para o topo
  process.stdout.write('\x1b[0;0H');
}

// POST - Receber e mostrar prompt no console
app.post('/console-prompt', (req, res) => {
  const { prompt, images } = req.body;
  
  // Limpar console completamente
  clearConsoleCompletely();
  
  if (prompt) {
    console.log('================== PROMPT ==================');
    console.log(prompt);
    console.log('============================================');
    
    // Armazenar mensagem
    messages.push({
      type: 'prompt',
      content: prompt,
      timestamp: new Date().toISOString()
    });
  }
  
  if (images && images.length > 0) {
    console.log('\n📎 Imagens anexadas:');
    images.forEach((path, index) => {
      console.log(`  ${index + 1}. ${path}`);
    });
  }
  
  res.json({ success: true, message: 'Prompt recebido no Console Prompt Workflow' });
});

// DELETE - Limpar console
app.delete('/console-prompt', (req, res) => {
  // Limpar console completamente
  clearConsoleCompletely();
  messages = [];
  console.log('✨ Console Prompt Workflow limpo');
  res.json({ success: true, message: 'Console limpo' });
});

// GET - Obter mensagens armazenadas (útil para debug)
app.get('/console-prompt', (req, res) => {
  res.json({ messages });
});

// Iniciar servidor
app.listen(PORT, () => {
  clearConsoleCompletely();
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Console Prompt Workflow v1.0          ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📝 Aguardando prompts...\n');
  console.log('Endpoints disponíveis:');
  console.log('  POST   /console-prompt - Receber prompt');
  console.log('  DELETE /console-prompt - Limpar console');
  console.log('  GET    /console-prompt - Ver mensagens\n');
});

// Tratamento de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({ error: err.message });
});