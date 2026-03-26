"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
    const router = useRouter();
    const [nameInput, setNameInput] = useState("");
    const setUserName = useStore((state) => state.setUserName);

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameInput.trim()) {
            setUserName(nameInput.trim());
            router.push("/home");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
            {/* Decorative stars */}
            <Sparkles className="absolute top-20 left-10 text-yellow-300 w-12 h-12 opacity-80 animate-pulse" />
            <Sparkles className="absolute top-40 right-10 text-pink-300 w-8 h-8 opacity-60 animate-bounce" />
            <Sparkles className="absolute bottom-40 left-20 text-blue-300 w-10 h-10 opacity-70 animate-pulse" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                className="w-full max-w-sm flex flex-col items-center z-10"
            >
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-50 rounded-full"></div>
                    <h1 className="text-6xl font-black text-center leading-none text-white text-stroke drop-shadow-xl relative z-10 p-4">
                        RECYCLO
                        <br />
                        <span className="text-yellow-300 text-7xl inline-block transform -rotate-2">
                            MAGIX
                        </span>
                    </h1>
                </div>

                <form
                    onSubmit={handleStart}
                    className="w-full space-y-6 flex flex-col items-center bg-white/20 p-8 rounded-[2rem] backdrop-blur-md border border-white/30 shadow-2xl"
                >
                    <label
                        htmlFor="name"
                        className="text-2xl font-bold text-purple-900 text-center w-full block"
                    >
                        COMMENT TU T'APPELLES ?
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-6 py-4 text-center text-2xl font-bold rounded-2xl bg-white/90 text-purple-900 border-4 border-purple-300 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/50 shadow-inner placeholder:text-purple-300 transition-all"
                        placeholder="Ton prénom..."
                        required
                    />

                    <button
                        type="submit"
                        className="btn-3d w-full mt-4 py-5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full flex items-center justify-center space-x-3 text-white shadow-[0_0_30px_rgba(250,204,21,0.6)] group"
                    >
                        <span className="text-2xl font-black tracking-widest text-shadow group-hover:scale-110 transition-transform">
                            JOUER
                        </span>
                        <ArrowRight className="w-8 h-8 stroke-[3] group-hover:translate-x-2 transition-transform" />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
