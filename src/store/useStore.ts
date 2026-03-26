import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ObjectCategory = string;
export type Purpose = "toy" | "deco" | "activity" | "coloring";
export type Beneficiary = "myself" | "friend1" | "friend2" | "surprise";

export interface Creation {
    id: string;
    date: string;
    category: string;
    purpose: Purpose;
    beneficiary: Beneficiary;
    imagePath: string;
}

interface AppState {
    userName: string;
    candies: number;
    capturedImage: string | null;
    detectedCategory: ObjectCategory | null;
    selectedPurpose: Purpose;
    selectedBeneficiary: Beneficiary;
    resultImageIndex: number;
    creations: Creation[];
    setUserName: (name: string) => void;
    addCandies: (amount: number) => void;
    setCapturedImage: (image: string | null) => void;
    setDetectedCategory: (category: ObjectCategory | null) => void;
    setSelectedPurpose: (purpose: Purpose) => void;
    setSelectedBeneficiary: (beneficiary: Beneficiary) => void;
    setResultImageIndex: (index: number) => void;
    addCreation: (creation: Omit<Creation, "id" | "date">) => void;
    resetGameState: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            userName: "",
            candies: 10,
            capturedImage: null,
            detectedCategory: null,
            selectedPurpose: "toy",
            selectedBeneficiary: "myself",
            resultImageIndex: 0,
            creations: [],
            setUserName: (name) => set({ userName: name }),
            addCandies: (amount) =>
                set((state) => ({ candies: state.candies + amount })),
            setCapturedImage: (image) => set({ capturedImage: image }),
            setDetectedCategory: (category) =>
                set({ detectedCategory: category }),
            setSelectedPurpose: (purpose) => set({ selectedPurpose: purpose }),
            setSelectedBeneficiary: (beneficiary) =>
                set({ selectedBeneficiary: beneficiary }),
            setResultImageIndex: (index) => set({ resultImageIndex: index }),
            addCreation: (creation) =>
                set((state) => ({
                    creations: [
                        {
                            ...creation,
                            id: Date.now().toString(),
                            date: new Date().toLocaleDateString("fr-FR"),
                        },
                        ...state.creations,
                    ],
                })),
            resetGameState: () =>
                set({ capturedImage: null, detectedCategory: null }),
        }),
        {
            name: "recyclo-magix-store",
            // On ne persiste PAS capturedImage (trop lourd pour localStorage)
            partialize: (state) => ({
                userName: state.userName,
                candies: state.candies,
                creations: state.creations,
            }),
        },
    ),
);
