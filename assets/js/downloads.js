(() => {
  const versionBadge = document.getElementById("zeiterfassung-plus-version");

  if (!versionBadge) return;

  fetch("/dateien/zeiterfassung-plus/release.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Release-Info konnte nicht geladen werden.");
      return response.json();
    })
    .then((release) => {
      if (typeof release.displayVersion === "string" && release.displayVersion.trim()) {
        versionBadge.textContent = release.displayVersion.trim();
      }
    })
    .catch(() => {
      // Der neutrale Text aus dem HTML bleibt bei fehlenden Release-Infos stehen.
    });
})();
