"use client";
import { useRouter } from "next/navigation";
import { useStore, Creation } from "@/store/useStore";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Trash2, Gift } from "lucide-react";

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
    toy: "🦖 Jouet",
    deco: "🖼️ Déco",
    activity: "🎨 Activité",
    coloring: "✏️ Coloriage",
};

const beneficiaryLabels: Record<string, string> = {
    myself: "Pour moi",
    friend1: "Copain 1",
    friend2: "Copain 2",
    surprise: "Surprise 🎁",
};

function CreationCard({ creation }: { creation: Creation }) {
    const fallback =
        "https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=400&auto=format&fit=crop";

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-white"
        >
            <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                    src={creation.imagePath || fallback}
                    alt="création"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = fallback;
                    }}
                />
                <div className="absolute top-2 right-2 bg-yellow-400 text-purple-900 text-xs font-black px-2 py-1 rounded-full border border-white shadow">
                    {purposeLabels[creation.purpose]}
                </div>
            </div>
            <div className="p-3">
                <p className="text-purple-900 font-black text-sm leading-tight">
                    {categoryLabels[creation.category] || creation.category}
                </p>
                <p className="text-purple-500 text-xs mt-1">
                    {beneficiaryLabels[creation.beneficiary]} · {creation.date}
                </p>
            </div>
        </motion.div>
    );
}

export default function CadeauxScreen() {
    const router = useRouter();
    const userName = useStore((s) => s.userName);
    const candies = useStore((s) => s.candies);
    const creations = useStore((s) => s.creations);

    return (
        <div className="flex flex-col min-h-screen p-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mt-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="bg-white/80 backdrop-blur-md p-3 rounded-full border-2 border-white shadow"
                >
                    <ArrowLeft
                        className="w-6 h-6 text-purple-700"
                        strokeWidth={3}
                    />
                </button>
                <h1 className="text-3xl font-black text-white text-stroke tracking-widest">
                    MES CRÉATIONS
                </h1>
                <div className="flex items-center space-x-1 bg-yellow-400 text-purple-900 px-3 py-2 rounded-full font-black border-2 border-white">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{candies}</span>
                </div>
            </div>

            {/* Stats */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/80 backdrop-blur-md border-2 border-white rounded-3xl p-5 mb-6 flex items-center justify-between shadow"
            >
                <div className="text-center">
                    <p className="text-4xl font-black text-purple-900">
                        {creations.length}
                    </p>
                    <p className="text-purple-500 text-sm font-bold">
                        Créations
                    </p>
                </div>
                <div className="text-5xl">♻️</div>
                <div className="text-center">
                    <p className="text-4xl font-black text-yellow-500">
                        {candies}
                    </p>
                    <p className="text-purple-500 text-sm font-bold">Bonbons</p>
                </div>
            </motion.div>

            {/* Grid */}
            {creations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <Gift className="w-24 h-24 text-white/30" />
                    <p className="text-white/60 font-bold text-xl">
                        Pas encore de créations !
                    </p>
                    <p className="text-white/40 text-sm">
                        Prends en photo un déchet pour commencer la magie ✨
                    </p>
                    <button
                        onClick={() => router.push("/camera")}
                        className="btn-3d mt-4 px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-black text-lg rounded-full border-4 border-white/30"
                    >
                        🎯 Commencer !
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {creations.map((creation, i) => (
                        <motion.div
                            key={creation.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <CreationCard creation={creation} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
