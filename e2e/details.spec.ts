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

  /**
   * Clicking the trigger while the card was open used to look like nothing
   * happened: the document `mousedown` closed it and the trigger's own `click`
   * reopened it inside the same gesture. So this asserts it *stays* closed,
   * which is the part that failed.
   */
  test("the trigger closes the card as well as opening it", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const trigger = page.getByRole("button", { name: /AI details/ });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await trigger.click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.waitForTimeout(200);
    await expect(page.getByRole("dialog"), "it reopened within the gesture").toHaveCount(0);
  });

  test("the trigger does not change colour on hover", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const trigger = page.getByRole("button", { name: /AI details/ });
    const colour = () => trigger.evaluate((el) => getComputedStyle(el).color);
    const resting = await colour();
    await trigger.hover();
    await page.waitForTimeout(120);
    expect(await colour(), "the green hover should be gone").toBe(resting);
  });
});
