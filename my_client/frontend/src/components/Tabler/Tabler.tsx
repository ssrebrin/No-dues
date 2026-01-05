import { useState, useEffect } from "react";
import { DeleteURLData } from "../../api/client";
import "../WebCrumbs.css";
import { renderEventType } from "./RenderType";
import { Table } from "./Table";
import { EventType } from "../event";
import { AddEvent } from "../AddEvent/AddEvent";
import { CSSTransition } from "react-transition-group";
import { EditableTable } from "./EditTable";
import { getStrDate } from "../Calendar/day";
import { isRegularEventOnDate, getRegularEventsOnDate } from "../../utils/regularityUtils";

interface tablerProps {
  Events : EventType[], 
  setShowAddEvent: React.Dispatch<React.SetStateAction<string>>, 
  showAddEvent: string, 
  showDay: string,
  refreshEvents: () => Promise<void>
}

export const Tabler:React.FC<tablerProps> = ({Events, setShowAddEvent, showAddEvent, showDay, refreshEvents}) => {
const [showOpt, setShowOpt] = useState(-1);
const [edit, setEdit] = useState(-1);
const [numEdit, setNumEdit] = useState(-1);
const [numSubEdit, setSubNumEdit] = useState(-1);
const today = new Date();
const tday = getStrDate(today.getDate(), today.getMonth()+1, today.getFullYear());
 console.log(Events);

  const [del, setDel] = useState(-1);
  
  // Функция для получения событий для выбранной даты
  const getEventsForDay = (day: string): EventType[] => {
    const targetDate = new Date();
    const [dayNum, monthNum, yearNum] = day.split('-').map(Number);
    targetDate.setFullYear(yearNum < 100 ? 2000 + yearNum : yearNum, monthNum - 1, dayNum);
    
    const eventsForDay: EventType[] = [];
    const processedRegularEvents = new Set<string>();
    
    Events.forEach(event => {
      // Обычные события
      if (event.Attributes.DateStart === day) {
        // Не показываем событие, если оно регулярное и сегодня его день начала
        if (!event.Attributes.Regularity) {
          eventsForDay.push(event);
        }
      }
      
      // Регулярные события
      if (event.Attributes.Regularity && !processedRegularEvents.has(event.ID || '')) {
        const occurrences = getRegularEventsOnDate(event, targetDate);
        if (occurrences.length > 0) {
          processedRegularEvents.add(event.ID || '');
          
          // Если несколько вхождений в день, выбираем первое или следующее после текущего времени
          let selectedOccurrence = occurrences[0];
          const now = new Date();
          
          if (day === tday) { // Если это текущий день
            // Ищем следующее вхождение после текущего времени
            const nextOccurrence = occurrences.find(occ => occ > now);
            if (nextOccurrence) {
              selectedOccurrence = nextOccurrence;
            }
          }
          
          // Создаем копию события с обновленным временем
          const eventCopy = { ...event };
          if (event.Attributes.TimeStart) {
            const [hours, minutes] = event.Attributes.TimeStart.split(':').map(Number);
            selectedOccurrence.setHours(hours, minutes, 0, 0);
          }
          
          eventsForDay.push(eventCopy);
        }
      }
      
      // Интервальные события
      if (event.Attributes.Interval && event.Attributes.DateStart && event.Attributes.DateEnd) {
        const startDate = new Date();
        const [startDay, startMonth, startYear] = event.Attributes.DateStart.split('-').map(Number);
        startDate.setFullYear(startYear < 100 ? 2000 + startYear : startYear, startMonth - 1, startDay);
        
        const endDate = new Date();
        const [endDay, endMonth, endYear] = event.Attributes.DateEnd.split('-').map(Number);
        endDate.setFullYear(endYear < 100 ? 2000 + endYear : endYear, endMonth - 1, endDay);
        
        if (targetDate >= startDate && targetDate <= endDate) {
          eventsForDay.push(event);
        }
      }
    });
    
    return eventsForDay;
  };
  
  const dayEvents = getEventsForDay(showDay === "" ? tday : showDay);
  
  return (
    <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
        {showDay === "" ? "Today's Events" : `${showDay} Events`}
      </h2>
<div className="space-y-4">
  {dayEvents.map((Event, i) => (
    <div key={Event.ID}>
{edit !== i ? (
  <>
    <div
      onClick={() => setShowOpt(showOpt === i ? -1 : i)}
      className="w-full text-left"
    >
      <Table ev = {Event} numEdit={numEdit==i?numSubEdit:-1}  del={del} setDel ={setDel} setNumEdit= {setNumEdit} />
    </div>

    {showOpt === i && (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {setEdit(i); setShowOpt(-1)}}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <span className="material-symbols-outlined text-lg mr-1">edit</span>
        </button>
        <button
          onClick={async () => {
            await DeleteURLData(String(Event.ID));
            await refreshEvents();
          }}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <span className="material-symbols-outlined text-lg mr-1">delete</span>
        </button>
        <button
          onClick={() => {setNumEdit(i); setSubNumEdit(-2)}}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <span className="material-symbols-outlined text-lg mr-1">add_circle</span>
        </button>
      </div>
    )}
  </>
) : (
<EditableTable ev={Event} setEdit={setEdit} />
)}

    </div>
  ))}


   {showAddEvent && (
  <div className="inset-0 z-[100000] flex">
    <div className="absolute "
         onClick={() => setShowAddEvent("")} />
    <div className="relative z-[100001]  rounded-lg shadow-xl 
                    w-full ">
      <AddEvent key = {showAddEvent} onClose={() => setShowAddEvent("")} start = {showDay === "" ? tday : showDay} refreshEvents={refreshEvents} />
    </div>
  </div>
)}
</div>
      {!showAddEvent && (<button
        onClick={() => setShowAddEvent(tday)}
        className="mt-6 w-full py-3 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-medium hover:bg-primary-200 transition-colors"
      >
        <span className="material-symbols-outlined mr-2">add_circle</span>
        Add New Event
      </button>)}
    </div>
  );
};

