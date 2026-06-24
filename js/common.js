function wordCount(html) {
    const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 0;
    return text.split(' ').filter(w => w.length > 0).length;
}
function readingMins(html) {
    return Math.max(1, Math.ceil(wordCount(html) / 200));
}
function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function clampPct(val) {
    return Math.max(0, Math.min(100, Math.round(val)));
}