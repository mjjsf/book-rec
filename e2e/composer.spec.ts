import { SAMPLE_QUERY, COMPOSER_PLACEHOLDER } from "../src/lib/designContent";
import { boxOf, expect, test } from "./fixtures";

/**
 * The composer carries the prototype's Start -> Entry beat and two fixed bugs:
 * it used to clip the last line of the designed question (14px text was on a
 * 1.35 line rather than Figma's 17px, and a border-box border ate 2px of the
 * 147px box), and the populate fade shared a class with the AI-details card so
 * the two could not be tuned independently.
 */
test.describe("composer", () => {
  test("opens in the empty Start state", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");
    const composer = page.getByLabel("Describe the book you are looking for");

    await expect(composer).toHaveValue("");
    await expect(composer).toHaveAttribute("placeholder", COMPOSER_PLACEHOLDER);
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  test("clicking it fills in the designed question and grows to the Entry size", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./");
    const composer = page.getByLabel("Describe the book you are looking for");

    const empty = await boxOf(page, "div.rounded-composer");
    expect(Math.round(empty.height), "Start frame is 112px").toBe(112);

    await composer.click();
    await expect(composer).toHaveValue(SAMPLE_QUERY);

    await expect
      .poll(async () => Math.round((await boxOf(page, "div.rounded-composer")).height))
      .toBe(147);
  });

  test("shows the whole question — nothing clipped", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");
    const composer = page.getByLabel("Describe the book you are looking for");
    await composer.click();
    await expect(composer).toHaveValue(SAMPLE_QUERY);

    // The box animates 112px -> 147px, so poll until it settles rather than
    // reading one mid-transition frame. If it never settles the poll fails,
    // which is the actual regression: text that stays cut off.
    await expect
      .poll(
        () =>
          composer.evaluate((el) => {
            const ta = el as HTMLTextAreaElement;
            return ta.scrollHeight - ta.clientHeight;
          }),
        { message: "the last line of the designed question is cut off" },
      )
      .toBeLessThanOrEqual(0);
  });

  test("fills once, so the field stays typeable", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");
    const composer = page.getByLabel("Describe the book you are looking for");

    await composer.click();
    await expect(composer).toHaveValue(SAMPLE_QUERY);

    await composer.fill("");
    await composer.click();
    await page.waitForTimeout(400);
    await expect(composer, "refilling would make it impossible to type").toHaveValue("");
  });

  /**
   * Every transition in the prototype runs at one duration. These four
   * surfaces used to carry 250ms, 350ms, 613ms and Tailwind's unset 150ms
   * default, so a single stray value is exactly the regression to catch.
   */
  test("every animated surface runs at 300ms", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    expect(
      await page.locator("div.rounded-composer").evaluate((el) => {
        return getComputedStyle(el).transitionDuration;
      }),
      "the box growing 112 -> 147 should take as long as the text fading in",
    ).toBe("0.3s");

    expect(
      await page.locator(".screen-enter").evaluate((el) => getComputedStyle(el).animationDuration),
    ).toBe("0.3s");

    const composer = page.getByLabel("Describe the book you are looking for");
    await composer.click();
    expect(await composer.evaluate((el) => getComputedStyle(el).animationDuration)).toBe("0.3s");
    await expect(composer).toHaveValue(SAMPLE_QUERY);

    await page.getByRole("button", { name: /AI details/ }).click();
    const card = page.getByRole("dialog");
    await expect(card).toBeVisible();
    expect(await card.evaluate((el) => getComputedStyle(el).animationDuration)).toBe("0.3s");
  });

  /**
   * The two beats of the fill — the box growing and the text fading up — are
   * one 300ms move, so this times them together from inside the page rather
   * than round-tripping a poll, which costs more than the tolerance is wide.
   */
  test("the resize and the fill finish together, in 300ms", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./");

    await page.evaluate(() => {
      const w = window as unknown as {
        __start: number | null;
        __faded: boolean;
        __done: number | null;
      };
      w.__start = null;
      w.__faded = false;
      w.__done = null;
      const box = document.querySelector("div.rounded-composer")!;
      const field = document.querySelector("textarea")!;
      // Computed opacity rounds to 1 well before an ease-out finishes, so the
      // fade's end has to come from the event, not from sampling the value.
      field.addEventListener("animationend", () => {
        w.__faded = true;
      });
      const tick = () => {
        // The fill lands first; time everything from the frame it appears on.
        if (w.__start === null && field.value.length > 0) w.__start = performance.now();
        const settled = Math.round(box.getBoundingClientRect().height) === 147 && w.__faded;
        if (w.__start !== null && settled) {
          w.__done = performance.now();
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });

    await page.getByLabel("Describe the book you are looking for").click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __done: number | null }).__done))
      .not.toBeNull();

    const elapsed = await page.evaluate(() => {
      const w = window as unknown as { __start: number; __done: number };
      return w.__done - w.__start;
    });

    expect(elapsed, "should not settle before the 300ms it is meant to take").toBeGreaterThan(250);
    expect(elapsed, "a 613ms fade would fail here").toBeLessThan(400);
  });
});
