"use client";
import { useEffect, useRef, useState } from "react";
export function useCountrySelection() {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const manual = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    try {
      const saved = localStorage.getItem("selectedCountry");
      if (saved && /^[A-Z]{2}$/.test(saved)) {
        setCountryCode(saved);
        return;
      }
    } catch {
      /* Country choice remains available without storage. */
    }
    fetch("/api/location", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!manual.current && /^[A-Z]{2}$/.test(data?.country ?? ""))
          setCountryCode(data.country);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  function selectCountry(code: string) {
    manual.current = true;
    setCountryCode(code);
    try {
      localStorage.setItem("selectedCountry", code);
    } catch {
      /* Keep the choice for this visit. */
    }
  }
  return { countryCode, selectCountry };
}
