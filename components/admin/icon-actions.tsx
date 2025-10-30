"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function IconActions({ iconId }: { iconId: string }) {
  return (
    <>
      <Button
        variant="ghost"
        className="flex-1 rounded-none rounded-bl-lg h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
        onClick={() => console.log('Edit', iconId)}
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <div className="w-px bg-gray-100 dark:bg-gray-800" />
      <Button
        variant="ghost"
        className="flex-1 rounded-none rounded-br-lg h-10 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
        onClick={() => console.log('Delete', iconId)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </>
  );
}