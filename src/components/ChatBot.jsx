import { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";

const QUICK_QUESTIONS = [
  "¿Cómo hago un pedido?",
  "¿Cómo se paga?",
  "¿Dónde se recoge?",
  "¿Hacéis domicilio?",
  "¿Con cuánta antelación hay que pedir?",
  "¿Qué platos tenéis?",
  "¿Hay comida picante?",
  "¿Cómo contacto?",
];

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function createBotAnswer(message, settings, products) {
  const text = normalizeText(message);

  if (
    text.includes("pedido") ||
    text.includes("pedir") ||
    text.includes("comprar") ||
    text.includes("encargar")
  ) {
    return `Para hacer un pedido, elige los platos del menú, pulsa "Continuar pedido", deja tus datos y genera el pedido por WhatsApp. El pedido queda pendiente hasta confirmar el Bizum.`;
  }

  if (
    text.includes("pagar") ||
    text.includes("pago") ||
    text.includes("bizum") ||
    text.includes("tarjeta") ||
    text.includes("efectivo")
  ) {
    return `El pago se confirma por Bizum al número ${settings.bizum_phone}. Al crear el pedido verás el importe exacto y el concepto que debes poner. No se prepara comida sin confirmar el pago.`;
  }

  if (
    text.includes("recoger") ||
    text.includes("recogida") ||
    text.includes("donde") ||
    text.includes("ubicacion") ||
    text.includes("direccion")
  ) {
    return `La recogida es en ${settings.pickup_location}. Al hacer el pedido eliges fecha y franja horaria de recogida.`;
  }

  if (
    text.includes("domicilio") ||
    text.includes("delivery") ||
    text.includes("envio") ||
    text.includes("glovo") ||
    text.includes("uber") ||
    text.includes("just")
  ) {
    return `De momento trabajamos principalmente con recogida. Así podemos preparar la comida bajo encargo y evitar líos de reparto.`;
  }

  if (
    text.includes("antelacion") ||
    text.includes("antes") ||
    text.includes("tiempo") ||
    text.includes("cuando") ||
    text.includes("hora")
  ) {
    return settings.order_notice;
  }

  if (
    text.includes("platos") ||
    text.includes("menu") ||
    text.includes("teneis") ||
    text.includes("venden") ||
    text.includes("comida")
  ) {
    const productList = products
      .slice(0, 8)
      .map((product) => `- ${product.name}: ${formatCurrency(product.price)}`)
      .join("\n");

    return `Ahora mismo tenemos estos platos disponibles:\n\n${productList}\n\nPuedes ver el menú completo en la página.`;
  }

  if (
    text.includes("picante") ||
    text.includes("aji") ||
    text.includes("ají")
  ) {
    return `Algunos platos pueden llevar ají o salsas aparte. Puedes poner tus preferencias en las notas del pedido, por ejemplo: "sin picante", "ají aparte" o "sin cilantro".`;
  }

  if (
    text.includes("alerg") ||
    text.includes("gluten") ||
    text.includes("lactosa") ||
    text.includes("vegetariano") ||
    text.includes("vegano")
  ) {
    return `Para alérgenos o dietas especiales, indícalo en las notas del pedido y confirma por WhatsApp antes de pagar. Así revisamos bien cada caso.`;
  }

  if (
    text.includes("contacto") ||
    text.includes("telefono") ||
    text.includes("whatsapp") ||
    text.includes("hablar")
  ) {
    return `Puedes contactar por WhatsApp al ${settings.whatsapp_phone}. También puedes generar un pedido desde la web y enviarlo directamente por WhatsApp.`;
  }

  if (
    text.includes("minimo") ||
    text.includes("pedido minimo") ||
    text.includes("cantidad")
  ) {
    return `De momento no hay pedido mínimo configurado en la web. Si necesitas un pedido grande o familiar, puedes dejarlo en notas o confirmarlo por WhatsApp.`;
  }

  return `Puedo ayudarte con pedidos, Bizum, recogida, platos disponibles, antelación y contacto. Si tienes una duda concreta, escríbela o pulsa una de las preguntas rápidas.`;
}

export function ChatBot({ settings, products }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const initialMessages = useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: `Hola 👋 Soy el asistente de ${settings.business_name}. Te puedo ayudar con pedidos, Bizum, recogida y platos disponibles.`,
      },
    ],
    [settings.business_name]
  );

  const [messages, setMessages] = useState(initialMessages);

  function sendMessage(messageText) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedMessage,
    };

    const botMessage = {
      id: crypto.randomUUID(),
      sender: "bot",
      text: createBotAnswer(trimmedMessage, settings, products),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      botMessage,
    ]);

    setInputMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(inputMessage);
  }

  return (
    <>
      {!isOpen && (
        <button
          className="chatbot-floating-button"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={20} />
          Ayuda
        </button>
      )}

      {isOpen && (
        <section className="chatbot-panel">
          <header className="chatbot-header">
            <div>
              <strong>Asistente</strong>
              <span>{settings.business_name}</span>
            </div>

            <button type="button" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender === "user"
                    ? "chatbot-message user"
                    : "chatbot-message bot"
                }
              >
                {message.text.split("\n").map((line, index) => (
                  <span key={`${message.id}-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="chatbot-quick-questions">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              placeholder="Escribe tu duda..."
            />

            <button type="submit">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}