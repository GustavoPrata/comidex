"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, ZoomIn, ZoomOut, Move, Check, Sparkles, Crosshair, Pencil, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  aspectRatio?: number; // Default will be 16:9
  className?: string;
  categoryName?: string;
  categoryId?: string;
  isProduct?: boolean; // To distinguish between product and category
}

export function ImageUpload({ 
  value, 
  onChange, 
  aspectRatio = 16/9, 
  className = "",
  categoryName,
  categoryId,
  isProduct = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    setIsLoadingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setIsEditing(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsEnhanced(false);
      setIsLoadingImage(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // Check for dragged file or auto-open when component mounts
  useEffect(() => {
    if ((window as any).draggedImageFile) {
      const file = (window as any).draggedImageFile;
      delete (window as any).draggedImageFile;
      handleFileSelect(file);
    } else if (!value && (window as any).autoOpenImageSelector) {
      delete (window as any).autoOpenImageSelector;
      // Auto-open file selector after a small delay
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    } else if (value && (window as any).autoOpenImageEditor) {
      delete (window as any).autoOpenImageEditor;
      // Auto-open editor with existing image
      setSelectedImage(value);
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setIsEnhanced(false);
      setIsEditing(true);
    }
  }, [handleFileSelect, value]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle image position dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  // Apply image enhancement filters
  const enhanceImage = useCallback(() => {
    setIsEnhanced(!isEnhanced);
  }, [isEnhanced]);

  // Reset zoom and position
  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsEnhanced(false);
  }, []);

  // Apply crop and save
  const handleSave = useCallback(async () => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = async () => {
      // Set canvas size to desired output (16:9 aspect ratio, 1200px width)
      const outputWidth = 1200;
      const outputHeight = outputWidth / aspectRatio;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Clear canvas
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Calculate scaled dimensions
      const imgAspect = img.width / img.height;
      const canvasAspect = aspectRatio;
      
      let drawWidth, drawHeight;
      if (imgAspect > canvasAspect) {
        // Image is wider
        drawHeight = outputHeight * zoom;
        drawWidth = drawHeight * imgAspect;
      } else {
        // Image is taller
        drawWidth = outputWidth * zoom;
        drawHeight = drawWidth / imgAspect;
      }

      // Center the image and apply position offset
      const drawX = (outputWidth - drawWidth) / 2 + position.x;
      const drawY = (outputHeight - drawHeight) / 2 + position.y;

      // Draw the image
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Apply enhancement filters if enabled
      if (isEnhanced) {
        const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
        const data = imageData.data;
        
        // Apply brightness, contrast and saturation adjustments
        for (let i = 0; i < data.length; i += 4) {
          // Brightness adjustment (+10%)
          data[i] = Math.min(255, data[i] * 1.1);     // Red
          data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
          
          // Contrast adjustment (+15%)
          const factor = 1.15;
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
          
          // Slight saturation boost
          const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
          const saturation = 1.2;
          data[i] = Math.min(255, Math.max(0, gray + saturation * (data[i] - gray)));
          data[i + 1] = Math.min(255, Math.max(0, gray + saturation * (data[i + 1] - gray)));
          data[i + 2] = Math.min(255, Math.max(0, gray + saturation * (data[i + 2] - gray)));
        }
        
        ctx.putImageData(imageData, 0, 0);
      }

      try {
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast.error("Erro ao processar imagem");
            return;
          }

          // Convert blob to base64 data URL
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            // Return the base64 string to the onChange handler
            onChange(base64String);
            setIsEditing(false);
            setSelectedImage(null);
            toast.success("Imagem preparada com sucesso!");
          };
          reader.readAsDataURL(blob);
          
        }, 'image/jpeg', 0.9);
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
      }
    };
    img.src = selectedImage;
  }, [selectedImage, zoom, position, aspectRatio, onChange, isEnhanced, categoryName, categoryId]);

  // Load image once when editor opens
  useEffect(() => {
    if (!isEditing || !selectedImage) return;
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setIsLoadingImage(false);
      
      // Force render by doing a micro zoom trick
      setTimeout(() => {
        setZoom(1.001);
        setTimeout(() => {
          setZoom(1);
        }, 10);
      }, 100);
    };
    img.onerror = () => {
      setIsLoadingImage(false);
      console.error("Failed to load image");
    };
    img.src = selectedImage;
  }, [isEditing, selectedImage]);

  // Render canvas when image is loaded or settings change
  useEffect(() => {
    if (!isEditing || !selectedImage || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size for preview (mantendo proporção 16:9)
    canvas.width = 800;
    canvas.height = 800 / aspectRatio;

    // Calculate scaled dimensions
    const img = imageRef.current;
    const imgAspect = img.width / img.height;
    const canvasAspect = aspectRatio;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
      drawHeight = canvas.height * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = canvas.width * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    // Center and apply position
    const drawX = (canvas.width - drawWidth) / 2 + position.x;
    const drawY = (canvas.height - drawHeight) / 2 + position.y;

    // Draw blurred background extension when zoomed out
    if (zoom < 1) {
      // Draw the image scaled to fill the entire canvas as background
      ctx.save();
      
      // Apply blur filter for background
      ctx.filter = "blur(20px) brightness(0.7)";
      
      // Calculate dimensions to cover entire canvas
      let bgWidth, bgHeight;
      if (imgAspect > canvasAspect) {
        bgHeight = canvas.height * 1.2; // Slightly larger to avoid gaps
        bgWidth = bgHeight * imgAspect;
      } else {
        bgWidth = canvas.width * 1.2;
        bgHeight = bgWidth / imgAspect;
      }
      
      const bgX = (canvas.width - bgWidth) / 2;
      const bgY = (canvas.height - bgHeight) / 2;
      
      // Draw blurred background
      ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight);
      
      ctx.restore();
    } else {
      // Draw black background when zoomed in
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw the main image on top
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Apply enhancement filters if enabled
    if (isEnhanced) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply brightness, contrast and saturation adjustments
      for (let i = 0; i < data.length; i += 4) {
        // Brightness adjustment (+10%)
        data[i] = Math.min(255, data[i] * 1.1);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
        
        // Contrast adjustment (+15%)
        const factor = 1.15;
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        
        // Slight saturation boost
        const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
        const saturation = 1.2;
        data[i] = Math.min(255, Math.max(0, gray + saturation * (data[i] - gray)));
        data[i + 1] = Math.min(255, Math.max(0, gray + saturation * (data[i + 1] - gray)));
        data[i + 2] = Math.min(255, Math.max(0, gray + saturation * (data[i + 2] - gray)));
      }
      
      ctx.putImageData(imageData, 0, 0);
    }

    // Draw crop guide lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Draw thirds grid
    for (let i = 1; i <= 2; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo((canvas.width / 3) * i, 0);
      ctx.lineTo((canvas.width / 3) * i, canvas.height);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, (canvas.height / 3) * i);
      ctx.lineTo(canvas.width, (canvas.height / 3) * i);
      ctx.stroke();
    }
  }, [zoom, position, aspectRatio, isEditing, isEnhanced]);

  return (
    <>
      <div className={`relative ${className}`}>
        {value ? (
          <div 
            className="relative group"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div 
              className="relative w-full h-48 rounded-xl overflow-hidden"
            >
              <img
                src={value}
                alt="Imagem da categoria"
                className="w-full h-full object-cover"
                style={{ objectFit: "cover" }}
              />
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                isDragging ? "bg-orange-500/30 border-2 border-dashed border-orange-500" : ""
              }`}>
                {isDragging && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                    <Upload className="h-8 w-8 text-orange-500" />
                    <p className="text-sm mt-1">Soltar para substituir</p>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                <div className="pointer-events-auto flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(value);
                    setPosition({ x: 0, y: 0 });
                    setZoom(1);
                    setIsEnhanced(false);
                    setIsEditing(true);
                  }}
                  className="rounded-full bg-white hover:bg-gray-100 text-black"
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="rounded-full"
                  type="button"
                >
                  Trocar Imagem
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange("");
                  }}
                  className="rounded-full"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer
              transition-all hover:bg-gray-50 dark:hover:bg-gray-900
              ${isDragging 
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950" 
                : "border-gray-300 dark:border-gray-700"
              }
            `}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Arraste uma imagem ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Proporção 16:9 (ajuste automático)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {/* Image Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) {
          setIsViewing(false);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isViewing ? "Visualizar e Editar Imagem" : "Ajustar Imagem"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Canvas Preview */}
            <div 
              className="relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mx-auto"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ 
                width: "100%",
                maxWidth: "800px",
                aspectRatio: "16 / 9"
              }}
            >
              {isLoadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-move block"
                style={{ 
                  width: "100%",
                  height: "100%",
                  opacity: isLoadingImage ? 0 : 1
                }}
                onMouseDown={handleMouseDown}
              />
              
              {/* Aspect Ratio Guide */}
              <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-xl" />
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Zoom Control */}
              <div className="flex items-center gap-4">
                <ZoomOut className="h-5 w-5 text-gray-500" />
                <Slider
                  value={[zoom]}
                  onValueChange={(value: number[]) => setZoom(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full"
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Mudar Foto
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="rounded-full"
                  type="button"
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  Centralizar
                </Button>
                <Button
                  size="sm"
                  variant={isEnhanced ? "default" : "outline"}
                  onClick={enhanceImage}
                  className={`rounded-full ${isEnhanced ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                  type="button"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Melhorar Foto
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSelectedImage(null);
                setIsViewing(false);
              }}
              className="rounded-full"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              type="button"
            >
              <Check className="h-4 w-4 mr-2" />
              {isViewing ? "Salvar Alterações" : "Aplicar Recorte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}