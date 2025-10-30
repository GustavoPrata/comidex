"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  message = "Carregando...", 
  size = "md",
  fullScreen = false,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Beautiful animated sushi spinner */}
      <div className="relative">
        {/* Outer ring with gradient */}
        <div className={cn("relative", sizeClasses[size])}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-20 blur-xl animate-pulse" />
          
          {/* Main spinning circle */}
          <svg
            className={cn("animate-spin text-orange-500", sizeClasses[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      
      {/* Loading message */}
      {message && (
        <p className={cn(
          "mt-4 font-medium animate-pulse",
          "text-gray-600 dark:text-gray-400",
          size === "sm" ? "text-xs" : 
          size === "md" ? "text-sm" : 
          "text-base"
        )}>
          {message}
        </p>
      )}
      
      {/* Animated dots */}
      <div className="flex gap-1 mt-2">
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

// Card loading skeleton
export function LoadingCard() {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}

// Table loading skeleton
export function LoadingTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-xl animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}