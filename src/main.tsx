import { createRoot } from "react-dom/client";
import App from "./App"; // Eliminada la extensión .tsx para evitar error TS5097
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("No se encontró el elemento root");

createRoot(rootElement).render(<App />);
