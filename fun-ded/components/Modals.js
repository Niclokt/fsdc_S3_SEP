// components/Modals.js
"use client";

export function SuccessModal({ isOpen, onClose, productName, newBalance }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center shadow-2xl relative">
                <p className="text-center text-lg mb-6">
                    You’ve successfully redeemed <br />
                    <span className="font-bold">{productName}!</span>
                </p>

                {/* Product Image Placeholder */}
                <div className="w-48 h-64 bg-gray-200 rounded-2xl mb-6 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-2xl">✦</span>
                        <span className="text-2xl font-bold">50</span>
                    </div>
                    <div className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
                        Redeemed!
                    </div>
                </div>

                <p className="text-lg mb-12">
                    New Balance: <span className="text-xl">✦</span>{" "}
                    <span className="font-bold text-xl">{newBalance}</span>
                </p>

                {/* Dismiss Button */}
                <button
                    onClick={onClose}
                    className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <span className="text-2xl font-light">✕</span>
                </button>
            </div>
        </div>
    );
}
