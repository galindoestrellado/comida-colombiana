import { MessageCircle, RotateCcw } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";
import {
  bizumConfig,
  getBizumConcept,
  getShortOrderId,
} from "../lib/whatsapp";

export function OrderSuccess({ order, onNewOrder }) {
  const shortOrderId = getShortOrderId(order.id);
  const bizumConcept = getBizumConcept(order.id);

  return (
    <section className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>

        <h2>Pedido creado</h2>

        <p>
          Tu pedido se ha guardado como pendiente de Bizum. Para confirmarlo,
          envía el Bizum y después manda el resumen por WhatsApp.
        </p>

        <div className="bizum-final-box">
          <h3>Datos para Bizum</h3>

          <div className="bizum-final-line">
            <span>Nº pedido</span>
            <strong>{shortOrderId}</strong>
          </div>

          <div className="bizum-final-line">
            <span>Importe</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>

          <div className="bizum-final-line">
            <span>Bizum</span>
            <strong>{bizumConfig.phone}</strong>
          </div>

          <div className="bizum-final-line">
            <span>Concepto</span>
            <strong>{bizumConcept}</strong>
          </div>
        </div>

        <div className="success-summary">
          <h3>Resumen del pedido</h3>

          {order.cart.map((item) => (
            <div className="summary-line" key={item.id}>
              <span>
                {item.quantity} x {item.name}
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
        </div>

        <div className="success-actions">
          <a className="whatsapp-button" href={order.whatsappUrl} target="_blank">
            <MessageCircle size={18} />
            Enviar pedido por WhatsApp
          </a>

          <button className="secondary-button" type="button" onClick={onNewOrder}>
            <RotateCcw size={18} />
            Nuevo pedido
          </button>
        </div>
      </div>
    </section>
  );
}