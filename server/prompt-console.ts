import express from "express";
import cors from "cors";

const app = express();
const PORT = 3456;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Console colorido e formatado
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Cores do texto
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",

  // Background
  bgCyan: "\x1b[46m",
  bgYellow: "\x1b[43m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgBlue: "\x1b[44m",
};

// Linha separadora
const separator = "═".repeat(60);

// Limpa o console no início
console.clear();

// Endpoint para receber mensagens
app.post("/prompt-message", (req, res) => {
  const { message, clear, image } = req.body;

  if (clear) {
    // Limpar console silenciosamente
    console.clear();
    res.json({ success: true, action: "cleared" });
    return;
  }

  // Mostrar timestamp
  const timestamp = new Date().toLocaleTimeString("pt-BR");
  console.log(`\n${colors.dim}[${timestamp}]${colors.reset}`);

  // Mostrar mensagem se houver
  if (message) {
    console.log(`\n${colors.white}${colors.bright}${message}${colors.reset}`);
  }

  // Mostrar imagem se houver
  if (image) {
    // Extrai o tipo de imagem do base64
    const imageType = image.match(/data:image\/([^;]+)/)?.[1] || "unknown";
    const imageSize = Math.round((image.length * 3) / 4 / 1024); // Tamanho aproximado em KB

    console.log(
      `\n${colors.green}${colors.bright}📷 IMAGEM RECEBIDA${colors.reset}`,
    );
    console.log(
      `${colors.cyan}Tipo: ${imageType.toUpperCase()} | Tamanho: ~${imageSize}KB${colors.reset}`,
    );
    console.log(`${colors.dim}Base64 (primeiros 100 chars):${colors.reset}`);
    console.log(`${colors.yellow}${image.substring(0, 100)}...${colors.reset}`);

    // Se quiser ver a imagem completa em base64, descomente a linha abaixo:
    // console.log(`\n${colors.dim}Base64 completo:${colors.reset}\n${image}`);
  }

  if (message || image) {
    console.log(""); // Linha em branco para separação
    res.json({ success: true, message: "Conteúdo exibido no console!" });
  } else {
    res.status(400).json({ error: "Nenhum conteúdo fornecido" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "running", port: PORT });
});

// Iniciar servidor
app.listen(PORT, () => {
  // Servidor inicia silenciosamente
});
