import { supabase } from "./supabaseClient";

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
}

export async function updateProduct(productId, productData) {
  const { error } = await supabase
    .from("products")
    .update({
      name: productData.name,
      category: productData.category,
      description: productData.description,
      price: Number(productData.price),
      icon: productData.icon,
      is_available: productData.is_available,
      display_order: Number(productData.display_order),
    })
    .eq("id", productId);

  if (error) {
    throw error;
  }
}

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: productData.name,
      category: productData.category,
      description: productData.description,
      price: Number(productData.price),
      icon: productData.icon,
      is_available: productData.is_available,
      display_order: Number(productData.display_order),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    price: Number(data.price),
  };
}