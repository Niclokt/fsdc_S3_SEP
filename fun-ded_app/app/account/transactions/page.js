// app/transactions/page.js
"use client";
import { useState, useEffect } from "react";
import {
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchCategories,
} from "@/lib/supabase-client";

export default function TransactionPage() {
    const [list, setList] = useState([]);
    const [categories, setCategories] = useState([]);

    // Load Data
    useEffect(() => {
        const load = async () => {
            const { data } = await fetchTransactions("current-user-id");
            setList(data || []);
            const { data: categoriesData } = await fetchCategories();
            setCategories(categoriesData || []);
        };
        load();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side: New Transaction Form */}
                <section className="flex-1 bg-gray-200 p-6 rounded-2xl h-fit">
                    <h3 className="font-bold mb-4 text-gray-600">
                        New Transaction
                    </h3>
                    <div className="space-y-3">
                        {[
                            "Date",
                            "Amount",
                            "Description",
                            "Category",
                            "Payment Mode",
                        ].map((field) =>
                            field === "Category" ? (
                                <select
                                    key={field}
                                    className="w-full p-4 bg-gray-400 rounded-xl"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    key={field}
                                    type={
                                        field === "Date"
                                            ? "date"
                                            : field === "Amount"
                                              ? "number"
                                              : "text"
                                    }
                                    step={
                                        field === "Amount" ? "0.01" : undefined
                                    }
                                    placeholder={field}
                                    maxLength={
                                        field === "Description"
                                            ? 300
                                            : undefined
                                    }
                                    onChange={(e) => {
                                        if (
                                            field === "Amount" &&
                                            e.target.value.includes(".")
                                        ) {
                                            const [integer, decimal] =
                                                e.target.value.split(".");
                                            if (decimal.length > 2) {
                                                e.target.value = `${integer}.${decimal.slice(0, 2)}`;
                                            }
                                        }
                                    }}
                                    className="w-full p-4 bg-gray-400 rounded-xl placeholder-black"
                                />
                            ),
                        )}
                        <button className="w-full bg-black text-white p-4 rounded-xl mt-2">
                            Add Transaction
                        </button>
                    </div>
                </section>

                {/* Right Side: Transaction History with Swipe-to-Edit */}
                <section className="flex-[1.5]">
                    <h3 className="font-bold mb-4">Transaction History</h3>
                    <div className="space-y-4">
                        {list.map((item) => (
                            <div
                                key={item.id}
                                className="relative group overflow-hidden rounded-xl"
                            >
                                {/* Swipe Action Layer (Hidden by default, revealed on hover/swipe) */}
                                <div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-4 transition-transform translate-x-full group-hover:translate-x-0">
                                    <button className="bg-white p-2 rounded shadow">
                                        ✎
                                    </button>
                                    <button
                                        onClick={() =>
                                            deleteTransaction(item.id)
                                        }
                                        className="bg-white p-2 rounded shadow"
                                    >
                                        🗑
                                    </button>
                                </div>
                                {/* Main Card */}
                                <div className="bg-gray-400 p-4 flex justify-between items-center transition-transform group-hover:-translate-x-24">
                                    <div>
                                        <p className="text-xs">{item.date}</p>
                                        <p className="font-bold">
                                            {item.description}
                                        </p>
                                    </div>
                                    <span className="text-xl font-bold">
                                        {item.amount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
