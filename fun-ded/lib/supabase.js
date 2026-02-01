// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SECTION: USER LOGIN AUTHENTICATION
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

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
