import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const purpose = searchParams.get("purpose");

    const fallbackImage =
        "https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=1080&auto=format&fit=crop";

    if (!category || !purpose) {
        return NextResponse.json({ image: fallbackImage });
    }

    try {
        const dirPath = path.join(
            process.cwd(),
            "public",
            "objects",
            category,
            purpose,
        );

        if (!fs.existsSync(dirPath)) {
            return NextResponse.json({ image: fallbackImage });
        }

        const files = fs.readdirSync(dirPath);
        const imageFiles = files.filter((f) =>
            f.match(/\.(jpg|jpeg|png|webp|gif)$/i),
        );

        if (imageFiles.length === 0) {
            return NextResponse.json({ image: fallbackImage });
        }

        const randomFile =
            imageFiles[Math.floor(Math.random() * imageFiles.length)];
        return NextResponse.json({
            image: `/objects/${category}/${purpose}/${randomFile}`,
        });
    } catch (error) {
        console.error("Error reading dir:", error);
        return NextResponse.json({ image: fallbackImage });
    }
}
