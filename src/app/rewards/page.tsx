"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore, Beneficiary } from "@/store/useStore";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { Star, Home, Share2, Check } from "lucide-react";

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

export default function RewardsScreen() {
    const router = useRouter();
    const userName = useStore((state) => state.userName);
    const addCandies = useStore((state) => state.addCandies);
    const addCreation = useStore((state) => state.addCreation);
    const detectedCategory = useStore((state) => state.detectedCategory);
    const selectedPurpose = useStore((state) => state.selectedPurpose);
    const setSelectedBeneficiary = useStore((state) => state.setSelectedBeneficiary);

    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiSize, setConfettiSize] = useState({ w: 400, h: 800 });
    const [imagePath, setImagePath] = useState<string>("");
    const [shared, setShared] = useState(false);
    const [localBeneficiary, setLocalBeneficiary] = useState<Beneficiary | null>(null);
    const [beneficiaryConfirmed, setBeneficiaryConfirmed] = useState(false);
    const creationSaved = useRef(false);

    const beneficiaries: { id: Beneficiary; label: string; icon: string }[] = [
        { id: "myself", label: "Pour moi", icon: "👦" },
        { id: "friend1", label: "Copain 1", icon: "👧" },
        { id: "surprise", label: "Surprise", icon: "🎁" },
    ];

    const fallback =
        "https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=1080&auto=format&fit=crop";

    useEffect(() => {
        if (!detectedCategory || !selectedPurpose) {
            router.replace("/home");
            return;
        }

        addCandies(10);
        setShowConfetti(true);
        setConfettiSize({ w: window.innerWidth, h: window.innerHeight });

        fetch(
            `/api/result-image?category=${detectedCategory}&purpose=${selectedPurpose}`,
        )
            .then((res) => res.json())
            .then((data) => {
                const img = data.image || fallback;
                setImagePath(img);
            })
            .catch(() => {
                setImagePath(fallback);
            });

        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBeneficiaryConfirm = () => {
        if (!localBeneficiary || !detectedCategory || !selectedPurpose) return;
        if (!creationSaved.current) {
            creationSaved.current = true;
            setSelectedBeneficiary(localBeneficiary);
            addCreation({
                category: detectedCategory,
                purpose: selectedPurpose,
                beneficiary: localBeneficiary,
                imagePath: imagePath || fallback,
            });
        }
        setBeneficiaryConfirmed(true);
    };

    const handleShare = async () => {
        const categoryName =
            categoryLabels[detectedCategory || ""] ||
            detectedCategory ||
            "un déchet";
        const purposeName = purposeLabels[selectedPurpose] || selectedPurpose;
        const text = `🎉 ${userName} vient de transformer ${categoryName} en ${purposeName} avec Recyclo Magix ! Joue toi aussi !`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Recyclo Magix 🌱",
                    text,
                    url: window.location.origin,
                });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(text);
            setShared(true);
            setTimeout(() => setShared(false), 2500);
        }
    };

    const categoryName =
        categoryLabels[detectedCategory || ""] ||
        detectedCategory ||
        "ton déchet";
    const purposeName = purposeLabels[selectedPurpose] || selectedPurpose;

    return (
        <div className="flex flex-col min-h-screen p-6 overflow-hidden relative">
            {showConfetti && (
                <Confetti
                    width={confettiSize.w}
                    height={confettiSize.h}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center z-10"
            >
                <h1 className="text-4xl font-black text-white text-stroke tracking-widest mt-8 mb-2 drop-shadow-lg">
                    BRAVO {userName?.toUpperCase()} !
                </h1>
                <div className="inline-flex items-center space-x-2 bg-yellow-400 text-purple-900 px-6 py-2 rounded-full font-black text-xl border-4 border-white shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                    <Star className="w-6 h-6 fill-current" />
                    <span>+10 BONBONS</span>
                    <Star className="w-6 h-6 fill-current" />
                </div>
                <p className="text-white/90 font-bold mt-3 text-lg">
                    {categoryName} →{" "}
                    <span className="text-yellow-300">{purposeName}</span>
                </p>
            </motion.div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                className="flex-1 flex flex-col items-center justify-center my-8 z-10 relative"
            >
                <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"></div>

                <div className="relative w-full max-w-sm aspect-square rounded-[3rem] p-4 bg-white/20 backdrop-blur-md border-4 border-white/50 shadow-2xl">
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner bg-black/10 flex flex-col items-center justify-center">
                        {imagePath ? (
                            <img
                                src={imagePath}
                                alt="Transformation Result"
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <Star className="w-16 h-16 text-white animate-spin opacity-50" />
                        )}
                    </div>

                    <Star className="absolute -top-3 -right-3 text-yellow-300 w-10 h-10 fill-current animate-pulse drop-shadow-sm" />
                    <Star className="absolute -bottom-4 -left-4 text-pink-300 w-12 h-12 fill-current animate-bounce drop-shadow-sm" />
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col space-y-4 z-10 pb-8"
            >
                {!beneficiaryConfirmed ? (
                    <div className="bg-white/20 backdrop-blur-md rounded-3xl p-5 border-4 border-white/40">
                        <h3 className="text-xl font-black text-white text-center mb-4 drop-shadow">
                            🎁 C'est pour qui ?
                        </h3>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {beneficiaries.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => setLocalBeneficiary(b.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all duration-300
                                        ${
                                            localBeneficiary === b.id
                                                ? "border-yellow-400 bg-white/40 scale-110 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                                                : "border-white/40 bg-white/20 hover:bg-white/30"
                                        }`}
                                >
                                    <span className="text-4xl mb-1">{b.icon}</span>
                                    <span className="text-xs font-bold text-white text-center leading-tight">{b.label}</span>
                                </button>
                            ))}
                        </div>
                        {localBeneficiary && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleBeneficiaryConfirm}
                                className="btn-3d w-full py-4 text-xl font-black rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center justify-center space-x-2 shadow-xl"
                            >
                                <Check className="w-6 h-6" />
                                <span>Confirmer !</span>
                            </motion.button>
                        )}
                    </div>
                ) : (
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
                )}

                <button
                    onClick={() => router.push("/home")}
                    className="btn-3d w-full py-5 text-2xl font-black rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center justify-center space-x-3 shadow-xl"
                >
                    <Home className="w-8 h-8" />
                    <span className="tracking-wider text-stroke-sm">
                        RETOURNER JOUER
                    </span>
                </button>
            </motion.div>
        </div>
    );
}
