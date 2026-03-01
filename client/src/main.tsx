import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const initClarity = async () => {
  try {
    const response = await fetch("/api/analytics/config", {
      credentials: "same-origin",
    });
    if (!response.ok) return;

    const data = (await response.json()) as {
      clarityProjectId?: string | null;
    };
    const projectId = (data?.clarityProjectId || "").trim();
    if (!projectId) return;

    const clarityWindow = window as Window & {
      clarity?: (...args: any[]) => void;
    };
    if (typeof clarityWindow.clarity === "function") return;

    (
      function (
        c: Window & { clarity?: (...args: any[]) => void; [key: string]: any },
        l: Document,
        a: string,
        r: string,
        i: string,
        t?: HTMLScriptElement,
        y?: Element | null,
      ) {
        c[a] =
          c[a] ||
          function (...args: any[]) {
            (c[a].q = c[a].q || []).push(args);
          };
        t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = `https://www.clarity.ms/tag/${i}`;
        y = l.getElementsByTagName(r)[0];
        y?.parentNode?.insertBefore(t, y);
      }
    )(window as any, document, "clarity", "script", projectId);
  } catch {
    // no-op
  }
};

void initClarity();

createRoot(document.getElementById("root")!).render(<App />);
