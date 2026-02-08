// lib/supabase-client.js
import { createClient } from "@/lib/supabase/client";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export const fetchTransactions = async (userId) => {
    return await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
};

export const createTransaction = async (entry) => {
    return await supabase.from("transactions").insert([entry]);
};

export const updateTransaction = async (id, updates) => {
    return await supabase.from("transactions").update(updates).eq("id", id);
};

export const deleteTransaction = async (id) => {
    return await supabase.from("transactions").delete().eq("id", id);
};
