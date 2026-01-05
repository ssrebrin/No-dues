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

interface tablerProps {
  Events : EventType[], 
  setShowAddEvent: React.Dispatch<React.SetStateAction<string>>, 
  showAddEvent: string, 
  showDay: string
}

export const Tabler:React.FC<tablerProps> = ({Events, setShowAddEvent, showAddEvent, showDay}) => {
const [showOpt, setShowOpt] = useState(-1);
const [edit, setEdit] = useState(-1);
const [numEdit, setNumEdit] = useState(-1);
const [numSubEdit, setSubNumEdit] = useState(-1);
const today = new Date();
const tday = getStrDate(today.getDate(), today.getMonth()+1, today.getFullYear());
 console.log(Events);

  const [del, setDel] = useState(-1);
  return (
    <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Today's Events</h2>
<div className="space-y-4">
  {Events.filter((e) => {return e.Attributes.DateStart ===(showDay === ""? tday:showDay)}).map((Event, i) => (
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
          onClick={() => DeleteURLData(String(Event.ID))}
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
      <AddEvent key = {showAddEvent} onClose={() => setShowAddEvent("")} start = {showAddEvent} />
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

