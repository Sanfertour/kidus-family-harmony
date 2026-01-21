import { createRoot } from "react-dom/client";
import App from "./App"; 
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento root en el DOM");
}

createRoot(rootElement).render(<App />);
