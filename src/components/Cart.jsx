import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";

export function Cart({
  cart,
  total,
  onIncrease,
  onDecrease,
  onClear,
  onGoToCheckout,
}) {
  return (
    <aside className="cart-panel">
      <div className="cart-panel__header">
        <h2>
          <ShoppingBag size={22} />
          Tu pedido
        </h2>

        {cart.length > 0 && (
          <button className="link-button" type="button" onClick={onClear}>
            <Trash2 size={16} />
            Vaciar
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="empty-cart">Todavía no has añadido platos.</p>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {formatCurrency(item.price)} x {item.quantity}
                </span>
              </div>

              <div className="quantity-controls">
                <button type="button" onClick={() => onDecrease(item.id)}>
                  <Minus size={15} />
                </button>

                <span>{item.quantity}</span>

                <button type="button" onClick={() => onIncrease(item.id)}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-total">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>

      <div className="payment-warning">
        El pedido solo se prepara cuando queda confirmado por Bizum.
      </div>

      <button
        className="primary-button"
        type="button"
        disabled={cart.length === 0}
        onClick={onGoToCheckout}
      >
        Continuar pedido
      </button>
    </aside>
  );
}