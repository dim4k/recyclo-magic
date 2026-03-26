"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore, Purpose, Beneficiary } from "@/store/useStore";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Sparkles, Loader2, RefreshCcw, Camera } from "lucide-react";

// ─── Magic Cauldron Animation ────────────────────────────────────────────────
function SparkleCanvas({ active }: { active: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        type Spark = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            life: number;
            maxLife: number;
            color: string;
            size: number;
        };
        const COLORS = [
            "255,220,50",
            "255,100,200",
            "180,100,255",
            "100,220,255",
            "255,255,255",
            "255,150,50",
        ];
        const sparks: Spark[] = [];

        const emit = () => {
            const cx = canvas.width / 2;
            const cy = canvas.height * 0.62;
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                sparks.push({
                    x: cx + (Math.random() - 0.5) * 60,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 3,
                    life: 1,
                    maxLife: Math.random() * 40 + 20,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    size: Math.random() * 4 + 2,
                });
            }
        };

        let frame = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;
            if (frame % 3 === 0) emit();
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.15;
                s.life -= 1 / s.maxLife;
                if (s.life <= 0) {
                    sparks.splice(i, 1);
                    continue;
                }
                const alpha = s.life;
                const grd = ctx.createRadialGradient(
                    s.x,
                    s.y,
                    0,
                    s.x,
                    s.y,
                    s.size * 2,
                );
                grd.addColorStop(0, `rgba(${s.color},${alpha})`);
                grd.addColorStop(1, `rgba(${s.color},0)`);
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
                ctx.fill();
                // cross spark
                ctx.strokeStyle = `rgba(${s.color},${alpha})`;
                ctx.lineWidth = s.size * 0.5;
                ctx.beginPath();
                ctx.moveTo(s.x - s.size, s.y);
                ctx.lineTo(s.x + s.size, s.y);
                ctx.moveTo(s.x, s.y - s.size);
                ctx.lineTo(s.x, s.y + s.size);
                ctx.stroke();
            }
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, [active]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />
    );
}

function MagicCauldron({
    capturedImage,
    onDone,
}: {
    capturedImage: string | null;
    onDone: () => void;
}) {
    // phase: 0=photo floating, 1=photo flying into cauldron, 2=cauldron shaking, 3=flash
    const [phase, setPhase] = useState(0);
    const doneRef = useRef(false);

    const next = useCallback((to: number, delay: number) => {
        setTimeout(() => setPhase(to), delay);
    }, []);

    useEffect(() => {
        // phase 0 → 1 after 1.2s (photo shown floating)
        next(1, 1200);
    }, [next]);

    useEffect(() => {
        if (phase === 1) next(2, 900); // photo reaches cauldron
        if (phase === 2) next(3, 2200); // cauldron shakes
        if (phase === 3 && !doneRef.current) {
            doneRef.current = true;
            setTimeout(() => onDone(), 800);
        }
    }, [phase, next, onDone]);

    return (
        <div
            className="fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center"
            style={{
                background:
                    "radial-gradient(ellipse at 50% 30%, #1a003a 0%, #0a0020 60%, #000010 100%)",
            }}
        >
            {/* Sparkle canvas */}
            <SparkleCanvas active={phase >= 2} />

            {/* Background ambient blobs */}
            {[
                ["#7c3aed", "15%", "20%"],
                ["#db2777", "80%", "15%"],
                ["#0284c7", "10%", "70%"],
                ["#d97706", "75%", "65%"],
            ].map(([color, x, y], i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{
                        width: 200,
                        height: 200,
                        left: x,
                        top: y,
                        background: color,
                    }}
                    animate={{ scale: [1, 1.4, 1], x: [0, 20, -10, 0] }}
                    transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Stars twinkling in bg */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-white pointer-events-none select-none"
                    style={{
                        left: `${Math.random() * 90 + 5}%`,
                        top: `${Math.random() * 80 + 5}%`,
                        fontSize: `${Math.random() * 8 + 4}px`,
                    }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{
                        duration: Math.random() * 2 + 1,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                    }}
                >
                    ✦
                </motion.div>
            ))}

            {/* Title */}
            <motion.div
                className="absolute top-10 left-0 right-0 text-center z-30"
                animate={
                    phase < 3
                        ? { opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }
                        : { opacity: 0 }
                }
                transition={{ duration: 1.5, repeat: phase < 3 ? Infinity : 0 }}
            >
                <span
                    className="text-3xl font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(200,100,255,0.8)]"
                    style={{ WebkitTextStroke: "1px rgba(255,150,255,0.5)" }}
                >
                    ✨ ABRACADABRA ✨
                </span>
            </motion.div>

            {/* Flying photo */}
            <AnimatePresence>
                {phase <= 1 && capturedImage && (
                    <motion.div
                        className="absolute z-30 rounded-2xl overflow-hidden border-4 border-white/60 shadow-[0_0_40px_rgba(200,100,255,0.8)]"
                        style={{ width: 160, height: 160 }}
                        initial={{
                            top: "15%",
                            left: "50%",
                            x: "-50%",
                            scale: 1,
                            opacity: 1,
                            rotate: 0,
                        }}
                        animate={
                            phase === 0
                                ? {
                                      y: [0, -12, 0],
                                      rotate: [-3, 3, -3],
                                      scale: [1, 1.04, 1],
                                  }
                                : {
                                      top: "57%",
                                      scale: 0.15,
                                      opacity: 0,
                                      rotate: 720,
                                      y: 0,
                                  }
                        }
                        transition={
                            phase === 0
                                ? {
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                  }
                                : { duration: 0.75, ease: [0.6, 0, 0.8, 1] }
                        }
                    >
                        <img
                            src={capturedImage}
                            alt="objet"
                            className="w-full h-full object-cover"
                        />
                        {/* Glitter overlay on photo */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-400/30"
                            animate={{ opacity: [0.2, 0.6, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cauldron */}
            <motion.div
                className="absolute z-10 flex flex-col items-center select-none"
                style={{ bottom: "8%" }}
                animate={
                    phase === 2
                        ? {
                              x: [0, -12, 12, -8, 8, -4, 4, 0],
                              rotate: [0, -4, 4, -3, 3, -1, 1, 0],
                          }
                        : {}
                }
                transition={{ duration: 0.6, repeat: phase === 2 ? 3 : 0 }}
            >
                {/* Smoke / bubbles above cauldron */}
                <div className="relative w-40 flex justify-center mb-1">
                    {phase >= 2 &&
                        [0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full blur-md"
                                style={{
                                    width: 24 + i * 12,
                                    height: 24 + i * 12,
                                    background: "rgba(150,80,255,0.35)",
                                    bottom: 0,
                                }}
                                animate={{
                                    y: [0, -60 - i * 20],
                                    opacity: [0.7, 0],
                                    scale: [0.8, 1.5],
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: i * 0.35,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    {/* Glow from cauldron when shaking */}
                    {phase >= 2 && (
                        <motion.div
                            className="absolute inset-x-0 bottom-0 h-8 rounded-full blur-xl"
                            style={{ background: "rgba(200,100,255,0.6)" }}
                            animate={{
                                opacity: [0.4, 1, 0.4],
                                scaleX: [0.8, 1.2, 0.8],
                            }}
                            transition={{ duration: 0.4, repeat: Infinity }}
                        />
                    )}
                </div>
                <div className="text-9xl leading-none filter drop-shadow-[0_0_30px_rgba(180,80,255,0.9)]">
                    🫕
                </div>
            </motion.div>

            {/* Flash explosion */}
            <AnimatePresence>
                {phase === 3 && (
                    <motion.div
                        className="absolute inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.8] }}
                        exit={{ opacity: 0 }}
                        style={{
                            background:
                                "radial-gradient(circle, rgba(255,200,255,1) 0%, rgba(200,100,255,0.9) 50%, rgba(100,0,200,0.8) 100%)",
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{
                                scale: [0, 1.5, 1],
                                rotate: [0, 20, -10, 0],
                            }}
                            transition={{ duration: 0.5 }}
                            className="text-8xl"
                        >
                            ✨
                        </motion.div>
                        {["⭐", "💫", "🌟", "✨", "💖"].map((e, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-5xl"
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1.2, 0],
                                    x: (i % 2 === 0 ? 1 : -1) * (60 + i * 30),
                                    y: -40 - i * 20,
                                    opacity: [1, 1, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1 + i * 0.05,
                                }}
                            >
                                {e}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TransformScreen() {
    const router = useRouter();
    const capturedImage = useStore((state) => state.capturedImage);
    const detectedCategory = useStore((state) => state.detectedCategory);
    const setDetectedCategory = useStore((state) => state.setDetectedCategory);
    const resetGameState = useStore((state) => state.resetGameState);

    const selectedPurpose = useStore((state) => state.selectedPurpose);
    const setSelectedPurpose = useStore((state) => state.setSelectedPurpose);
    const selectedBeneficiary = useStore((state) => state.selectedBeneficiary);
    const setSelectedBeneficiary = useStore(
        (state) => state.setSelectedBeneficiary,
    );

    const [isDetecting, setIsDetecting] = useState(true);
    const [showMagic, setShowMagic] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!capturedImage) {
            router.replace("/camera");
            return;
        }

        // Call Gemini API to detect object
        const detectObject = async () => {
            try {
                const response = await fetch("/api/detect", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageBase64: capturedImage }),
                });

                const data = await response.json();

                if (
                    data.category &&
                    data.category !== "other" &&
                    data.category !== "unknown"
                ) {
                    setDetectedCategory(data.category);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error("Error detecting object:", error);
                setNotFound(true);
            } finally {
                setIsDetecting(false);
            }
        };

        detectObject();
    }, [capturedImage, router, setDetectedCategory]);

    const handleTransform = () => {
        if (selectedPurpose) {
            setShowMagic(true);
        }
    };

    const purposes: {
        id: Purpose;
        label: string;
        icon: string;
        color: string;
    }[] = [
        {
            id: "toy",
            label: "Un Jouet",
            icon: "🦖",
            color: "from-pink-400 to-rose-500",
        },
        {
            id: "deco",
            label: "Déco",
            icon: "🖼️",
            color: "from-blue-400 to-indigo-500",
        },
        {
            id: "activity",
            label: "Activité",
            icon: "🎨",
            color: "from-purple-400 to-fuchsia-500",
        },
        {
            id: "coloring",
            label: "Coloriage",
            icon: "✏️",
            color: "from-green-400 to-emerald-500",
        },
    ];

    const beneficiaries: { id: Beneficiary; label: string; icon: string }[] = [
        { id: "myself", label: "Pour moi", icon: "👦" },
        { id: "friend1", label: "Copain 1", icon: "👧" },
        { id: "surprise", label: "Surprise", icon: "🎁" },
    ];

    // Helper translations for display
    const categoryLabels: Record<string, string> = {
        bottleCap: "Bouchon",
        candyWrapper: "Emballage",
        cardboardBox: "Carton",
        ceramicMug: "Tasse",
        cerealBox: "Boîte Céréales",
        cigaretteButt: "Mégot",
        coffeeCup: "Gobelet",
        glassBottle: "Bouteille en Verre",
        juiceBox: "Brique de Jus",
        plasticBottle: "Bouteille Plastique",
        plasticCup: "Verre Plastique",
        sprayCan: "Aérosol",
        woodenStick: "Bâton",
        unknown: "Objet mystère",
        other: "Objet mystère",
    };

    if (isDetecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 space-y-8">
                <div className="relative w-48 h-48 rounded-full border-8 border-white/20 overflow-hidden shadow-2xl">
                    {capturedImage && (
                        <Image
                            src={capturedImage}
                            alt="Captured"
                            fill
                            className="object-cover opacity-50"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="w-16 h-16 text-yellow-300 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-white text-stroke tracking-wide">
                    Je regarde ton objet...
                </h2>
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        );
    }

    // --- Écran "Objet non reconnu" ---
    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 space-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-52 h-52 rounded-3xl overflow-hidden border-4 border-white/40 shadow-2xl"
                >
                    {capturedImage && (
                        <Image
                            src={capturedImage}
                            alt="Captured"
                            fill
                            className="object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-6xl">🤔</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h2 className="text-3xl font-black text-white text-stroke tracking-wide">
                        Hmm, je ne vois
                        <br />
                        rien de recyclable !
                    </h2>
                    <p className="text-white/80 text-lg font-medium">
                        Essaie de mieux cadrer l'objet,
                        <br />
                        en pleine lumière 💡
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-xs bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-3xl p-5 space-y-3 text-left"
                >
                    <p className="text-purple-800 font-black text-sm uppercase tracking-wider mb-2">
                        Conseils 👇
                    </p>
                    {[
                        { icon: "🎯", tip: "L'objet doit être bien au centre" },
                        { icon: "💡", tip: "Évite les reflets et l'ombre" },
                        { icon: "🔍", tip: "Approche-toi un peu plus" },
                    ].map(({ icon, tip }) => (
                        <div key={tip} className="flex items-center space-x-3">
                            <span className="text-2xl">{icon}</span>
                            <span className="text-purple-700 text-sm font-medium">
                                {tip}
                            </span>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col w-full max-w-xs space-y-3"
                >
                    <button
                        onClick={() => {
                            resetGameState();
                            router.push("/camera");
                        }}
                        className="btn-3d w-full py-5 text-xl font-black rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white flex items-center justify-center space-x-3 shadow-xl border-4 border-white/20"
                    >
                        <Camera className="w-7 h-7" />
                        <span>Reprendre une photo</span>
                    </button>
                    <button
                        onClick={() => {
                            setNotFound(false);
                            setIsDetecting(true);
                            if (capturedImage) {
                                fetch("/api/detect", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        imageBase64: capturedImage,
                                    }),
                                })
                                    .then((r) => r.json())
                                    .then((d) => {
                                        if (
                                            d.category &&
                                            d.category !== "other" &&
                                            d.category !== "unknown"
                                        ) {
                                            setDetectedCategory(d.category);
                                        } else {
                                            setNotFound(true);
                                        }
                                    })
                                    .catch(() => setNotFound(true))
                                    .finally(() => setIsDetecting(false));
                            }
                        }}
                        className="btn-3d w-full py-3 text-lg font-bold rounded-full bg-white/30 backdrop-blur-sm text-purple-800 flex items-center justify-center space-x-2 border-2 border-white/50"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        <span>Réessayer avec cette photo</span>
                    </button>
                </motion.div>
            </div>
        );
    }

    // Magic animation screen
    if (showMagic) {
        return (
            <MagicCauldron
                capturedImage={capturedImage}
                onDone={() => router.push("/rewards")}
            />
        );
    }

    const displayName = detectedCategory
        ? categoryLabels[detectedCategory] || detectedCategory
        : "Objet mystère";

    return (
        <div className="flex flex-col min-h-screen p-6 pb-28">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8 bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30 shadow-lg mt-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white relative flex-shrink-0 bg-gray-200 shadow-inner">
                    {capturedImage ? (
                        <Image
                            src={capturedImage}
                            alt="Captured"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-blue-200"></div>
                    )}
                </div>
                <div>
                    <h2 className="text-sm font-bold text-purple-500 uppercase tracking-widest">
                        J'AI TROUVÉ :
                    </h2>
                    <p className="text-2xl font-black text-purple-900">
                        {displayName}
                    </p>
                </div>
            </div>

            {/* Purpose Selection */}
            <div className="mb-8">
                <h3 className="text-2xl font-black text-purple-900 mb-4 text-center">
                    Qu'est-ce qu'on en fait ?
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {purposes.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPurpose(p.id)}
                            className={`relative p-4 rounded-3xl border-4 transition-all duration-300 overflow-hidden group
                                ${
                                    selectedPurpose === p.id
                                        ? "border-yellow-400 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                                        : "border-white/60 bg-white/50 hover:bg-white/70"
                                }`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${p.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                            ></div>
                            {selectedPurpose === p.id && (
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${p.color} opacity-40`}
                                ></div>
                            )}
                            <div className="relative z-10 flex items-center justify-between">
                                <span className="text-4xl drop-shadow-md">
                                    {p.icon}
                                </span>
                                <span
                                    className={`text-2xl font-bold ${selectedPurpose === p.id ? "text-white" : "text-purple-900"}`}
                                >
                                    {p.label}
                                </span>
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedPurpose === p.id ? "border-white bg-yellow-400" : "border-purple-400 bg-white/80"}`}
                                >
                                    {selectedPurpose === p.id && (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Fixed Bottom Button */}
            {selectedPurpose && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-40"
                >
                    <button
                        onClick={handleTransform}
                        className="btn-3d w-full py-5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full flex items-center justify-center space-x-3 text-white shadow-[0_0_40px_rgba(250,204,21,0.6)]"
                    >
                        <Wand2 className="w-8 h-8 animate-bounce" />
                        <span className="text-2xl font-black tracking-widest text-shadow">
                            TRANSFORMER
                        </span>
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
