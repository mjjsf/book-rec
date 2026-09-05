import { boxOf, expect, test } from "./fixtures";

/**
 * The regression that prompted this suite: PhoneFrame was rendered inside each
 * page rather than the layout, so every navigation remounted it. It starts at
 * scale 1 and only measures the real scale in an effect, so the frame popped
 * 1.0 -> 0.744 and back on every submit.
 *
 * A before/after comparison would not have caught it — both ends are correct.
 * These tests sample across the navigation instead.
 */
test.describe("navigation", () => {
  test("the frame never changes size during a navigation", async ({ page, notFound }) => {
    void notFound;
    // The short viewport is where the pop was largest.
    await page.setViewportSize({ width: 1280, height: 700 });
    await page.goto("./");

    await page.evaluate(() => {
      const w = window as unknown as { __sizes: string[]; __raf: number };
      w.__sizes = [];
      const tick = () => {
        const el = document.querySelector(".phone-frame");
        // Record "missing" rather than skipping: a frame that vanishes
        // mid-navigation must fail this test, not quietly shrink the sample.
        w.__sizes.push(
          el
            ? (() => {
                const r = el.getBoundingClientRect();
                return `${r.width.toFixed(2)}x${r.height.toFixed(2)}`;
              })()
            : "missing",
        );
        w.__raf = requestAnimationFrame(tick);
      };
      tick();
    });

    const composer = page.getByLabel("Describe the book you are looking for");
    await composer.click();
    await expect(composer).not.toHaveValue("");
    await page.getByRole("button", { name: "Send" }).click();
    await page.waitForURL(/\/chat\//);
    await expect(page.locator("li p.font-serif").first()).toBeVisible();

    const sizes = await page.evaluate(() => {
      const w = window as unknown as { __sizes: string[]; __raf: number };
      cancelAnimationFrame(w.__raf);
      return w.__sizes;
    });

    expect(sizes.length, "should have sampled real frames").toBeGreaterThan(20);
    expect(sizes, "the frame disappeared mid-navigation").not.toContain("missing");
    expect(
      [...new Set(sizes)],
      "the frame resized mid-navigation — is PhoneFrame back inside a page?",
    ).toHaveLength(1);
  });

  test("the new screen cross-fades in", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");
    const composer = page.getByLabel("Describe the book you are looking for");
    await composer.click();
    await expect(composer).not.toHaveValue("");

    await page.getByRole("button", { name: "Send" }).click();
    const opacity = await page
      .locator(".screen-enter")
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity, "should start transparent").toBeLessThan(1);

    await expect
      .poll(() =>
        page.locator(".screen-enter").evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBe(1);
  });

  test("the close button returns to the first screen", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");

    const close = page.getByRole("button", { name: "Close the assistant" });
    await expect(close).not.toHaveAttribute("aria-disabled", "true");
    await close.click();

    await expect(page).toHaveURL(/\/book-rec\/$/);
    await expect(page.getByText("What kind of book")).toBeVisible();
  });

  test("the close button is inert on the first screen", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const close = page.getByRole("button", { name: "Close the assistant" });
    // Still drawn — the Figma Start frame shows the chip (283:122).
    await expect(close).toBeVisible();
    await expect(close).toHaveAttribute("aria-disabled", "true");
    expect(await close.evaluate((el) => getComputedStyle(el).cursor)).not.toBe("pointer");

    const before = page.url();
    await close.click({ force: true });
    await page.waitForTimeout(300);
    expect(page.url()).toBe(before);
  });

  test("the home indicator does not swallow bottom-nav clicks", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");
    // "More" is the closest nav item to the indicator.
    await page.locator('nav a[href*="/more"]').click();
    await expect(page).toHaveURL(/\/more/);
  });
});

test.describe("assets", () => {
  test("no request 404s anywhere in the flow", async ({ page, notFound }) => {
    // The fixture asserts this on teardown; walking the flow gives it surface.
    void notFound;
    await page.goto("./");
    await boxOf(page, ".phone-frame");
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif").first()).toBeVisible();
  });
});
