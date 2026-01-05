import React, { useState } from "react";
import { PostSubtask, Subtask } from "../../../api/client";

interface InputWithCheckProps {
  val: string;
  id: number;
  setNumEdit: React.Dispatch<React.SetStateAction<number>>;
  refresh: () => void;
}

export const InputWithCheck: React.FC<InputWithCheckProps> = ({ val, id, setNumEdit, refresh }) => {
  const [value, setValue] = useState(val);

  const handleConfirm = () => {
    const st: Subtask = { event_id: id, name: value, state: "0" };
    PostSubtask(st).then(refresh);
    setNumEdit(-1);
    setValue(""); // очистить поле
  };

  return (
<div className="flex items-center w-full max-w-md border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden transition">
  <input
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Enter subtask name"
    className="flex-1 px-4 py-2 text-gray-800 rounded-lg focus:outline-none text-base"
  />
  <button
    onClick={(e) => {
      handleConfirm();
      e.stopPropagation();
    }}
    className="flex items-center justify-center px-4 py-2 bg-green-200 hover:bg-green-300 active:scale-95 transition-all text-green-800 font-medium rounded-l-none"
  >
    <span className="material-symbols-outlined text-xl">
      check
    </span>
  </button>
</div>

  );
};
