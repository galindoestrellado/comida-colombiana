import { supabase } from "./supabaseClient";

export async function getBusinessSettings() {
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBusinessSettings(settings) {
  const { data, error } = await supabase
    .from("business_settings")
    .update({
      business_name: settings.business_name,
      whatsapp_phone: settings.whatsapp_phone,
      bizum_phone: settings.bizum_phone,
      pickup_location: settings.pickup_location,
      order_notice: settings.order_notice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}