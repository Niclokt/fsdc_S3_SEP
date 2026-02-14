"use client";
import { useState, useEffect, useMemo } from "react";
import {
    supabase,
    fetchTransactions,
    createTransaction,
    fetchCategories,
    fetchPaymentModes,
    deleteTransaction,
} from "@/lib/supabase-client";

const BUDGET_LIMIT = 1000;

export default function TransactionPage() {
    const [list, setList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [userId, setUserId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [expandedMonths, setExpandedMonths] = useState({});

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        category: "",
        paymentMode: "",
    });

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

    // Load Data
    useEffect(() => {
        if (!userId) return;

        const load = async () => {
            const [transRes, catRes, payModeRes] = await Promise.all([
                fetchTransactions(userId),
                fetchCategories(),
                fetchPaymentModes(),
            ]);

            const sortedTransactions = (transRes.data || []).sort(
                (a, b) =>
                    new Date(b.TransactionDate) - new Date(a.TransactionDate),
            );

            setList(sortedTransactions);
            setCategories(catRes.data || []);
            setPaymentModes(payModeRes.data || []);
        };
        load();
    }, [userId]);

    const handleChange = (field, value) => {
        if (field === "amount" && value.includes(".")) {
            const [integer, decimal] = value.split(".");
            if (decimal.length > 2) value = `${integer}.${decimal.slice(0, 2)}`;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditClick = (item) => {
        setEditingId(item.id); // Use 'id' instead of 'TransactionId'
        setFormData({
            date: item.TransactionDate,
            amount: item.Amount.toString(),
            description: item.Description,
            category: item.Category,
            paymentMode: item.PaymentMode,
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            date: new Date().toISOString().split("T")[0],
            amount: "",
            description: "",
            category: "",
            paymentMode: "",
        });
    };

    const handleSaveOrUpdate = async () => {
        if (!formData.amount || !formData.description)
            return alert("Please fill in all required fields!");

        const entryToSave = {
            UserId: userId,
            TransactionDate: formData.date,
            Amount: parseFloat(formData.amount),
            Description: formData.description,
            DateModified:
                new Date().toISOString().replace("T", " ").split(".")[0] +
                "+00",
            Category: formData.category,
            PaymentMode: formData.paymentMode,
        };

        try {
            let result;

            if (editingId) {
                // Update existing record
                result = await supabase
                    .from("transaction")
                    .update(entryToSave)
                    .eq("id", editingId)
                    .select();
            } else {
                // Create new record
                result = await createTransaction(entryToSave);
            }

            const { data, error } = result;

            if (error) throw error;

            if (editingId) {
                setList(list.map((t) => (t.id === editingId ? data[0] : t)));
                resetForm();
            } else {
                setList([data[0], ...list]);
                resetForm();
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await deleteTransaction(id);
            if (error) throw error;
            setList(list.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error deleting transaction: " + error.message);
        }
    };

    // Memoize grouped transactions
    const groupedTransactions = useMemo(() => {
        return list.reduce((groups, transaction) => {
            const date = new Date(transaction.TransactionDate);
            const month = date.toLocaleString("default", {
                month: "long",
                year: "numeric",
            });

            if (!groups[month]) groups[month] = [];
            groups[month].push(transaction);
            return groups;
        }, {});
    }, [list]);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Form Section */}
                <section className="flex-1 bg-gray-200 p-6 rounded-2xl h-fit">
                    <h3 className="font-bold mb-4 text-gray-600">
                        {editingId ? "Edit Transaction" : "New Transaction"}
                    </h3>
                    <div className="space-y-3">
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
                            onClick={handleSaveOrUpdate}
                            className={`w-full text-white p-4 rounded-xl mt-2 active:scale-95 transition-transform ${
                                editingId
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-black hover:bg-gray-900"
                            }`}
                        >
                            {editingId
                                ? "Update Transaction"
                                : "Add Transaction"}
                        </button>

                        {editingId && (
                            <button
                                onClick={resetForm}
                                className="w-full text-gray-500 text-sm mt-2 underline hover:text-gray-700"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </section>

                {/* Transaction History Section */}
                <section className="flex-[1.5]">
                    <h3 className="font-bold mb-4">Transaction History</h3>
                    <div className="space-y-6">
                        {Object.entries(groupedTransactions)
                            .sort(
                                ([monthA], [monthB]) =>
                                    new Date(monthB) - new Date(monthA),
                            )
                            .map(([month, transactions]) => {
                                const monthlyTotal = transactions.reduce(
                                    (sum, item) => sum + Number(item.Amount),
                                    0,
                                );
                                const isOverBudget =
                                    monthlyTotal > BUDGET_LIMIT;
                                const progress = Math.min(
                                    (monthlyTotal / BUDGET_LIMIT) * 100,
                                    100,
                                );

                                return (
                                    <div key={month} className="space-y-2">
                                        {/* Month Header */}
                                        <button
                                            onClick={() =>
                                                setExpandedMonths((prev) => ({
                                                    ...prev,
                                                    [month]: !prev[month],
                                                }))
                                            }
                                            className={`w-full flex flex-col p-3 rounded-xl font-bold transition-all shadow-sm ${
                                                isOverBudget
                                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                            }`}
                                        >
                                            <div className="w-full flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span>
                                                        {expandedMonths[month]
                                                            ? "▲"
                                                            : "▼"}
                                                    </span>
                                                    <span>{month}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-sm opacity-70 font-normal">
                                                        Monthly Total
                                                    </span>
                                                    <span className="text-lg">
                                                        $
                                                        {monthlyTotal.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${
                                                        isOverBudget
                                                            ? "bg-red-500"
                                                            : "bg-green-500"
                                                    }`}
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div>
                                        </button>

                                        {/* Transaction List */}
                                        {expandedMonths[month] && (
                                            <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200">
                                                {transactions.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative group overflow-hidden rounded-xl"
                                                    >
                                                        {/* Action Buttons */}
                                                        <div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-4 transition-transform translate-x-full group-hover:translate-x-0">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditClick(
                                                                        item,
                                                                    )
                                                                }
                                                                className="bg-white p-2 rounded shadow hover:bg-gray-100 text-blue-600"
                                                                title="Edit transaction"
                                                            >
                                                                ✎
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="bg-white p-2 rounded shadow hover:bg-gray-100 text-red-600"
                                                                title="Delete transaction"
                                                            >
                                                                🗑
                                                            </button>
                                                        </div>

                                                        {/* Transaction Card */}
                                                        <div className="bg-gray-400 p-4 flex justify-between items-center transition-transform group-hover:-translate-x-24">
                                                            <div>
                                                                <p className="text-[10px] text-black-600 uppercase tracking-wider">
                                                                    {
                                                                        item.TransactionDate
                                                                    }
                                                                </p>
                                                                <p className="font-bold text-black-900">
                                                                    {
                                                                        item.Description
                                                                    }
                                                                </p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full">
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
                                                            <span className="text-xl font-bold text-black-900">
                                                                $
                                                                {Number(
                                                                    item.Amount,
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </section>
            </div>
        </div>
    );
}
