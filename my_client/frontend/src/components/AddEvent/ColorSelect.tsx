import { useRef, useState } from "react";
import "./ColorSelect.css"
import CcolorButton from "./ColorButton";

export const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const recentColors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24"];
  const baseColors = [
    "#F28B82", "#FBBC04", "#f7e84dff", "#a8ff45ff",
    "#48f4cbff", "#51d0edff", "#6198f2ff", "#b160f8ff",
  ];

    const ColorButton = ({ c }: { c: string }) => (
    <button
        key={c}
        className="color-btn"
        style={{ backgroundColor: c }}
        onClick={() => onChange(c)}
    />
    );

    const colorInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-3 p-3 bg-white !rounded-xl !shadow-md !border !border-gray-200 w-fit">
      {/* Часто используемые */}
      <div>
        <div className="!text-xs !text-gray-500 mb-1">Часто используемые</div>
        <div className="flex flex-wrap !gap-2">
          {recentColors.map((c) => <ColorButton key={c} c={c} />)}
        </div>
      </div>

      {/* Базовые цвета */}
      <div>
        <div className="!text-xs !text-gray-500 mb-1">Базовые цвета</div>
        <div className="flex flex-wrap !gap-2">
          {baseColors.map((c) => <ColorButton key={c} c={c} />)}
          
      <CcolorButton
        value={value}
        onChange={onChange}
      />
      </div>
    </div>
    </div>
  );
};
