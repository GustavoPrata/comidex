'use client'

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Trash2,
  Terminal,
  Image,
  X,
  FileImage,
  CheckCircle,
} from "lucide-react";

interface ConsoleMessage {
  id: string;
  text: string;
  timestamp: Date;
  imageId?: string;
}

export default function PromptPage() {
  const [inputText, setInputText] = useState("");
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [photoCounter, setPhotoCounter] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar contador de fotos do localStorage
  useEffect(() => {
    const savedCounter = localStorage.getItem('promptPhotoCounter');
    if (savedCounter) {
      setPhotoCounter(parseInt(savedCounter, 10));
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() && !currentImageId) return;
    if (isSending) return; // Prevenir duplo envio

    try {
      setIsSending(true);
      const payload: any = {};
      
      if (inputText.trim()) {
        payload.message = inputText.trim();
      }
      
      if (currentImageId) {
        payload.imageId = currentImageId;
        const fileExtension = selectedImage?.split(';')[0].split('/')[1] || 'jpg';
        payload.message = (payload.message || '') + ` [veja a foto attachments/${currentImageId}.${fileExtension}]`;
      }

      // Envia para o workflow Console Prompt através do proxy
      const response = await fetch("/api/prompt-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Workflow não está rodando");
      }
      
      // Adiciona à lista de mensagens
      let displayText = inputText.trim() || "";
      if (currentImageId) {
        const fileExtension = selectedImage?.split(';')[0].split('/')[1] || 'jpg';
        const imagePath = `[veja a foto attachments/${currentImageId}.${fileExtension}]`;
        displayText = displayText ? `${displayText} ${imagePath}` : `📷 ${imagePath}`;
      }
      
      const newMessage: ConsoleMessage = {
        id: Date.now().toString(),
        text: displayText,
        timestamp: new Date(),
        imageId: currentImageId || undefined,
      };
      
      setConsoleMessages(prev => [...prev, newMessage]);
      
      // Limpa o campo de input e imagem
      setInputText("");
      setSelectedImage(null);
      setCurrentImageId(null);
      
      // Foca novamente no textarea
      textareaRef.current?.focus();
    } catch (error) {
      // Se o Console Prompt não está rodando, envia para o console principal
      console.log("📨 [PROMPT]:", inputText.trim() || "");
      if (currentImageId) {
        const fileExtension = selectedImage?.split(';')[0].split('/')[1] || 'jpg';
        console.log("📷 [IMAGE]:", `attachments/${currentImageId}.${fileExtension}`);
      }
      
      // Adiciona à lista de mensagens com indicação de que foi para o console principal
      let displayText = inputText.trim() || "";
      if (currentImageId) {
        const fileExtension = selectedImage?.split(';')[0].split('/')[1] || 'jpg';
        const imagePath = `[veja a foto attachments/${currentImageId}.${fileExtension}]`;
        displayText = displayText ? `${displayText} ${imagePath}` : `📷 ${imagePath}`;
      }
      
      const newMessage: ConsoleMessage = {
        id: Date.now().toString(),
        text: `[Console Principal] ${displayText}`,
        timestamp: new Date(),
        imageId: currentImageId || undefined,
      };
      
      setConsoleMessages(prev => [...prev, newMessage]);
      
      // Limpa o campo de input e imagem
      setInputText("");
      setSelectedImage(null);
      setCurrentImageId(null);
      
      // Foca novamente no textarea
      textareaRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = async () => {
    try {
      // Limpa o console do workflow através do proxy
      const response = await fetch("/api/prompt-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clear: true }),
      });

      if (!response.ok) {
        throw new Error("Erro ao limpar console");
      }
      
      // Limpa a lista de mensagens
      setConsoleMessages([]);
    } catch (error) {
      // Se o Console Prompt não está rodando, apenas limpa a lista local
      console.log("🧹 [PROMPT]: Limpando console local");
      setConsoleMessages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Envia com Enter direto
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter para quebra de linha
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };
  
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Criar FormData para enviar a imagem
      const formData = new FormData();
      const imageId = `foto${photoCounter}`;
      formData.append('image', file);
      formData.append('imageId', imageId);
      
      // Enviar imagem para o servidor
      const response = await fetch('/api/prompt-upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const data = await response.json();
      
      // Atualizar contador e salvar no localStorage
      const newCounter = photoCounter + 1;
      setPhotoCounter(newCounter);
      localStorage.setItem('promptPhotoCounter', newCounter.toString());
      
      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setCurrentImageId(imageId);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao fazer upload da imagem.');
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setCurrentImageId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handlers para Drag & Drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      processImageFile(files[0]);
    }
  };

  // Handler para Ctrl+V (colar)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of Array.from(items)) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            processImageFile(blob);
          }
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [photoCounter]);

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-gray-200 dark:border-gray-800 border-0 shadow-lg bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-black dark:text-white">Console Prompt - Workflow</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-500 dark:text-gray-300">
                    Digite e envie mensagens para o console do servidor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 dark:bg-gray-900 text-black dark:text-white">
                  {consoleMessages.length} mensagens
                </Badge>
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/20 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                  <FileImage className="h-3 w-3 mr-1" />
                  {photoCounter - 1} fotos
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Input Area with Drag & Drop */}
        <Card 
          className={`border-0 shadow-lg bg-white dark:bg-gray-950 transition-all border-gray-200 dark:border-gray-800 ${
            isDragging ? 'ring-4 ring-orange-400 ring-opacity-50' : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            <div className="space-y-4 relative">
              {/* Drag & Drop Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-orange-500/10 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                    <p className="text-orange-600 font-semibold">Solte a imagem aqui</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
                  Digite sua mensagem
                </label>
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite qualquer texto aqui..."
                  className="min-h-[120px] resize-y font-mono text-sm bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  autoFocus
                  data-testid="input-prompt"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Enter para enviar • Shift+Enter para nova linha • Ctrl+V para colar imagem • Arraste imagens aqui
                </p>
              </div>

              {/* Preview de Imagem */}
              {selectedImage && currentImageId && (
                <div className="relative rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 dark:bg-orange-900/10 p-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-h-32 rounded-md border border-gray-200 dark:border-gray-700"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Imagem carregada com sucesso!
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-500 text-white">
                          {currentImageId}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-300">
                          Salva em attachments/{currentImageId}.jpg
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 dark:text-gray-500 dark:text-gray-300">
                        A imagem será enviada junto com sua mensagem
                      </p>
                    </div>
                    <Button
                      onClick={removeImage}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de mensagens enviadas */}
              {consoleMessages.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Mensagens Enviadas:
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                    {consoleMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {format(msg.timestamp)}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">
                          {msg.text}
                        </span>
                        {msg.imageId && (
                          <Badge variant="outline" className="text-xs border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400">
                            {msg.imageId}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {/* Botão de Upload de Imagem */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading || currentImageId !== null}
                  className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900"
                  data-testid="button-upload-image"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {isUploading ? "Carregando..." : currentImageId ? "Imagem Selecionada" : `Adicionar foto${photoCounter}`}
                </Button>
                
                <Button
                  onClick={handleSend}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={(!inputText.trim() && !currentImageId) || isSending}
                  data-testid="button-send-prompt"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? "Enviando..." : "Enviar ao Console"}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900"
                  data-testid="button-clear-console"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Console
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function format(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}