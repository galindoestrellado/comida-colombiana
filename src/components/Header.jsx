import { Clock, MapPin, MessageCircle } from "lucide-react";

export function Header({ settings }) {
  return (
    <header className="hero">
      <div className="hero__badge">🇨🇴 Comida casera por encargo</div>

      <h1>{settings.business_name}</h1>

      <p>
        Platos colombianos preparados con cariño para recoger. Haz tu pedido,
        paga por Bizum para confirmarlo y ven a recogerlo a la hora acordada.
      </p>

      <div className="hero__info">
        <span>
          <Clock size={18} />
          Pedidos con antelación
        </span>
        <span>
          <MapPin size={18} />
          Recogida en {settings.pickup_location}
        </span>
        <span>
          <MessageCircle size={18} />
          Confirmación por WhatsApp
        </span>
      </div>
    </header>
  );
}