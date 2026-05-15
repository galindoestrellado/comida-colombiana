import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { buildWhatsAppOrderUrl } from "../lib/whatsapp";
import { formatCurrency } from "../lib/formatCurrency";
import { createOrder } from "../lib/ordersApi";

export function CheckoutForm({ cart, total, onBack, onOrderCreated }) {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const savedOrder = await createOrder({
        cart,
        customer,
        total,
      });

      const whatsappUrl = buildWhatsAppOrderUrl({
        cart,
        customer,
        total,
        orderId: savedOrder.id,
      });

      onOrderCreated({
        id: savedOrder.id,
        customer,
        cart,
        total,
        whatsappUrl,
      });
    } catch (error) {
      console.error("Error creando pedido:", error);
      setErrorMessage(
        "No se ha podido guardar el pedido. Revisa Supabase o inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="checkout">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} />
        Volver al menú
      </button>

      <div className="checkout__grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Datos para recoger</h2>

          <label>
            Nombre
            <input
              name="name"
              value={customer.name}
              onChange={handleChange}
              placeholder="Ej: Xavi"
              required
            />
          </label>

          <label>
            Teléfono
            <input
              name="phone"
              type="tel"
              value={customer.phone}
              onChange={handleChange}
              placeholder="Ej: 611 111 111"
              required
            />
          </label>

          <label>
            Fecha de recogida
            <input
              name="pickupDate"
              type="date"
              value={customer.pickupDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Hora de recogida
            <select
              name="pickupTime"
              value={customer.pickupTime}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una hora</option>
              <option value="13:00 - 13:30">13:00 - 13:30</option>
              <option value="13:30 - 14:00">13:30 - 14:00</option>
              <option value="14:00 - 14:30">14:00 - 14:30</option>
              <option value="20:00 - 20:30">20:00 - 20:30</option>
              <option value="20:30 - 21:00">20:30 - 21:00</option>
              <option value="21:00 - 21:30">21:00 - 21:30</option>
            </select>
          </label>

          <label>
            Notas del pedido
            <textarea
              name="notes"
              value={customer.notes}
              onChange={handleChange}
              placeholder="Ej: sin cilantro, ají aparte, una arepa solo queso..."
            />
          </label>

          <div className="bizum-box">
            <h3>Pago por Bizum</h3>
            <p>
                Al generar el pedido te daremos un número de pedido y el concepto exacto
                para hacer Bizum. La comida no se prepara hasta confirmar el pago.
            </p>
          </div>

          {errorMessage && <div className="form-error">{errorMessage}</div>}

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            <Send size={18} />
            {isSubmitting ? "Guardando pedido..." : "Generar pedido por WhatsApp"}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Resumen</h2>

          {cart.map((item) => (
            <div className="summary-line" key={item.id}>
              <span>
                {item.quantity} x {item.name}
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}