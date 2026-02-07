// app/goals/page.js
"use client";
import Navbar from "@/components/Navbar";
import { BarChartCard, GoalTracker } from "@/components/Dashboards";

export default function GoalsPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 pb-12">
            {/* Navigation - Highlighted dot is index 2 for Goals */}
            <Navbar activeTab="Goals" activeDot={2} />

            {/* Gamification Stats Header */}
            <div className="flex justify-center items-center gap-10 mt-8 mb-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="text-3xl font-bold italic">365</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">✦</span>
                    <span className="text-3xl font-bold italic">60</span>
                </div>
            </div>

            {/* Goal Visualizations */}
            <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
                {/* Goal #1: Bar Chart Visualization */}
                <div className="w-full">
                    <BarChartCard
                        title="Goal #1"
                        data={[3, 5, 6, 2, 8, 4, 7, 5, 4, 3, 6, 5, 2, 4]}
                    />
                </div>

                {/* Goal #2: Milestone Tracker */}
                <GoalTracker goalNumber="2" milestones={[10, 20, 30]} />

                {/* Goal #3: Milestone Tracker */}
                <GoalTracker goalNumber="3" milestones={[10, 20, 30]} />
            </div>
        </main>
    );
}
