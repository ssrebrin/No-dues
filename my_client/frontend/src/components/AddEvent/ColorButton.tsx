import React, { useState, useRef, useEffect } from "react";
import { ChromePicker, ColorResult } from "react-color";

interface ColorButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ColorButton({ value, onChange }: ColorButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        className="!w-8 !h-8 !rounded-full !border !border-gray-300 flex items-center justify-center !text-gray-600 hover:!bg-gray-100 transition"
        onClick={() => setShowPicker(!showPicker)}
        type="button"
      >
        +
      </button>

      {showPicker && (
        <div
          className="absolute left-0 mt-2 z-50 shadow-lg"
          // теперь появляется ПОД кнопкой (mt-2 = отступ вниз)
        >
          <ChromePicker
            color={value}
            onChange={(color: ColorResult) => onChange(color.hex)}
          />
        </div>
      )}
    </div>
  );
}
