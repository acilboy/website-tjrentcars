"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { SiteSettings } from "@/types";

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: SiteSettings | null;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);

  useEffect(() => {
    if (initialSettings) return;
    let active = true;
    api
      .getSettings()
      .then((data) => {
        if (active && data) setSettings(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [initialSettings]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings | null {
  return useContext(SiteSettingsContext);
}
