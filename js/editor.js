// ==================== EDITOR (Chapters) ====================
function updateEditorWordCount() {
    const wc = wordCount(document.getElementById('editor-content').innerHTML);
    document.getElementById('editor-wordcount').textContent = wc.toLocaleString() + ' words';
}

function updateToolbar() {
    ['bold', 'italic', 'underline'].forEach(cmd => {
        const btn = document.getElementById('tb-' + cmd);
        if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
    });
}

// Formatting (for toolbar buttons)
function e(evt, cmd) {
    evt.preventDefault();
    document.execCommand(cmd, false, null);
    updateToolbar();
}

// Keyboard handler for the editor content area
function handleEditorKey(evt) {
    if ((evt.ctrlKey || evt.metaKey) && ['b', 'i', 'u'].includes(evt.key.toLowerCase())) {
        setTimeout(updateToolbar, 10);
    }
    if (!(evt.ctrlKey || evt.metaKey) || evt.key !== 's') {
        document.getElementById('save-status').textContent = 'Unsaved changes';
    }
}
function handleEditorInput() {
    document.getElementById('save-status').textContent = 'Unsaved changes';
    updateEditorWordCount();
}

// Global keyboard shortcut (Ctrl+S) handled in page's own script

// Book Settings (used in editor.html)
async function openBookSettings() {
    // fill modal with current bookMeta
    document.getElementById('bs-title').value = bookMeta.title;
    document.getElementById('bs-author').value = bookMeta.author;
    document.getElementById('bs-intro').value = bookMeta.intro || '';
    document.getElementById('bs-error').textContent = '';
    pendingCoverFile = null;
    const curWrap = document.getElementById('cover-current-wrap');
    if (bookMeta.coverBase64) {
        document.getElementById('cover-current-img').src = bookMeta.coverBase64;
        curWrap.style.display = '';
    } else {
        curWrap.style.display = 'none';
    }
    document.getElementById('cover-new-preview-wrap').style.display = 'none';
    document.getElementById('bs-cover-input').value = '';
    openModal('modal-book-settings');
}

function previewCover(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    pendingCoverFile = file;
    document.getElementById('cover-new-preview').src = URL.createObjectURL(file);
    document.getElementById('cover-new-preview-wrap').style.display = '';
}

async function removeCover() {
    if (!confirm('Remove the current cover image?')) return;
    bookMeta.coverBase64 = '';
    await db.ref('meta/coverBase64').set('');
    document.getElementById('cover-current-wrap').style.display = 'none';
    document.getElementById('cover-current-img').src = '';
    applyBookMeta();
}

async function saveBookSettings() {
    const err = document.getElementById('bs-error');
    err.textContent = 'Saving…';
    bookMeta.title = document.getElementById('bs-title').value.trim() || 'The Tapestry';
    bookMeta.author = document.getElementById('bs-author').value.trim();
    bookMeta.intro = document.getElementById('bs-intro').value.trim();
    if (pendingCoverFile) {
        try {
            bookMeta.coverBase64 = await fileToBase64(pendingCoverFile);
            pendingCoverFile = null;
        } catch (e) {
            err.textContent = 'Could not read image file.';
            return;
        }
    }
    try {
        await db.ref('meta').update({
            title: bookMeta.title,
            author: bookMeta.author,
            intro: bookMeta.intro,
            coverBase64: bookMeta.coverBase64
        });
    } catch (e) {
        err.textContent = 'Save failed: ' + e.message;
        return;
    }
    applyBookMeta();
    err.textContent = '';
    closeModal('modal-book-settings');
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
    });
}

function applyBookMeta() {
    document.title = 'The Tapestry';
    // Update header titles if present
    const t = document.getElementById('editor-book-title');
    if (t) t.textContent = bookMeta.title || 'The Book';
}