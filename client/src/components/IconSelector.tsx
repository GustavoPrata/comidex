'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Package } from 'lucide-react';
import { cn } from "@/lib/utils";
import { menuIconLibrary, type MenuIconOption } from '@/lib/menu-icons-library';

interface IconSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export function IconSelector({ value, onChange, placeholder = "Buscar ícone..." }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const selectedIcon = useMemo(() => {
    return menuIconLibrary.find(icon => icon.name === value);
  }, [value]);

  const filteredIcons = useMemo(() => {
    if (!search) return menuIconLibrary;
    
    const searchLower = search.toLowerCase();
    return menuIconLibrary.filter(icon => 
      icon.name.toLowerCase().includes(searchLower) ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  }, [search]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(true)}
      >
        {selectedIcon ? (
          <span className="flex items-center gap-2">
            {(() => {
              const Icon = selectedIcon.icon;
              return <Icon className="h-4 w-4" />;
            })()}
            {selectedIcon.name}
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            Selecionar ícone
          </span>
        )}
        {value && (
          <X 
            className="h-4 w-4 ml-auto hover:text-destructive" 
            onClick={handleClear}
          />
        )}
      </Button>

      {open && (
        <>
          {/* Overlay personalizado */}
          <div className="fixed inset-0 z-[9998] bg-black/50" />
          
          {/* Modal personalizado */}
          <div 
            ref={modalRef}
            className="fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-2 bg-white dark:bg-gray-900 p-6 shadow-xl rounded-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Selecionar Ícone</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {/* Barra de busca */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder}
                  className="pl-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  autoFocus
                />
              </div>

              {/* Área de ícones com scroll */}
              <ScrollArea className="h-[400px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                <div className="grid grid-cols-5 gap-3">
                  {filteredIcons.map((icon) => {
                    const Icon = icon.icon;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => handleSelect(icon.name)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-md border transition-all",
                          "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                          "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 dark:hover:border-orange-600 group",
                          value === icon.name && "bg-orange-100 dark:bg-orange-900/30 border-orange-500 dark:border-orange-600"
                        )}
                        title={icon.keywords.join(', ')}
                      >
                        <Icon className={cn(
                          "h-5 w-5 mb-1 transition-colors",
                          value === icon.name 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-600 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400"
                        )} />
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 text-center line-clamp-1">{icon.name}</span>
                      </button>
                    );
                  })}
                </div>

                {filteredIcons.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum ícone encontrado
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </>
      )}
    </div>
  );
}