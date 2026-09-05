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

    // Sampled in-page rather than by reading one value after the click: a
    // single round-trip is racing a 300ms window, and it loses that race under
    // load. The sampler cannot miss the fade, so this asserts the same thing
    // without depending on how fast the driver gets its question in.
    await page.evaluate(() => {
      const w = window as unknown as { __fade: number[]; __raf: number };
      w.__fade = [];
      const tick = () => {
        const screens = [...document.querySelectorAll(".screen-enter")];
        if (screens.length > 0) {
          w.__fade.push(Math.min(...screens.map((el) => Number(getComputedStyle(el).opacity))));
        }
        w.__raf = requestAnimationFrame(tick);
      };
      tick();
    });

    await page.getByRole("button", { name: "Send" }).click();
    await page.waitForURL(/\/chat\//);
    await expect(page.locator("li p.font-serif").first()).toBeVisible();

    const fade = await page.evaluate(() => {
      const w = window as unknown as { __fade: number[]; __raf: number };
      cancelAnimationFrame(w.__raf);
      return w.__fade;
    });

    expect(fade.length, "should have sampled real frames").toBeGreaterThan(20);
    expect(Math.min(...fade), "the new screen should start transparent").toBeLessThan(0.5);
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

  /**
   * The chrome used to render inside each screen, so the remounting template
   * took the header and the nav down with the body — and, more to the point,
   * brought them back at opacity 0 and faded them up with it. The frame went
   * white for the length of the fade.
   *
   * Presence is the wrong thing to sample: React swaps the old subtree for the
   * new one inside a single commit, so an animation frame never catches a gap.
   * What it does catch is the chrome being transparent, so this multiplies the
   * effective opacity down the ancestor chain, every frame, for both.
   */
  test("the chrome never fades mid-navigation — no white flash", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    await page.evaluate(() => {
      const w = window as unknown as { __opacity: number[]; __raf: number };
      w.__opacity = [];
      const effectiveOpacity = (el: Element | null) => {
        if (!el) return 0;
        let value = 1;
        for (let node: Element | null = el; node; node = node.parentElement) {
          value *= Number(getComputedStyle(node).opacity);
        }
        return value;
      };
      const tick = () => {
        w.__opacity.push(
          Math.min(
            effectiveOpacity(document.querySelector("header")),
            effectiveOpacity(document.querySelector('[data-testid="bottom-nav"]')),
          ),
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

    const frames = await page.evaluate(() => {
      const w = window as unknown as { __opacity: number[]; __raf: number };
      cancelAnimationFrame(w.__raf);
      return w.__opacity;
    });

    expect(frames.length, "should have sampled real frames").toBeGreaterThan(20);
    expect(
      Math.min(...frames),
      "the header or the nav faded with the screen body — is the chrome back inside a page?",
    ).toBeCloseTo(1, 2);
  });

  test("the chrome is not inside the element that fades", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");

    // The structural invariant behind the test above, named directly.
    expect(
      await page.evaluate(() => {
        const fading = document.querySelector(".screen-enter");
        return [
          fading?.contains(document.querySelector("header")),
          fading?.contains(document.querySelector('[data-testid="bottom-nav"]')),
        ];
      }),
    ).toEqual([false, false]);
  });
});

/**
 * The bottom bar is decorative in the prototype: it is drawn, it goes nowhere,
 * and it does not light up under the cursor. It used to be four `next/link`s
 * with a green hover, which invited clicks into stub routes.
 */
test.describe("bottom nav", () => {
  for (const path of ["./", "./chat/"]) {
    test(`is inert on ${path}`, async ({ page, notFound }) => {
      void notFound;
      await page.goto(path);

      const nav = page.locator('[data-testid="bottom-nav"]');
      await expect(nav).toBeVisible();
      expect(await nav.locator("[href]").count(), "nothing in the bar links anywhere").toBe(0);
      expect(
        await nav.locator("a, button, [tabindex]").count(),
        "a decorative bar should not be tabbable",
      ).toBe(0);

      const before = page.url();
      for (const label of ["Home", "My Books", "Discover", "More"]) {
        await nav.getByText(label, { exact: true }).click({ force: true });
      }
      await page.waitForTimeout(300);
      expect(page.url(), "clicking the bar should go nowhere").toBe(before);
    });
  }

  /**
   * The icons are inline SVGs drawing with `currentColor`, so they take
   * --color-nav-label from the span that also holds the label. Swap an icon and
   * miss that conversion and it still renders — just in whatever colour its own
   * markup carried — which nothing else in the suite would notice.
   */
  test("each icon takes its colour from the label beside it", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const mismatched = await page.locator('[data-testid="bottom-nav"]').evaluate((bar) =>
      [...bar.querySelectorAll("svg")].flatMap((icon) => {
        const item = icon.parentElement!;
        const label = item.querySelector("span");
        // The FAB carries no label; the colour sits on its own span.
        const want = getComputedStyle(label ?? item).color;
        const name = label?.textContent ?? "(the sparkle FAB)";

        // The paint has to come from the shapes, not the <svg>: `color` is
        // inherited whatever the paths draw with, so reading it off the icon
        // element would pass even for a hardcoded fill.
        return [...icon.querySelectorAll("path, circle, rect, polygon, ellipse, line")].flatMap(
          (shape) =>
            (["fill", "stroke"] as const)
              .map((property) => ({
                name,
                property,
                got: getComputedStyle(shape)[property],
                want,
              }))
              // `none` is how an outline icon declines a fill.
              .filter((row) => row.got !== "none" && row.got !== want),
        );
      }),
    );

    expect(mismatched, "an icon is painting with its own colour, not the token").toEqual([]);
  });

  /**
   * The pill is pinned to 288x63 (BottomNav.tsx), so an icon wider than the one
   * it replaces pushes its siblings out rather than growing the bar — invisible
   * to the 16/16/16 framing assertion, which only measures the outer box.
   *
   * The bound is the pill's border box, not its padding box: the four items
   * already span 267px inside a 240px padding box, so `px-[24px]` is inert and
   * `justify-center` centres the row across the full 288px. That is the design
   * as drawn; what would actually break is an item crossing the rounded edge.
   * Today there is ~10px of headroom on each side.
   */
  test("every icon renders and nothing overflows the pill", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const report = await page.locator('[data-testid="bottom-nav"]').evaluate((bar) => {
      const pill = bar.firstElementChild!;
      const inner = pill.getBoundingClientRect();
      return {
        empty: [...bar.querySelectorAll("svg")]
          .map((icon, index) => ({ index, box: icon.getBoundingClientRect() }))
          .filter(({ box }) => box.width === 0 || box.height === 0)
          .map(({ index }) => index),
        overflowing: [...pill.children]
          .map((item) => ({
            text: item.textContent ?? "",
            box: item.getBoundingClientRect(),
          }))
          .filter(({ box }) => box.left < inner.left - 0.5 || box.right > inner.right + 0.5)
          .map(({ text }) => text),
      };
    });

    expect(report.empty, "an icon rendered with no box at all").toEqual([]);
    expect(report.overflowing, "an item is spilling outside the pill").toEqual([]);
  });

  test("does not change colour on hover", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    const item = page.locator('[data-testid="bottom-nav"]').getByText("Home", { exact: true });
    const colour = () => item.evaluate((el) => getComputedStyle(el).color);
    const resting = await colour();
    await item.hover();
    await page.waitForTimeout(120);
    expect(await colour(), "the hover colour should be gone").toBe(resting);
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
