// Shop Page Component
"use client";
import { memo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

const ProductItem = memo(({ product, onRedeem, canRedeem }) => (
    <div className="bg-gray-200 p-8 rounded-2xl flex justify-between items-center">
        <span>✨ {product.PointCost}</span>
        <button
            onClick={() => onRedeem(product)}
            disabled={!canRedeem}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                canRedeem
                    ? "bg-black text-white hover:opacity-90"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
        >
            Redeem
        </button>
    </div>
));

ProductItem.displayName = "ProductItem";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [points, setPoints] = useState(60);
    const [redeemed, setRedeemed] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. MEMORY OPTIMIZATION: Track if component is mounted
        let isMounted = true;

        const fetchData = async () => {
            try {
                const { data: shopData, error: shopError } = await supabase
                    .from("shopInventory")
                    .select(
                        "Id, ProductName, PointCost, ProductImageUrl, AvailableStockCount",
                    )
                    .gt("AvailableStockCount", 0)
                    .order("PointCost", { ascending: true });

                if (shopError) throw shopError;

                // 2. Only update state if the component is still in memory
                if (isMounted) {
                    console.log("Database Raw Data Row 1:", shopData[0]);
                    setProducts(shopData || []);
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching shop data:", error);
                    setLoading(false);
                }
            }
        };

        fetchData();

        // 3. CLEANUP: This runs when the component unmounts
        return () => {
            isMounted = false;
        };
    }, []);

    const handleRedeem = (product) => {
        if (points >= product.PointCost) {
            setPoints((prev) => prev - product.PointCost);
            setRedeemed(product);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 text-center">
            <div className="flex justify-center gap-8 mb-8">
                <span>🔥 365</span>
                <span>✨ {points}</span>
            </div>

            <div className="space-y-4">
                {loading ? (
                    [...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 p-8 rounded-2xl animate-pulse h-16"
                        />
                    ))
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <ProductItem
                            key={product.Id}
                            product={product}
                            onRedeem={handleRedeem}
                            canRedeem={points >= product.PointCost}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No products available
                    </div>
                )}
            </div>

            {/* Success Modal */}
            {redeemed && (
                <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8">
                    <h2 className="mb-4 text-lg text-black">
                        You've successfully redeemed {redeemed.ProductName}!
                    </h2>
                    {redeemed.ProductImageUrl ? (
                        <img
                            src={redeemed.ProductImageUrl}
                            alt={redeemed.ProductName}
                            className="w-48 h-64 object-cover rounded-xl mb-4"
                        />
                    ) : (
                        <div className="w-48 h-64 bg-gray-200 rounded-xl mb-4" />
                    )}
                    <p className="font-bold mb-12 text-black">
                        New Balance: ✨ {points}
                    </p>
                    <button
                        onClick={() => setRedeemed(null)}
                        className="text-3xl border-2 border-black rounded-full w-12 h-12 flex items-center justify-center text-black"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
