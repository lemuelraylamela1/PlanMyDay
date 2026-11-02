"use client";

import * as React from "react";
import { weddingDefaults, type WeddingDefaults } from "./config/wedding-defaults";

const LanternContentContext = React.createContext<WeddingDefaults>(weddingDefaults);

export function LanternContentProvider({
  value,
  children,
}: {
  value: WeddingDefaults;
  children: React.ReactNode;
}) {
  return (
    <LanternContentContext.Provider value={value}>
      {children}
    </LanternContentContext.Provider>
  );
}

export function useLanternContent(): WeddingDefaults {
  return React.useContext(LanternContentContext);
}
