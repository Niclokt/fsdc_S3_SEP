"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ activeTab, pageDots = 4, activeDot = 0 }) {
    const tabs = ["Overview", "Transactions", "Goals", "Shop"];
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return (
        <nav className="w-full pt-6 pb-2 bg-white sticky top-0 z-10">
            {/* Top Bar: Tabs and Logout Button */}
            {/* Added: flex-wrap to prevent overflow and justify-center for centering */}
            <div className="flex flex-wrap justify-between items-center mb-4 px-4 gap-y-2">
                {/* Tab Links */}
                {/* Updated: Added flex-grow-0 to the inner div to keep it centered properly */}
                <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-12 flex-1 overflow-x-auto whitespace-nowrap no-scrollbar px-2">
                    {tabs.map((tab) => (
                        <Link
                            key={tab}
                            href={`/account/${tab.toLowerCase()}`}
                            className={`text-sm sm:text-base md:text-xl transition-all border-b-2 pb-1 ${
                                activeTab === tab
                                    ? "font-bold text-gray-800 border-black"
                                    : "text-gray-500 hover:text-black border-transparent"
                            }`}
                        >
                            {tab}
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                {/* Updated: shrink-0 ensures the button doesn't squash on small screens */}
                <button
                    onClick={handleLogout}
                    className="flex-shrink-0 ml-2 sm:ml-4 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                    Logout
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2">
                {[...Array(pageDots)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                            activeDot === i ? "bg-gray-600" : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </nav>
    );
}
