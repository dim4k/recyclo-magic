"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, Purpose, Beneficiary } from "@/store/useStore";
import Image from "next/image";
import { motion } from "framer-motion";
import { Wand2, Sparkles, Loader2, RefreshCcw, Camera } from "lucide-react";

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
            <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899, #f59e0b, #06b6d4)" }}>
                {/* Bulles animées en arrière-plan */}
                {[
                    { size: 180, x: "10%", y: "5%", color: "#f472b6", delay: 0, dur: 4 },
                    { size: 120, x: "70%", y: "10%", color: "#fbbf24", delay: 0.5, dur: 5 },
                    { size: 200, x: "80%", y: "60%", color: "#818cf8", delay: 1, dur: 3.5 },
                    { size: 140, x: "5%", y: "70%", color: "#34d399", delay: 0.3, dur: 4.5 },
                    { size: 100, x: "50%", y: "85%", color: "#fb923c", delay: 0.8, dur: 3 },
                    { size: 80, x: "35%", y: "15%", color: "#e879f9", delay: 1.2, dur: 5.5 },
                ].map((b, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full opacity-40 blur-2xl"
                        style={{ width: b.size, height: b.size, left: b.x, top: b.y, background: b.color }}
                        animate={{ scale: [1, 1.3, 1], x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
                        transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
                    />
                ))}

                {/* Étoiles */}
                {["⭐", "✨", "🌟", "💫", "⭐", "✨"].map((star, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-4xl select-none"
                        style={{ left: `${10 + i * 15}%`, top: `${5 + (i % 2) * 10}%` }}
                        animate={{ y: [0, -30, 0], rotate: [0, 20, -20, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                    >
                        {star}
                    </motion.div>
                ))}
                {["💖", "🌈", "✨", "💫"].map((star, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-3xl select-none"
                        style={{ left: `${5 + i * 22}%`, bottom: `${5 + (i % 2) * 8}%` }}
                        animate={{ y: [0, 25, 0], rotate: [0, -15, 15, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.5 }}
                    >
                        {star}
                    </motion.div>
                ))}

                {/* Texte ABRACADABRA */}
                <motion.div
                    className="absolute top-8 left-0 right-0 text-center z-10"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <span className="text-4xl font-black text-white drop-shadow-lg tracking-widest" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.5)" }}>
                        ✨ ABRACADABRA ✨
                    </span>
                </motion.div>

                {/* Vidéo centrée */}
                <div className="absolute inset-0 flex items-center justify-center px-6">
                    <motion.div
                        className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40"
                        style={{ maxWidth: 360, maxHeight: "70vh" }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <video
                            src="/video/P%C3%A9gase_f%C3%A9erique_en_vid%C3%A9o_pour_mobile.mp4"
                            autoPlay
                            playsInline
                            muted={false}
                            style={{ display: "block", maxWidth: "100%", maxHeight: "70vh", width: "auto", height: "auto" }}
                            onEnded={() => router.push("/rewards")}
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    const displayName = detectedCategory
        ? categoryLabels[detectedCategory] || detectedCategory
        : "Objet mystère";

    return (
        <div className="flex flex-col min-h-screen p-6 pb-32">
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
                    className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-40"
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
