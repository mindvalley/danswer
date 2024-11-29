"use client";

import React, { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";

export const LoginText = () => {
  const settings = useContext(SettingsContext);
  return (
    <>Log In to Eve<sup className="ai-superscript">AI</sup></>
  );
};
