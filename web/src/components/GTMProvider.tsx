"use client";

import React from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GTM_ID, pageview } from "@/lib/gtm";

export default function GTMProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <GoogleTagManager gtmId={GTM_ID} />
      {children}
    </>
  );
}
