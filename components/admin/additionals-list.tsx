"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface Additional {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

interface AdditionalsListProps {
  additionals: Additional[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const AdditionalsList = memo(function AdditionalsList({ 
  additionals, 
  onEdit, 
  onDelete 
}: AdditionalsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {additionals.map((additional) => (
        <Card 
          key={additional.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-sm">{additional.name}</h3>
              <Badge 
                variant={additional.active ? "default" : "secondary"}
                className="text-xs"
              >
                {additional.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>Categoria: {additional.category}</p>
              <p className="font-semibold text-base text-gray-900 dark:text-white">
                R$ {additional.price.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2 mt-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit?.(additional.id)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete?.(additional.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});