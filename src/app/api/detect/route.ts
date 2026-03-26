import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 },
            );
        }

        // 1. Lire dynamiquement les catégories (dossiers dans public/objects)
        const objectsDir = path.join(process.cwd(), "public", "objects");
        let validCategories: string[] = [];
        try {
            if (fs.existsSync(objectsDir)) {
                validCategories = fs.readdirSync(objectsDir).filter((file) => {
                    return fs
                        .statSync(path.join(objectsDir, file))
                        .isDirectory();
                });
            }
        } catch (e) {
            console.error("Impossible de lire les dossiers objets", e);
        }

        if (validCategories.length === 0) {
            validCategories = ["plasticBottle", "cardboardBox"]; // fallback de sureté
        }
        validCategories.push("other");

        const PROMPT = `Tu es une IA de recyclage pour un jeu d'enfants. Voici une image.
Identifie l'objet principal dans l'image et REponds UNIQUEMENT par l'un de ces mots exacts (respecte bien les majuscules s'il y en a) : 
${validCategories.join(", ")}

Ne renvoie aucune autre phrase, ni ponctuation. JUSTE LE MOT EXACT.`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            // Mock
            const mockCategory =
                validCategories.filter((c) => c !== "other")[0] || "other";
            return NextResponse.json({ category: mockCategory, mock: true });
        }

        const ai = new GoogleGenAI({ apiKey });

        const base64Data = imageBase64.replace(
            /^data:image\/[a-z]+;base64,/,
            "",
        );

        // Détecter le vrai mimeType depuis le data URL
        const mimeMatch = imageBase64.match(/^data:(image\/[a-z+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        console.log(
            `[detect] image size: ${Math.round(base64Data.length / 1024)}KB, mimeType: ${mimeType}`,
        );

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType as
                                    | "image/jpeg"
                                    | "image/png"
                                    | "image/webp",
                                data: base64Data,
                            },
                        },
                        { text: PROMPT },
                    ],
                },
            ],
        });

        let rawText = "other";
        const textValue = response.text;
        if (typeof textValue === "string") {
            rawText = textValue.trim();
        }
        console.log(`[detect] Gemini raw response: "${rawText}"`);

        // Vérifier si la réponse de l'IA fait bien partie de nos dossiers (en enlevant les retours à la ligne éventuels)
        const matchedCategory =
            validCategories.find(
                (c) => c.toLowerCase() === rawText.toLowerCase(),
            ) || "other";

        return NextResponse.json({ category: matchedCategory });
    } catch (error) {
        console.error("Gemini detection error:", error);
        return NextResponse.json(
            {
                error: "Detection failed",
                category: "other",
                details: String(error),
            },
            { status: 500 },
        );
    }
}
