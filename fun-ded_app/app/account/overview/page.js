// Overview Page Component
"use client";

import { memo } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    ProgressBar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Mock data for charts
const spending14DaysData = [
    { day: "Day 1", amount: 45 },
    { day: "Day 2", amount: 52 },
    { day: "Day 3", amount: 38 },
    { day: "Day 4", amount: 61 },
    { day: "Day 5", amount: 55 },
    { day: "Day 6", amount: 48 },
    { day: "Day 7", amount: 42 },
    { day: "Day 8", amount: 59 },
    { day: "Day 9", amount: 46 },
    { day: "Day 10", amount: 50 },
    { day: "Day 11", amount: 53 },
    { day: "Day 12", amount: 44 },
    { day: "Day 13", amount: 57 },
    { day: "Day 14", amount: 62 },
];

const momSpendingData = [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1450 },
    { month: "Mar", amount: 1100 },
    { month: "Apr", amount: 1600 },
    { month: "May", amount: 1350 },
    { month: "Jun", amount: 1500 },
];

const wowSpendingData = [
    { week: "Week 1", amount: 320 },
    { week: "Week 2", amount: 400 },
    { week: "Week 3", amount: 280 },
    { week: "Week 4", amount: 450 },
];

// Memoized components to prevent unnecessary re-renders
const SpendingBarChart = memo(() => (
    <ResponsiveContainer width="100%" height={200}>
        <BarChart data={spending14DaysData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
    </ResponsiveContainer>
));

SpendingBarChart.displayName = "SpendingBarChart";

const BudgetProgressCard = memo(() => {
    const spent = 300;
    const budget = 500;
    const percentage = (spent / budget) * 100;

    return (
        <div className="w-full h-24 flex flex-col justify-center">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Spent: ${spent}</span>
                <span className="text-sm text-gray-600">Budget: ${budget}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-gray-600 mt-1">
                {percentage.toFixed(0)}% used
            </p>
        </div>
    );
});

BudgetProgressCard.displayName = "BudgetProgressCard";

const MomChart = memo(() => (
    <ResponsiveContainer width="100%" height={200}>
        <LineChart data={momSpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
            />
        </LineChart>
    </ResponsiveContainer>
));

MomChart.displayName = "MomChart";

const WowChart = memo(() => (
    <ResponsiveContainer width="100%" height={200}>
        <LineChart data={wowSpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
                type="monotone"
                dataKey="amount"
                stroke="#f59e0b"
                strokeWidth={2}
            />
        </LineChart>
    </ResponsiveContainer>
));

WowChart.displayName = "WowChart";

export default function OverviewPage() {
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
                    component={<SpendingBarChart />}
                />
                <DashboardCard
                    title="Current Month Budget Balance"
                    component={<BudgetProgressCard />}
                />
                <DashboardCard
                    title="Month on Month Spending"
                    component={<MomChart />}
                />
                <DashboardCard
                    title="Week on Week Spending"
                    component={<WowChart />}
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
