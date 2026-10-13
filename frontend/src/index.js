import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import i18n from "./i18n/i18n";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./redux/store";
import axios from "axios";

// Send the current language with every API content request
axios.interceptors.request.use((config) => {
  const activeLang = (i18n.language || "en").startsWith("hi")
    ? "hi"
    : (i18n.language || "en").startsWith("mr")
    ? "mr"
    : "en";

  config.headers = config.headers || {};
  config.headers["Accept-Language"] = activeLang;

  config.params = config.params || {};
  if (!config.params.lang) {
    config.params.lang = activeLang;
  }
  return config;
});

ReactDOM.render(
  <Provider store={Store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();
