import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";

window.onerror = function (message, _source, _lineno, _colno, error) {
  console.error("Global error:", message, error);
  document.body.innerHTML += `<div style="color:red;position:fixed;top:0;left:0;z-index:9999;background:white;padding:10px;">Error: ${message}</div>`;
  return false;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
