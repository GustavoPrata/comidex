import { useState, useMemo } from 'react';
import { 
  menuIconLibrary, 
  type MenuIconOption
} from '../../../lib/menu-icons-library';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string | null) => void;
  trigger?: React.ReactNode;
  placeholder?: string;
}

export function IconSelector({ value, onChange, trigger, placeholder = "Buscar ícone..." }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedIcon = useMemo(() => {
    if (!value) return null;
    return menuIconLibrary.find(icon => icon.name === value);
  }, [value]);

  const filteredIcons = useMemo(() => {
    if (!search) return menuIconLibrary;
    
    const searchLower = search.toLowerCase();
    return menuIconLibrary.filter(icon => 
      icon.name.toLowerCase().includes(searchLower) ||
      icon.keywords.some(k => k.includes(searchLower))
    );
  }, [search]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full justify-start"
        >
          {selectedIcon ? (
            <div className="flex items-center gap-2">
              <selectedIcon.icon className="h-4 w-4" />
              <span>{selectedIcon.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecionar ícone...</span>
          )}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <DialogHeader>
            <DialogTitle>Selecionar Ícone</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Barra de busca */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="pl-8 pr-8"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Área de ícones com scroll */}
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="grid grid-cols-5 gap-3">
                {filteredIcons.map((icon) => {
                  const Icon = icon.icon;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-md border transition-all hover:bg-orange-50 hover:border-orange-400 group",
                        value === icon.name && "bg-orange-100 border-orange-500"
                      )}
                      title={icon.keywords.join(', ')}
                    >
                      <Icon className={cn(
                        "h-5 w-5 mb-1 transition-colors",
                        value === icon.name ? "text-orange-600" : "text-gray-600 group-hover:text-orange-500"
                      )} />
                      <span className="text-[10px] text-gray-700 text-center line-clamp-1">{icon.name}</span>
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
        </DialogContent>
      </Dialog>
    </>
  );
}