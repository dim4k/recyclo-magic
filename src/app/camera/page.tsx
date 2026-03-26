"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { X, Volume2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CameraScreen() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const setCapturedImage = useStore((state) => state.setCapturedImage);
    const [captured, setCaptured] = useState(false);

    useEffect(() => {
        let active = true;
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" }, audio: false })
            .then((stream) => {
                if (!active) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(console.error);

        return () => {
            active = false;
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const capture = useCallback(async () => {
        const stream = streamRef.current;
        if (!stream) return;

        const doCapture = (imageSrc: string) => {
            setCaptured(true);
            setCapturedImage(imageSrc);
            setTimeout(() => router.push("/transform"), 800);
        };

        // Try ImageCapture API first — bypasses hardware overlay restriction
        const track = stream.getVideoTracks()[0];
        if (track && "ImageCapture" in window) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ic = new (window as any).ImageCapture(track);
                const blob: Blob = await ic.takePhoto();
                const reader = new FileReader();
                reader.onloadend = () => doCapture(reader.result as string);
                reader.readAsDataURL(blob);
                return;
            } catch (e) {
                console.warn("ImageCapture failed, falling back to canvas", e);
            }
        }

        // Canvas fallback
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        doCapture(canvas.toDataURL("image/jpeg", 0.92));
    }, [router, setCapturedImage]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 absolute inset-0 text-white overflow-hidden z-50">
            {/* Top controls */}
            <div className="p-6 flex justify-between items-center z-20 absolute top-0 left-0 right-0">
                <button
                    onClick={() => router.back()}
                    className="text-white bg-black/30 backdrop-blur-md p-3 rounded-full hover:bg-black/50 transition border border-white/20"
                >
                    <X size={28} strokeWidth={3} />
                </button>
                <button className="text-white bg-black/30 backdrop-blur-md p-3 rounded-full hover:bg-black/50 transition border border-white/20">
                    <Volume2 size={24} strokeWidth={3} />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative flex items-center justify-center">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Glitter Frame */}
                <div className="absolute inset-8 border-4 border-white/80 rounded-[3rem] pointer-events-none z-10 shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center">
                    <Sparkles className="absolute -top-4 -left-4 text-yellow-300 w-12 h-12 drop-shadow-md animate-pulse" />
                    <Sparkles className="absolute -top-6 right-10 text-pink-300 w-8 h-8 drop-shadow-md animate-bounce" />
                    <Sparkles className="absolute bottom-10 -right-5 text-yellow-200 w-10 h-10 drop-shadow-md animate-pulse" />
                    <Sparkles className="absolute -bottom-4 left-1/4 text-blue-300 w-8 h-8 drop-shadow-md animate-bounce" />
                </div>

                {/* Capture White Flash */}
                {captured && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-white z-30 flex items-center justify-center"
                    >
                        <Sparkles className="w-32 h-32 text-yellow-500 animate-spin" />
                        <h2 className="absolute mt-40 text-2xl font-black text-purple-600">
                            Magie en cours...
                        </h2>
                    </motion.div>
                )}
            </div>

            {/* Capture Button Area */}
            <div className="h-44 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center z-20 absolute bottom-0 left-0 right-0 pb-6">
                <div className="relative">
                    <button
                        onClick={capture}
                        className="btn-3d w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-1 shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center"
                    >
                        <div className="w-full h-full rounded-full border-4 border-white/80 flex items-center justify-center bg-gradient-to-tr from-white/20 to-transparent">
                            <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm shadow-inner"></div>
                        </div>
                    </button>
                    <span className="absolute -bottom-6 w-full text-center text-sm font-bold opacity-90 tracking-widest text-shadow">
                        clic
                    </span>
                </div>
            </div>
        </div>
    );
}
