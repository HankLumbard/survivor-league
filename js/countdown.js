(() => {
  const target = new Date("2026-09-23T20:00:00-04:00").getTime();
  const el = document.getElementById("premiere-countdown");
  if (!el) return;

  const pad = (n) => String(n).padStart(2, "0");

  function updateCountdown() {
    const remaining = target - Date.now();

    if (remaining <= 0) {
      el.textContent = "THE SEASON HAS BEGUN";
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    el.innerHTML = `<span>${days}</span><small>DAYS</small> <span>${pad(hours)}</span><small>HRS</small> <span>${pad(minutes)}</span><small>MIN</small> <span>${pad(seconds)}</span><small>SEC</small>`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
