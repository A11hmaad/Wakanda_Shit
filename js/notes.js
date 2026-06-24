// ==================== NOTES COMPLETE LOGIC ====================

// ── Helpers ──
function hideAllNotesViews() {
    document.getElementById('notes-empty').style.display = 'none';
    document.getElementById('notes-browser').style.display = 'none';
    document.getElementById('notes-editor-content').style.display = 'none';
    document.getElementById('notes-pc-list').style.display = 'none';
    document.getElementById('notes-timeline-view').style.display = 'none';
}

// ── Render sidebar navigation ──
function renderNotesNav() {
    const nav = document.getElementById('notes-nav-list');
    const psCount = Object.keys(notesData.potentialScenes).length;
    const charCount = Object.keys(notesData.characters).length;
    const nationCount = Object.keys(notesData.nations).length;
    const religionCount = Object.keys(notesData.religions).length;
    const wbCount = Object.keys(notesData.worldbuilding).length;

    nav.innerHTML = `
        <li class="notes-nav-category ${notesCurrentCategory==='potentialScenes'?'active':''}" onclick="selectNotesCategory('potentialScenes')"><span class="cat-icon">🎬</span> Potential Scenes <span style="margin-left:auto;font-size:0.7rem;color:var(--muted);">${psCount}</span></li>
        <li class="notes-nav-category ${notesCurrentCategory==='characters'?'active':''}" onclick="selectNotesCategory('characters')"><span class="cat-icon">👤</span> Characters <span style="margin-left:auto;font-size:0.7rem;color:var(--muted);">${charCount}</span></li>
        <li class="notes-nav-category ${notesCurrentCategory==='nations'?'active':''}" onclick="selectNotesCategory('nations')"><span class="cat-icon">🏴</span> Nations <span style="margin-left:auto;font-size:0.7rem;color:var(--muted);">${nationCount}</span></li>
        <li class="notes-nav-category ${notesCurrentCategory==='religions'?'active':''}" onclick="selectNotesCategory('religions')"><span class="cat-icon">☀️</span> Religions <span style="margin-left:auto;font-size:0.7rem;color:var(--muted);">${religionCount}</span></li>
        <li class="notes-nav-category ${notesCurrentCategory==='worldbuilding'?'active':''}" onclick="selectNotesCategory('worldbuilding')"><span class="cat-icon">📜</span> Worldbuilding <span style="margin-left:auto;font-size:0.7rem;color:var(--muted);">${wbCount}</span></li>
        <li class="notes-nav-category ${notesCurrentCategory==='overallStory'?'active':''}" onclick="selectNotesCategory('overallStory')"><span class="cat-icon">📖</span> Overall Story</li>
        <li class="notes-nav-category ${notesCurrentCategory==='timeline'?'active':''}" onclick="selectNotesCategory('timeline')"><span class="cat-icon">⏳</span> Sort Timeline</li>`;

    if (notesCurrentCategory === 'potentialScenes') {
        const subList = document.createElement('ul');
        subList.className = 'notes-sub-list';
        Object.entries(notesData.potentialScenes).forEach(([psId, data]) => {
            const li = document.createElement('li');
            li.className = 'notes-sub-item' + (notesCurrentPsCharId === psId ? ' active' : '');
            li.innerHTML = `<span onclick="selectPotentialScenesCharacter('${psId}')" style="flex:1;">${escHtml(data.name || 'Unnamed')}</span><span class="sub-actions"><button class="icon-btn danger" onclick="event.stopPropagation();deletePotentialScenesCharacter('${psId}')">✕</button></span>`;
            subList.appendChild(li);
        });
        nav.appendChild(subList);
    }
}

// ── Category selection ──
function selectNotesCategory(category) {
    if (notesUnsavedFlag && notesCurrentCategory && notesCurrentCategory !== 'timeline') saveCurrentNoteSilent();
    if (timelineUnsavedFlag && notesCurrentCategory === 'timeline') saveTimelineEntriesSilent();

    notesCurrentCategory = category;
    notesCurrentCharId = null;
    notesCurrentPsCharId = null;
    notesCurrentChId = null;
    notesCurrentNationId = null;
    notesCurrentReligionId = null;
    notesCurrentWbId = null;
    notesUnsavedFlag = false;
    timelineUnsavedFlag = false;

    hideAllNotesViews();
    if (category === 'potentialScenes') showNotesBrowser('Potential Scenes', 'potentialScenes', notesData.potentialScenes);
    else if (category === 'characters') showNotesBrowser('Characters', 'characters', notesData.characters);
    else if (category === 'nations') showNotesBrowser('Nations', 'nations', notesData.nations);
    else if (category === 'religions') showNotesBrowser('Religions', 'religions', notesData.religions);
    else if (category === 'worldbuilding') showNotesBrowser('Worldbuilding', 'worldbuilding', notesData.worldbuilding);
    else if (category === 'overallStory') loadOverallStoryEditor();
    else if (category === 'timeline') loadTimelineView();
    renderNotesNav();
}

// ── Browser (card grid) ──
function showNotesBrowser(title, dataKey, dataObj) {
    hideAllNotesViews();
    document.getElementById('notes-browser').style.display = 'flex';
    document.getElementById('notes-browser-title').textContent = title;
    notesAddMode = dataKey;
    renderNotesCards(dataObj, dataKey);
}

function renderNotesCards(dataObj, dataKey) {
    const container = document.getElementById('notes-browser-content');
    const entries = Object.entries(dataObj);
    if (!entries.length) {
        container.innerHTML = `<p style="color:var(--muted);font-style:italic;text-align:center;padding:2rem;">No items yet. Click "+ Add" to create one.</p>`;
    } else {
        container.innerHTML = `<div class="notes-card-grid">${entries.map(([id,data])=>`<div class="notes-card" onclick="openNotesItem('${dataKey}','${id}')"><span class="notes-card-name">${escHtml(data.name||'Unnamed')}</span><span class="notes-card-actions"><button class="icon-btn danger" onclick="event.stopPropagation();deleteNotesItem('${dataKey}','${id}')">✕</button></span></div>`).join('')}</div>`;
    }
}

// ── Add / open / delete items ──
function handleNotesBrowserAdd() {
    if (notesAddMode === 'potentialScenes') openAddPotentialScenesCharacter();
    else if (notesAddMode === 'characters') openAddItem('characters', 'Add Character');
    else if (notesAddMode === 'nations') openAddItem('nations', 'Add Nation');
    else if (notesAddMode === 'religions') openAddItem('religions', 'Add Religion');
    else if (notesAddMode === 'worldbuilding') openAddItem('worldbuilding', 'Add Worldbuilding Reference');
}

function handleNotesAdd() { handleNotesBrowserAdd(); }

function openAddItem(mode, title) {
    notesAddMode = mode;
    document.getElementById('modal-add-item-title').textContent = title;
    document.getElementById('new-item-name').value = '';
    document.getElementById('add-item-error').textContent = '';
    openModal('modal-add-item');
}

async function addNotesItem() {
    const name = document.getElementById('new-item-name').value.trim();
    if (!name) { document.getElementById('add-item-error').textContent = 'Name required.'; return; }
    const mode = notesAddMode;
    closeModal('modal-add-item');
    if (mode === 'characters') {
        const id = db.ref('notes/characters').push().key;
        notesData.characters[id] = { name, content: '' };
        await db.ref('notes/characters/' + id).set({ name, content: '' });
        notesCurrentCharId = id;
        loadCharacterProfileEditor();
    } else if (mode === 'nations') {
        const id = db.ref('notes/nations').push().key;
        notesData.nations[id] = { name, content: '' };
        await db.ref('notes/nations/' + id).set({ name, content: '' });
        notesCurrentNationId = id;
        loadNationEditor();
    } else if (mode === 'religions') {
        const id = db.ref('notes/religions').push().key;
        notesData.religions[id] = { name, content: '' };
        await db.ref('notes/religions/' + id).set({ name, content: '' });
        notesCurrentReligionId = id;
        loadReligionEditor();
    } else if (mode === 'worldbuilding') {
        const id = db.ref('notes/worldbuilding').push().key;
        notesData.worldbuilding[id] = { name, content: '' };
        await db.ref('notes/worldbuilding/' + id).set({ name, content: '' });
        notesCurrentWbId = id;
        loadWorldbuildingEditor();
    }
    renderNotesNav();
}

function openNotesItem(dataKey, id) {
    if (dataKey === 'potentialScenes') selectPotentialScenesCharacter(id);
    else if (dataKey === 'characters') { notesCurrentCharId = id; loadCharacterProfileEditor(); renderNotesNav(); }
    else if (dataKey === 'nations') { notesCurrentNationId = id; loadNationEditor(); renderNotesNav(); }
    else if (dataKey === 'religions') { notesCurrentReligionId = id; loadReligionEditor(); renderNotesNav(); }
    else if (dataKey === 'worldbuilding') { notesCurrentWbId = id; loadWorldbuildingEditor(); renderNotesNav(); }
}

async function deleteNotesItem(dataKey, id) {
    if (!confirm('Delete this item?')) return;
    const pathMap = { characters:'notes/characters', potentialScenes:'notes/potentialScenes', nations:'notes/nations', religions:'notes/religions', worldbuilding:'notes/worldbuilding' };
    delete notesData[dataKey][id];
    await db.ref(pathMap[dataKey] + '/' + id).remove();
    if (dataKey === 'potentialScenes' && notesCurrentPsCharId === id) { notesCurrentPsCharId = null; notesCurrentChId = null; }
    else if (dataKey === 'characters' && notesCurrentCharId === id) { notesCurrentCharId = null; }
    else if (dataKey === 'nations' && notesCurrentNationId === id) { notesCurrentNationId = null; }
    else if (dataKey === 'religions' && notesCurrentReligionId === id) { notesCurrentReligionId = null; }
    else if (dataKey === 'worldbuilding' && notesCurrentWbId === id) { notesCurrentWbId = null; }
    hideAllNotesViews();
    selectNotesCategory(notesCurrentCategory);
    renderNotesNav();
}

// ── Potential Scenes ──
function openAddPotentialScenesCharacter() {
    notesAddMode = 'potentialScenes';
    document.getElementById('modal-add-item-title').textContent = 'Add Character';
    document.getElementById('new-item-name').value = '';
    document.getElementById('add-item-error').textContent = '';
    openModal('modal-add-item');
    document.getElementById('modal-add-item-btn').onclick = async function() {
        const name = document.getElementById('new-item-name').value.trim();
        if (!name) { document.getElementById('add-item-error').textContent = 'Name required.'; return; }
        const id = db.ref('notes/potentialScenes').push().key;
        notesData.potentialScenes[id] = { name, chapters: {} };
        await db.ref('notes/potentialScenes/' + id).set({ name, chapters: {} });
        closeModal('modal-add-item');
        document.getElementById('modal-add-item-btn').onclick = addNotesItem;  // reset
        notesCurrentPsCharId = id;
        notesCurrentChId = null;
        showPotentialChaptersList();
        renderNotesNav();
    };
}

function selectPotentialScenesCharacter(psId) {
    notesCurrentPsCharId = psId;
    notesCurrentChId = null;
    notesUnsavedFlag = false;
    showPotentialChaptersList();
    renderNotesNav();
}

async function deletePotentialScenesCharacter(psId) {
    if (!confirm('Delete this character and all their potential chapters?')) return;
    delete notesData.potentialScenes[psId];
    await db.ref('notes/potentialScenes/' + psId).remove();
    if (notesCurrentPsCharId === psId) { notesCurrentPsCharId = null; notesCurrentChId = null; }
    hideAllNotesViews();
    selectNotesCategory('potentialScenes');
    renderNotesNav();
}

function showPotentialChaptersList() {
    if (!notesCurrentPsCharId) return;
    hideAllNotesViews();
    const psData = notesData.potentialScenes[notesCurrentPsCharId];
    if (!psData) return;
    document.getElementById('notes-pc-list').style.display = 'flex';
    document.getElementById('notes-pc-list-title').textContent = (psData.name || 'Character') + ' — Chapters';
    const container = document.getElementById('notes-pc-list-content');
    const chapters = psData.chapters || {};
    const sorted = Object.entries(chapters).sort((a,b) => (a[1].serial||0) - (b[1].serial||0));
    if (!sorted.length) {
        container.innerHTML = `<p style="color:var(--muted);font-style:italic;text-align:center;padding:2rem;">No potential chapters yet. Click "+ Add Chapter" to create one.</p>`;
    } else {
        container.innerHTML = `<div style="display:flex;flex-direction:column;gap:0.5rem;">${sorted.map(([chId,chData])=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:0.7rem 1rem;border:1px solid var(--rule);cursor:pointer;transition:border-color 0.15s;flex-wrap:wrap;gap:0.4rem;" onclick="openPotentialChapterEditor('${notesCurrentPsCharId}','${chId}')"><span style="font-family:var(--serif);font-size:1rem;color:var(--ink);">${chData.serial||''}. ${escHtml(chData.title||'Untitled')}</span><span style="display:flex;gap:0.3rem;"><button class="icon-btn" onclick="event.stopPropagation();openEditPotentialChapter('${notesCurrentPsCharId}','${chId}')">✎</button><button class="icon-btn danger" onclick="event.stopPropagation();deletePotentialChapter('${notesCurrentPsCharId}','${chId}')">✕</button></span></div>`).join('')}</div>`;
    }
}

function openPotentialChapterEditor(psId, chId) {
    notesCurrentPsCharId = psId;
    notesCurrentChId = chId;
    notesUnsavedFlag = false;
    const chData = notesData.potentialScenes[psId]?.chapters?.[chId];
    if (!chData) return;
    hideAllNotesViews();
    document.getElementById('notes-editor-content').style.display = 'flex';
    document.getElementById('notes-editor-title').value = chData.title || '';
    document.getElementById('notes-editor-body').innerHTML = chData.content || '';
    document.getElementById('notes-save-status').textContent = 'Saved';
}

function openAddPotentialChapter() {
    if (!notesCurrentPsCharId) return;
    const psData = notesData.potentialScenes[notesCurrentPsCharId];
    const chCount = psData && psData.chapters ? Object.keys(psData.chapters).length : 0;
    document.getElementById('new-pc-title').value = '';
    document.getElementById('new-pc-serial').value = chCount + 1;
    document.getElementById('add-pc-error').textContent = '';
    openModal('modal-add-potential-chapter');
}

async function addPotentialChapter() {
    if (!notesCurrentPsCharId) return;
    const title = document.getElementById('new-pc-title').value.trim();
    const serial = parseInt(document.getElementById('new-pc-serial').value) || 1;
    if (!title) { document.getElementById('add-pc-error').textContent = 'Title required.'; return; }
    const chId = db.ref('notes/potentialScenes/' + notesCurrentPsCharId + '/chapters').push().key;
    if (!notesData.potentialScenes[notesCurrentPsCharId].chapters) notesData.potentialScenes[notesCurrentPsCharId].chapters = {};
    notesData.potentialScenes[notesCurrentPsCharId].chapters[chId] = { title, serial, content: '' };
    await db.ref('notes/potentialScenes/' + notesCurrentPsCharId + '/chapters/' + chId).set({ title, serial, content: '' });
    closeModal('modal-add-potential-chapter');
    notesCurrentChId = chId;
    openPotentialChapterEditor(notesCurrentPsCharId, chId);
    renderNotesNav();
}

function openEditPotentialChapter(psId, chId) {
    const chData = notesData.potentialScenes[psId]?.chapters?.[chId];
    if (!chData) return;
    document.getElementById('edit-pc-key').value = chId;
    document.getElementById('edit-pc-key').dataset.psId = psId;
    document.getElementById('edit-pc-title').value = chData.title || '';
    document.getElementById('edit-pc-serial').value = chData.serial || 1;
    openModal('modal-edit-potential-chapter');
}

async function savePotentialChapterMeta() {
    const chId = document.getElementById('edit-pc-key').value;
    const psId = document.getElementById('edit-pc-key').dataset.psId;
    const title = document.getElementById('edit-pc-title').value.trim() || 'Untitled';
    const serial = parseInt(document.getElementById('edit-pc-serial').value) || 1;
    if (!notesData.potentialScenes[psId].chapters[chId]) return;
    notesData.potentialScenes[psId].chapters[chId].title = title;
    notesData.potentialScenes[psId].chapters[chId].serial = serial;
    await db.ref('notes/potentialScenes/' + psId + '/chapters/' + chId).update({ title, serial });
    if (notesCurrentChId === chId) document.getElementById('notes-editor-title').value = title;
    closeModal('modal-edit-potential-chapter');
    showPotentialChaptersList();
    renderNotesNav();
}

async function deletePotentialChapter(psId, chId) {
    if (!confirm('Delete this potential chapter?')) return;
    delete notesData.potentialScenes[psId].chapters[chId];
    await db.ref('notes/potentialScenes/' + psId + '/chapters/' + chId).remove();
    if (notesCurrentChId === chId) { notesCurrentChId = null; hideAllNotesViews(); showPotentialChaptersList(); }
    else showPotentialChaptersList();
    renderNotesNav();
}

// ── Editors for Character / Nation / Religion / Worldbuilding ──
function loadCharacterProfileEditor() {
    if (!notesCurrentCharId) return;
    const data = notesData.characters[notesCurrentCharId];
    if (!data) return;
    hideAllNotesViews();
    document.getElementById('notes-editor-content').style.display = 'flex';
    document.getElementById('notes-editor-title').value = data.name || '';
    document.getElementById('notes-editor-body').innerHTML = data.content || '';
    document.getElementById('notes-save-status').textContent = 'Saved';
    notesUnsavedFlag = false;
}
function loadNationEditor() {
    if (!notesCurrentNationId) return;
    const data = notesData.nations[notesCurrentNationId];
    if (!data) return;
    hideAllNotesViews();
    document.getElementById('notes-editor-content').style.display = 'flex';
    document.getElementById('notes-editor-title').value = data.name || '';
    document.getElementById('notes-editor-body').innerHTML = data.content || '';
    document.getElementById('notes-save-status').textContent = 'Saved';
    notesUnsavedFlag = false;
}
function loadReligionEditor() {
    if (!notesCurrentReligionId) return;
    const data = notesData.religions[notesCurrentReligionId];
    if (!data) return;
    hideAllNotesViews();
    document.getElementById('notes-editor-content').style.display = 'flex';
    document.getElementById('notes-editor-title').value = data.name || '';
    document.getElementById('notes-editor-body').innerHTML = data.content || '';
    document.getElementById('notes-save-status').textContent = 'Saved';
    notesUnsavedFlag = false;
}
function loadWorldbuildingEditor() {
    if (!notesCurrentWbId) return;
    const data = notesData.worldbuilding[notesCurrentWbId];
    if (!data) return;
    hideAllNotesViews();
    document.getElementById('notes-editor-content').style.display = 'flex';
    document.getElementById('notes-editor-title').value = data.name || '';
    document.getElementById('notes-editor-body').innerHTML = data.content || '';
    document.getElementById('notes-save-status').textContent = 'Saved';
    notesUnsavedFlag = false;
}
function loadOverallStoryEditor() {
    hideAllNotesViews();
    document.getElementById('notes-editor-content').style.display = 'flex';
    document.getElementById('notes-editor-title').value = 'Overall Story';
    document.getElementById('notes-editor-title').readOnly = true;
    document.getElementById('notes-editor-body').innerHTML = notesData.overallStory.content || '';
    document.getElementById('notes-save-status').textContent = 'Saved';
    notesUnsavedFlag = false;
}

// ── Timeline ──
function loadTimelineView() {
    hideAllNotesViews();
    document.getElementById('notes-timeline-view').style.display = 'flex';
    document.getElementById('timeline-era-positive').value = notesData.timeline.positiveSuffix || 'AD';
    document.getElementById('timeline-era-negative').value = notesData.timeline.negativeSuffix || 'BC';
    renderTimelineEntries();
    timelineUnsavedFlag = false;
    document.getElementById('timeline-save-status').textContent = '';
}

function formatTimelineYear(year) {
    const posSuffix = notesData.timeline.positiveSuffix || 'AD';
    const negSuffix = notesData.timeline.negativeSuffix || 'BC';
    if (year >= 0) return year + ' ' + posSuffix;
    else return Math.abs(year) + ' ' + negSuffix;
}

function renderTimelineEntries() {
    const container = document.getElementById('timeline-entries');
    const entries = notesData.timeline.entries || [];
    const sorted = [...entries].sort((a,b) => (a.year||0) - (b.year||0));
    container.innerHTML = '';
    sorted.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'timeline-entry';
        div.innerHTML = `<span class="timeline-entry-year">${formatTimelineYear(entry.year||0)}</span><input type="text" class="timeline-entry-text" value="${escHtml(entry.text||'')}" onchange="updateTimelineEntry(${idx},this.value)" /><span class="timeline-entry-actions"><button class="icon-btn danger" onclick="deleteTimelineEntry(${idx})">✕</button></span>`;
        container.appendChild(div);
    });
}

function addTimelineEntry() {
    const year = parseInt(document.getElementById('timeline-new-year').value);
    const text = document.getElementById('timeline-new-text').value.trim();
    if (isNaN(year) || !text) return;
    if (!notesData.timeline.entries) notesData.timeline.entries = [];
    notesData.timeline.entries.push({ year, text });
    document.getElementById('timeline-new-year').value = '';
    document.getElementById('timeline-new-text').value = '';
    timelineUnsavedFlag = true;
    document.getElementById('timeline-save-status').textContent = 'Unsaved changes';
    renderTimelineEntries();
}

function updateTimelineEntry(idx, newText) {
    const entries = notesData.timeline.entries || [];
    const sorted = [...entries].sort((a,b) => (a.year||0) - (b.year||0));
    const entry = sorted[idx];
    const origIdx = entries.indexOf(entry);
    if (origIdx >= 0) notesData.timeline.entries[origIdx].text = newText;
    timelineUnsavedFlag = true;
    document.getElementById('timeline-save-status').textContent = 'Unsaved changes';
}

function deleteTimelineEntry(idx) {
    const entries = notesData.timeline.entries || [];
    const sorted = [...entries].sort((a,b) => (a.year||0) - (b.year||0));
    const entry = sorted[idx];
    const origIdx = entries.indexOf(entry);
    if (origIdx >= 0) notesData.timeline.entries.splice(origIdx, 1);
    timelineUnsavedFlag = true;
    document.getElementById('timeline-save-status').textContent = 'Unsaved changes';
    renderTimelineEntries();
}

async function saveTimelineSettings() {
    const posSuffix = document.getElementById('timeline-era-positive').value.trim() || 'AD';
    const negSuffix = document.getElementById('timeline-era-negative').value.trim() || 'BC';
    notesData.timeline.positiveSuffix = posSuffix;
    notesData.timeline.negativeSuffix = negSuffix;
    await db.ref('notes/timeline/positiveSuffix').set(posSuffix);
    await db.ref('notes/timeline/negativeSuffix').set(negSuffix);
    renderTimelineEntries();
    document.getElementById('timeline-save-status').textContent = 'Era saved ✓';
    setTimeout(() => { if (document.getElementById('timeline-save-status').textContent === 'Era saved ✓') document.getElementById('timeline-save-status').textContent = ''; }, 2000);
}

async function saveTimelineEntries() {
    await db.ref('notes/timeline/entries').set(notesData.timeline.entries || []);
    timelineUnsavedFlag = false;
    document.getElementById('timeline-save-status').textContent = 'Timeline saved ✓';
    setTimeout(() => { if (document.getElementById('timeline-save-status').textContent === 'Timeline saved ✓') document.getElementById('timeline-save-status').textContent = ''; }, 2000);
}

async function saveTimelineEntriesSilent() {
    await db.ref('notes/timeline/entries').set(notesData.timeline.entries || []);
    timelineUnsavedFlag = false;
}

function timelineUnsaved() {
    timelineUnsavedFlag = true;
    document.getElementById('timeline-save-status').textContent = 'Unsaved changes';
}

// ── Note formatting & saving ──
function notesFormat(evt, cmd) { evt.preventDefault(); document.execCommand(cmd, false, null); }
function notesUnsaved() { notesUnsavedFlag = true; document.getElementById('notes-save-status').textContent = 'Unsaved changes'; }
function handleNotesEditorKey(evt) {
    if ((evt.ctrlKey || evt.metaKey) && ['b','i','u'].includes(evt.key.toLowerCase())) { /* native behaviour */ }
    if (!(evt.ctrlKey || evt.metaKey) || evt.key !== 's') notesUnsaved();
}

async function saveCurrentNote() {
    const title = document.getElementById('notes-editor-title').value.trim() || 'Untitled';
    const content = document.getElementById('notes-editor-body').innerHTML;
    if (notesCurrentCategory === 'characters' && notesCurrentCharId) {
        notesData.characters[notesCurrentCharId].name = title;
        notesData.characters[notesCurrentCharId].content = content;
        await db.ref('notes/characters/' + notesCurrentCharId).update({ name: title, content });
    } else if (notesCurrentCategory === 'potentialScenes' && notesCurrentPsCharId && notesCurrentChId) {
        const chObj = notesData.potentialScenes[notesCurrentPsCharId].chapters[notesCurrentChId];
        if (chObj) { chObj.title = title; chObj.content = content; }
        await db.ref('notes/potentialScenes/' + notesCurrentPsCharId + '/chapters/' + notesCurrentChId).update({ title, content });
    } else if (notesCurrentCategory === 'nations' && notesCurrentNationId) {
        notesData.nations[notesCurrentNationId].name = title;
        notesData.nations[notesCurrentNationId].content = content;
        await db.ref('notes/nations/' + notesCurrentNationId).update({ name: title, content });
    } else if (notesCurrentCategory === 'religions' && notesCurrentReligionId) {
        notesData.religions[notesCurrentReligionId].name = title;
        notesData.religions[notesCurrentReligionId].content = content;
        await db.ref('notes/religions/' + notesCurrentReligionId).update({ name: title, content });
    } else if (notesCurrentCategory === 'worldbuilding' && notesCurrentWbId) {
        notesData.worldbuilding[notesCurrentWbId].name = title;
        notesData.worldbuilding[notesCurrentWbId].content = content;
        await db.ref('notes/worldbuilding/' + notesCurrentWbId).update({ name: title, content });
    } else if (notesCurrentCategory === 'overallStory') {
        notesData.overallStory.content = content;
        await db.ref('notes/overallStory/content').set(content);
    }
    notesUnsavedFlag = false;
    document.getElementById('notes-save-status').textContent = 'Saved ✓';
    renderNotesNav();
}

async function saveCurrentNoteSilent() {
    const title = document.getElementById('notes-editor-title').value.trim() || 'Untitled';
    const content = document.getElementById('notes-editor-body').innerHTML;
    if (notesCurrentCategory === 'characters' && notesCurrentCharId) {
        notesData.characters[notesCurrentCharId].name = title;
        notesData.characters[notesCurrentCharId].content = content;
        await db.ref('notes/characters/' + notesCurrentCharId).update({ name: title, content });
    } else if (notesCurrentCategory === 'potentialScenes' && notesCurrentPsCharId && notesCurrentChId) {
        const chObj = notesData.potentialScenes[notesCurrentPsCharId].chapters[notesCurrentChId];
        if (chObj) { chObj.title = title; chObj.content = content; }
        await db.ref('notes/potentialScenes/' + notesCurrentPsCharId + '/chapters/' + notesCurrentChId).update({ title, content });
    } else if (notesCurrentCategory === 'nations' && notesCurrentNationId) {
        notesData.nations[notesCurrentNationId].name = title;
        notesData.nations[notesCurrentNationId].content = content;
        await db.ref('notes/nations/' + notesCurrentNationId).update({ name: title, content });
    } else if (notesCurrentCategory === 'religions' && notesCurrentReligionId) {
        notesData.religions[notesCurrentReligionId].name = title;
        notesData.religions[notesCurrentReligionId].content = content;
        await db.ref('notes/religions/' + notesCurrentReligionId).update({ name: title, content });
    } else if (notesCurrentCategory === 'worldbuilding' && notesCurrentWbId) {
        notesData.worldbuilding[notesCurrentWbId].name = title;
        notesData.worldbuilding[notesCurrentWbId].content = content;
        await db.ref('notes/worldbuilding/' + notesCurrentWbId).update({ name: title, content });
    } else if (notesCurrentCategory === 'overallStory') {
        notesData.overallStory.content = content;
        await db.ref('notes/overallStory/content').set(content);
    }
    notesUnsavedFlag = false;
}

// ── Back navigation ──
function notesBrowserBack() {
    if (notesCurrentCategory) selectNotesCategory(notesCurrentCategory);
}
function notesEditorBack() {
    if (notesCurrentCategory === 'potentialScenes' && notesCurrentChId) {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        notesCurrentChId = null;
        showPotentialChaptersList();
    } else if (notesCurrentCategory === 'potentialScenes' && notesCurrentPsCharId) {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        notesCurrentPsCharId = null;
        selectNotesCategory('potentialScenes');
    } else if (notesCurrentCategory === 'characters' && notesCurrentCharId) {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        notesCurrentCharId = null;
        selectNotesCategory('characters');
    } else if (notesCurrentCategory === 'nations' && notesCurrentNationId) {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        notesCurrentNationId = null;
        selectNotesCategory('nations');
    } else if (notesCurrentCategory === 'religions' && notesCurrentReligionId) {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        notesCurrentReligionId = null;
        selectNotesCategory('religions');
    } else if (notesCurrentCategory === 'worldbuilding' && notesCurrentWbId) {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        notesCurrentWbId = null;
        selectNotesCategory('worldbuilding');
    } else if (notesCurrentCategory === 'overallStory') {
        if (notesUnsavedFlag) saveCurrentNoteSilent();
        selectNotesCategory('overallStory');
    }
}
function notesPcListBack() {
    if (notesUnsavedFlag) saveCurrentNoteSilent();
    notesCurrentPsCharId = null;
    notesCurrentChId = null;
    selectNotesCategory('potentialScenes');
}
function notesTimelineBack() {
    if (timelineUnsavedFlag) saveTimelineEntriesSilent();
    selectNotesCategory('timeline');
}