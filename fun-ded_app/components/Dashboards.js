// components/Navbar.js
"use client";
import Link from "next/link";

export default function Navbar({ activeTab, pageDots = 4, activeDot = 0 }) {
    const tabs = ["Overview", "Transaction", "Goals", "Shop"];

    return (
        <nav className="w-full pt-6 pb-2 bg-white sticky top-0 z-10">
            {/* Tab Links */}
            <div className="flex justify-center gap-6 md:gap-12 mb-4">
                {tabs.map((tab) => (
                    <Link
                        key={tab}
                        href={`/${tab.toLowerCase()}`}
                        className={`text-lg md:text-xl transition-all ${
                            activeTab === tab
                                ? "font-bold border-b-2 border-black pb-1"
                                : "text-gray-500 hover:text-black"
                        }`}
                    >
                        {tab}
                    </Link>
                ))}
            </div>
            ß{/* Pagination Dots */}
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

// BarChartCard Component
export function BarChartCard({ title, data }) {
    const maxValue = Math.max(...data);

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            <div className="flex items-end justify-center gap-2 h-48">
                {data.map((value, index) => (
                    <div
                        key={index}
                        className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{
                            height: `${(value / maxValue) * 100}%`,
                            minHeight: "4px",
                        }}
                        title={`Day ${index + 1}: ${value}`}
                    />
                ))}
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
                Total: {data.reduce((a, b) => a + b, 0)}
            </div>
        </div>
    );
}

// GoalTracker Component
export function GoalTracker({ goalNumber, milestones }) {
    const currentProgress = Math.floor(
        Math.random() * milestones[milestones.length - 1],
    );
    const targetMilestone = milestones[milestones.length - 1];
    const progressPercentage = (currentProgress / targetMilestone) * 100;

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Goal #{goalNumber}</h3>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>
                        {currentProgress} / {targetMilestone}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-green-500 h-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Milestones */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                    Milestones:
                </p>
                <div className="flex gap-2">
                    {milestones.map((milestone, index) => (
                        <div
                            key={index}
                            className={`flex-1 text-center py-2 rounded transition-colors ${
                                currentProgress >= milestone
                                    ? "bg-green-100 text-green-700 font-semibold"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {milestone}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
