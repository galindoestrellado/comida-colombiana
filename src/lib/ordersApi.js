import { supabase } from "./supabaseClient";

export async function createOrder({ cart, customer, total }) {
  const orderId = crypto.randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    customer_name: customer.name,
    customer_phone: customer.phone,
    pickup_date: customer.pickupDate,
    pickup_time: customer.pickupTime,
    notes: customer.notes || null,
    total,
    status: "pendiente_bizum",
    payment_method: "bizum",
  });

  if (orderError) {
    throw orderError;
  }

  const orderItems = cart.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    line_total: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw itemsError;
  }

  return {
    id: orderId,
  };
}