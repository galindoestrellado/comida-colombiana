import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../lib/settingsApi";

export function SettingsManager({ onSettingsUpdated }) {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getBusinessSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error cargando configuración:", error);
        setErrorMessage("No se ha podido cargar la configuración.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedSettings = await updateBusinessSettings(settings);
      setSettings(updatedSettings);
      onSettingsUpdated?.(updatedSettings);
      alert("Configuración guardada.");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      setErrorMessage("No se ha podido guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="admin-message">Cargando configuración...</div>;
  }

  if (errorMessage && !settings) {
    return <div className="form-error">{errorMessage}</div>;
  }

  return (
    <form className="settings-card" onSubmit={handleSubmit}>
      <h2>Configuración del negocio</h2>
      <p>
        Cambia datos generales sin tocar código. Estos datos se usan en la
        tienda, Bizum y WhatsApp.
      </p>

      <label>
        Nombre del negocio
        <input
          value={settings.business_name}
          onChange={(event) =>
            handleChange("business_name", event.target.value)
          }
        />
      </label>

      <label>
        Teléfono WhatsApp del negocio
        <input
          value={settings.whatsapp_phone}
          onChange={(event) =>
            handleChange("whatsapp_phone", event.target.value)
          }
          placeholder="Ej: 34611111111"
        />
      </label>

      <label>
        Teléfono Bizum
        <input
          value={settings.bizum_phone}
          onChange={(event) => handleChange("bizum_phone", event.target.value)}
          placeholder="Ej: 611 111 111"
        />
      </label>

      <label>
        Lugar de recogida
        <input
          value={settings.pickup_location}
          onChange={(event) =>
            handleChange("pickup_location", event.target.value)
          }
        />
      </label>

      <label>
        Aviso de pedidos
        <textarea
          value={settings.order_notice}
          onChange={(event) => handleChange("order_notice", event.target.value)}
        />
      </label>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <button className="primary-button settings-save-button" disabled={isSaving}>
        <Save size={17} />
        {isSaving ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}