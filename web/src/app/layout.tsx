import "./globals.css";

import {
  fetchEnterpriseSettingsSS,
  fetchSettingsSS,
} from "@/components/settings/lib";
import {
  SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED,
} from "@/lib/constants";
import { Metadata } from "next";
import { buildClientUrl } from "@/lib/utilsSS";
import { Inter } from "next/font/google";
import { EnterpriseSettings, GatingType } from "./admin/settings/interfaces";
import { HeaderTitle } from "@/components/header/HeaderTitle";
import { Logo } from "@/components/Logo";
import GTMProvider from "@/components/GTMProvider";
import { fetchAssistantData } from "@/lib/chat/fetchAssistantdata";
import { AppProvider } from "@/components/context/AppProvider";
import { PHProvider } from "./providers";
import { getCurrentUserSS } from "@/lib/userSS";
import CardSection from "@/components/admin/CardSection";
import { Suspense } from "react";
import PostHogPageView from "./PostHogPageView";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let logoLocation = buildClientUrl("/favicon.ico");
  let enterpriseSettings: EnterpriseSettings | null = null;
  if (SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    enterpriseSettings = await (await fetchEnterpriseSettingsSS()).json();
    logoLocation =
      enterpriseSettings && enterpriseSettings.use_custom_logo
        ? "/api/enterprise-settings/logo"
        : buildClientUrl("/favicon.ico");
  }

  return {
    title: enterpriseSettings?.application_name ?? "Eve AI",
    description:
      "With Eve, you can quickly access the information you need to succeed in Mindvalley",
    icons: {
      icon: logoLocation,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [combinedSettings, assistantsData, user] = await Promise.all([
    fetchSettingsSS(),
    fetchAssistantData(),
    getCurrentUserSS(),
  ]);

  const productGating =
    combinedSettings?.settings.product_gating ?? GatingType.NONE;


  const getPageContent = (content: React.ReactNode) => (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content"
        />
      </head>
      <body className={`relative ${inter.variable} font-sans`}>
        <div
          className={`text-default min-h-screen bg-background ${
            process.env.THEME_IS_DARK?.toLowerCase() === "true" ? "dark" : ""
          }`}
        >
          <PHProvider>{content}</PHProvider>
        </div>
      </body>
    </html>
  );

  if (!combinedSettings) {
    return getPageContent(
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-2 flex items-center max-w-[175px]">
          <HeaderTitle>Eve AI</HeaderTitle>
          <Logo height={40} width={40} />
        </div>

        <CardSection className="max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-error">Error</h1>
          <p className="text-text-500">
            Your Eve AI instance was not configured properly and your settings
            could not be loaded. This could be due to an admin configuration
            issue or an incomplete setup.
          </p>
          <p className="text-text-500">
            Please contact your Eve AI administrator to resolve this issue.
          </p>
        </CardSection>
      </div>
    );
  }
  if (productGating === GatingType.FULL) {
    return getPageContent(
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-2 flex items-center max-w-[175px]">
          <HeaderTitle>Danswer</HeaderTitle>
          <Logo height={40} width={40} />
        </div>
        <CardSection className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-error">
            Access Restricted
          </h1>
          <p className="text-text-500 mb-4">
            We regret to inform you that your access to Danswer has been
            temporarily suspended due to a lapse in your subscription.
          </p>
          <p className="text-text-500 mb-4">
            To reinstate your access and continue benefiting from Danswer&apos;s
            powerful features, please update your payment information.
          </p>
          <p className="text-text-500">
            If you&apos;re an admin, you can resolve this by visiting the
            billing section. For other users, please reach out to your
            administrator to address this matter.
          </p>
        </CardSection>
      </div>
    );
  }

  const { assistants, hasAnyConnectors, hasImageCompatibleModel } =
    assistantsData;

  return getPageContent(
    <GTMProvider>
    <AppProvider
      user={user}
      settings={combinedSettings}
      assistants={assistants}
      hasAnyConnectors={hasAnyConnectors}
      hasImageCompatibleModel={hasImageCompatibleModel}
    >
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </AppProvider>
    </GTMProvider>
  );
}
