"use client";
import { useState } from "react";
import { signIn } from "../lib/supabase";
import { useRouter } from "next/navigation";

// Login Page Component
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await signIn(email, password);
        if (!error) router.push("/overview");
        else alert(error.message);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
            <h1 className="text-5xl font-bold mb-12 tracking-tighter">
                FUN-DED
            </h1>
            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4 w-full max-w-sm"
            >
                <input
                    type="email"
                    placeholder="Username (Email)"
                    className="bg-gray-200 p-4 rounded-lg outline-none text-center"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="bg-gray-200 p-4 rounded-lg outline-none text-center"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-gray-300 p-3 rounded-lg w-24 self-center font-medium hover:bg-gray-400"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
