import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport:{width:1280,height:1000} })).newPage();
await p.goto('http://localhost:3000/book-rec/chat/', { waitUntil:'networkidle' });
await p.evaluate(() => document.fonts.ready.then(()=>true));
await p.waitForTimeout(300);
console.table(await p.evaluate(() => {
  const baselineOf = (el) => { const s=document.createElement('span');
    s.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(s); const y=s.getBoundingClientRect().bottom; s.remove(); return y; };
  const ctx = document.createElement('canvas').getContext('2d');
  const capTopOf = (el) => { const cs=getComputedStyle(el);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} 1000px ${cs.fontFamily}`;
    return baselineOf(el) - ctx.measureText('H').actualBoundingBoxAscent/1000*parseFloat(cs.fontSize); };
  const lis=[...document.querySelectorAll('li')];
  return lis.map((li,i) => {
    const title=li.querySelector('p.font-serif'), author=title.nextElementSibling;
    const ratingRow=author.nextElementSibling, rating=ratingRow.querySelector('p');
    const btn=li.querySelector('div.rounded-shelf'), box=li.getBoundingClientRect();
    const cover=li.querySelector('svg[width="70"], img[width="70"]').getBoundingClientRect();
    const last = i===lis.length-1;
    return {
      'title→author': +(capTopOf(author)-baselineOf(title)).toFixed(2),
      'author→rating': +(capTopOf(rating)-baselineOf(author)).toFixed(2),
      'rating→button': +(btn.getBoundingClientRect().top-ratingRow.getBoundingClientRect().bottom).toFixed(2),
      'button→rule': last?null:+((box.bottom-1)-btn.getBoundingClientRect().bottom).toFixed(2),
      'coverTop': +cover.top.toFixed(2),
    };
  });
}));
await b.close();
