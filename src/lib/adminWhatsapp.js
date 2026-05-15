import { formatCurrency } from "./formatCurrency";
import { getBizumConcept, getShortOrderId, bizumConfig } from "./whatsapp";

function cleanPhone(phone) {
  const onlyNumbers = phone.replace(/\D/g, "");

  if (onlyNumbers.startsWith("34")) {
    return onlyNumbers;
  }

  return `34${onlyNumbers}`;
}

function buildWhatsAppUrl(phone, message) {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function buildBizumReminderUrl(order) {
  const shortOrderId = getShortOrderId(order.id);
  const bizumConcept = getBizumConcept(order.id);

  const message = `
Hola ${order.customer_name}, hemos recibido tu pedido #${shortOrderId}.

Para confirmarlo, falta el Bizum de ${formatCurrency(Number(order.total))} al ${bizumConfig.phone}.

Concepto: ${bizumConcept}

Cuando lo recibamos empezamos a prepararlo. Gracias 😊
`.trim();

  return buildWhatsAppUrl(order.customer_phone, message);
}

export function buildPaymentConfirmedUrl(order) {
  const shortOrderId = getShortOrderId(order.id);

  const message = `
Hola ${order.customer_name}, Bizum recibido ✅

Tu pedido #${shortOrderId} queda confirmado.
Te avisamos cuando esté listo para recoger. Gracias 😊
`.trim();

  return buildWhatsAppUrl(order.customer_phone, message);
}

export function buildOrderReadyUrl(order) {
  const shortOrderId = getShortOrderId(order.id);

  const message = `
Hola ${order.customer_name}, tu pedido #${shortOrderId} ya está listo para recoger 😊
`.trim();

  return buildWhatsAppUrl(order.customer_phone, message);
}