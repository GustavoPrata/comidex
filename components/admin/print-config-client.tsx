"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PrintConfigFilterProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: string[]) => void;
}

export function PrintConfigFilter({ onSearch, onFilterChange }: PrintConfigFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const filters = [
    { id: "printers", label: "Impressoras", count: 5 },
    { id: "groups", label: "Grupos", count: 14 }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex gap-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => toggleFilter(filter.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeFilters.includes(filter.id)
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="search"
          placeholder="Pesquisar itens..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}