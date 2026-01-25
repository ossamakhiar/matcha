import { ToastType } from '../components/utils/Toast';

type ToastListener = (message: string, type: ToastType) => void;

class ToastManager {
    private listeners: ToastListener[] = [];

    subscribe(listener: ToastListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private emit(message: string, type: ToastType) {
        this.listeners.forEach((listener) => listener(message, type));
    }

    success(message: string) {
        this.emit(message, 'success');
    }

    error(message: string) {
        this.emit(message, 'error');
    }

    info(message: string) {
        this.emit(message, 'info');
    }

    show(message: string, type: ToastType = 'info') {
        this.emit(message, type);
    }
}

export const toast = new ToastManager();

