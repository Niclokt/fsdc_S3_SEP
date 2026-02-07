// lib/supabase.js
import { createClient } from "@/lib/supabase/server";
export const supabase = createClient();

/**
 * SECTION: API CALLS FOR CRUD REQUESTS ON TRANSACTIONS
 */
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
