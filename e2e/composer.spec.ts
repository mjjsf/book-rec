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

  test("the populate fade is slower than the card's, and only that one moved", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./");

    const composer = page.getByLabel("Describe the book you are looking for");
    await composer.click();
    expect(
      await composer.evaluate((el) => getComputedStyle(el).animationDuration),
      "populate fade should be 350ms x 1.75",
    ).toBe("0.613s");
    await expect(composer).toHaveValue(SAMPLE_QUERY);

    await page.getByRole("button", { name: /AI details/ }).click();
    const card = page.getByRole("dialog");
    await expect(card).toBeVisible();
    expect(
      await card.evaluate((el) => getComputedStyle(el).animationDuration),
      "the AI-details card was not in scope and should be unchanged",
    ).toBe("0.35s");
  });
});
