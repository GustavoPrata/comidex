import * as React from "react";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)]);
  };

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={`relative w-full flex items-center ${className}`}>
      <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        {/* Filled track */}
        <div
          className="absolute h-2 rounded-full bg-orange-500 transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb/Handle - Bolinha visual */}
        <div
          className="absolute w-5 h-5 -mt-1.5 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg transition-all duration-150 hover:scale-110 pointer-events-none"
          style={{ 
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Inner circle for better visual */}
          <div className="absolute inset-1 bg-white dark:bg-gray-100 rounded-full opacity-30"></div>
        </div>
      </div>
      
      {/* Invisible input for interaction */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="absolute inset-0 w-full cursor-pointer opacity-0 hover:cursor-grab active:cursor-grabbing"
        style={{ height: "20px" }}
      />
    </div>
  );
}