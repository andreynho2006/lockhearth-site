(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Entrances: each section's parts rise in order, once.
  const groups = new Map();
  document.querySelectorAll(".reveal").forEach((el) => {
    const host = el.closest("section, header, footer") || document.body;
    if (!groups.has(host)) groups.set(host, []);
    groups.get(host).push(el);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      (groups.get(entry.target) || []).forEach((el, i) => {
        el.style.transitionDelay = reduce ? "0ms" : `${i * 80}ms`;
        el.classList.add("is-in");
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  groups.forEach((_, host) => io.observe(host));

  // Signature: the hero picture changes slowly, like light shifting in a room.
  const frame = document.querySelector("[data-crossfade]");
  if (frame && !reduce) {
    const imgs = [...frame.querySelectorAll("img")];
    const caption = frame.querySelector("figcaption");
    const captions = [
      caption.textContent,
      "The hearth of a Breton village home around 1900.",
      "An iron key from about 1500 to 1600, Rijksmuseum.",
    ];
    let i = 0, timer = null;
    const step = () => {
      imgs[i].classList.remove("is-on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("is-on");
      caption.textContent = captions[i];
    };
    const start = () => { if (!timer) timer = setInterval(step, 6000); };
    const stop = () => { clearInterval(timer); timer = null; };
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    start();
  }

  // Tabs: three ways back in.
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((tab, n) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      const next = tabs[(n + d + tabs.length) % tabs.length];
      select(next); next.focus();
    });
  });

  // Index cards: one open at a time.
  const qs = [...document.querySelectorAll(".card-q")];
  qs.forEach((q) => q.addEventListener("click", () => {
    const open = q.getAttribute("aria-expanded") !== "true";
    qs.forEach((other) => {
      const on = other === q && open;
      other.setAttribute("aria-expanded", String(on));
      document.getElementById(other.getAttribute("aria-controls")).hidden = !on;
    });
  }));

  // The family kit: real 2-of-3 Shamir over GF(256), the same field (0x11B) the app uses.
  const kit = document.querySelector("[data-kit]");
  if (!kit) return;
  const mul = (a, b) => {
    let r = 0;
    for (let k = 0; k < 8; k++) {
      if (b & 1) r ^= a;
      const hi = a & 0x80;
      a = (a << 1) & 0xff;
      if (hi) a ^= 0x1b;
      b >>= 1;
    }
    return r;
  };
  const inv = (a) => { let r = 1; for (let k = 0; k < 254; k++) r = mul(r, a); return r; };
  const secret = new TextEncoder().encode("Mom's passport: in the Medical room");
  const coeff = crypto.getRandomValues(new Uint8Array(secret.length));
  const share = (x) => secret.map((s, j) => s ^ mul(coeff[j], x));
  const shares = { 1: share(1), 2: share(2), 3: share(3) };
  const hex = (b) => [...b.slice(0, 12)].map((v) => v.toString(16).padStart(2, "0")).join(" ").toUpperCase();
  const sheets = [...kit.querySelectorAll(".sheet")];
  sheets.forEach((s) => { s.querySelector("[data-code]").textContent = hex(shares[s.dataset.x]) + " …"; });

  const vault = document.querySelector("[data-vault]");
  const title = vault.querySelector("[data-vault-title]");
  const detail = vault.querySelector("[data-vault-detail]");
  const chosen = [];
  const render = () => {
    sheets.forEach((s) => {
      const on = chosen.includes(Number(s.dataset.x));
      s.setAttribute("aria-pressed", String(on));
      s.querySelector(".sheet__state").textContent = on ? "Chosen" : "Tap to choose";
    });
    if (chosen.length < 2) {
      vault.classList.remove("is-open");
      title.textContent = chosen.length ? "One sheet: still shut" : "The vault is shut";
      detail.textContent = chosen.length
        ? "One sheet on its own is random noise. It reveals nothing about the key. Choose a second."
        : "Choose two sheets.";
      return;
    }
    const [a, b] = chosen;
    const d = inv(a ^ b), wa = mul(b, d), wb = mul(a, d);
    const out = shares[a].map((v, j) => mul(v, wa) ^ mul(shares[b][j], wb));
    vault.classList.add("is-open");
    title.textContent = `Sheets ${a} and ${b}: the vault opens`;
    detail.textContent = `Rebuilt from two sheets: “${new TextDecoder().decode(out)}”`;
  };
  sheets.forEach((s) => s.addEventListener("click", () => {
    const x = Number(s.dataset.x);
    const at = chosen.indexOf(x);
    if (at >= 0) chosen.splice(at, 1);
    else { chosen.push(x); if (chosen.length > 2) chosen.shift(); }
    render();
  }));
  render();
})();
