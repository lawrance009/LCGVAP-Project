(async () => {
  await new Promise((r) => setTimeout(r, 2600));
  const vw = document.documentElement.clientWidth;
  const clippedByAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) return true;
    }
    return false;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const label = (el) => `${el.tagName.toLowerCase()}:${(el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28)}`;
  const offscreen = [...document.querySelectorAll('body *')]
    .filter((el) => visible(el) && getComputedStyle(el).position !== 'fixed')
    .filter((el) => { const r = el.getBoundingClientRect(); return r.right > vw + 1 || r.left < -1; })
    .filter((el) => !clippedByAncestor(el))
    .slice(0, 6).map(label);
  const mobile = vw < 640;
  const small = [...document.querySelectorAll('a, button, input, select, textarea, [role="tab"]')]
    .filter((el) => visible(el) && !el.closest('nav[aria-label="Main"] ~ *'))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const inlineText = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
      if (inlineText) return false;
      const min = mobile && (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'SELECT') ? 40 : 24;
      return r.height < min || r.width < 24;
    })
    .slice(0, 8).map((el) => { const r = el.getBoundingClientRect(); return `${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  const clipped = [...document.querySelectorAll('h1, h2, h3, p, dd, a, button, label')]
    .filter((el) => visible(el) && !el.className.toString().includes('truncate') && !el.className.toString().includes('line-clamp'))
    .filter((el) => el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible')
    .slice(0, 5).map(label);
  return { path: location.pathname, vw, docWidth: document.documentElement.scrollWidth, offscreen, small, clipped };
})()
