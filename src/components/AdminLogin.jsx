import { useState } from "react";
import { Lock, LogIn } from "lucide-react";
import { signInAdmin } from "../lib/authApi";

export function AdminLogin({ onLoggedIn, onBackToShop }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signInAdmin({ email, password });
      onLoggedIn();
    } catch (error) {
      console.error("Error login admin:", error);
      setErrorMessage("Email o contraseña incorrectos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-icon">
          <Lock size={32} />
        </div>

        <h1>Acceso admin</h1>

        <p>Entra para ver pedidos y gestionar estados.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@email.com"
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            required
          />
        </label>

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <LogIn size={18} />
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>

        <button
          className="back-button admin-login-back"
          type="button"
          onClick={onBackToShop}
        >
          Volver a la tienda
        </button>
      </form>
    </section>
  );
}