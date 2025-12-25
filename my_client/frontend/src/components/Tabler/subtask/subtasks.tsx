import React, { useEffect, useState } from "react";
import { DeleteST, GetSubtask, UpdateSubtask } from "../../../../wailsjs/go/main/App";
import { InputWithCheck } from "./STEditor";
import '../../../style.css';

interface Subtask {
  id: number;
  name: string;
  state: string;
}

interface ShowSubtasksProps {
  id: number;
  numEdit: number;
  
  setNumEdit: React.Dispatch<React.SetStateAction<number>>;
  setDel: React.Dispatch<React.SetStateAction<number>>;
  del: number;
}

export const ShowSubtasks: React.FC<ShowSubtasksProps> = ({ id, numEdit, setDel, del, setNumEdit }) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isNone, setIsNone] = useState(false);
  const [key, setKey] = useState(0);
  const refresh = () => setKey(k => k + 1);



  useEffect(() => {
    const fetchSubtasks = async () => {
      try {
        const result = await GetSubtask(String(id));
        const obj = JSON.parse(result);          // obj.subtasks — это строка
         // теперь получаем массив Subtask[]
        if (obj.subtasks === "None") {
          setIsNone(true);
          setSubtasks([]);
        } else {
          const parsed: Subtask[] = JSON.parse(obj.subtasks); 
          if (!Array.isArray(parsed)) {
            throw new Error("JSON не является массивом");
          }
          setIsNone(false);
          setSubtasks(parsed);
        }
      } catch (err) {
        console.error("Ошибка получения подзадач:", err);
        setSubtasks([]);
      }
    };
    fetchSubtasks();
  }, [key]);

  if (isNone) {
//console.log("HERERE");
    return numEdit === -2 ? <InputWithCheck refresh={refresh} val="" id={id} setNumEdit={setNumEdit}/> : null ;
  }
  return (
    <div className="">
      <ul className="space-y-2">
        {subtasks.map((task) => (
          
          <li
  key={task.name}
  className="flex items-center justify-between px-3 py-2"
>
  <div className="flex items-center">
    <button
      type="button"
      aria-pressed={task.state === "2"}
      onClick={(e) => {
      
      e.stopPropagation();
      UpdateSubtask({field : "state", newVal: task.state === "2"? "0":"2"}, Number(task.id)).then(() => refresh())}}
      className={`w-5 h-5 rounded-full border flex items-center justify-center
                  transition active:scale-[.95]
                  shrink-0
                  ${task.state === "2" ? "border-green-500 bg-green-100" : "border-gray-300 bg-white"}`}
    >
                <span
                  className={`text-xs leading-none text-green-700
                              ${task.state === "2" ? "opacity-100" : "opacity-0"}`}
                >
                  ✓
                </span>
              </button>
              <div
              onClick={(e) => {
                
                e.stopPropagation();
                task.state === "2"?{}:
                UpdateSubtask({field : "state", newVal: task.state === "0"? "1":"0"}, 
                  Number(task.id)).then(() => refresh())}}
              >

            <span 
            className={`ml-2 text-gray-800 ${task.state === "1" ? "font-bold !font-bold" : ""}`}
              onMouseEnter={() => setDel(task.id)}
              onMouseLeave={() => setDel(-1)}
            >
              {task.name}
              {del==task.id?
              <button
              onClick={()=>{DeleteST(String(task.id))}}
              >
              <span className="material-symbols-outlined text-lg mx-2">
                close
              </span>
              </button>:""}
            </span>
            </div>
              </div>

            <span
              className={`text-xs font-medium px-2 py-1 rounded 
                ${
                  task.state === "2"
                    ? "bg-green-100 text-green-700"
                    : task.state === "1"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-600"
                }`}
            >
                {task.state}
            </span>
          </li>

        ))}
      </ul>
      {numEdit === -2 ? <InputWithCheck val="" id={id} setNumEdit={setNumEdit} refresh={refresh}/> : null}
    </div>
  );
};
