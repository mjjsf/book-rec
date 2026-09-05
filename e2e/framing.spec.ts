import { SCREEN, boxOf, expect, frameScale, test } from "./fixtures";

/**
 * The prototype is presented the way the Figma prototype is: the frame scaled
 * down to fit, never enlarged, content scaling as one unit. Two bugs lived
 * here — the device inheriting its parent's already-scaled width and so
 * shrinking twice, and the nav's spacing drifting when the 1px border ate two
 * pixels of the layout box.
 */
test.describe("framing", () => {
  test("is exactly the designed 393x852 when the window is tall enough", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./");
    const frame = await boxOf(page, ".phone-frame");
    expect(Math.round(frame.width)).toBe(SCREEN.width);
    expect(Math.round(frame.height)).toBe(SCREEN.height);
    await expect(page.locator(".device")).toHaveCount(1);
  });

  test("nav sits 16px from the left, right and bottom", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");
    const frame = await boxOf(page, ".phone-frame");
    const nav = await boxOf(page, '[data-testid="bottom-nav"]');

    expect(Math.round(nav.x - frame.x)).toBe(16);
    expect(Math.round(frame.x + frame.width - (nav.x + nav.width))).toBe(16);
    expect(Math.round(frame.y + frame.height - (nav.y + nav.height))).toBe(16);
  });

  test("scales down to fit a short window without a page scrollbar", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.setViewportSize({ width: 1280, height: 700 });
    await page.goto("./");

    const scale = await frameScale(page);
    expect(scale, "should have scaled down").toBeLessThan(1);

    const frame = await boxOf(page, ".phone-frame");
    expect(
      frame.width / frame.height,
      "aspect ratio must survive scaling",
    ).toBeCloseTo(SCREEN.width / SCREEN.height, 3);

    const scrolls = await page.evaluate(
      () =>
        document.scrollingElement!.scrollHeight >
        document.scrollingElement!.clientHeight + 1,
    );
    expect(scrolls, "the device must fit the window").toBe(false);

    // The 16px gaps scale with everything else rather than drifting.
    const nav = await boxOf(page, '[data-testid="bottom-nav"]');
    expect(nav.x - frame.x).toBeCloseTo(16 * scale, 0);
    expect(frame.y + frame.height - (nav.y + nav.height)).toBeCloseTo(16 * scale, 0);
  });

  test("drops the device chrome on a phone-sized viewport", async ({ page, notFound }) => {
    void notFound;
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("./");

    await expect(page.locator(".device")).toHaveCount(0);
    const frame = await boxOf(page, ".phone-frame");
    expect(Math.round(frame.width)).toBe(390);
  });
});
