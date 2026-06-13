import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UiProvider } from "./context/UiContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UiProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </UiProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
