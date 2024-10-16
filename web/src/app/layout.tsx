import "./globals.css";

import {
  fetchEnterpriseSettingsSS,
  fetchSettingsSS,
} from "@/components/settings/lib";
import {
  CUSTOM_ANALYTICS_ENABLED,
  SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED,
} from "@/lib/constants";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { Metadata } from "next";
import { buildClientUrl } from "@/lib/utilsSS";
import { Inter } from "next/font/google";
import Head from "next/head";
import { EnterpriseSettings, GatingType } from "./admin/settings/interfaces";
import { Card } from "@tremor/react";
import { HeaderTitle } from "@/components/header/HeaderTitle";
import { Logo } from "@/components/Logo";
import { UserProvider } from "@/components/user/UserProvider";
import { ProviderContextProvider } from "@/components/chat_search/ProviderContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let logoLocation = buildClientUrl("/danswer.ico");
  let enterpriseSettings: EnterpriseSettings | null = null;
  if (SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    enterpriseSettings = await (await fetchEnterpriseSettingsSS()).json();
    logoLocation =
      enterpriseSettings && enterpriseSettings.use_custom_logo
        ? "/api/enterprise-settings/logo"
        : buildClientUrl("/danswer.ico");
  }

  return {
    title: enterpriseSettings?.application_name ?? "Eve AI",
    description: "With Eve, you can quickly access the information you need to succeed in Mindvalley",
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
  const combinedSettings = await fetchSettingsSS();

  const productGating =
    combinedSettings?.settings.product_gating ?? GatingType.NONE;

  if (!combinedSettings) {
    return (
      <html lang="en" className={`${inter.variable} font-sans`}>
        <Head>
          <title>Settings Unavailable | Eve AI</title>
        </Head>
        <body className="bg-background text-default">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="mb-2 flex items-center max-w-[175px]">
              <h1 className="flex text-2xl text-strong font-bold my-auto">
                Eve<sup className="ai-superscript">AI</sup>
              </h1>
              <Logo height={40} width={40} />
            </div>

            <Card className="p-8 max-w-md">
              <h1 className="text-2xl font-bold mb-4 text-error">Error</h1>
              <p className="text-text-500">
                Your Eve AI instance was not configured properly and your
                settings could not be loaded. This could be due to an admin
                configuration issue or an incomplete setup.
              </p>
              <p className="mt-4">
                Please contact IT Department to report this error.
              </p>
            </Card>
          </div>
        </body>
      </html>
    );
  }
  if (productGating === GatingType.FULL) {
    return (
      <html lang="en" className={`${inter.variable} font-sans`}>
        <Head>
          <title>Access Restricted | EVE AI</title>
        </Head>
        <body className="bg-background text-default">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="mb-2 flex items-center max-w-[175px]">
              <HeaderTitle>EVE AI</HeaderTitle>
              <Logo height={40} width={40} />
            </div>
            <Card className="p-8 max-w-md">
              <h1 className="text-2xl font-bold mb-4 text-error">
                Access Restricted
              </h1>
              <p className="text-text-500 mb-4">
                We regret to inform you that your access to EVE AI has been
                temporarily suspended due to a lapse in your subscription.
              </p>
              <p className="text-text-500 mb-4">
                To reinstate your access and continue benefiting from
                EVE AI&apos;s powerful features, please update your payment
                information.
              </p>
              <p className="text-text-500">
                If you&apos;re an admin, you can resolve this by visiting the
                billing section. For other users, please reach out to your
                administrator to address this matter.
              </p>
            </Card>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content"
        />
      </Head>

      {CUSTOM_ANALYTICS_ENABLED && combinedSettings.customAnalyticsScript && (
        <head>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: combinedSettings.customAnalyticsScript,
            }}
          />
        </head>
      )}

      <body className={`relative ${inter.variable} font-sans`}>
        <div
          className={`text-default min-h-screen bg-background ${
            // TODO: remove this once proper dark mode exists
            process.env.THEME_IS_DARK?.toLowerCase() === "true" ? "dark" : ""
            }`}
        >
          {productGating === GatingType.PARTIAL && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-warning-100 text-warning-900 p-2 text-center">
              <p className="text-sm font-medium">
                Your account is pending payment!{" "}
                <a
                  href="/admin/cloud-settings"
                  className="font-bold underline hover:text-warning-700 transition-colors"
                >
                  Update your billing information
                </a>{" "}
                or access will be suspended soon.
              </p>
            </div>
          )}
          <UserProvider>
            <ProviderContextProvider>
              <SettingsProvider settings={combinedSettings}>
                {children}
              </SettingsProvider>
            </ProviderContextProvider>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
