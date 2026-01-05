import "../WebCrumbs.css";
import { GetDay } from "./day";
import { EventType } from "../event";
import { useState } from "react";

const getMonthName = (i: number) => {
  switch (i) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
    default:
      return "";
  }
};

function parseDate(str: string): Date {
	//console.log(str);
  const [dd, mm, yy] = str.split("-").map(Number);
  // В Date: месяц с 0, а год нужно привести к 20xx или 19xx
  const fullYear = yy < 100 ? 2000 + yy : yy;
  return new Date(fullYear, mm - 1, dd);
}

function daysBetween(d1: string, d2: string): number {
  const date1 = parseDate(d1);
  const date2 = parseDate(d2);
  const msInDay = 1000 * 60 * 60 * 24;
  const diffMs = date2.getTime() - date1.getTime();
  return Math.abs(Math.floor(diffMs / msInDay));
}

function isDateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  const date = parseDate(dateStr);
  const start = parseDate(startStr);
  const end = parseDate(endStr);

  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

const getStrDate = (day: number, month: number, year: number) =>{
	return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year%100).padStart(2, "0")}`
}

const today = new Date();
	// Текущий год и месяц
let act = false;

// Текущий год, месяц и число
const year = today.getFullYear();
const month = today.getMonth(); // 0 = Январь
const day = today.getDate();

const getCalDay = (mmonth: number, yyear: number, Events: EventType[], setShowDay: React.Dispatch<React.SetStateAction<string>>, setShowAddEvent: React.Dispatch<React.SetStateAction<string>>, intMode:string) => {
  const dd = new Date(yyear, mmonth, 1);
  const dayOfWeek = (dd.getDay() + 6) % 7; // чтобы понедельник был первым
  
  const elements: JSX.Element[] = [];

  // Пустые ячейки до первого дня месяца
  for (let i = 0; i < dayOfWeek; i++) {
    elements.push(
      <div 
        key={`empty-${i}`} 
        className="aspect-square p-1 rounded-lg relative"
      ></div>
    );
  }

  // Дни месяца
  while (dd.getMonth() === mmonth) {
    const dday = dd.getDate();
    const act = 
      yyear === new Date().getFullYear()
        ? (mmonth === new Date().getMonth()
            ? dday >= new Date().getDate()
            : mmonth > new Date().getMonth())
        : yyear > new Date().getFullYear();

    const str = getStrDate(dday, mmonth+1, yyear);
    const eve = Events.filter(e => {
      if (e.Attributes.DateStart === str) return true;

      if (e.Type === "regular") {
        const diff = daysBetween(e.Attributes.DateStart, str);
        return diff >= 0 && diff % Number(e.Attributes.Regularity) === 0;
      }

      if (e.Type === "interval") {
        return isDateInRange(str, e.Attributes.DateStart, String(e.Attributes.DateEnd));
      }

      return false;
    });

    elements.push(
  <GetDay 
    i={dday} 
    Events={eve} 
    Today={str} 
    setShowAddEvent={setShowAddEvent} 
    act={act} 
    intMode={intMode} 
    key={dday} 
	setShowDay={setShowDay}
  />);
    dd.setDate(dd.getDate() + 1);
  }

  return <>{elements}</>;
};

interface CalProps {
	Events: EventType[], 
	setShowAddEvent: React.Dispatch<React.SetStateAction<string>>, 
	setShowDay: React.Dispatch<React.SetStateAction<string>>,
}

export const Calendar:React.FC<CalProps> = ({ Events, setShowAddEvent, setShowDay}) => {

	const [mode, setMode] = useState("cur");
	const [intmode, setIntMode] = useState("point");
	const [crMonth, setCrMonth] = useState(today.getMonth());
	const [crYear, setCrYear] = useState(today.getFullYear());


// Найдём понедельник текущей недели
// getDay(): 0 = Воскресенье, 1 = Понедельник, ..., 6 = Суббота
const dayOfWeek = today.getDay();
const diffToMonday = (dayOfWeek + 6) % 7; // сколько дней назад был понедельник
const monday = new Date(year, month, day - diffToMonday);

// Создадим массив из 28 дней
const days28: number[] = [];
const daysFormatted: string[] = [];

for (let i = 0; i < 28; i++) {
  const current = new Date(monday);
  current.setDate(monday.getDate() + i);

  const day = current.getDate();
  const month = current.getMonth() + 1; // месяцы с 0
  const year = current.getFullYear() % 100; // две последние цифры года

  // Заполняем два массива
  days28.push(day);
  daysFormatted.push(
    `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year%100).padStart(2, "0")}`
  );
}
act = false;
  return (
    <div className="w-full md:w-1/2">
	    <div className="bg-white rounded-lg shadow-md p-6">
	      <div className="flex justify-between items-center mb-6">
			{mode === "cal"?
	        (<>
			<button 
			onClick={() => {  if (crMonth === 0) {setCrYear(crYear-1);setCrMonth(11);} else {setCrMonth(crMonth-1);}}}
			className="p-2 rounded-full hover:bg-gray-100 transition-colors">
	          <span className="material-symbols-outlined">chevron_left</span>
	        </button>
	        <h2 className="text-xl font-semibold">{getMonthName(crMonth) + " " + String(crYear)}</h2>
	        <button 
			
			onClick={() => {  if (crMonth === 11) {setCrYear(crYear+1);setCrMonth(0);} else {setCrMonth(crMonth+1);}}}
			className="p-2 rounded-full hover:bg-gray-100 transition-colors">
	          <span className="material-symbols-outlined">chevron_right</span>
	        </button>
			</>):
			<h2 className="text-xl font-semibold">{getMonthName(month) + " " + String(year)}</h2>
			}
	      </div>
	      
	      <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2">
	        <div className="p-2">Mon</div>
	        <div className="p-2">Tue</div>
	        <div className="p-2">Wed</div>
	        <div className="p-2">Thu</div>
	        <div className="p-2">Fri</div>
	        <div className="p-2 text-primary-500">Sat</div>
	        <div className="p-2 text-primary-500">Sun</div>
	      </div>
	      
	      <div className="grid grid-cols-7 gap-1">
			{mode==="cur"?
			days28.map((dayNumber, ii) => {
			if (dayNumber == day) {act = true;}
			const dayStr = daysFormatted[ii];

			const dayEvents = Events.filter(e => {
				if (e.Attributes.DateStart === dayStr) return true;

				if (e.Type === "regular") {
				const diff = daysBetween(e.Attributes.DateStart, dayStr);
				//console.log("====", daysFormatted[ii]);
				return diff >= 0 && diff % Number(e.Attributes.Regularity) === 0;
				}

				if (e.Type === "interval") {
				return isDateInRange(dayStr, e.Attributes.DateStart, String(e.Attributes.DateEnd));
				}

				return false;
			});

			
			return (
  <GetDay 
    key={ii}
    setShowDay={setShowDay}
    i={dayNumber} 
    Events={dayEvents} 
    Today={dayStr} 
    setShowAddEvent={setShowAddEvent} 
    act={act} 
    intMode={intmode} 
  />);
			}):
			getCalDay(crMonth, crYear, Events,setShowDay, setShowAddEvent, intmode)
			}
	      </div>
<div className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 rounded-lg shadow">
  <button
    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
    onClick={() => setMode(mode === "cur" ? "cal" : "cur")}
  >
    Switch mode
  </button>

  <button
    className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
    onClick={() => setIntMode(intmode === "int" ? "point" : "int")}
  >
    Switch interval mode
  </button>
</div>

	    </div>
	  </div>
  )
}