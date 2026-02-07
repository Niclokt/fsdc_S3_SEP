import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function CategoryData() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("\"Category\"").select();

  return <pre>{JSON.stringify(categories, null, 2)}</pre>;
}

export default function Category() {
  return (
    <Suspense fallback={<div>Loading categories...</div>}>
      <CategoryData />
    </Suspense>
  );
}