"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface TableActionsProps {
  tableId: string;
  isActive: boolean;
  isOccupied: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function TableActions({ 
  tableId, 
  isActive, 
  isOccupied, 
  onToggle,
  onDelete 
}: TableActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 rounded-2xl"
        onClick={onToggle}
        disabled={isOccupied}
        data-testid={`button-toggle-${tableId}`}
      >
        <Eye className={`mr-2 h-4 w-4 ${isActive ? 'text-orange-500' : 'text-gray-600'}`} />
        {isActive ? 'Desativar' : 'Ativar'}
      </Button>
      
      <Link href={`/admin/tables/${tableId}/edit`}>
        <Button 
          size="icon"
          variant="secondary"
          className="rounded-full"
          data-testid={`button-edit-${tableId}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <Button
        size="icon"
        variant="ghost"
        className="rounded-full hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        disabled={isOccupied}
        data-testid={`button-delete-${tableId}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}