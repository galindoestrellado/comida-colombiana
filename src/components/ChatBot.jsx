import { useMemo, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const QUICK_QUESTIONS = [
  "¿Qué me recomiendas para 2 personas?",
  "Quiero algo para 4 personas que no pique mucho",
  "¿Cómo hago un pedido?",
  "¿Cómo se paga?",
  "¿Dónde se recoge?",
  "¿Qué platos son más típicos?",
];

export function ChatBot({ settings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const initialMessages = useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: `Hola 👋 Soy el asistente de IA de ${settings.business_name}. Puedes preguntarme qué pedir, cómo funciona el Bizum, dónde recoger o qué platos encajan mejor contigo.`,
      },
    ],
    [settings.business_name]
  );

  const [messages, setMessages] = useState(initialMessages);

  async function sendMessage(messageText) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isThinking) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputMessage("");
    setIsThinking(true);

    try {
      const historyForApi = messages.map((message) => ({
        sender: message.sender,
        text: message.text,
      }));

      const { data, error } = await supabase.functions.invoke("chatbot", {
        body: {
          message: trimmedMessage,
          history: historyForApi,
        },
      });

      if (error) {
        throw error;
      }

      const botMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text:
          data?.answer ||
          "No he podido responder ahora mismo. Prueba otra vez en unos segundos.",
      };

      setMessages((currentMessages) => [...currentMessages, botMessage]);
    } catch (error) {
      console.error("Error llamando chatbot IA:", error);

      const errorMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: "Ahora mismo no puedo responder con IA. Prueba de nuevo o contacta por WhatsApp.",
      };

      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setIsThinking(false);
    }
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
          <Bot size={20} />
          IA
        </button>
      )}

      {isOpen && (
        <section className="chatbot-panel">
          <header className="chatbot-header">
            <div>
              <strong>Asistente IA</strong>
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

            {isThinking && (
              <div className="chatbot-message bot">
                Pensando recomendaciones...
              </div>
            )}
          </div>

          <div className="chatbot-quick-questions">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                disabled={isThinking}
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
              placeholder="Ej: quiero algo para 4 personas..."
              disabled={isThinking}
            />

            <button type="submit" disabled={isThinking}>
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}