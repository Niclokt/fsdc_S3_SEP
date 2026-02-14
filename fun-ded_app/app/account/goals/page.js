// app/goals/page.js
"use client";
import { memo, useState, useEffect } from "react";
import { BarChartCard, GoalTracker } from "@/components/Dashboards";
import { supabase } from "@/lib/supabase-client";

// Utility function to check if two dates are consecutive days
const isConsecutiveDay = (lastDate, currentDate) => {
    const last = new Date(lastDate);
    const today = new Date(currentDate);
    const diffTime = Math.abs(today - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};

// Update user streak in database
const updateUserStreak = async (userId) => {
    try {
        // Fetch current streak record
        const { data: streakRecord, error: fetchError } = await supabase
            .from("userStreak")
            .select("StreakCount, LastLoginDate")
            .eq("UserId", userId)
            .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

        const today = new Date().toISOString().split("T")[0];
        let newStreakCount = 1;

        if (streakRecord) {
            const lastLogin = streakRecord.LastLoginDate;
            const lastLoginDate = new Date(lastLogin)
                .toISOString()
                .split("T")[0];

            // If user logged in today, no update needed
            if (lastLoginDate === today) {
                return streakRecord.StreakCount;
            }

            // Check if login is consecutive day
            if (isConsecutiveDay(lastLogin, new Date())) {
                newStreakCount = streakRecord.StreakCount + 1;
            }

            // Update existing record
            const { error: updateError } = await supabase
                .from("userStreak")
                .update({
                    StreakCount: newStreakCount,
                    LastLoginDate: new Date().toISOString(),
                })
                .eq("UserId", userId);

            if (updateError) throw updateError;
        } else {
            // Create new streak record
            const { error: insertError } = await supabase
                .from("userStreak")
                .insert([
                    {
                        UserId: userId,
                        StreakCount: 1,
                        LastLoginDate: new Date().toISOString(),
                    },
                ]);

            if (insertError) throw insertError;
        }

        return newStreakCount;
    } catch (error) {
        console.error("Error updating streak:", error);
        return 0;
    }
};

// Memoized streak display component
const StreakDisplay = memo(({ count }) => (
    <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <span className="text-3xl font-bold italic">{count}</span>
    </div>
));

StreakDisplay.displayName = "StreakDisplay";

export default function GoalsPage() {
    const [streakCount, setStreakCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeStreak = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                    setLoading(false);
                    return;
                }

                const userId = session.user.id;
                const count = await updateUserStreak(userId);
                setStreakCount(count);
            } catch (error) {
                console.error("Error initializing streak:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeStreak();
    }, []);

    return (
        <main className="max-w-4xl mx-auto px-6 pb-12">
            {/* Gamification Stats Header */}
            <div className="flex justify-center items-center gap-10 mt-8 mb-10">
                {loading ? (
                    <div className="flex items-center gap-2 animate-pulse">
                        <span className="text-2xl">🔥</span>
                        <span className="text-3xl font-bold italic text-gray-400">-</span>
                    </div>
                ) : (
                    <StreakDisplay count={streakCount} />
                )}
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
