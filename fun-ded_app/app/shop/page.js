// Shop Page Component

"use client";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function ShopPage() {
    const [points, setPoints] = useState(60);
    const [redeemed, setRedeemed] = useState(null);

    const handleRedeem = (product) => {
        if (points >= product.cost) {
            setPoints((prev) => prev - product.cost);
            setRedeemed(product.name);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 text-center">
            <Navbar activeTab="Shop" />
            <div className="flex justify-center gap-8 mb-8">
                <span>🔥 365</span>
                <span>✨ {points}</span>
            </div>

            <div className="space-y-4">
                {[
                    { name: "Product #1", cost: 50 },
                    { name: "Product #2", cost: 100 },
                ].map((p) => (
                    <div
                        key={p.name}
                        className="bg-gray-200 p-8 rounded-2xl flex justify-between items-center"
                    >
                        <span>✨ {p.cost}</span>
                        <button
                            onClick={() => handleRedeem(p)}
                            className="bg-black text-white px-4 py-2 rounded-lg"
                        >
                            Redeem
                        </button>
                    </div>
                ))}
            </div>

            {/* Screen 7: Success Modal */}
            {redeemed && (
                <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8">
                    <h2 className="mb-4 text-lg">
                        You've successfully redeemed {redeemed}!
                    </h2>
                    <div className="w-48 h-64 bg-gray-200 rounded-xl mb-4" />
                    <p className="font-bold mb-12">New Balance: ✨ {points}</p>
                    <button
                        onClick={() => setRedeemed(null)}
                        className="text-3xl border-2 rounded-full w-12 h-12"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
