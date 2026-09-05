import { expect, test } from "./fixtures";

/**
 * Book-row spacing is specified typographically, not as box gaps: 9px from the
 * title's baseline to the author's cap height, then 8px from the author's to
 * the rating line's. The
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
    // First 70px-wide graphic in the row: the cover. The star strip's svgs come
    // later in document order and are narrower.
    const cover = li.querySelector('svg[width="70"], img[width="70"]');
    const isLast = li === li.parentElement.lastElementChild;
    const box = li.getBoundingClientRect();
    return {
      coverTop: cover.getBoundingClientRect().top,
      coverBottom: cover.getBoundingClientRect().bottom,
      // The hairline is the row's bottom border, so it occupies the last
      // device pixel of the border box. The final row draws none.
      ruleTop: isLast ? null : box.bottom - 1,
      ruleBottom: isLast ? null : box.bottom,
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
  coverTop: number;
  coverBottom: number;
  ruleTop: number | null;
  ruleBottom: number | null;
  titleToAuthor: number;
  authorToRating: number;
  ratingToButton: number;
  buttonToRule: number;
};

test.describe("book row typography", () => {
  test("all four rows measure 9px then 8px baseline-to-cap", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif").first()).toBeVisible();
    // Webfont swap moves baselines; measuring before it lands is meaningless.
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const rows: Row[] = await page.evaluate(measure);
    expect(rows).toHaveLength(4);

    rows.forEach((row, index) => {
      expect(row.titleToAuthor, `book ${index + 1}: title baseline -> author cap`).toBeCloseTo(
        9,
        0,
      );
      expect(row.authorToRating, `book ${index + 1}: author baseline -> rating cap`).toBeCloseTo(
        8,
        0,
      );
    });
  });

  test("the gaps around the shelf button are what the row's height leaves", async ({
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
      // Derived, not chosen. Centring the hairline between the covers pinned
      // the row's height to the cover's 105px, so this gap is whatever is left
      // below the button — and the pixel added above the author line came out
      // of it, 24.195 -> 23.195. The covers did not move: the pitch assertion
      // below is what says so.
      expect(row.buttonToRule, `book ${index + 1}: button -> dividing rule`).toBeCloseTo(
        23.195,
        1,
      );
    });
  });
});

/**
 * The hairline between two books belongs midway between their covers. It used
 * to sit 10.6px under the cover above and 21px over the cover below, because
 * its distance from the cover above was never written down anywhere: it was
 * the row's bottom padding *minus* however far the 105px cover overhung the
 * text column. Pinning the row's box to the cover's height removes that
 * dependency, and centring then reduces to "padding-bottom equals list gap".
 *
 * Measured as the property itself — two distances that must match — rather
 * than as the CSS values that produce them.
 */
/** Adjacent rows, as [index, row, next] — the rule lives between them. */
function pairs(rows: Row[]): Array<[number, Row, Row]> {
  return rows
    .slice(0, -1)
    .map((row, index) => [index, row, rows[index + 1]!] as [number, Row, Row]);
}

test.describe("book row rhythm", () => {
  test("the rule sits midway between the covers it divides", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const rows: Row[] = await page.evaluate(measure);
    expect(rows.length).toBeGreaterThan(1);

    for (const [index, row, next] of pairs(rows)) {
      const above = row.ruleTop! - row.coverBottom;
      const below = next.coverTop - row.ruleBottom!;
      expect(
        above,
        `rule ${index + 1}: ${above.toFixed(2)}px above vs ${below.toFixed(2)}px below`,
      ).toBeCloseTo(below, 1);
    }
  });

  test("centring the rule left the covers where they were", async ({ page, notFound }) => {
    void notFound;
    await page.goto("./chat/");
    await expect(page.locator("li p.font-serif").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => true));

    // The rule was to move, not the books. Row pitch is what makes that
    // claim checkable rather than assumed.
    const rows: Row[] = await page.evaluate(measure);
    for (const [index, row, next] of pairs(rows)) {
      expect(next.coverTop - row.coverTop, `pitch below book ${index + 1}`).toBeCloseTo(137.61, 1);
    }
  });
});
