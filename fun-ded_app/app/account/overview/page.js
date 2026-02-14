// Overview Page Component
"use client";

import { memo, useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
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

// Aggregate spending data by day (sorted ascending, includes all 14 days)
const aggregateByDay = (transactions, startDate) => {
    const dayMap = new Map();
    transactions.forEach((tx) => {
        const date = new Date(tx.TransactionDate).toLocaleDateString();
        dayMap.set(date, (dayMap.get(date) || 0) + parseFloat(tx.Amount || 0));
    });

    // Generate all 14 days from startDate
    const allDays = [];
    for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toLocaleDateString();
        allDays.push({
            day: dateStr,
            amount: dayMap.get(dateStr) || 0,
        });
    }
    return allDays;
};

// Aggregate spending data by month (sorted ascending)
const aggregateByMonth = (transactions) => {
    const monthMap = new Map();
    const monthKeys = new Map();
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
        monthKeys.set(
            monthKey,
            new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        );
    });
    return Array.from(monthMap, ([month, amount]) => ({
        month,
        amount,
        sortKey: monthKeys.get(month),
    }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ month, amount }) => ({ month, amount }));
};

// Aggregate spending data by week (sorted ascending)
const aggregateByWeek = (transactions) => {
    const weekMap = new Map();
    const weekKeys = new Map();
    transactions.forEach((tx) => {
        const date = new Date(tx.TransactionDate);
        const weekNum = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNum}`;
        weekMap.set(
            weekKey,
            (weekMap.get(weekKey) || 0) + parseFloat(tx.Amount || 0),
        );
        weekKeys.set(weekKey, weekNum);
    });
    return Array.from(weekMap, ([week, amount]) => ({
        week,
        amount,
        sortKey: weekKeys.get(week),
    }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ week, amount }) => ({ week, amount }));
};

// Aggregate spending data by category (for pie chart)
const aggregateByCategory = (transactions) => {
    const categoryMap = new Map();
    transactions.forEach((tx) => {
        const category = tx.Category || "Uncategorized";
        categoryMap.set(
            category,
            (categoryMap.get(category) || 0) + parseFloat(tx.Amount || 0),
        );
    });
    return Array.from(categoryMap, ([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
    }));
};

// Memoized chart components
const SpendingBarChart = memo(({ data = [] }) => (
    <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
                contentStyle={{
                    backgroundColor: "#1f2937",
                    borderRadius: "12px",
                    border: "none",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => `$${value.toFixed(2)}`}
            />
            <Bar
                dataKey="amount"
                fill="#3b82f6"
                isAnimationActive={false}
                radius={[8, 8, 0, 0]}
            />
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
            <Tooltip
                contentStyle={{
                    backgroundColor: "#1f2937",
                    borderRadius: "12px",
                    border: "none",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => `$${value.toFixed(2)}`}
            />
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
            <Tooltip
                contentStyle={{
                    backgroundColor: "#1f2937",
                    borderRadius: "12px",
                    border: "none",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => `$${value.toFixed(2)}`}
            />
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

// Color palette for pie chart
const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
];

const CategoryPieChart = memo(({ data = [] }) => (
    <ResponsiveContainer width="100%" height={250}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
            >
                {data.map((_, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                    />
                ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        </PieChart>
    </ResponsiveContainer>
));

CategoryPieChart.displayName = "CategoryPieChart";

export default function OverviewPage() {
    const [spending14Days, setSpending14Days] = useState([]);
    const [budgetSpent, setBudgetSpent] = useState(0);
    const [momData, setMomData] = useState([]);
    const [wowData, setWowData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
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
                    .select("TransactionDate, Amount, Category")
                    .eq("UserId", userId)
                    .order("TransactionDate", { ascending: false });

                if (error) throw error;

                if (!allTransactions || allTransactions.length === 0) {
                    setLoading(false);
                    return;
                }

                // Filter for past 14 days (ascending order left to right)
                const { start: start14 } = getDateRange(14);
                const last14Days = allTransactions.filter((tx) => {
                    const txDate = new Date(tx.TransactionDate);
                    return txDate >= start14;
                });
                setSpending14Days(aggregateByDay(last14Days, start14));

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

                // Category breakdown for current month
                setCategoryData(aggregateByCategory(currentMonthTx));

                // Month-on-month comparison (last 6 months, ascending order)
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
                sixMonthsAgo.setDate(1);

                const last6Months = allTransactions.filter((tx) => {
                    const txDate = new Date(tx.TransactionDate);
                    return txDate >= sixMonthsAgo;
                });
                setMomData(aggregateByMonth(last6Months));

                // Week-on-week comparison (current month only, ascending order)
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
            <main className="max-w-6xl mx-auto p-4">
                <div className="mt-8">
                    <h2 className="text-2xl">Hello,</h2>
                    <h1 className="text-4xl font-bold">Sohee</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="md:col-span-2 bg-gray-200 p-6 rounded-2xl animate-pulse h-72" />
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
        <main className="max-w-6xl mx-auto p-4">
            <div className="mt-8">
                <h2 className="text-2xl">Hello,</h2>
                <h1 className="text-4xl font-bold">Sohee</h1>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Row 1: 14-Day Spending (spans 2 columns) */}
                <div className="md:col-span-2">
                    <DashboardCard
                        title="Spending Over Past 14 Days"
                        component={<SpendingBarChart data={spending14Days} />}
                    />
                </div>

                {/* Row 2: Category Pie Chart & Budget Progress */}
                <DashboardCard
                    title="Spending Breakdown by Category (Current Month)"
                    component={<CategoryPieChart data={categoryData} />}
                />
                <DashboardCard
                    title="Current Month Budget Balance"
                    component={
                        <BudgetProgressCard spent={budgetSpent} budget={1500} />
                    }
                />

                {/* Row 3: MoM & WoW */}
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
