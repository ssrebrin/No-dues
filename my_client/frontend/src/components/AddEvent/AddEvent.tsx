import { useState } from "react";
import { PostURLData } from "../../../wailsjs/go/main/App";
import { main } from "../../../wailsjs/go/models";
import "../WebCrumbs.css";
import "./ev.css";
import { ColorPicker } from "./ColorSelect";
import { toLightColor } from "../Tabler/Table";

// Функция форматирования в DD-MM-YY
function formatDate(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

function convertDate(input: string): string {
  const [day, month, year] = input.split("-");

  if (!day || !month || !year) {
    throw new Error("Неверный формат даты. Ожидается DD-MM-YY");
  }
  const fullYear = Number(year) < 50 ? `20${year}` : `19${year}`;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Сегодняшняя дата в формате YYYY-MM-DD для <input type="date">
function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface AddEventProps {
  onClose: () => void;
  start?: string; // необязательный пропс
}

export const AddEvent: React.FC<AddEventProps> = ({ onClose, start = "" }) => {
  //const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(start === ""?todayISO():convertDate(start));
  const [endDate, setEndDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState("single"); // single | regular | interval
  const [category, setCategory] = useState("");
  const [regularity, setRegularity] = useState("1"); // дни
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [color, setColor] = useState("#f173ffff");
  const [deadLine, setDeadLine] = useState(todayISO())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Валидация
    if (!category.trim() && !description.trim()) {
      setError("Event title is required");
      return;
    }
    if (!startDate) {
      setError("Start date is required");
      return;
    }
    if (eventType === "interval" && (!endDate || endDate < startDate)) {
      setError("End date must be after start date");
      return;
    }
    if (eventType === "regular" && (!regularity)) {
      setError("End date must be after start date");
      return;
    }
console.log(startDate);
    // Форматируем даты
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = endDate ? formatDate(endDate) : undefined;

    const attrs: main.EventAttributes = {
      Name: category,
      TimeStart: startTime,
      TimeEnd: endTime || undefined,
      DateStart: formattedStartDate,
      DateEnd: formattedEndDate,
      Location: location,
      Regularity: eventType === "regular" ? regularity : undefined,
      BgColor: color,
      LegendMark: category,
      Interval: eventType === "interval" ? `${formattedStartDate} - ${formattedEndDate}` : undefined,
      DetachOnCal: undefined,
    };

    const event: main.Event = {
      name: "Max",
      event_type: eventType,
      description,
      event_attributes: attrs,
      // временный convertValues (если нужно обойти TS-ошибку)
      convertValues: (a: any, c: any) => a,
    };

    try {
      await PostURLData(event);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save event");
    }
  };
  
//console.log("render", color, toLightColor(color));

  return (
        <div
        key = {color}
      className="p-4 rounded-lg hover:shadow-lg transition-all duration-300"
      style={{
        backgroundColor: toLightColor(color),
        borderLeft: `4px solid ${color}`,
      }}
    >
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-xl font-semibold text-gray-800">Add New Event</h3>
    <button 
      onClick={onClose} 
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <span className="material-symbols-outlined text-2xl">close</span>
    </button>
  </div>

  {error && (
    <div className="mb-4 text-red-600 font-medium bg-red-50 p-3 rounded-lg">
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    <input
      type="text"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      placeholder="Event Title"
      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
    />

    <div className="flex gap-4">
        <div className="grid grid-cols">
        <p>Starts</p>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
      /></div>
      { eventType === "task"?(
        <div className="grid grid-cols">
        <p>Deadline</p>
        <input
          type="date"
          value={deadLine}
          onChange={(e) => setDeadLine(e.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
        /></div>
      ):(
                <div className="grid grid-cols">
        <p>Ends</p>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
        /></div>
      )}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
      />
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
      />
    </div>

    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Event Description"
      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
      rows={3}
    />

    <select
      value={eventType}
      onChange={(e) => setEventType(e.target.value)}
      className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
    >
      <option value="event">Event</option>
      <option value="task">Task</option>
    </select>

    {eventType === "regular" && (
      <select
        value={regularity}
        onChange={(e) => setRegularity(e.target.value)}
        className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
      >
        <option value="1">Daily</option>
        <option value="7">Weekly</option>
        <option value="30">Monthly</option>
        <option value="365">Yearly</option>
      </select>
    )}

    <input
      type="text"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      placeholder="Location"
      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
    />

    <button 
      type="submit"
      className="w-full bg-primary-500 text-white font-semibold py-2 rounded-lg hover:bg-primary-600 transition"
    >
      Save Event
    </button>

    <ColorPicker value={color} onChange={setColor}/>
  </form>
</div>

  );
};
