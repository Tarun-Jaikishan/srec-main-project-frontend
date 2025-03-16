import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import App from "./App.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>

    <ToastContainer position="bottom-right" />
  </StrictMode>
);
