// Overview Page Component
"use client";

import { memo, useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase-client";

// Utility functions for date calculations
const getDateRange = (days) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return { start, end };
};

const getCurrentMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startOfMonth, endOfMonth };
};

const getPreviousMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startOfMonth, endOfMonth };
};

// Aggregate spending data by day
const aggregateByDay = (transactions) => {
    const dayMap = new Map();
    transactions.forEach((tx) => {
        const date = new Date(tx.TransactionDate).toLocaleDateString();
        dayMap.set(date, (dayMap.get(date) || 0) + parseFloat(tx.Amount || 0));
    });
    return Array.from(dayMap, ([date, amount]) => ({ day: date, amount }));
};

// Aggregate spending data by month
const aggregateByMonth = (transactions) => {
    const monthMap = new Map();
    transactions.forEach((tx) => {
        const date = new Date(tx.TransactionDate);
        const monthKey = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
        monthMap.set(
            monthKey,
            (monthMap.get(monthKey) || 0) + parseFloat(tx.Amount || 0),
        );
    });
    return Array.from(monthMap, ([month, amount]) => ({ month, amount }));
};

// Aggregate spending data by week
const aggregateByWeek = (transactions) => {
    const weekMap = new Map();
    transactions.forEach((tx) => {
        const date = new Date(tx.TransactionDate);
        const weekNum = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNum}`;
        weekMap.set(
            weekKey,
            (weekMap.get(weekKey) || 0) + parseFloat(tx.Amount || 0),
        );
    });
    return Array.from(weekMap, ([week, amount]) => ({ week, amount }));
};

// Memoized chart components
const SpendingBarChart = memo(({ data = [] }) => (
    <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Bar dataKey="amount" fill="#3b82f6" isAnimationActive={false} />
        </BarChart>
    </ResponsiveContainer>
));

SpendingBarChart.displayName = "SpendingBarChart";

const BudgetProgressCard = memo(({ spent = 0, budget = 500 }) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    return (
        <div className="w-full h-24 flex flex-col justify-center">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">
                    Spent: ${spent.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">Budget: ${budget}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <p className="text-xs text-gray-600 mt-1">
                {percentage.toFixed(0)}% used
            </p>
        </div>
    );
});

BudgetProgressCard.displayName = "BudgetProgressCard";

const MomChart = memo(({ data = [] }) => (
    <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                isAnimationActive={false}
            />
        </LineChart>
    </ResponsiveContainer>
));

MomChart.displayName = "MomChart";

const WowChart = memo(({ data = [] }) => (
    <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Line
                type="monotone"
                dataKey="amount"
                stroke="#f59e0b"
                strokeWidth={2}
                isAnimationActive={false}
            />
        </LineChart>
    </ResponsiveContainer>
));

WowChart.displayName = "WowChart";

export default function OverviewPage() {
    const [spending14Days, setSpending14Days] = useState([]);
    const [budgetSpent, setBudgetSpent] = useState(0);
    const [momData, setMomData] = useState([]);
    const [wowData, setWowData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user session
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                    console.warn("No active session");
                    setLoading(false);
                    return;
                }

                const userId = session.user.id;

                // Fetch all transactions for the user
                const { data: allTransactions, error } = await supabase
                    .from("transaction")
                    .select("TransactionDate, Amount")
                    .eq("UserId", userId)
                    .order("TransactionDate", { ascending: false });

                if (error) throw error;

                if (!allTransactions || allTransactions.length === 0) {
                    setLoading(false);
                    return;
                }

                // Filter for past 14 days
                const { start: start14 } = getDateRange(14);
                const last14Days = allTransactions.filter((tx) => {
                    const txDate = new Date(tx.TransactionDate);
                    return txDate >= start14;
                });
                setSpending14Days(aggregateByDay(last14Days));

                // Calculate current month spending
                const { startOfMonth, endOfMonth } = getCurrentMonth();
                const currentMonthTx = allTransactions.filter((tx) => {
                    const txDate = new Date(tx.TransactionDate);
                    return txDate >= startOfMonth && txDate <= endOfMonth;
                });
                const currentMonthSpent = currentMonthTx.reduce(
                    (sum, tx) => sum + parseFloat(tx.Amount || 0),
                    0,
                );
                setBudgetSpent(currentMonthSpent);

                // Month-on-month comparison (last 6 months)
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
                sixMonthsAgo.setDate(1);

                const last6Months = allTransactions.filter((tx) => {
                    const txDate = new Date(tx.TransactionDate);
                    return txDate >= sixMonthsAgo;
                });
                setMomData(aggregateByMonth(last6Months));

                // Week-on-week comparison (current month only)
                setWowData(aggregateByWeek(currentMonthTx));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto p-4">
                <div className="mt-8">
                    <h2 className="text-2xl">Hello,</h2>
                    <h1 className="text-4xl font-bold">Sohee</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 p-6 rounded-2xl animate-pulse h-72"
                        />
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto p-4">
            <div className="mt-8">
                <h2 className="text-2xl">Hello,</h2>
                <h1 className="text-4xl font-bold">Sohee</h1>
            </div>

            {/* Grid Layout: Stacks on Mobile, 2x2 on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <DashboardCard
                    title="Spending Over Past 14 Days"
                    component={<SpendingBarChart data={spending14Days} />}
                />
                <DashboardCard
                    title="Current Month Budget Balance"
                    component={
                        <BudgetProgressCard spent={budgetSpent} budget={1500} />
                    }
                />
                <DashboardCard
                    title="Month on Month Spending"
                    component={<MomChart data={momData} />}
                />
                <DashboardCard
                    title="Week on Week Spending"
                    component={<WowChart data={wowData} />}
                />
            </div>
        </main>
    );
}

const DashboardCard = memo(({ title, component }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">
            {title}
        </p>
        <div className="w-full">{component}</div>
    </div>
));

DashboardCard.displayName = "DashboardCard";
