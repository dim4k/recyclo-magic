"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Star, Camera, Gift, Map, Play, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeScreen() {
    const router = useRouter();
    const userName = useStore((state) => state.userName);
    const candies = useStore((state) => state.candies);
    const creations = useStore((state) => state.creations);
    const resetGameState = useStore((state) => state.resetGameState);
    const setUserName = useStore((state) => state.setUserName);

    const handleLogout = () => {
        resetGameState();
        setUserName("");
        router.replace("/");
    };

    useEffect(() => {
        if (!userName) router.replace("/");
    }, [userName, router]);

    if (!userName) return null;

    const handleCamera = () => {
        resetGameState();
        router.push("/camera");
    };

    return (
        <div className="flex flex-col min-h-screen p-6 overflow-hidden relative">
            {/* Top Bar */}
            <div className="flex justify-between items-center z-10 mb-8 mt-4 bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-purple-400 overflow-hidden">
                        <span className="text-2xl">👦</span>
                    </div>
                    <span className="text-purple-900 font-black text-xl uppercase tracking-wide">
                        {userName}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-black border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-lg">{candies}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/30 backdrop-blur-md p-3 rounded-full border-2 border-white/50 text-purple-700 hover:bg-white/50 transition"
                        title="Se déconnecter"
                    >
                        <LogOut className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Main Container */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 space-y-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-sm"
                >
                    <div className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full"></div>
                    <button
                        onClick={handleCamera}
                        className="btn-3d relative w-full aspect-square bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 rounded-[3rem] p-2 flex flex-col items-center justify-center border-4 border-white/50 shadow-[0_0_40px_rgba(236,72,153,0.5)] overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Camera className="w-32 h-32 text-white mb-4 drop-shadow-xl group-hover:scale-110 transition-transform" />
                        <span className="text-4xl font-black text-white text-stroke tracking-widest leading-none text-center">
                            VITE, <br />
                            UN DÉCHET !
                        </span>
                        <Play className="absolute bottom-6 right-6 w-12 h-12 text-yellow-300 fill-current" />
                    </button>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <motion.button
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => router.push("/cadeaux")}
                        className="btn-3d bg-white/30 backdrop-blur-sm border-4 border-white/40 rounded-3xl p-4 flex flex-col items-center justify-center aspect-square shadow-lg relative"
                    >
                        <Gift className="w-16 h-16 text-yellow-500 fill-current mb-2 drop-shadow-md" />
                        <span className="text-lg font-black text-purple-900">
                            CADEAUX
                        </span>
                        {creations.length > 0 && (
                            <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow">
                                {creations.length}
                            </div>
                        )}
                    </motion.button>
                    <motion.button
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => router.push("/carte")}
                        className="btn-3d bg-white/30 backdrop-blur-sm border-4 border-white/40 rounded-3xl p-4 flex flex-col items-center justify-center aspect-square shadow-lg"
                    >
                        <Map className="w-16 h-16 text-blue-500 mb-2 drop-shadow-md" />
                        <span className="text-lg font-black text-purple-900">
                            CARTE
                        </span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
