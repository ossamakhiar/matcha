import React, { useState } from "react";

export type CreateEventPayload = {
  title: string;
  startsAtISO: string;
  note?: string;
};

type Props = {
  onSubmit: (payload: CreateEventPayload) => void;
  defaultTitle?: string;
};

export const CreateEventForm: React.FC<Props> = ({
  onSubmit,
  defaultTitle = "Date proposal",
}) => {
    const [title, setTitle] = useState(defaultTitle);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [note, setNote] = useState("");

    const canSubmit = Boolean(date && time);

    const handleSubmit = () => {
        if (!canSubmit) return;

        const startsAtISO = new Date(`${date}T${time}`).toISOString();
        onSubmit({
            title: title.trim() || defaultTitle,
            startsAtISO,
            note: note.trim() ? note.trim() : undefined,
        });
    }

    return (
    <div className="space-y-3">
        <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
            Title (optional)
        </label>
        <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
            placeholder="Coffee, dinner, walk…"
        />
        </div>

        <div className="grid grid-cols-2 gap-3">
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
            Date
            </label>
            <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
            />
        </div>

        <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
            Time
            </label>
            <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
            />
        </div>
        </div>

        <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
            Note (optional)
        </label>
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
            rows={3}
            placeholder="e.g. I know a nice place near…"
        />
        </div>

        <div className="flex justify-end gap-2 pt-1">
        <button
            type="button"
            className="rounded-md bg-pink px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
        >
            Send
        </button>
        </div>
    </div>
    );
};
