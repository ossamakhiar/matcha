import { FC, ReactNode } from "react";
import { IoClose } from "react-icons/io5";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
            {title && (
                <h2 className="text-lg font-semibold text-pink">
                    {title}
                </h2>
            )}
            <button
              onClick={onClose}
            >
              <IoClose size={25} />
            </button>
        </div>

        {children}
      </div>
    </div>
  );
};
