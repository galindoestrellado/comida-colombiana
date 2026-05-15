import { formatCurrency } from "./formatCurrency";

export function getShortOrderId(orderId) {
  return orderId ? orderId.slice(0, 8).toUpperCase() : "SIN-ID";
}

export function getBizumConcept(orderId) {
  return `Pedido ${getShortOrderId(orderId)}`;
}

function cleanBusinessPhone(phone) {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppOrderUrl({
  cart,
  customer,
  total,
  orderId,
  settings,
}) {
  const shortOrderId = getShortOrderId(orderId);
  const bizumConcept = getBizumConcept(orderId);

  const businessPhone = cleanBusinessPhone(settings.whatsapp_phone);

  const orderLines = cart
    .map(
      (item) =>
        `- ${item.quantity} x ${item.name} (${formatCurrency(
          item.price * item.quantity
        )})`
    )
    .join("\n");

  const message = `
Hola, quiero confirmar este pedido de comida colombiana:

Nº PEDIDO: ${shortOrderId}

DATOS DEL CLIENTE
Nombre: ${customer.name}
Teléfono: ${customer.phone}
Fecha de recogida: ${customer.pickupDate}
Hora de recogida: ${customer.pickupTime}

PEDIDO
${orderLines}

TOTAL: ${formatCurrency(total)}

NOTAS
${customer.notes || "Sin notas"}

BIZUM
Enviaré Bizum de ${formatCurrency(total)} al ${settings.bizum_phone}
Concepto: ${bizumConcept}
`.trim();

  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
}