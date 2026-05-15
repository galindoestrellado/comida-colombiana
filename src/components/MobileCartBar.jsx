import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";

export function MobileCartBar({ cart, total, onClick }) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return null;
  }

  return (
    <button className="mobile-cart-bar" type="button" onClick={onClick}>
      <span>
        <ShoppingBag size={18} />
        {itemCount} producto{itemCount === 1 ? "" : "s"}
      </span>

      <strong>{formatCurrency(total)}</strong>

      <em>Ver pedido</em>
    </button>
  );
}