// Overview Page Component
"use client";

export default function OverviewPage() {
    return (
        <main className="max-w-4xl mx-auto p-4">
            <div className="mt-8">
                <h2 className="text-2xl">Hello,</h2>
                <h1 className="text-4xl font-bold">Sohee</h1>
            </div>

            {/* Grid Layout: Stacks on Mobile, 2x2 on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <DashboardCard title="Past 14 days" type="bar" />
                <DashboardCard title="Budget Balance: $300" type="progress" />
                <DashboardCard title="MoM" type="chart" />
                <DashboardCard title="WoW" type="chart" />
            </div>
        </main>
    );
}

function DashboardCard({ title, type }) {
    return (
        <div className="bg-gray-200 p-4 rounded-2xl min-h-[150px]">
            <p className="text-sm font-mono mb-2">{title}</p>
            {/* Placeholder for visual charts */}
            <div className="w-full h-24 bg-gray-300 rounded-lg flex items-center justify-center italic text-gray-500">
                {type} visualization
            </div>
        </div>
    );
}
