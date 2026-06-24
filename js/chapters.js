// ==================== CHAPTERS ====================
function sortedChapters() {
    return Object.entries(chapters)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => (a.serial || 0) - (b.serial || 0));
}

async function loadChaptersFromDB() {
    db.ref('chapters').on('value', snap => {
        chapters = snap.val() || {};
        // After data arrives, update UI depending on current page
        if (typeof renderChapterLists === 'function') renderChapterLists();
        if (typeof renderHomepage === 'function') renderHomepage();
    });
}

// ========== RENDERING (shared) ==========
function renderChapterLists() {
    const sorted = sortedChapters();
    const lastKey = localStorage.getItem('tapestry_last_chapter');

    // Editor sidebar
    const el = document.getElementById('editor-chapter-list');
    if (el) {
        el.innerHTML = '';
        sorted.forEach(ch => {
            const wc = wordCount(ch.content);
            const li = document.createElement('li');
            li.className = 'chapter-item' + (ch.key === currentKey ? ' active' : '');
            li.innerHTML = `
                <span class="chapter-num">${ch.serial || ''}</span>
                <span class="chapter-title-text">${escHtml(ch.title || 'Untitled')}</span>
                <span class="chapter-rt">${wc.toLocaleString()}w</span>
                <span class="chapter-actions">
                    <button class="icon-btn" onclick="openEditChapter('${ch.key}')">✎</button>
                    <button class="icon-btn danger" onclick="deleteChapter('${ch.key}')">✕</button>
                </span>`;
            li.addEventListener('click', evt => {
                if (evt.target.closest('.chapter-actions')) return;
                selectChapter(ch.key, true);
                if (typeof closeDrawer === 'function') closeDrawer('editor');
            });
            el.appendChild(li);
        });
    }

    // Reader sidebar
    const rl = document.getElementById('reader-chapter-list');
    if (rl) {
        rl.innerHTML = '';
        sorted.forEach(ch => {
            const rt = readingMins(ch.content);
            const progress = clampPct(parseInt(localStorage.getItem('tapestry_progress_' + ch.key)) || 0);
            const isLast = ch.key === lastKey;
            const li = document.createElement('li');
            li.className = 'chapter-item' + (ch.key === currentKey ? ' active' : '');
            li.innerHTML = `
                <span class="chapter-num">${ch.serial || ''}</span>
                <span class="chapter-title-text">${escHtml(ch.title || 'Untitled')}${isLast && ch.key !== currentKey ? ' ↩' : ''}</span>
                <span class="chapter-rt">${progress > 0 ? progress + '%' : rt + 'min'}</span>`;
            li.addEventListener('click', () => {
                selectChapter(ch.key, false, 'right');
                if (typeof closeDrawer === 'function') closeDrawer('reader');
            });
            rl.appendChild(li);
        });
    }
}

function renderHomepage() {
    // Only relevant on reader.html
    if (!document.getElementById('rh-title-display')) return;
    document.getElementById('rh-title-display').textContent = bookMeta.title || 'The Book';
    document.getElementById('rh-author-display').textContent = bookMeta.author || '';
    const coverWrap = document.getElementById('rh-cover-wrap');
    if (bookMeta.coverBase64) {
        coverWrap.innerHTML = `<img class="rh-cover" src="${bookMeta.coverBase64}" alt="Cover" />`;
    } else {
        coverWrap.innerHTML = '';
    }
    const introEl = document.getElementById('rh-intro-display');
    if (bookMeta.intro && bookMeta.intro.trim()) {
        introEl.style.display = '';
        introEl.innerHTML = bookMeta.intro.split('\n').map(l => `<p style="margin-bottom:0.8em">${escHtml(l)}</p>`).join('');
    } else {
        introEl.style.display = 'none';
    }
    const sorted = sortedChapters();
    document.getElementById('rh-read-heading').textContent = sorted.length ? `Read ${bookMeta.title || 'the book'}` : '';
    const rl = document.getElementById('rh-chapter-list');
    if (!sorted.length) {
        rl.innerHTML = '<li style="font-family:var(--serif);font-style:italic;color:var(--muted);padding:1rem 0;">No chapters yet.</li>';
        return;
    }
    const lastKey = localStorage.getItem('tapestry_last_chapter');
    rl.innerHTML = '';
    sorted.forEach(ch => {
        const progress = clampPct(parseInt(localStorage.getItem('tapestry_progress_' + ch.key)) || 0);
        const rt = readingMins(ch.content);
        const isLast = ch.key === lastKey;
        let metaText = rt + ' min read';
        if (progress > 0) metaText += ' · ' + progress + '% read';
        const li = document.createElement('li');
        li.className = 'rh-chapter-item';
        li.innerHTML = `
            <span class="rh-ci-num">${ch.serial || ''}</span>
            <div class="rhi-text">
                <div class="rhi-top">
                    <span class="rh-ci-title">${escHtml(ch.title || 'Untitled')}</span>
                    ${isLast ? '<span class="rhi-here-badge">↩ You were here</span>' : ''}
                </div>
                <span class="rhi-meta">${metaText}</span>
                <div class="rhi-progress"><div class="rhi-progress-fill" style="width:${progress}%"></div></div>
            </div>`;
        li.addEventListener('click', () => selectChapter(ch.key, false, 'right'));
        rl.appendChild(li);
    });
}

// ========== CHAPTER ACTIONS ==========
function selectChapter(key, isEditor, animDir) {
    currentKey = key;
    const ch = chapters[key];
    if (!ch) return;
    if (isEditor) {
        // Editor view – set up editor area
        document.getElementById('editor-empty').style.display = 'none';
        document.getElementById('editor-area').style.display = 'flex';
        document.getElementById('editor-title-input').value = ch.title || '';
        document.getElementById('editor-content').innerHTML = ch.content || '';
        document.getElementById('save-status').textContent = 'Saved';
        if (typeof updateEditorWordCount === 'function') updateEditorWordCount();
    } else {
        // Reader view
        localStorage.setItem('tapestry_last_chapter', key);
        const wrap = document.querySelector('.reader-content-wrap');
        wrap.classList.remove('page-anim-right', 'page-anim-left', 'page-anim-fade');
        void wrap.offsetWidth;
        if (animDir === 'right') wrap.classList.add('page-anim-right');
        else if (animDir === 'left') wrap.classList.add('page-anim-left');
        else wrap.classList.add('page-anim-fade');

        document.getElementById('reader-homepage').style.display = 'none';
        document.getElementById('reader-area').style.display = '';
        document.getElementById('reading-progress-bar').style.display = 'block';
        document.getElementById('reader-chapter-title').textContent = ch.title || 'Untitled';
        document.getElementById('reader-body').innerHTML = ch.content || '<em style="color:var(--muted)">This chapter has no content yet.</em>';
        document.getElementById('reader-chapter-meta').textContent =
            wordCount(ch.content).toLocaleString() + ' words · ' + readingMins(ch.content) + ' min read';

        applyReaderFont();
        applyReaderSize();
        updateChapterNav();

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        const savedScroll = parseInt(localStorage.getItem('tapestry_scroll_' + key)) || 0;
        const savedProgress = clampPct(parseInt(localStorage.getItem('tapestry_progress_' + key)) || 0);
        if (!localStorage.getItem('tapestry_scroll_' + key) && savedScroll === 0) {
            localStorage.setItem('tapestry_progress_' + key, 0);
            localStorage.setItem('tapestry_scroll_' + key, 0);
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.getElementById('reader-scroll').scrollTop = savedScroll;
                window.scrollTo(0, 0);
                document.getElementById('reading-progress-fill').style.width = savedProgress + '%';
                updateMinsLeft(savedProgress);
            });
        });
    }
    renderChapterLists();
}

function updateChapterNav() {
    const sorted = sortedChapters();
    const idx = sorted.findIndex(c => c.key === currentKey);
    const isLast = idx === sorted.length - 1;
    if (idx > 0) {
        document.getElementById('nav-prev').classList.remove('disabled');
        document.getElementById('nav-prev-title').textContent = sorted[idx - 1].title || 'Untitled';
    } else {
        document.getElementById('nav-prev').classList.add('disabled');
    }
    if (!isLast) {
        document.getElementById('nav-next').classList.remove('disabled');
        document.getElementById('nav-next-title').textContent = sorted[idx + 1].title || 'Untitled';
        document.getElementById('end-of-book').classList.remove('visible');
    } else {
        document.getElementById('nav-next').classList.add('disabled');
        document.getElementById('end-of-book').classList.add('visible');
    }
}

function navChapter(dir) {
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    const sorted = sortedChapters();
    const idx = sorted.findIndex(c => c.key === currentKey);
    const next = sorted[idx + dir];
    if (next) selectChapter(next.key, false, dir === 1 ? 'right' : 'left');
}

// ========== EDITOR‑SPECIFIC CHAPTER FUNCTIONS ==========
async function saveCurrentChapter() {
    if (!currentKey) return;
    const title = document.getElementById('editor-title-input').value.trim() || 'Untitled';
    const content = document.getElementById('editor-content').innerHTML;
    await db.ref('chapters/' + currentKey).update({ title, content });
    document.getElementById('save-status').textContent = 'Saved ✓';
}

function openAddChapter() {
    document.getElementById('new-chapter-serial').value = sortedChapters().length + 1;
    document.getElementById('new-chapter-title').value = '';
    document.getElementById('add-chapter-error').textContent = '';
    openModal('modal-add-chapter');
}

async function addChapter() {
    const title = document.getElementById('new-chapter-title').value.trim();
    const serial = parseInt(document.getElementById('new-chapter-serial').value) || 1;
    if (!title) { document.getElementById('add-chapter-error').textContent = 'Title required.'; return; }
    const ref = db.ref('chapters').push();
    await ref.set({ title, serial, content: '' });
    closeModal('modal-add-chapter');
    selectChapter(ref.key, true);
}

function openEditChapter(key) {
    const ch = chapters[key];
    if (!ch) return;
    document.getElementById('edit-chapter-key').value = key;
    document.getElementById('edit-chapter-title').value = ch.title || '';
    document.getElementById('edit-chapter-serial').value = ch.serial || 1;
    openModal('modal-edit-chapter');
}

async function saveChapterMeta() {
    const key = document.getElementById('edit-chapter-key').value;
    const title = document.getElementById('edit-chapter-title').value.trim() || 'Untitled';
    const serial = parseInt(document.getElementById('edit-chapter-serial').value) || 1;
    await db.ref('chapters/' + key).update({ title, serial });
    if (key === currentKey) document.getElementById('editor-title-input').value = title;
    closeModal('modal-edit-chapter');
}

async function deleteChapter(key) {
    if (!confirm('Delete this chapter? This cannot be undone.')) return;
    await db.ref('chapters/' + key).remove();
    if (currentKey === key) {
        currentKey = null;
        document.getElementById('editor-empty').style.display = '';
        document.getElementById('editor-area').style.display = 'none';
    }
}