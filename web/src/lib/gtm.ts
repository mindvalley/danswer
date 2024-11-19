export const GTM_ID = "GTM-T8573CZX"; // Replace with your GTM ID

export const pageview = (url: string) => {
  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({
      event: "pageview",
      page: url,
    });
  }
};
