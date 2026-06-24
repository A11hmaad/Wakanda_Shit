// ==================== READER SPECIFIC ====================
function applyReaderFont() {
    const f = document.getElementById('reader-font-select').value;
    localStorage.setItem('tapestry_font', f);
    const body = document.getElementById('reader-body');
    const title = document.getElementById('reader-chapter-title');
    const intro = document.getElementById('rh-intro-display');
    if (body) body.style.fontFamily = f;
    if (title) title.style.fontFamily = f;
    if (intro) intro.style.fontFamily = f;
    if (body) body.querySelectorAll('*').forEach(el => el.style.fontFamily = f);
    if (intro) intro.querySelectorAll('*').forEach(el => el.style.fontFamily = f);
}

function applyReaderSize() {
    const s = parseInt(document.getElementById('reader-size-range').value);
    localStorage.setItem('tapestry_size', s);
    const body = document.getElementById('reader-body');
    const intro = document.getElementById('rh-intro-display');
    if (body) body.style.fontSize = s + 'px';
    if (intro) intro.style.fontSize = s + 'px';
    const title = document.getElementById('reader-chapter-title');
    if (title) title.style.fontSize = (s * 1.8) + 'px';
    document.getElementById('reader-size-label').textContent = s + 'px';
    if (body) body.querySelectorAll('*').forEach(el => el.style.fontSize = s + 'px');
    if (intro) intro.querySelectorAll('*').forEach(el => el.style.fontSize = s + 'px');
}

function updateMinsLeft(pct) {
    if (!currentKey) return;
    const ch = chapters[currentKey];
    if (!ch) return;
    const total = readingMins(ch.content);
    const remaining = Math.ceil(total * (1 - pct / 100));
    const el = document.getElementById('reader-mins-left');
    if (pct >= 100) el.textContent = 'Finished ✓';
    else if (remaining <= 0) el.textContent = '<1 min left';
    else el.textContent = remaining + ' min' + (remaining !== 1 ? 's' : '') + ' left';
}

// Progress bar & scroll tracking
let _scrollTicking = false;
let _scrollSaveTimer = null;

function setupScrollListener() {
    const scrollEl = document.getElementById('reader-scroll');
    if (!scrollEl) return;
    scrollEl.addEventListener('scroll', function() {
        if (!_scrollTicking) {
            requestAnimationFrame(() => {
                liveUpdateProgress();
                _scrollTicking = false;
            });
            _scrollTicking = true;
        }
        if (currentKey) {
            clearTimeout(_scrollSaveTimer);
            _scrollSaveTimer = setTimeout(() => {
                saveProgressToStorage();
                if (document.getElementById('reader-homepage').style.display !== 'none') renderHomepage();
            }, 600);
        }
    });
}

function saveProgressToStorage() {
    if (!currentKey) return;
    const scrollEl = document.getElementById('reader-scroll');
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    const rawPct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 100;
    const pct = clampPct(rawPct);
    localStorage.setItem('tapestry_scroll_' + currentKey, scrollTop);
    localStorage.setItem('tapestry_progress_' + currentKey, pct);
}

function flushScrollSave() {
    if (_scrollSaveTimer) {
        clearTimeout(_scrollSaveTimer);
        _scrollSaveTimer = null;
    }
    if (!currentKey || document.getElementById('reader-area').style.display === 'none') return;
    saveProgressToStorage();
}

function liveUpdateProgress() {
    if (!currentKey) return;
    const scrollEl = document.getElementById('reader-scroll');
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    const rawPct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 100;
    const pct = clampPct(rawPct);
    document.getElementById('reading-progress-fill').style.width = pct + '%';
    updateMinsLeft(pct);
}

function loadReaderPrefs() {
    const savedFont = localStorage.getItem('tapestry_font');
    const savedSize = localStorage.getItem('tapestry_size');
    if (savedFont) {
        const sel = document.getElementById('reader-font-select');
        if (sel) sel.value = savedFont;
    }
    if (savedSize) {
        const range = document.getElementById('reader-size-range');
        if (range) {
            range.value = savedSize;
            document.getElementById('reader-size-label').textContent = savedSize + 'px';
        }
    }
}