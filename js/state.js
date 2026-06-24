// Global state shared across pages (reset on page load)
let chapters = {};
let currentKey = null;                // only used in editor/reader
let editorMode = false;               // true when on editor pages
let storedPassword = "HambaHamba";    // default, will be overwritten from Firebase
let bookMeta = { title: "The Tapestry", author: "", intro: "", coverBase64: "" };
let pendingCoverFile = null;          // for book settings modal

// Notes state – used only in notes.html and possibly editor if needed
let notesData = {
    characters: {},
    potentialScenes: {},
    nations: {},
    religions: {},
    worldbuilding: {},
    overallStory: { content: '' },
    timeline: { positiveSuffix: 'AD', negativeSuffix: 'BC', entries: [] }
};
let notesCurrentCategory = null;
let notesCurrentCharId = null;
let notesCurrentPsCharId = null;
let notesCurrentChId = null;
let notesCurrentNationId = null;
let notesCurrentReligionId = null;
let notesCurrentWbId = null;
let notesUnsavedFlag = false;
let timelineUnsavedFlag = false;
let notesAddMode = null;