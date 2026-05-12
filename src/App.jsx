import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import { Cart } from "./components/Cart";
import { CheckoutForm } from "./components/CheckoutForm";
import { OrderSuccess } from "./components/OrderSuccess";
import { AdminPanel } from "./components/AdminPanel";
import { AdminLogin } from "./components/AdminLogin";
import { getCurrentSession } from "./lib/authApi";
import { getProducts } from "./lib/productsApi";
import "./App.css";

function App() {
  const isAdminRoute = window.location.pathname === "/admin";

  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(isAdminRoute ? "admin" : "menu");
  const [lastOrder, setLastOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [adminSession, setAdminSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(isAdminRoute);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductsError("No se ha podido cargar el menú.");
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function checkSession() {
      if (!isAdminRoute) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const session = await getCurrentSession();
        setAdminSession(session);
      } catch (error) {
        console.error("Error comprobando sesión:", error);
      } finally {
        setIsCheckingSession(false);
      }
    }

    checkSession();
  }, [isAdminRoute]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category))];
  }, [products]);

  function navigateTo(path) {
    window.history.pushState({}, "", path);

    if (path === "/admin") {
      setStep("admin");
    } else {
      setStep("menu");
    }
  }

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function increaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  function handleOrderCreated(order) {
    setLastOrder(order);
    setCart([]);
    setStep("success");
  }

  function startNewOrder() {
    setLastOrder(null);
    setCart([]);
    navigateTo("/");
  }

  if (step === "admin") {
    if (isCheckingSession) {
      return (
        <main className="app">
          <div className="admin-message admin-loading">Comprobando sesión...</div>
        </main>
      );
    }

    if (!adminSession) {
      return (
        <main className="app">
          <AdminLogin
            onLoggedIn={async () => {
              const session = await getCurrentSession();
              setAdminSession(session);
            }}
            onBackToShop={() => navigateTo("/")}
          />
        </main>
      );
    }

    return (
      <main className="app">
        <AdminPanel
          onBackToShop={() => navigateTo("/")}
          onLoggedOut={() => {
            setAdminSession(null);
            navigateTo("/");
          }}
        />
      </main>
    );
  }

  if (step === "checkout") {
    return (
      <main className="app">
        <CheckoutForm
          cart={cart}
          total={total}
          onBack={() => setStep("menu")}
          onOrderCreated={handleOrderCreated}
        />
      </main>
    );
  }

  if (step === "success" && lastOrder) {
    return (
      <main className="app">
        <OrderSuccess order={lastOrder} onNewOrder={startNewOrder} />
      </main>
    );
  }

  return (
    <main className="app">
      <Header />

      <section className="layout">
        <div className="menu-area">
          <div className="section-heading">
            <span>Menú disponible</span>
            <h2>Elige tus platos colombianos</h2>
            <p>
              Platos caseros preparados bajo pedido. Recomendamos reservar con
              antelación para asegurar disponibilidad.
            </p>
          </div>

          {isLoadingProducts && (
            <div className="admin-message">Cargando menú...</div>
          )}

          {productsError && <div className="form-error">{productsError}</div>}

          {!isLoadingProducts &&
            !productsError &&
            categories.map((category) => (
              <section className="category-section" key={category}>
                <h3>{category}</h3>

                <div className="products-grid">
                  {products
                    .filter((product) => product.category === category)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={addToCart}
                      />
                    ))}
                </div>
              </section>
            ))}
        </div>

        <Cart
          cart={cart}
          total={total}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onClear={clearCart}
          onGoToCheckout={() => setStep("checkout")}
        />
      </section>
    </main>
  );
}

export default App;