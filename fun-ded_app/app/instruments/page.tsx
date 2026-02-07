import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function CategoryData() {
  const supabase = await createClient();
  const { data: category } = await supabase.from("category").select();

  return <pre>{JSON.stringify(category, null, 2)}</pre>;
}

export default function Category() {
  return (
    <Suspense fallback={<div>Loading category...</div>}>
      <CategoryData />
    </Suspense>
  );
}