// components/Navbar.js
"use client";
import Link from "next/link";

export default function Navbar({ activeTab, pageDots = 4, activeDot = 0 }) {
    const tabs = ["Overview", "Transactions", "Goals", "Shop"];

    return (
        <nav className="w-full pt-6 pb-2 bg-white sticky top-0 z-10">
            {/* Tab Links */}
            <div className="flex justify-center gap-6 md:gap-12 mb-4">
                {tabs.map((tab) => (
                    <Link
                        key={tab}
                        href={`/account/${tab.toLowerCase()}`}
                        className={`text-lg md:text-xl transition-all ${
                            activeTab === tab
                                ? "font-bold text-gray-800 border-b-2 border-black pb-1"
                                : "text-gray-500 hover:text-black"
                        }`}
                    >
                        {tab}
                    </Link>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2">
                {[...Array(pageDots)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            activeDot === i ? "bg-gray-600" : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </nav>
    );
}
