import { ReactNode, useEffect, useRef, useState } from "react";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import useOutsideClick from "../../hooks/useOutsideClick";

type ComposerActionItemProps = {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  className?: string
};

function ComposerActionItem({
  icon,
  title,
  onClick,
  className,
}: ComposerActionItemProps) {
    const actionClass =
        "flex h-16 w-16 bg-[#2f3b4d] flex-col items-center px-3 py-2 rounded-full hover:bg-[#3a475c] text-left";

    return (
        <button
        type="button"
        className={`${actionClass} ${className}`}
        onClick={onClick}
        role="menuitem"
        >
        {icon}
        <span>{title}</span>
        </button>
    );
}

function ChatComposerActions({
  onEventClick,
}: {
  onEventClick: () => void;
}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useOutsideClick(() => setOpen(false))

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown as any);
        return () => {
            window.removeEventListener("keydown", onKeyDown as any);
        };
    }, [open]);


    return (
    <div className="relative flex items-center">
        <button
            ref={btnRef}
            type="button"
            aria-label="More actions"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="p-1 rounded-md"
        >
            <FiPlus size={25} />
        </button>

        {open && (
            <div
                ref={panelRef}
                className="absolute left-0 bottom-12 flex min-w-[300px] bg-[#242526] border text-white rounded-lg shadow-md p-2 z-50"
                role="menu"
            >
                <ComposerActionItem
                    onClick={() => {
                        setOpen(false);
                        onEventClick();
                    }}
                    icon={<BsFillCalendarEventFill size={30} className="fill-slate-300" />}
                    title="event"
                    className="text-slate-300 "
                />
            </div>
        )}
    </div>
    );
}

export default ChatComposerActions;