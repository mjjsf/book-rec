import { expect, test } from "./fixtures";

/**
 * Book-row spacing is specified typographically, not as box gaps: 8px from the
 * baseline of each descriptor line to the cap height of the line below it. The
 * CSS gets there by pulling each box onto those edges with negative margins
 * derived from the fonts' metrics, so asserting the CSS values would only
 * restate the implementation.
 *
 * These measurements are taken independently: the baseline from a zero-sized
 * inline probe the browser aligns for us, the cap height from the real glyph
 * geometry of a capital in the resolved font. If the fonts fall back on a
 * different platform, the metric overrides keep the arithmetic identical, and
 * this test is what proves it.
 */
const measure = `(() => {
  const baselineOf = (el) => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    el.appendChild(probe);
    const y = probe.getBoundingClientRect().bottom;
    probe.remove();
    return y;
  };
  const ctx = document.createElement("canvas").getContext("2d");
  const capTopOf = (el) => {
    const style = getComputedStyle(el);
    // Measure at 1000px and scale down: sub-pixel glyph metrics at 12px are
    // too coarse to tell 8px from 8.5px.
    ctx.font = style.fontStyle + " " + style.fontWeight + " 1000px " + style.fontFamily;
    const cap = (ctx.measureText("H").actualBoundingBoxAscent / 1000) * parseFloat(style.fontSize);
    return baselineOf(el) - cap;
  };
  return [...document.querySelectorAll("li")].map((li) => {
    const title = li.querySelector("p.font-serif");
    const author = title.nextElementSibling;
    const ratingRow = author.nextElementSibling;
    const rating = ratingRow.querySelector("p");
    const button = li.querySelector("div.rounded-shelf");
    const isLast = li === li.parentElement.lastElementChild;
    return {
      titleToAuthor: capTopOf(author) - baselineOf(title),
      authorToRating: capTopOf(rating) - baselineOf(author),
      ratingToButton: button.getBoundingClientRect().top - ratingRow.getBoundingClientRect().bottom,
      // The last row draws no hairline, so its rule is the padding edge.
      buttonToRule:
        li.getBoundingClientRect().bottom -
        button.getBoundingClientRect().bottom -
        (isLast ? 0 : 1),
    };
  });
})()`;

type Row = {
  titleToAuthor: number;
  authorToRating: number;
  ratingToButton: number;
  buttonToRule: number;
};

test.describe("book row typography", () => {
  test("all four rows measure 8px baseline-to-cap on both pairs", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif").first()).toBeVisible();
    // Webfont swap moves baselines; measuring before it lands is meaningless.
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const rows: Row[] = await page.evaluate(measure);
    expect(rows).toHaveLength(4);

    rows.forEach((row, index) => {
      expect(row.titleToAuthor, `book ${index + 1}: title baseline -> author cap`).toBeCloseTo(
        8,
        0,
      );
      expect(row.authorToRating, `book ${index + 1}: author baseline -> rating cap`).toBeCloseTo(
        8,
        0,
      );
    });
  });

  test("the gaps around the shelf button are unchanged by the condensing", async ({
    page,
    notFound,
  }) => {
    void notFound;
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const rows: Row[] = await page.evaluate(measure);
    rows.forEach((row, index) => {
      expect(row.ratingToButton, `book ${index + 1}: rating row -> button`).toBeCloseTo(20, 0);
      // This one regressed to 28.4px when the condensed column became shorter
      // than the 105px cover and the cover started setting the row's height.
      expect(row.buttonToRule, `book ${index + 1}: button -> dividing rule`).toBeCloseTo(19, 0);
    });
  });
});
