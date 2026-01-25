import { FC, useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
};

export const Toast: FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'info':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-xl" />;
            case 'error':
                return <FaExclamationCircle className="text-xl" />;
            case 'info':
                return <FaCheckCircle className="text-xl" />;
            default:
                return null;
        }
    };

    return (
        <div 
            className={`transition-all duration-300 ease-out ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            style={{
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible ? 1 : 0,
            }}
        >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${getStyles()} min-w-[300px] max-w-md`}>
                {getIcon()}
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="hover:opacity-75 transition-opacity"
                    aria-label="Close notification"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};
