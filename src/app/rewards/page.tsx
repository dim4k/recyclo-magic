"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore, Beneficiary } from "@/store/useStore";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";

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
    const addCreation = useStore((state) => state.addCreation);
    const detectedCategory = useStore((state) => state.detectedCategory);
    const selectedPurpose = useStore((state) => state.selectedPurpose);
    const setSelectedBeneficiary = useStore((state) => state.setSelectedBeneficiary);

    const [imagePath, setImagePath] = useState<string>("");
    const [localBeneficiary, setLocalBeneficiary] = useState<Beneficiary | null>(null);
    const [showSending, setShowSending] = useState(false);
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
        fetch(`/api/result-image?category=${detectedCategory}&purpose=${selectedPurpose}`)
            .then((res) => res.json())
            .then((data) => setImagePath(data.image || fallback))
            .catch(() => setImagePath(fallback));
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
        setShowSending(true);
    };

    const categoryName = categoryLabels[detectedCategory || ""] || detectedCategory || "ton déchet";
    const purposeName = purposeLabels[selectedPurpose] || selectedPurpose;

    // Pegasus sending video overlay
    if (showSending) {
        return (
            <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899, #f59e0b, #06b6d4)" }}>
                {[{ size: 180, x: "10%", y: "5%", color: "#f472b6", delay: 0, dur: 4 },
                  { size: 120, x: "70%", y: "10%", color: "#fbbf24", delay: 0.5, dur: 5 },
                  { size: 200, x: "80%", y: "60%", color: "#818cf8", delay: 1, dur: 3.5 },
                  { size: 140, x: "5%", y: "70%", color: "#34d399", delay: 0.3, dur: 4.5 },
                ].map((b, i) => (
                    <motion.div key={i} className="absolute rounded-full opacity-40 blur-2xl"
                        style={{ width: b.size, height: b.size, left: b.x, top: b.y, background: b.color }}
                        animate={{ scale: [1, 1.3, 1], x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
                        transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
                    />
                ))}

                <motion.div className="absolute top-8 left-0 right-0 text-center z-10"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <span className="text-4xl font-black text-white drop-shadow-lg tracking-widest">
                        ✨ ENVOI EN COURS ✨
                    </span>
                </motion.div>

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
                            onEnded={() => router.push("/confirmation")}
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen p-6 overflow-hidden relative">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center z-10"
            >
                <h1 className="text-4xl font-black text-white text-stroke tracking-widest mt-8 mb-2 drop-shadow-lg">
                    BRAVO {userName?.toUpperCase()} !
                </h1>
                <p className="text-white/90 font-bold mt-1 text-lg">
                    {categoryName} →{" "}
                    <span className="text-yellow-300">{purposeName}</span>
                </p>
            </motion.div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                className="flex-1 flex flex-col items-center justify-center my-6 z-10 relative"
            >
                <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"></div>
                <div className="relative w-full max-w-sm aspect-square rounded-[3rem] p-4 bg-white/20 backdrop-blur-md border-4 border-white/50 shadow-2xl">
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner bg-black/10 flex flex-col items-center justify-center">
                        {imagePath ? (
                            <img src={imagePath} alt="Transformation Result" className="object-cover w-full h-full" />
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
                className="z-10 pb-8"
            >
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
                            <span>Envoyer !</span>
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
