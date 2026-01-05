import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, useState } from "react";
import "../WebCrumbs.css";
import { renderEventType } from "./RenderType";
import { EventType } from "../event";
import { ShowSubtasks } from "./subtask/subtasks";

export function toLightColor(color: string, opacity = 0.06): string {
  if (color.startsWith("#")) {
    // Handle 8-digit hex colors (with alpha)
    if (color.length === 9) {
      const bigint = parseInt(color.slice(1, 9), 16);
      const r = (bigint >> 24) & 255;
      const g = (bigint >> 16) & 255;
      const b = (bigint >> 8) & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Handle 6-digit hex colors
    else if (color.length === 7) {
      const bigint = parseInt(color.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  if (color.startsWith("rgb")) {
    const nums = color.match(/\d+/g);
    if (!nums) return color;
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

function toDarkColor(color: string, factor = 0.8): string {
  // factor < 1 → затемнение, factor > 1 → осветление
  if (color.startsWith("#")) {
    const bigint = parseInt(color.slice(1), 16);
    const r = Math.max(0, Math.min(255, Math.floor(((bigint >> 16) & 255) * factor)));
    const g = Math.max(0, Math.min(255, Math.floor(((bigint >> 8) & 255) * factor)));
    const b = Math.max(0, Math.min(255, Math.floor((bigint & 255) * factor)));
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (color.startsWith("rgb")) {
    const nums = color.match(/\d+/g);
    if (!nums) return color;
    const [r, g, b] = nums.map(Number);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  }
  return color;
}

type LegendColors = {
  General: string;
  Important: string;
  Meeting: string;
  Deadline: string;
};

const legendColors: LegendColors = {
  General: "rgb(168,85,247)",
  Important: "rgb(34,197,94)",
  Meeting: "rgb(59,130,246)",
  Deadline: "rgb(244,63,94)",
};

interface tableProps{
  ev: EventType;
  numEdit: number; 
  del: number;
  setDel : React.Dispatch<React.SetStateAction<number>>;
  setNumEdit: React.Dispatch<React.SetStateAction<number>>;
}

export const Table:React.FC<tableProps> = ({ ev, numEdit, del, setDel, setNumEdit}) => {
  const mainColor = ev.Attributes.BgColor || "rgb(59,130,246)";
  console.log(mainColor, toLightColor(mainColor,1));
  const lightColor = toLightColor(mainColor);
  const leg = legendColors[ev.Attributes.LegendMark as keyof LegendColors] || "rgba(240, 246, 59, 1)";
  const legColor = toDarkColor(leg, 0.5);
  const lightLegColor = toLightColor(leg, 0.15);
  return (
    <div
      className="p-4 rounded-lg hover:shadow-lg transition-all duration-300"
      style={{
        backgroundColor: lightColor,
        borderLeft: `4px solid ${mainColor}`,
      }}
    >
      {/* Заголовок и маркер */}
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg">{ev.Attributes.Name}</h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: lightLegColor,
            color: legColor,
          }}
        >
          {ev.Attributes.LegendMark}
        </span>
      </div>

      {/* Описание */}
      <p className="text-gray-600 mt-2 text-left w-full">{ev.Description}</p>
      
        <ShowSubtasks id={Number(ev.ID)} numEdit={numEdit} del = {del} setDel={setDel}  setNumEdit={setNumEdit}/>
      {/* Нижняя строка: время/локация слева, тип события справа */}
      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
        {/* Время и локация слева */}
        <div className="flex items-center">
          <span>
            {ev.Attributes.TimeStart ? (
              <>
                <span className="material-symbols-outlined text-lg mr-1">schedule</span>
                {ev.Attributes.TimeEnd ? ` - ${ev.Attributes.TimeEnd}` : ""}
              </>
            ) : ""}
          </span>
          {ev.Attributes.Location && (
            <>
              <span className="material-symbols-outlined text-lg mx-2">
                location_on
              </span>
              {ev.Attributes.Location}
            </>
          )}
        </div>

        {/* Тип события справа */}
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: toLightColor(mainColor, 0.12),
            color: toDarkColor(mainColor, 0.5),
          }}
        >
          {renderEventType(ev)}
        </span>
      </div>
    </div>
  );
};
