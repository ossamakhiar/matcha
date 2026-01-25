import { useCallback, useRef, useState } from "react";

function    useRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioSeconds, setAudioSeconds] = useState(0);

    const audioChunks = useRef<Blob[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });

            intervalRef.current = setInterval(() => setAudioSeconds(prev => prev + 1), 1000);

            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            audioChunks.current = []; // ? before recording starts
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunks.current.push(e.data);
            };
            mediaRecorder.start();
        } catch (e) {
            // Failed to start recording
        }
    }
    const stopRecording = useCallback(() => {
        return new Promise<ArrayBuffer>((resolve) => {
            if (!mediaRecorderRef.current) return;

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                const audioBuffer = await audioBlob.arrayBuffer();
                audioChunks.current = [];
                const tracks = mediaRecorderRef.current!.stream.getTracks();
                tracks.forEach((track) => track.stop());
                if (intervalRef.current) clearInterval(intervalRef.current);
                resolve(audioBuffer)
                setIsRecording(false);
                setAudioSeconds(0);
            }
            mediaRecorderRef.current.stop();
        });
    }, [])


    return {
        startRecording,
        stopRecording,
        isRecording,
        audioSeconds
    }

}


export default useRecorder;