import { supabase } from "./supabaseClient";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
}