import { useState, useMemo } from 'react';
import { 
  menuIconLibrary, 
  type MenuIconOption,
  getIconsByCategory,
  defaultGroupIcons 
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

const categoryLabels: Record<MenuIconOption['category'], string> = {
  japanese: 'Japonês',
  drinks: 'Bebidas',
  desserts: 'Sobremesas',
  special: 'Especial',
  general: 'Geral',
  fruits: 'Frutas',
  cooking: 'Cozinha',
  service: 'Serviço',
  nature: 'Natureza',
  status: 'Status',
  action: 'Ação',
};

const categoryColors: Record<MenuIconOption['category'], string> = {
  japanese: 'bg-red-100 hover:bg-red-200 text-red-700',
  drinks: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  desserts: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
  special: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
  general: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  fruits: 'bg-green-100 hover:bg-green-200 text-green-700',
  cooking: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  service: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  nature: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
  status: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
  action: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700',
};

const categories = Object.keys(categoryLabels) as MenuIconOption['category'][];

export function IconSelector({ value, onChange, trigger, placeholder = "Buscar ícone..." }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuIconOption['category'] | 'all'>('all');

  const selectedIcon = useMemo(() => {
    if (!value) return null;
    return menuIconLibrary.find(icon => icon.name === value);
  }, [value]);

  const filteredIcons = useMemo(() => {
    let icons = selectedCategory === 'all' 
      ? menuIconLibrary 
      : getIconsByCategory(selectedCategory as MenuIconOption['category']);

    if (search) {
      const searchLower = search.toLowerCase();
      icons = icons.filter(icon => 
        icon.name.toLowerCase().includes(searchLower) ||
        icon.keywords.some(k => k.includes(searchLower))
      );
    }

    return icons;
  }, [search, selectedCategory]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
  };

  const suggestedIcons = useMemo(() => {
    // Sugestões baseadas em palavras comuns no nome do grupo
    const suggestions: MenuIconOption[] = [];
    const commonWords = ['rodizio', 'bebidas', 'sobremesas', 'especiais', 'sushi', 'premium'];
    
    commonWords.forEach(word => {
      const icon = menuIconLibrary.find(i => 
        i.keywords.some(k => k.includes(word))
      );
      if (icon && !suggestions.includes(icon)) {
        suggestions.push(icon);
      }
    });

    return suggestions.slice(0, 6);
  }, []);

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecionar Ícone</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Barra de busca compacta */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-10"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* Categorias em select dropdown */}
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Ícones</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Área de ícones com scroll */}
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.map((icon) => {
                  const Icon = icon.icon;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-md border transition-all hover:bg-orange-50 hover:border-orange-400 group",
                        value === icon.name && "bg-orange-100 border-orange-500"
                      )}
                      title={icon.keywords.join(', ')}
                    >
                      <Icon className="h-5 w-5 mb-1 text-gray-600 group-hover:text-orange-600" />
                      <span className="text-[10px] text-center line-clamp-1">{icon.name}</span>
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