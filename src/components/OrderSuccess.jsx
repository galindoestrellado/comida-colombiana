import { MessageCircle, RotateCcw } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";

export function OrderSuccess({ order, onNewOrder }) {
  return (
    <section className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>

        <h2>Pedido preparado para enviar</h2>

        <p>
          Ahora abre WhatsApp y envía el pedido. Después haz Bizum para que quede
          confirmado.
        </p>

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
            Abrir WhatsApp
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