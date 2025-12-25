import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type MenuProps = {
  actions: { label: string; onClick: () => void }[];
  children: ReactNode;
};

export const ContextMenu: React.FC<MenuProps> = ({ actions, children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.pageX, y: e.pageY });
    setShowMenu(true);
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  return (
    <div onContextMenu={handleContextMenu} onClick={handleClick}>
      {children}

      {showMenu &&
        createPortal(
          <ul
            className="absolute bg-white border rounded shadow-lg z-[9999]"
            style={{ top: pos.y, left: pos.x, position: "absolute" }}
          >
            {actions.map((a, i) => (
              <li
                key={i}
                onClick={a.onClick}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {a.label}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
};
