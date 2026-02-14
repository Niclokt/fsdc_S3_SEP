// Grouped list without TotalSpent calculation in each month's header
"use client";
import { useState, useEffect } from "react";
import {
    supabase,
    fetchTransactions,
    createTransaction, // Used for saving
    fetchCategories,
    fetchPaymentModes,
    deleteTransaction,
} from "@/lib/supabase-client";

export default function TransactionPage() {
    const [list, setList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [userId, setUserId] = useState(null);

    // Get Current User ID
    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUserId(user?.id);
        };
        getUser();
    }, []);

    // 1. New Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0], // Defaults to today
        amount: "",
        description: "",
        category: "",
        paymentMode: "",
    });

    // Load Data - Now watches for userId to change from null to an actual ID
    useEffect(() => {
        if (!userId) return; // Don't run if we don't have a user yet

        const load = async () => {
            const [transRes, catRes, payModeRes] = await Promise.all([
                fetchTransactions(userId),
                fetchCategories(),
                fetchPaymentModes(),
            ]);

            setList(transRes.data || []);
            setCategories(catRes.data || []);
            setPaymentModes(payModeRes.data || []);
        };
        load();
    }, [userId]); // <--- The dependency array now includes userId

    // 2. Handle Input Changes
    const handleChange = (field, value) => {
        // Apply your decimal logic for amounts
        if (field === "amount" && value.includes(".")) {
            const [integer, decimal] = value.split(".");
            if (decimal.length > 2) value = `${integer}.${decimal.slice(0, 2)}`;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // 3. Submit to Supabase
    const handleAdd = async () => {
        if (!formData.amount || !formData.description)
            return alert("For goodness sake, Fill in the details!");

        // EXPLICIT MAPPING:
        // Left side = Supabase Column Name
        // Right side = React State Value
        const entryToSave = {
            //TransactionId: crypto.randomUUID(), // Unique ID for the transaction
            // CreatedDate:
            //     new Date().toISOString().replace("T", " ").split(".")[0] +
            //     "+00",
            UserId: userId,
            TransactionDate: formData.date,
            Amount: parseFloat(formData.amount), // Ensuring type safety
            Description: formData.description,
            DateModified:
                new Date().toISOString().replace("T", " ").split(".")[0] +
                "+00",
            Category: formData.category,
            PaymentMode: formData.paymentMode, // Mapping 'paymentMode' to 'payment_method'
        };

        // Debugging step
        console.log("Current User ID:", userId);
        console.log("Entry to Save:", entryToSave);

        // We no longer manually attach userId here!
        const { data, error } = await createTransaction(entryToSave);

        // Debugging step
        console.log("Supabase Response Data:", data);
        console.log("Supabase Response Error:", error);

        if (error) {
            console.error("Error saving:", error);
        } else {
            // Update UI list immediately and reset form
            setList([data[0], ...list]);
            setFormData({
                date: new Date().toISOString().split("T")[0],
                amount: "",
                description: "",
                category: "",
                paymentMode: "",
            });
        }
    };

    // Grouping Logic (can be memoized for performance if needed)
    // Step 1: Create the grouped object
    const groupedTransactions = list.reduce((groups, transaction) => {
        const date = new Date(transaction.TransactionDate);
        const month = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });

        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(transaction);
        return groups;
    }, {});

    // Step 2: Add state at the top of your component to track open/closed sections
    const [expandedMonths, setExpandedMonths] = useState({});

    const toggleMonth = (month) => {
        setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                <section className="flex-1 bg-gray-200 p-6 rounded-2xl h-fit">
                    <h3 className="font-bold mb-4 text-gray-600">
                        New Transaction
                    </h3>
                    <div className="space-y-3">
                        {/* Mapping with Controlled Logic */}
                        {[
                            { label: "Date", key: "date", type: "date" },
                            { label: "Amount", key: "amount", type: "number" },
                            {
                                label: "Description",
                                key: "description",
                                type: "text",
                            },
                            {
                                label: "Category",
                                key: "category",
                                type: "select",
                                options: categories,
                            },
                            {
                                label: "Payment Mode",
                                key: "paymentMode",
                                type: "select",
                                options: paymentModes,
                            },
                        ].map((field) =>
                            field.type === "select" ? (
                                <select
                                    key={field.key}
                                    value={formData[field.key]}
                                    onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                    }
                                    className="w-full p-4 bg-gray-400 rounded-xl"
                                >
                                    <option value="">
                                        Select {field.label}
                                    </option>
                                    {field.options.map((opt) => (
                                        <option
                                            key={opt.Id}
                                            value={
                                                opt[
                                                    field.label.replace(" ", "")
                                                ]
                                            }
                                        >
                                            {opt[field.label.replace(" ", "")]}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    key={field.key}
                                    type={field.type}
                                    placeholder={field.label}
                                    value={formData[field.key]}
                                    onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                    }
                                    className="w-full p-4 bg-gray-400 rounded-xl placeholder-black"
                                />
                            ),
                        )}
                        <button
                            onClick={handleAdd}
                            className="w-full bg-black text-white p-4 rounded-xl mt-2 active:scale-95 transition-transform"
                        >
                            Add Transaction
                        </button>
                    </div>
                </section>

                {/* Right Side Remains mostly same, but ensures list updates work */}
                <section className="flex-[1.5]">
                    <h3 className="font-bold mb-4">Transaction History</h3>
                    <div className="space-y-6">
                        {Object.entries(groupedTransactions).map(
                            ([month, transactions]) => (
                                <div key={month} className="space-y-2">
                                    {/* Month Header / Toggle Button */}
                                    <button
                                        onClick={() => toggleMonth(month)}
                                        className="w-full flex justify-between items-center bg-gray-300 p-3 rounded-xl font-bold text-gray-700 hover:bg-gray-400 transition-colors"
                                    >
                                        <span>{month}</span>
                                        <span>
                                            {expandedMonths[month] ? "▲" : "▼"}
                                        </span>
                                    </button>

                                    {/* Collapsible Content */}
                                    {expandedMonths[month] && (
                                        <div className="space-y-4 pl-2 animate-in fade-in slide-in-from-top-2">
                                            {transactions.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="relative group overflow-hidden rounded-xl"
                                                >
                                                    {/* Slide-in Actions (Edit/Delete) */}
                                                    <div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-4 transition-transform translate-x-full group-hover:translate-x-0">
                                                        <button className="bg-white p-2 rounded shadow">
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                await deleteTransaction(
                                                                    item.id,
                                                                );
                                                                setList(
                                                                    list.filter(
                                                                        (t) =>
                                                                            t.id !==
                                                                            item.id,
                                                                    ),
                                                                );
                                                            }}
                                                            className="bg-white p-2 rounded shadow"
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>

                                                    {/* Transaction Card Details */}
                                                    <div className="bg-gray-400 p-4 flex justify-between items-center transition-transform group-hover:-translate-x-24">
                                                        <div>
                                                            <p className="text-xs text-black-600">
                                                                {
                                                                    item.TransactionDate
                                                                }
                                                            </p>
                                                            <p className="font-bold text-black-600">
                                                                {
                                                                    item.Description
                                                                }
                                                            </p>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[10px] bg-gray-500 text-white px-2 py-0.5 rounded-full">
                                                                    {
                                                                        item.Category
                                                                    }
                                                                </span>
                                                                <span className="text-[10px] bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
                                                                    {
                                                                        item.PaymentMode
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xl font-bold">
                                                            ${item.Amount}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
