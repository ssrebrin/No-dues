import React, { useEffect, useState } from "react";

import "./WebCrumbs.css";
import {Loginn} from "./login/login"
import { Tabler } from "./Tabler/Tabler";
import { Calendar } from "./Calendar/Calendar";
import { GetURLData } from "../api/client";
import { EventType } from "./event";
import { AddEvent } from "./AddEvent/AddEvent";
import ReactDOM from "react-dom";
import { Panel } from "./panel/panel";




export const Component = () => {
  const [showAddEvent, setShowAddEvent] = useState("");
  
  const [showDay, setShowDay] = useState("")
  const Name = "Max";
  const [eventsStr, setEventsStr] = useState<string>("[]");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await GetURLData(Name);
        setEventsStr(result);
      } catch (err) {
        console.error("Ошибка получения данных:", err);
      }
    };
    fetchEvents();
  }, [Name]);

  useEffect(() => {
    if (showAddEvent) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [showAddEvent]);

  let Events: EventType[] = [];
  
  try {
    const wrapper = JSON.parse(eventsStr);
    if (wrapper.events && typeof wrapper.events === "string") {
      const parsed = JSON.parse(wrapper.events);
      Events = Array.isArray(parsed) ? parsed as EventType[] : [];
    }
  } catch (e) {
    console.error("Ошибка парсинга JSON:", e);
  }
return (
  <div id="webcrumbs" className="relative">
    <div className="flex flex-col md:flex-row p-4 gap-6 h-screen bg-gray-50 relative z-0">
      <Tabler Events={Events}  setShowAddEvent={setShowAddEvent} showAddEvent={showAddEvent} showDay={showDay} key={showDay}/>
      <Calendar Events={Events} setShowAddEvent={setShowAddEvent} setShowDay={setShowDay}/>
      {/*<Panel/>*/}
    </div>


  </div>
);

};
