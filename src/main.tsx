import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanExpiredCache } from "@/lib/clientCache";

// Clean expired cache entries on app start
cleanExpiredCache();

createRoot(document.getElementById("root")!).render(<App />);
