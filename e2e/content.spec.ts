import { RATIONALE, RESULT_BOOK_IDS } from "../src/lib/designContent";
import { CATALOG } from "../src/lib/catalog";
import { expect, test } from "./fixtures";

/**
 * The results screen is designed content, not output. It also shipped as a 7KB
 * empty shell for two releases: `useSearchParams` forces everything inside its
 * Suspense boundary to client-render, and the whole screen was inside it. These
 * assertions cover both the rendered result and the controls around it.
 */
const DESIGNED_TITLES = RESULT_BOOK_IDS.map(
  (id) => CATALOG.find((book) => book.id === id)!.title,
);

test.describe("results screen", () => {
  test("shows the four designed books in the designed order", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif")).toHaveText(DESIGNED_TITLES);
  });

  test("shows the designed reply verbatim", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");
    // Both paragraphs, so a truncated or reflowed rationale fails.
    for (const paragraph of RATIONALE.split("\n\n")) {
      await expect(page.getByText(paragraph.trim(), { exact: false })).toBeVisible();
    }
  });

  /**
   * Covers come from `npm run covers`, which writes the WebP files *and*
   * regenerates the static imports in src/covers/index.ts. Regenerate one
   * without the other and the rows silently fall back to the generated
   * two-tone art — the page still renders, so nothing else would notice.
   */
  test("every row shows real cover art, not the generated fallback", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./chat/");

    const covers = page.locator('li img[width="70"]');
    await expect(covers).toHaveCount(DESIGNED_TITLES.length);
    // Decoded, not merely present: a broken src still yields an <img>.
    for (let index = 0; index < DESIGNED_TITLES.length; index += 1) {
      expect(
        await covers.nth(index).evaluate((el) => (el as HTMLImageElement).naturalWidth),
        `cover ${index + 1} did not load`,
      ).toBeGreaterThan(0);
    }
    await expect(page.locator('li svg[width="70"]'), "generated art is still showing").toHaveCount(
      0,
    );
  });

  test("is present in the served HTML, not only after hydration", async ({ request }) => {
    // The empty-shell bug was invisible in a browser: hydration filled it in.
    const response = await request.get("./chat/");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html, "the page shipped as an empty shell").toContain("Arrival");
    expect(html).toContain("Dungeon Crawler Carl");
  });
});

test.describe("controls", () => {
  test("the reading-history switch toggles", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");

    const toggle = page.getByRole("switch");
    const before = await toggle.getAttribute("aria-checked");
    await toggle.click();
    await expect(toggle).not.toHaveAttribute("aria-checked", before!);
  });

  test("shelving a book persists across navigation", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");

    await page.locator("button[aria-pressed]").first().click();
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);

    await page.goto("./");
    await page.goto("./chat/");
    await expect(
      page.locator('button[aria-pressed="true"]'),
      "shelf state lives in localStorage and should survive",
    ).toHaveCount(1);
  });

  test("the shelf menu changes the button's label", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");

    await page.locator('button[aria-label="Choose a shelf"]').first().click();
    await page.getByRole("button", { name: "Read", exact: true }).first().click();
    await expect(page.locator("button[aria-pressed]").first()).toHaveText("Read");
  });
});
