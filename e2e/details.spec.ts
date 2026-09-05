import { boxOf, expect, test } from "./fixtures";

/**
 * The AI-details card takes its position from where it is rendered rather than
 * centring itself over a scrim. On Start it hangs 16px below the controls row;
 * in the Refine dock it is anchored to the field's bottom-right corner, because
 * the dock's controls row sits at y~734 and 16px below would put a 218px card
 * past the bottom of the 852px frame.
 */
const CONTROLS = "div.relative.flex.w-full.items-center.justify-between";

test.describe("AI details card", () => {
  test("hangs 16px below the controls row on the first screen", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const controls = await boxOf(page, CONTROLS);
    await page.getByRole("button", { name: /AI details/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const card = await boxOf(page, '[role="dialog"]');
    expect(card.y - (controls.y + controls.height)).toBeCloseTo(16, 0);
    expect(card.x + card.width).toBeCloseTo(controls.x + controls.width, 0);

    const frame = await boxOf(page, ".phone-frame");
    expect(card.y).toBeGreaterThanOrEqual(frame.y - 1);
    expect(card.y + card.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
  });

  test("aligns to the refine field's bottom-right corner in the dock", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./chat/");

    const field = await boxOf(page, "div.rounded-composer");
    await page.getByRole("button", { name: /AI details/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const card = await boxOf(page, '[role="dialog"]');
    expect(card.x + card.width).toBeCloseTo(field.x + field.width, 0);
    expect(card.y + card.height).toBeCloseTo(field.y + field.height, 0);

    const frame = await boxOf(page, ".phone-frame");
    expect(
      card.y,
      "anchoring below the controls row here would overflow the frame",
    ).toBeGreaterThanOrEqual(frame.y - 1);
    expect(card.y + card.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
  });

  test("dismisses on Escape and on an outside click, with no scrim", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./");

    await page.getByRole("button", { name: /AI details/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // The overlay frame renders as a shadowed card with no dimming.
    await expect(page.locator('[class*="bg-black/"]')).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("button", { name: /AI details/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const frame = await boxOf(page, ".phone-frame");
    await page.mouse.click(frame.x + 180, frame.y + 180);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
