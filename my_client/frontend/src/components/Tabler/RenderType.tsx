import { ReactElement, JSXElementConstructor, ReactPortal, ReactNode } from "react";
import { EventType } from "../event";

export const renderEventType = (Event: EventType) => {
  switch (Event.Type) {
    case "regular":
      return (
        <div className="flex items-center m-1">
          <span className="material-symbols-outlined text-lg mr-1">event_repeat</span>
          <span >Regular ({Event.Attributes["Regularity"]}) </span>
        </div>
      );
    case "interval":
      return (
        <div className="flex items-center">
          <span className="material-symbols-outlined text-lg mr-1">date_range</span>
          <span>Interval ({Event.Attributes["Interval"]}) </span>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <span className="material-symbols-outlined text-lg mr-1">calendar_today</span>
          <span>{Event.Type} </span>
        </div>
      );
  }
};
