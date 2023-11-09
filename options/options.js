const manifest = browser.runtime.getManifest();
const versionElem = document.getElementById(`ext-version`);
versionElem.innerHTML = `Version ${manifest.version}`;