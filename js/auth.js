// Load password from Firebase on page load (call once)
async function loadPassword() {
    const snap = await db.ref('meta/password').get();
    if (snap.exists()) storedPassword = snap.val();
}
// (We'll call loadPassword() in the page that needs it, usually editor.html)