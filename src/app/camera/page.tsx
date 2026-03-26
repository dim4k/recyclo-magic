"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Canvas glitter effect
function GlitterCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const COLORS = [
            "255,220,50", // gold
            "255,150,220", // pink
            "180,130,255", // purple
            "100,220,255", // cyan
            "255,255,255", // white
            "255,200,100", // amber
        ];

        type Glitter = {
            x: number;
            y: number;
            size: number;
            color: string;
            alpha: number;
            alphaSpeed: number;
            twinklePhase: number;
            twinkleSpeed: number;
            shape: number; // 0=circle, 1=cross, 2=diamond
        };

        const COUNT = 120;
        const glitters: Glitter[] = Array.from({ length: COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random(),
            alphaSpeed:
                (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.06 + 0.02,
            shape: Math.floor(Math.random() * 3),
        }));

        const drawCross = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            s: number,
        ) => {
            ctx.beginPath();
            ctx.moveTo(x - s, y);
            ctx.lineTo(x + s, y);
            ctx.moveTo(x, y - s);
            ctx.lineTo(x, y + s);
            ctx.lineWidth = s * 0.6;
            ctx.stroke();
        };
        const drawDiamond = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            s: number,
        ) => {
            ctx.beginPath();
            ctx.moveTo(x, y - s);
            ctx.lineTo(x + s * 0.6, y);
            ctx.lineTo(x, y + s);
            ctx.lineTo(x - s * 0.6, y);
            ctx.closePath();
            ctx.fill();
        };

        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            glitters.forEach((g) => {
                g.twinklePhase += g.twinkleSpeed;
                g.alpha = (Math.sin(g.twinklePhase) + 1) / 2;

                const glow = g.size * 3;
                const grad = ctx.createRadialGradient(
                    g.x,
                    g.y,
                    0,
                    g.x,
                    g.y,
                    glow,
                );
                grad.addColorStop(0, `rgba(${g.color},${g.alpha})`);
                grad.addColorStop(1, `rgba(${g.color},0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(g.x, g.y, glow, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(${g.color},${g.alpha})`;
                ctx.fillStyle = `rgba(${g.color},${g.alpha})`;
                if (g.shape === 0) {
                    ctx.beginPath();
                    ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (g.shape === 1) {
                    drawCross(ctx, g.x, g.y, g.size * 2);
                } else {
                    drawDiamond(ctx, g.x, g.y, g.size * 1.5);
                }
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
    );
}

export default function CameraScreen() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const setCapturedImage = useStore((state) => state.setCapturedImage);
    const [captured, setCaptured] = useState(false);
    const [facingMode, setFacingMode] = useState<"environment" | "user">(
        "environment",
    );

    const startCamera = useCallback(async (mode: "environment" | "user") => {
        // Stop existing stream
        streamRef.current?.getTracks().forEach((t) => t.stop());
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: mode } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        startCamera(facingMode);
        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    const flipCamera = useCallback(() => {
        setFacingMode((prev) =>
            prev === "environment" ? "user" : "environment",
        );
    }, []);

    const capture = useCallback(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        const doCapture = (imageSrc: string) => {
            setCaptured(true);
            setCapturedImage(imageSrc);
            setTimeout(() => router.push("/transform"), 1200);
        };

        // Pause briefly so the GPU flushes the current frame to memory
        // This fixes the black frame issue with hardware-decoded rear cameras on Android
        video.pause();
        await new Promise((r) => setTimeout(r, 80));

        const rawW = video.videoWidth || 640;
        const rawH = video.videoHeight || 480;
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(rawW, rawH));
        const w = Math.round(rawW * scale);
        const h = Math.round(rawH * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            video.play();
            return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        video.play();
        doCapture(canvas.toDataURL("image/jpeg", 0.85));
    }, [router, setCapturedImage]);

    return (
        <div
            className="flex flex-col h-screen absolute inset-0 text-white overflow-hidden z-50"
            style={{
                background:
                    "linear-gradient(160deg, #2d0a4e 0%, #1a0533 50%, #0d1b4b 100%)",
            }}
        >
            {/* Canvas glitter effect */}
            <GlitterCanvas />

            {/* Top controls */}
            <div className="p-6 flex justify-between items-center z-20 absolute top-0 left-0 right-0">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="text-white bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/30 shadow-lg"
                >
                    <X size={28} strokeWidth={3} />
                </motion.button>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-3xl"
                >
                    🪄
                </motion.div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={flipCamera}
                    className="text-white bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/30 shadow-lg text-xl"
                    title="Changer de caméra"
                >
                    🔄
                </motion.button>
            </div>

            {/* Cute header text */}
            <div className="absolute top-20 left-0 right-0 text-center z-10 pointer-events-none">
                <motion.p
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white font-black text-lg tracking-widest drop-shadow-lg"
                    style={{ WebkitTextStroke: "0.5px rgba(255,200,255,0.5)" }}
                >
                    ✨ MONTRE-MOI TON DÉCHET ✨
                </motion.p>
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

                {/* Cute glitter frame */}
                <div className="absolute inset-6 pointer-events-none z-10">
                    {/* Corners */}
                    {[
                        "top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl",
                        "top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl",
                        "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl",
                        "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl",
                    ].map((cls, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-12 h-12 border-pink-300 ${cls}`}
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                    {/* Corner sparkles */}
                    {[
                        { cls: "-top-3 -left-3", emoji: "💖" },
                        { cls: "-top-3 -right-3", emoji: "⭐" },
                        { cls: "-bottom-3 -left-3", emoji: "🌟" },
                        { cls: "-bottom-3 -right-3", emoji: "✨" },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${s.cls} text-2xl`}
                            animate={{
                                scale: [1, 1.4, 1],
                                rotate: [0, 20, -20, 0],
                            }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: i * 0.4,
                            }}
                        >
                            {s.emoji}
                        </motion.div>
                    ))}
                </div>

                {/* Capture Flash */}
                <AnimatePresence>
                    {captured && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(255,200,255,0.95) 0%, rgba(200,150,255,0.98) 100%)",
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [0.5, 1.3, 1],
                                    rotate: [0, 20, -10, 0],
                                }}
                                transition={{ duration: 0.6 }}
                                className="text-8xl mb-4"
                            >
                                ✨
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-purple-700 text-center drop-shadow"
                            >
                                Magie en cours... 🪄
                            </motion.h2>
                            <div className="flex space-x-2 mt-4 text-4xl">
                                {["⭐", "💫", "🌟", "💖"].map((e, i) => (
                                    <motion.span
                                        key={i}
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                        }}
                                    >
                                        {e}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Capture Button */}
            <div
                className="h-48 flex flex-col items-center justify-center z-20 absolute bottom-0 left-0 right-0 pb-4"
                style={{
                    background:
                        "linear-gradient(to top, rgba(20,0,40,0.9) 0%, transparent 100%)",
                }}
            >
                <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-pink-200 font-bold text-sm tracking-widest mb-4"
                >
                    APPUIE POUR CAPTURER 📸
                </motion.p>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={capture}
                    className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                        background:
                            "linear-gradient(135deg, #f472b6, #a855f7, #60a5fa)",
                    }}
                >
                    {/* Pulse ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background:
                                "linear-gradient(135deg, #f472b6, #a855f7)",
                        }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background:
                                "linear-gradient(135deg, #a855f7, #60a5fa)",
                        }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            delay: 0.3,
                        }}
                    />
                    <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner z-10">
                        <Sparkles className="w-9 h-9 text-white drop-shadow" />
                    </div>
                </motion.button>
            </div>
        </div>
    );
}
