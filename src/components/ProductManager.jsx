import { useEffect, useState } from "react";
import { Plus, RefreshCw, Save } from "lucide-react";
import {
  createProduct,
  getAdminProducts,
  updateProduct,
} from "../lib/adminProductsApi";
import { formatCurrency } from "../lib/formatCurrency";

const EMPTY_PRODUCT = {
  name: "",
  category: "Platos principales",
  description: "",
  price: 0,
  icon: "🍽️",
  image_url: "",
  is_available: true,
  display_order: 99,
};

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [editingProducts, setEditingProducts] = useState({});
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingProductId, setSavingProductId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProducts() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getAdminProducts();
      setProducts(data);

      const initialEditingState = {};
      data.forEach((product) => {
        initialEditingState[product.id] = {
          ...product,
        };
      });

      setEditingProducts(initialEditingState);
    } catch (error) {
      console.error("Error cargando productos admin:", error);
      setErrorMessage("No se han podido cargar los productos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleFieldChange(productId, field, value) {
    setEditingProducts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  }

  function handleNewProductChange(field, value) {
    setNewProduct((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(productId) {
    setSavingProductId(productId);

    try {
      await updateProduct(productId, editingProducts[productId]);

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
              ...editingProducts[productId],
              price: Number(editingProducts[productId].price),
            }
            : product
        )
      );
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("No se ha podido guardar el producto.");
    } finally {
      setSavingProductId(null);
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();

    if (!newProduct.name.trim()) {
      alert("Pon un nombre al producto.");
      return;
    }

    if (!newProduct.description.trim()) {
      alert("Pon una descripción al producto.");
      return;
    }

    if (Number(newProduct.price) <= 0) {
      alert("Pon un precio mayor que 0.");
      return;
    }

    setIsCreating(true);

    try {
      const createdProduct = await createProduct(newProduct);

      setProducts((currentProducts) => [...currentProducts, createdProduct]);

      setEditingProducts((current) => ({
        ...current,
        [createdProduct.id]: createdProduct,
      }));

      setNewProduct(EMPTY_PRODUCT);
    } catch (error) {
      console.error("Error creando producto:", error);
      alert("No se ha podido crear el producto.");
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return <div className="admin-message">Cargando productos...</div>;
  }

  if (errorMessage) {
    return <div className="form-error">{errorMessage}</div>;
  }

  return (
    <section className="product-manager">
      <div className="product-manager__header">
        <div>
          <h2>Productos</h2>
          <p>Edita platos, precios y disponibilidad del menú.</p>
        </div>

        <button
          type="button"
          className="secondary-button product-refresh-button"
          onClick={loadProducts}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <form className="admin-product-card new-product-card" onSubmit={handleCreateProduct}>
        <div className="admin-product-card__top">
          <div className="admin-product-icon">{newProduct.icon}</div>

          <div>
            <h3>Nuevo producto</h3>
            <span>Añade un plato al menú</span>
          </div>

          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={newProduct.is_available}
              onChange={(event) =>
                handleNewProductChange("is_available", event.target.checked)
              }
            />
            Disponible
          </label>
        </div>

        <div className="admin-product-form">
          <label>
            Icono
            <input
              value={newProduct.icon}
              onChange={(event) =>
                handleNewProductChange("icon", event.target.value)
              }
            />
          </label>

          <label>
            Imagen URL
            <input
              value={newProduct.image_url || ""}
              onChange={(event) =>
                handleNewProductChange("image_url", event.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label>
            Nombre
            <input
              value={newProduct.name}
              onChange={(event) =>
                handleNewProductChange("name", event.target.value)
              }
              placeholder="Ej: Arepa de queso"
            />
          </label>

          <label>
            Categoría
            <input
              value={newProduct.category}
              onChange={(event) =>
                handleNewProductChange("category", event.target.value)
              }
              placeholder="Ej: Entrantes"
            />
          </label>

          <label>
            Precio
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProduct.price}
              onChange={(event) =>
                handleNewProductChange("price", event.target.value)
              }
            />
          </label>

          <label>
            Orden
            <input
              type="number"
              min="0"
              value={newProduct.display_order}
              onChange={(event) =>
                handleNewProductChange("display_order", event.target.value)
              }
            />
          </label>

          <label className="description-field">
            Descripción
            <textarea
              value={newProduct.description}
              onChange={(event) =>
                handleNewProductChange("description", event.target.value)
              }
              placeholder="Describe el plato..."
            />
          </label>
        </div>

        <button
          type="submit"
          className="primary-button product-save-button"
          disabled={isCreating}
        >
          <Plus size={17} />
          {isCreating ? "Creando..." : "Añadir producto"}
        </button>
      </form>

      <div className="admin-products-list">
        {products.map((product) => {
          const editedProduct = editingProducts[product.id];

          return (
            <article className="admin-product-card" key={product.id}>
              <div className="admin-product-card__top">
                <div className="admin-product-icon">{editedProduct.icon}</div>

                <div>
                  <h3>{product.name}</h3>
                  <span>{formatCurrency(product.price)}</span>
                </div>

                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={editedProduct.is_available}
                    onChange={(event) =>
                      handleFieldChange(
                        product.id,
                        "is_available",
                        event.target.checked
                      )
                    }
                  />
                  Disponible
                </label>
              </div>

              <div className="admin-product-form">
                <label>
                  Icono
                  <input
                    value={editedProduct.icon}
                    onChange={(event) =>
                      handleFieldChange(product.id, "icon", event.target.value)
                    }
                  />
                </label>

                <label>
                  Imagen URL
                  <input
                    value={editedProduct.image_url || ""}
                    onChange={(event) =>
                      handleFieldChange(product.id, "image_url", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </label>

                <label>
                  Nombre
                  <input
                    value={editedProduct.name}
                    onChange={(event) =>
                      handleFieldChange(product.id, "name", event.target.value)
                    }
                  />
                </label>

                <label>
                  Categoría
                  <input
                    value={editedProduct.category}
                    onChange={(event) =>
                      handleFieldChange(
                        product.id,
                        "category",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Precio
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedProduct.price}
                    onChange={(event) =>
                      handleFieldChange(product.id, "price", event.target.value)
                    }
                  />
                </label>

                <label>
                  Orden
                  <input
                    type="number"
                    min="0"
                    value={editedProduct.display_order}
                    onChange={(event) =>
                      handleFieldChange(
                        product.id,
                        "display_order",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="description-field">
                  Descripción
                  <textarea
                    value={editedProduct.description}
                    onChange={(event) =>
                      handleFieldChange(
                        product.id,
                        "description",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>

              <button
                type="button"
                className="primary-button product-save-button"
                onClick={() => handleSave(product.id)}
                disabled={savingProductId === product.id}
              >
                <Save size={17} />
                {savingProductId === product.id ? "Guardando..." : "Guardar"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}