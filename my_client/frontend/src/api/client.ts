// API client for backend communication
const API_BASE_URL = 'http://localhost:8082';

// Types
export interface EventAttributes {
  Name?: string;
  TimeStart: string;
  TimeEnd?: string;
  DateStart?: string;
  DateEnd?: string;
  Location?: string;
  Regularity?: string;
  BgColor: string;
  LegendMark: string;
  Interval?: string;
  DetachOnCal?: string;
}

export interface Event {
  ID?: string;
  name: string;
  event_type: string;
  description: string;
  event_attributes: EventAttributes;
}

export interface Subtask {
  event_id?: number;
  name: string;
  state: string;
}

export interface UpdateField {
  field?: string;
  newVal?: string;
}

// API Functions
export async function GetURLData(name: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/user/${name}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }
  const data = await response.json();
  return JSON.stringify(data);
}

export async function GetSubtask(id: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/subtask/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch subtask: ${response.statusText}`);
  }
  const data = await response.json();
  return JSON.stringify(data);
}

export async function DeleteURLData(id: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/event/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }
  const text = await response.text();
  return text || JSON.stringify({});
}

export async function DeleteST(id: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/subtask/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete subtask: ${response.statusText}`);
  }
  const text = await response.text();
  return text || JSON.stringify({});
}

export async function PostURLData(event: Event): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }
}

export async function PostSubtask(subtask: Subtask): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/subtask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subtask),
  });
  if (!response.ok) {
    throw new Error(`Failed to create subtask: ${response.statusText}`);
  }
}

export async function UpdateEvent(changes: UpdateField[], id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/event/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(changes),
  });
  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText}`);
  }
}

export async function UpdateSubtask(change: UpdateField, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/subtask/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(change),
  });
  if (!response.ok) {
    throw new Error(`Failed to update subtask: ${response.statusText}`);
  }
}


