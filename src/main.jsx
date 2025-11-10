import ReactDOM from "react-dom/client";
import App, { AuthProvider } from "./App";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
