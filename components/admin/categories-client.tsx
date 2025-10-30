"use client";

import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Edit, Trash2, GripVertical } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  items: number;
  maxPrice?: number;
  minPrice?: number;
  active: boolean;
}

interface CategoriesListProps {
  categories: Category[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const CategoriesList = memo(function CategoriesList({ 
  categories,
  onEdit,
  onDelete 
}: CategoriesListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id)
        ? prev.filter(catId => catId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {category.items} itens
                    </Badge>
                    {category.minPrice && category.maxPrice && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        R$ {category.minPrice.toFixed(2)} - R$ {category.maxPrice.toFixed(2)}
                      </span>
                    )}
                    <Badge 
                      variant={category.active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {category.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories.includes(category.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(category.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete?.(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Itens da categoria serão exibidos aqui...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});