import { test as base, expect } from "@playwright/test";

export { expect };

/**
 * Every test runs with a 404 watcher attached. A missing base path shows up as
 * 404s on `/_next/` assets long before it shows up as a visibly broken page, so
 * this is the cheapest canary available and it costs nothing to keep on.
 */
export const test = base.extend<{ notFound: string[] }>({
  notFound: async ({ page }, use) => {
    const urls: string[] = [];
    page.on("response", (response) => {
      if (response.status() === 404) urls.push(response.url());
    });
    await use(urls);
    expect(urls, `unexpected 404s: ${urls.join(", ")}`).toEqual([]);
  },
});

/** The designed frame, which is also an iPhone 14/15 Pro screen. */
export const SCREEN = { width: 393, height: 852 } as const;

/** Measured box of an element, in CSS pixels as rendered. */
export async function boxOf(page: import("@playwright/test").Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no bounding box for ${selector}`);
  return box;
}

/** The frame's current scale factor, derived from its rendered height. */
export async function frameScale(page: import("@playwright/test").Page) {
  const frame = await boxOf(page, ".phone-frame");
  return frame.height / SCREEN.height;
}
