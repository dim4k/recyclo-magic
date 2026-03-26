"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { Star, Home, Share2, Check } from "lucide-react";
import { useRef } from "react";

const categoryLabels: Record<string, string> = {
    bottleCap: "Bouchon",
    candyWrapper: "Emballage bonbon",
    cardboardBox: "Carton",
    ceramicMug: "Tasse",
    cerealBox: "Boîte de céréales",
    cigaretteButt: "Mégot",
    coffeeCup: "Gobelet café",
    glassBottle: "Bouteille en verre",
    juiceBox: "Brique de jus",
    plasticBottle: "Bouteille plastique",
    plasticCup: "Verre plastique",
    sprayCan: "Aérosol",
    woodenStick: "Bâton",
    unknown: "Objet mystère",
    other: "Objet mystère",
};

const purposeLabels: Record<string, string> = {
    toy: "Un Jouet",
    deco: "Une Déco",
    activity: "Une Activité",
    coloring: "Un Coloriage",
};

export default function ConfirmationScreen() {
    const router = useRouter();
    const userName = useStore((state) => state.userName);
    const addCandies = useStore((state) => state.addCandies);
    const detectedCategory = useStore((state) => state.detectedCategory);
    const selectedPurpose = useStore((state) => state.selectedPurpose);
    const selectedBeneficiary = useStore((state) => state.selectedBeneficiary);

    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiSize, setConfettiSize] = useState({ w: 400, h: 800 });
    const [shared, setShared] = useState(false);
    const candiesAdded = useRef(false);

    const beneficiaryLabels: Record<string, string> = {
        myself: "toi 👦",
        friend1: "ton copain 👧",
        surprise: "une surprise 🎁",
    };

    useEffect(() => {
        if (!detectedCategory || !selectedPurpose) {
            router.replace("/home");
            return;
        }
        if (!candiesAdded.current) {
            candiesAdded.current = true;
            addCandies(10);
        }
        setShowConfetti(true);
        setConfettiSize({ w: window.innerWidth, h: window.innerHeight });
        const timer = setTimeout(() => setShowConfetti(false), 6000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleShare = async () => {
        const categoryName = categoryLabels[detectedCategory || ""] || detectedCategory || "un déchet";
        const purposeName = purposeLabels[selectedPurpose] || selectedPurpose;
        const text = `🎉 ${userName} vient de transformer ${categoryName} en ${purposeName} avec Recyclo Magix ! Joue toi aussi !`;
        if (navigator.share) {
            try {
                await navigator.share({ title: "Recyclo Magix 🌱", text, url: window.location.origin });
            } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(text);
            setShared(true);
            setTimeout(() => setShared(false), 2500);
        }
    };

    const forWhom = beneficiaryLabels[selectedBeneficiary || ""] || "quelqu'un de spécial";
    const purposeName = purposeLabels[selectedPurpose] || selectedPurpose || "quelque chose de magique";

    return (
        <div className="flex flex-col min-h-screen p-6 overflow-hidden relative items-center justify-center">
            {showConfetti && (
                <Confetti
                    width={confettiSize.w}
                    height={confettiSize.h}
                    recycle={false}
                    numberOfPieces={600}
                />
            )}

            {/* Animated background blobs */}
            {[
                { size: 200, x: "5%", y: "10%", color: "#fbbf24" },
                { size: 150, x: "70%", y: "5%", color: "#f472b6" },
                { size: 180, x: "60%", y: "70%", color: "#818cf8" },
                { size: 120, x: "0%", y: "65%", color: "#34d399" },
            ].map((b, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full opacity-30 blur-3xl pointer-events-none"
                    style={{ width: b.size, height: b.size, left: b.x, top: b.y, background: b.color }}
                    animate={{ scale: [1, 1.2, 1], x: [0, 15, -15, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}

            {/* Title */}
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-center z-10 mb-6"
            >
                <h1 className="text-5xl font-black text-white text-stroke tracking-widest drop-shadow-lg mb-4">
                    BRAVO {userName?.toUpperCase()} !
                </h1>

                {/* +10 Bonbons badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", bounce: 0.7 }}
                    className="inline-flex items-center space-x-2 bg-yellow-400 text-purple-900 px-8 py-3 rounded-full font-black text-2xl border-4 border-white shadow-[0_0_30px_rgba(250,204,21,0.7)]"
                >
                    <Star className="w-7 h-7 fill-current" />
                    <span>+10 BONBONS</span>
                    <Star className="w-7 h-7 fill-current" />
                </motion.div>
            </motion.div>

            {/* Confirmation message */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
                className="z-10 w-full max-w-sm mb-8"
            >
                <div className="bg-white/25 backdrop-blur-md rounded-3xl p-6 border-4 border-white/50 shadow-2xl text-center">
                    <div className="text-6xl mb-3">🌱✨</div>
                    <p className="text-white font-black text-xl leading-snug drop-shadow">
                        {purposeName} est en route
                    </p>
                    <p className="text-white/90 font-bold text-lg mt-1">
                        pour {forWhom} !
                    </p>
                    <p className="text-white/70 text-sm mt-3 font-medium">
                        Tu as transformé un déchet en magie 🎉
                    </p>
                </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col space-y-4 z-10 w-full max-w-sm"
            >
                <button
                    onClick={handleShare}
                    className="btn-3d w-full py-5 text-2xl font-black rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white flex items-center justify-center space-x-3 border-4 border-white/20 shadow-xl"
                >
                    {shared ? (
                        <>
                            <Check className="w-7 h-7 flex-shrink-0" />
                            <span>Copié !</span>
                        </>
                    ) : (
                        <>
                            <Share2 className="w-7 h-7 flex-shrink-0" />
                            <span>Partager la magie</span>
                        </>
                    )}
                </button>

                <button
                    onClick={() => router.push("/home")}
                    className="btn-3d w-full py-5 text-2xl font-black rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center justify-center space-x-3 shadow-xl"
                >
                    <Home className="w-8 h-8" />
                    <span className="tracking-wider text-stroke-sm">RETOURNER JOUER</span>
                </button>
            </motion.div>
        </div>
    );
}
