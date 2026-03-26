"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Navigation, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const COLLECTION_POINTS = [
    {
        id: 1,
        name: "École des Lilas",
        type: "♻️",
        desc: "Collecte plastique & carton",
        offsetLat: 0.003,
        offsetLng: 0.005,
    },
    {
        id: 2,
        name: "Mairie du quartier",
        type: "🗑️",
        desc: "Déchèterie mobile chaque lundi",
        offsetLat: -0.004,
        offsetLng: 0.002,
    },
    {
        id: 3,
        name: "Supermarché BioVert",
        type: "🛒",
        desc: "Reprise bouteilles & emballages",
        offsetLat: 0.001,
        offsetLng: -0.006,
    },
    {
        id: 4,
        name: "Parc des Étoiles",
        type: "🌱",
        desc: "Composteur collectif ouvert",
        offsetLat: -0.002,
        offsetLng: -0.003,
    },
    {
        id: 5,
        name: "Bibliothèque Centrale",
        type: "📚",
        desc: "Dépôt jouets & livres recyclés",
        offsetLat: 0.005,
        offsetLng: -0.001,
    },
];

export default function CarteScreen() {
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">(
        "loading",
    );
    const [selected, setSelected] = useState<
        (typeof COLLECTION_POINTS)[0] | null
    >(null);

    useEffect(() => {
        let map: import("leaflet").Map | null = null;

        const initMap = async (lat: number, lng: number) => {
            const L = (await import("leaflet")).default;

            // Fix marker icons (Next.js bundling issue)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            if (!mapRef.current) return;

            map = L.map(mapRef.current, { zoomControl: false }).setView(
                [lat, lng],
                15,
            );

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap",
            }).addTo(map);

            // Marker position utilisateur
            const userIcon = L.divIcon({
                html: `<div style="width:20px;height:20px;border-radius:50%;background:#a855f7;border:3px solid white;box-shadow:0 0 10px rgba(168,85,247,0.8)"></div>`,
                className: "",
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            });
            L.marker([lat, lng], { icon: userIcon })
                .addTo(map)
                .bindPopup("📍 Tu es ici !")
                .openPopup();

            // Points de collecte
            COLLECTION_POINTS.forEach((point) => {
                const pLat = lat + point.offsetLat;
                const pLng = lng + point.offsetLng;

                const icon = L.divIcon({
                    html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">${point.type}</div>`,
                    className: "",
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

                L.marker([pLat, pLng], { icon })
                    .addTo(map!)
                    .on("click", () => setSelected(point));
            });

            setStatus("ready");
        };

        navigator.geolocation.getCurrentPosition(
            (pos) => initMap(pos.coords.latitude, pos.coords.longitude),
            () => {
                // Fallback : Paris centre
                initMap(48.8566, 2.3522);
            },
            { timeout: 5000 },
        );

        return () => {
            map?.remove();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex items-center space-x-3">
                <button
                    onClick={() => router.back()}
                    className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/50"
                >
                    <ArrowLeft
                        className="w-6 h-6 text-purple-700"
                        strokeWidth={3}
                    />
                </button>
                <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-white/50 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-pink-500" />
                    <span className="font-black text-purple-800 text-lg tracking-wide">
                        POINTS DE COLLECTE
                    </span>
                </div>
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1 w-full" style={{ zIndex: 1 }} />

            {/* Loading overlay */}
            {status === "loading" && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center space-y-4 z-[999]">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    <p className="font-black text-purple-700 text-xl">
                        Chargement de la carte...
                    </p>
                    <p className="text-purple-500 text-sm">
                        Autorise la localisation si demandé 📍
                    </p>
                </div>
            )}

            {/* Selected point panel */}
            {selected && (
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-0 left-0 right-0 z-[1000] p-5"
                >
                    <div className="bg-white rounded-3xl p-5 shadow-2xl border-4 border-purple-200 relative">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-4 right-4 text-gray-400 font-black text-xl w-8 h-8 flex items-center justify-center"
                        >
                            ✕
                        </button>
                        <div className="flex items-center space-x-4">
                            <span className="text-5xl">{selected.type}</span>
                            <div>
                                <p className="font-black text-purple-800 text-xl leading-tight">
                                    {selected.name}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {selected.desc}
                                </p>
                            </div>
                        </div>
                        <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl flex items-center justify-center space-x-2">
                            <Navigation className="w-5 h-5" />
                            <span>Y aller !</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Leaflet CSS */}
            <style>{`
                @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
            `}</style>
        </div>
    );
}
