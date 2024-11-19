interface Window {
  dataLayer: any[];
}

declare module "@next/third-parties/google" {
  export function GoogleTagManager(props: { gtmId: string }): JSX.Element;
}
