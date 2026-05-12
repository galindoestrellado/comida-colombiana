import { Plus } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";

export function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-card__image">{product.icon}</div>

      <div className="product-card__content">
        <div>
          <span className="product-card__category">{product.category}</span>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>

        <div className="product-card__footer">
          <strong>{formatCurrency(product.price)}</strong>

          <button type="button" onClick={() => onAdd(product)}>
            <Plus size={17} />
            Añadir
          </button>
        </div>
      </div>
    </article>
  );
}