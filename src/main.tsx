import ReactDOM from "react-dom/client";

import App from "./App";

import "./App.css";

// No StrictMode: it double-mounts effects in dev, which would double-register
// the global shortcut and re-init the TipTap editor unnecessarily.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
