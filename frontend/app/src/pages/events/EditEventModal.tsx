import { FC, useState, useEffect } from 'react';
import { ScheduledEvent } from './types';
import { FaTimes } from 'react-icons/fa';

type Props = {
    event: ScheduledEvent;
    isOpen: boolean;
    onClose: () => void;
    onSave: (eventId: number, updates: { title: string; eventDate: string; notes?: string }) => void;
};

export const EditEventModal: FC<Props> = ({ event, isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState(event.title);
    const [eventDate, setEventDate] = useState('');
    const [notes, setNotes] = useState(event.notes || '');

    useEffect(() => {
        const date = new Date(event.eventDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setEventDate(localDate.toISOString().slice(0, 16));
    }, [event.eventDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(event.id, { title, eventDate, notes });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink resize-none"
                            placeholder="Add any additional details..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-pink text-white rounded-lg hover:bg-pink-600 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
