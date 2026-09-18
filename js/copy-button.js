/* ── Reicon Morph Copy Button ── */
(function () {
  const btn = document.getElementById("cpyBtn");
  if (!btn) return;
  const label = document.getElementById("cpyLabel");
  const idleText = label ? label.textContent : "Copy";
  let timer = null;

  btn.addEventListener("click", () => {
    const textToCopy = btn.getAttribute("data-copy") || "dev@devchauhan.in";

    btn.classList.add("copied");
    if (label) label.textContent = "Copied!";

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove("copied");
      if (label) label.textContent = idleText;
    }, 1500);
  });
})();
