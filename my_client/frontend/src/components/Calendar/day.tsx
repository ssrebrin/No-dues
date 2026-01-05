// day.tsx
import "./day.css"
import "../WebCrumbs.css";
import { EventType } from "../event";
import { formatRegularity } from "../../utils/regularityUtils";

function parseDate(str: string): Date {
	//console.log(str);
  const [dd, mm, yy] = str.split("-").map(Number);
  // В Date: месяц с 0, а год нужно привести к 20xx или 19xx
  const fullYear = yy < 100 ? 2000 + yy : yy;
  return new Date(fullYear, mm - 1, dd);
}


function isDateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  const date = parseDate(dateStr);
  const start = parseDate(startStr);
  const end = parseDate(endStr);

  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

export const getStrDate = (day: number, month: number, year: number) =>{
	return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year%100).padStart(2, "0")}`
}

interface DayProps{
  i: number,
  Events: EventType[], 
  Today: string, 
  setShowAddEvent: React.Dispatch<React.SetStateAction<string>>, 
  setShowDay: React.Dispatch<React.SetStateAction<string>>, 
  act: boolean, 
  intMode: string
}

export const GetDay:React.FC<DayProps> = ({ i, Events, Today, setShowAddEvent, setShowDay, act, intMode }) => {
	const today = new Date();
  const tday = getStrDate(today.getDate(), today.getMonth()+1, today.getFullYear());
  //console.log(">", tday, "-", Today);

return (
  <div
    onClick={() => setShowDay(Today)}
    key={i}
    className={`aspect-square p-1 rounded-lg1 relative ${
      act ? `group ${
        tday === Today
          ? "bg-primary-50 border-primary-200"
          : "hover:bg-gray-50"
      }`
    : "group bg-primary-5000 hover:bg-gray-50"
    }`}
  >
    {/* Номер дня */}
    <div className="flex justify-between items-start">
      <span className="text-sm">{i}</span>
      {act && (
        <button 
          onClick={() => setShowAddEvent(Today)}
          className="opacity-0 group-hover:opacity-100 text-primary-500 hover:text-primary-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
        </button>
      )}
    </div>

    {/* Контейнер для точек - горизонтальное расположение */}
    {Events.length > 0 && intMode === "point" && (
      <div className="absolute bottom-2 left-1 right-1 flex gap-1 pointer-events-none overflow-hidden">
        {Events.slice(0, 3).map((ev, index) => (
          <div key={`circle-${ev.ID}`} className="tooltip-container flex-shrink-0">
            {/* Точка */}
            <div 
              className="dot"
              style={{ backgroundColor: ev.Attributes.BgColor }}
            />
            {/* Плашка */}
            <div className="tooltip">
              <p className="font-medium text-blue-700">{ev.Attributes.Name}</p>
              <p className="text-gray-600 mt-1">{ev.Description}</p>
              {/* Регулярность */}
              {ev.Attributes.Regularity && (
                <p className="text-blue-500 mt-1 flex items-center">
                  <span className="material-symbols-outlined text-xs mr-1">
                    repeat
                  </span>
                  {formatRegularity(ev.Attributes.Regularity)}
                </p>
              )}
              {/* Тип события */}
              <p className="text-gray-500 mt-1 flex items-center">
                <span className="material-symbols-outlined text-xs mr-1">
                  {ev.Attributes.Regularity ? "event_repeat" : "calendar_today"}
                </span>
                {ev.Attributes.Regularity ? "Regular Event" : ev.Type || "Event"}
              </p>
            </div>
          </div>
        ))}
        {/* Индикатор если событий больше 3 */}
        {Events.length > 3 && (
          <div className="flex-shrink-0 text-xs text-gray-500 flex items-center justify-center w-4 h-4 bg-gray-100 rounded-full">
            +{Events.length - 3}
          </div>
        )}
      </div>
    )}

    {/* Линии интервалов остаются как есть */}
    {Events.map(ev => {
      if (ev.Type === "event" && intMode === "int") {
        let lineClass = "left-0 right-0";
        if (Today === ev.Attributes.DateStart) lineClass = "left-1/2 right-0";
        else if (Today === ev.Attributes.DateEnd) lineClass = "left-0 right-1/2";

        return (
          <div 
            key={`interval-${ev.ID}`} 
            className="absolute bottom-4 left-0 right-0 pointer-events-none"
          >
            <div className="tooltip-container relative w-full pointer-events-auto">
              <div
                className={`absolute ${lineClass} rounded-full h-1 cursor-pointer group-hover:h-1.5 transition-all`}
                style={{ backgroundColor: ev.Attributes.BgColor }}
              />
              <div className="tooltip">
                <p className="font-medium text-amber-700">{ev.Attributes.Name}</p>
                <p className="text-gray-600 mt-1">{ev.Description}</p>
                <p className="text-gray-500 mt-1 flex items-center">
                  <span className="material-symbols-outlined text-xs mr-1">
                    date_range
                  </span>
                  {ev.Type}
                </p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    })}
  </div>
);
};