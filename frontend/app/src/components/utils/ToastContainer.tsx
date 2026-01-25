import { FC, useEffect, useState } from 'react';
import { Toast, ToastType } from './Toast';

type ToastMessage = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContainerProps = {
    toastManager: {
        subscribe: (listener: (message: string, type: ToastType) => void) => () => void;
    };
};

export const ToastContainer: FC<ToastContainerProps> = ({ toastManager }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const unsubscribe = toastManager.subscribe((message, type) => {
            const id = Date.now().toString() + Math.random().toString(36);
            setToasts((prev) => [...prev, { id, message, type }]);
        });

        return unsubscribe;
    }, [toastManager]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
