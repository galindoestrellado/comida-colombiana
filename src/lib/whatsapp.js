import { formatCurrency } from "./formatCurrency";

const BUSINESS_PHONE = "34611111111";

export function buildWhatsAppOrderUrl({ cart, customer, total, orderId }) {
  const shortOrderId = orderId ? orderId.slice(0, 8).toUpperCase() : "SIN-ID";

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

PAGO
Haré Bizum para confirmar el pedido.
`.trim();

  return `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(message)}`;
}