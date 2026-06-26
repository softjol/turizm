import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

/**
 * "Continue with Google" button backed by Google Identity Services (GIS).
 *
 * GIS renders its own button and, on success, hands us an ID token (JWT) via the
 * `credential` field. We forward that token to POST /auth/google, which verifies
 * it with Google and returns our own access/refresh tokens. No redirect is used,
 * so only the page origin needs to be whitelisted in the Google Cloud console.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface CredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: CredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/** Loads the GIS client script once, resolving when `window.google` is ready. */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi-load-failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi-load-failed"));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  onError,
}: {
  /** Called with a human-readable message when sign-in fails. */
  onError?: (message: string) => void;
}) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const { lang } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCredential = useCallback(
    async (resp: CredentialResponse) => {
      if (!resp.credential) {
        onError?.("Google did not return a credential");
        return;
      }
      try {
        await googleAuth(resp.credential);
        await refresh(); // hydrate auth context so header/menu update
        navigate("/profile");
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Google sign-in failed");
      }
    },
    [navigate, refresh, onError],
  );

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGsiScript()
      .then(() => {
        const container = containerRef.current;
        if (cancelled || !window.google || !container) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => void handleCredential(resp),
        });
        container.innerHTML = "";
        window.google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          locale: lang,
          width: Math.min(400, Math.max(200, container.offsetWidth || 360)),
        });
      })
      .catch(() => onError?.("Не удалось загрузить Google"));
    return () => {
      cancelled = true;
    };
  }, [handleCredential, lang, onError]);

  if (!CLIENT_ID) return null;

  // GIS injects an iframe; centring the wrapper keeps the button aligned.
  return <div ref={containerRef} className="flex w-full justify-center" />;
}
