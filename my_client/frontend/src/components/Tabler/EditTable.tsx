import { useState } from "react";
import "../WebCrumbs.css";
import { renderEventType } from "./RenderType";
import { EventType } from "../event";
import { UpdateEvent } from "../../../wailsjs/go/main/App";

type UpdateField = { field: string; newVal: string };

type EditableTableProps = {
  ev: EventType;
  setEdit: React.Dispatch<React.SetStateAction<number>>;
};

export const EditableTable: React.FC<EditableTableProps> = ({ ev, setEdit }) => {
  const [values, setValues] = useState({
    Name: ev.Attributes.Name || "",
    Description: ev.Description || "",
    TimeStart: ev.Attributes.TimeStart || "",
    TimeEnd: ev.Attributes.TimeEnd || "",
    Location: ev.Attributes.Location || "",
    LegendMark: ev.Attributes.LegendMark || "",
    BgColor: ev.Attributes.BgColor || ""
  });

  const mainColor = ev.Attributes.BgColor || "rgb(59,130,246)";
  const toLightColor = (color: string, opacity = 0.06): string => {
    if (color.startsWith("#")) {
      const bigint = parseInt(color.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    if (color.startsWith("rgb")) {
      const nums = color.match(/\d+/g);
      if (!nums) return color;
      const [r, g, b] = nums;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };
  const toDarkColor = (color: string, factor = 0.8): string => {
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
  };

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates: UpdateField[] = [];
    for (const key in values) {
      const oldVal = (ev.Attributes as any)[key] ?? (ev as any)[key] ?? "";
      const newVal = (values as any)[key];
      if (newVal !== oldVal && newVal !== undefined) {
        updates.push({ field: key, newVal: newVal });
        
      }
    }
    console.log(updates);
    if (ev.Description !== values.Description) {
      updates.push({ field: "description", newVal: values.Description });
    }
    if (updates.length > 0) {
      await UpdateEvent(updates, Number(ev.ID) );
    }
  };




  return (
    <div
  className="p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl bg-white border border-gray-200"
  style={{
    backgroundColor: toLightColor(mainColor),
    borderLeft: `6px solid ${mainColor}`,
  }}
>
  {/* Заголовок и маркер */}
  <div className="flex justify-between items-start mb-3">
    <input
      type="text"
      value={values.Name}
      onChange={(e) => handleChange("Name", e.target.value)}
      className="font-semibold text-lg bg-gray-50 border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-2/3 p-1"
    />
    <input
      type="text"
      value={values.LegendMark}
      onChange={(e) => handleChange("LegendMark", e.target.value)}
      className="text-xs px-3 py-1 rounded-full font-medium"
      style={{
        backgroundColor: toLightColor(mainColor, 0.15),
        color: toDarkColor(mainColor, 0.6),
      }}
    />
  </div>

  {/* Описание */}
  <textarea
    value={values.Description}
    onChange={(e) => handleChange("Description", e.target.value)}
    className="w-full bg-gray-50 border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 resize-none"
    rows={3}
    placeholder="Описание события"
  />









  {/* Время, локация, тип */}
  <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
    <div className="flex items-center space-x-3">
      <span className="material-symbols-outlined text-lg">schedule</span>
      <input
        type="time"
        value={values.TimeStart}
        onChange={(e) => handleChange("TimeStart", e.target.value)}
        className="w-20 bg-gray-50 border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded p-1"
      />
      <span>-</span>
      <input
        type="time"
        value={values.TimeEnd}
        onChange={(e) => handleChange("TimeEnd", e.target.value)}
        className="w-20 bg-gray-50 border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded p-1"
      />
      <span className="material-symbols-outlined text-lg ml-3">location_on</span>
      <input
        type="text"
        value={values.Location}
        onChange={(e) => handleChange("Location", e.target.value)}
        className="bg-gray-50 border border-gray-200 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-300 w-36"
        placeholder="Локация"
      />
    </div>
    <span
      className="text-xs px-3 py-1 rounded-full font-medium"
      style={{
        backgroundColor: toLightColor(mainColor, 0.12),
        color: toDarkColor(mainColor, 0.5),
      }}
    >
      {renderEventType(ev)}
    </span>
  </div>








  {/* Кнопки */}
  <div className="flex justify-end gap-2 mt-5">
    <button
      onClick={() => { handleSave(); setEdit(-1); }}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
    >
      Сохранить
    </button>
    <button
      onClick={() => setEdit(-1)}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-medium"
    >
      Отменить
    </button>
  </div>
</div>

  );
};
