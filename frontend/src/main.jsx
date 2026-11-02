import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { registerSW } from "virtual:pwa-register";

import App from "./App";
import "./i18n";

import "./styles/cards.css";
import "./styles/pageHeader.css";
import "./styles/theme.css";
import "./styles/statcard.css";
import "./styles/quickaction.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import "./index.css";

registerSW({
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </BrowserRouter>
  </React.StrictMode>
);