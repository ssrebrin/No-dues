type EventAttributes = {
  TimeStart: string;
  TimeEnd?: string;
  DateStart: string;
  DateEnd?: string;
  Location?: string;
  Regularity?: string;
  BgColor: string;
  LegendMark: string;
  Name?: string;
  Interval?: string;
  DetachOnCal?: string;
  Deadline?: string;
  Complete?: number;
};

export type EventType = {
  ID?: string;
  Type: string;
  Description: string;
  Attributes: EventAttributes;
};