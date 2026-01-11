import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";
import { store, persistor } from "./state/store";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<div className="p-4 text-slate-600">Loading data…</div>}
        persistor={persistor}
      >
        <HashRouter>
          <App />
        </HashRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
