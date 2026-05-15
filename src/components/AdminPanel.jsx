import { useEffect, useMemo, useState } from "react";
import { LogOut, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { getOrders, updateOrderStatus } from "../lib/adminApi";
import { signOutAdmin } from "../lib/authApi";
import { formatCurrency } from "../lib/formatCurrency";
import { ProductManager } from "./ProductManager";
import {
  buildBizumReminderUrl,
  buildOrderReadyUrl,
  buildPaymentConfirmedUrl,
} from "../lib/adminWhatsapp";
import { SettingsManager } from "./SettingsManager";

const STATUS_OPTIONS = [
  "pendiente_bizum",
  "pagado",
  "preparando",
  "listo",
  "entregado",
  "cancelado",
];

const STATUS_LABELS = {
  pendiente_bizum: "Pendiente Bizum",
  pagado: "Pagado",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const FILTER_OPTIONS = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "pendiente_bizum",
    label: "Pendiente Bizum",
  },
  {
    value: "pagado",
    label: "Pagado",
  },
  {
    value: "preparando",
    label: "Preparando",
  },
  {
    value: "listo",
    label: "Listo",
  },
  {
    value: "entregado",
    label: "Entregado",
  },
  {
    value: "cancelado",
    label: "Cancelado",
  },
];

export function AdminPanel({ settings, onSettingsUpdated, onBackToShop, onLoggedOut }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredOrders = useMemo(() => {
    if (activeStatusFilter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === activeStatusFilter);
  }, [orders, activeStatusFilter]);

  const orderCounts = useMemo(() => {
    const counts = {
      all: orders.length,
    };

    STATUS_OPTIONS.forEach((status) => {
      counts[status] = orders.filter((order) => order.status === status).length;
    });

    return counts;
  }, [orders]);

  async function loadOrders() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setErrorMessage("No se han podido cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("No se ha podido actualizar el estado.");
    }
  }

  async function handleLogout() {
    try {
      await signOutAdmin();
      onLoggedOut();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      alert("No se ha podido cerrar sesión.");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-badge">
            <ShieldCheck size={17} />
            Panel interno
          </span>
          <h1>Administración</h1>
          <p>Gestiona pedidos, Bizum, estados y productos.</p>
        </div>

        <div className="admin-actions">
          <button type="button" className="secondary-button" onClick={onBackToShop}>
            Volver a tienda
          </button>

          <button type="button" className="secondary-button" onClick={handleLogout}>
            <LogOut size={17} />
            Salir
          </button>

          {activeTab === "orders" && (
            <button
              type="button"
              className="primary-button admin-refresh"
              onClick={loadOrders}
            >
              <RefreshCw size={17} />
              Actualizar
            </button>
          )}
        </div>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={activeTab === "orders" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("orders")}
        >
          Pedidos
        </button>

        <button
          type="button"
          className={activeTab === "products" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("products")}
        >
          Productos
        </button>

        <button
          type="button"
          className={activeTab === "settings" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("settings")}
        >
          Configuración
        </button>
      </div>

      {activeTab === "products" && <ProductManager />}

      {activeTab === "settings" && (
        <SettingsManager onSettingsUpdated={onSettingsUpdated} />
      )}

      {activeTab === "orders" && (
        <>
          <div className="order-filters">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  activeStatusFilter === filter.value
                    ? "order-filter active"
                    : "order-filter"
                }
                onClick={() => setActiveStatusFilter(filter.value)}
              >
                <span>{filter.label}</span>
                <strong>{orderCounts[filter.value] || 0}</strong>
              </button>
            ))}
          </div>

          {isLoading && <div className="admin-message">Cargando pedidos...</div>}

          {errorMessage && <div className="form-error">{errorMessage}</div>}

          {!isLoading && orders.length === 0 && (
            <div className="admin-message">Todavía no hay pedidos.</div>
          )}

          {!isLoading && orders.length > 0 && filteredOrders.length === 0 && (
            <div className="admin-message">
              No hay pedidos con el estado seleccionado.
            </div>
          )}

          {!isLoading && filteredOrders.length > 0 && (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card__top">
                    <div>
                      <h2>Pedido #{order.id.slice(0, 8).toUpperCase()}</h2>
                      <p>{new Date(order.created_at).toLocaleString("es-ES")}</p>
                    </div>

                    <select
                      value={order.status}
                      onChange={(event) =>
                        handleStatusChange(order.id, event.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="order-card__customer">
                    <strong>{order.customer_name}</strong>
                    <span>{order.customer_phone}</span>
                    <span>
                      Recogida: {order.pickup_date} · {order.pickup_time}
                    </span>
                    {order.notes && <span>Notas: {order.notes}</span>}
                  </div>

                  <div className="order-items-admin">
                    {order.order_items.map((item) => (
                      <div className="order-item-admin" key={item.id}>
                        <span>
                          {item.quantity} x {item.product_name}
                        </span>
                        <strong>{formatCurrency(Number(item.line_total))}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-card__footer">
                    <span>Método: {order.payment_method}</span>
                    <strong>{formatCurrency(Number(order.total))}</strong>
                  </div>

                  <div className="order-whatsapp-actions">
                    <a
                      href={buildBizumReminderUrl(order, settings)}
                      target="_blank"
                      className="admin-whatsapp-button"
                    >
                      <MessageCircle size={16} />
                      Recordar Bizum
                    </a>

                    <a
                      href={buildPaymentConfirmedUrl(order)}
                      target="_blank"
                      className="admin-whatsapp-button"
                    >
                      <MessageCircle size={16} />
                      Confirmar pago
                    </a>

                    <a
                      href={buildOrderReadyUrl(order)}
                      target="_blank"
                      className="admin-whatsapp-button"
                    >
                      <MessageCircle size={16} />
                      Avisar listo
                    </a>
                  </div>

                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}