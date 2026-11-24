/* CuppaShot – interakciók */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Év a láblécben ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav: háttér görgetéskor + mobil menü ---------- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Aktív menüpont ---------- */
  const navAnchors = [...links.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const secObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => secObserver.observe(s));

  /* ---------- Reveal animáció ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Számlálók ---------- */
  const fmt = new Intl.NumberFormat("hu-HU");
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = fmt.format(target) + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt.format(Math.round(target * eased)) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { countUp(entry.target); countObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Gépelő terminál ---------- */
  const typed = document.getElementById("typed");
  const commands = [
    "brew --espresso spec.md",
    "agents assign --claude --codex --gemini",
    "pytest -q   ✓ 512 passed",
    "git push origin main   crema ✓",
    "serve --fresh cuppashot.hu",
  ];
  if (typed && !reduceMotion) {
    let ci = 0, pos = commands[0].length, deleting = true;
    const tick = () => {
      const cmd = commands[ci];
      if (deleting) {
        pos--;
        typed.textContent = cmd.slice(0, pos);
        if (pos <= 0) { deleting = false; ci = (ci + 1) % commands.length; }
        setTimeout(tick, 28);
      } else {
        const next = commands[ci];
        pos++;
        typed.textContent = next.slice(0, pos);
        if (pos >= next.length) { deleting = true; setTimeout(tick, 2200); }
        else setTimeout(tick, 55 + Math.random() * 60);
      }
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Recept: folyamatcsík görgetésre ---------- */
  const recipe = document.getElementById("recipe");
  if (recipe) {
    const steps = [...recipe.querySelectorAll(".recipe__step")];
    const nums = steps.map((s) => s.querySelector(".recipe__num"));
    const update = () => {
      const r = recipe.getBoundingClientRect();
      const vh = window.innerHeight;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
      const isStacked = steps.length > 1 && Math.abs(steps[1].getBoundingClientRect().top - steps[0].getBoundingClientRect().top) > 20;

      if (isStacked) {
        const first = nums[0].getBoundingClientRect();
        const last = nums[nums.length - 1].getBoundingClientRect();
        const firstC = first.top + first.height / 2;
        const lastC = last.top + last.height / 2;
        const span = Math.max(1, lastC - firstC);
        recipe.style.setProperty("--line-h", span.toFixed(1) + "px");
        const minReachableLastC = (lastC + window.scrollY) - maxScroll;
        const triggerY = Math.max(vh * 0.72, minReachableLastC + 16);
        const p = Math.max(0, Math.min(1, (triggerY - firstC) / span));
        recipe.style.setProperty("--progress", p.toFixed(3));
        steps.forEach((s, i) => {
          const c = nums[i].getBoundingClientRect();
          const center = c.top + c.height / 2;
          s.classList.toggle("is-done", center <= triggerY + 8 || p >= 0.99);
        });
      } else {
        const first = nums[0].getBoundingClientRect();
        const last = nums[nums.length - 1].getBoundingClientRect();
        const span = Math.max(1, (last.left + last.width / 2) - (first.left + first.width / 2));
        recipe.style.setProperty("--line-w", span.toFixed(1) + "px");
        const minReachableTop = (r.top + window.scrollY) - maxScroll;
        const startTop = vh * 0.85;
        const endTop = Math.max(vh * 0.42, minReachableTop + 24);
        const denom = Math.max(1, startTop - endTop);
        const p = Math.max(0, Math.min(1, (startTop - r.top) / denom));
        recipe.style.setProperty("--progress", p.toFixed(3));
        steps.forEach((s, i) => s.classList.toggle("is-done", p >= i / (steps.length - 1) - 0.001 || p >= 0.98));
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Projektkártya: fény követi az egeret ---------- */
  document.querySelectorAll(".project").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- E-mail másolása ---------- */
  const toast = document.getElementById("toast");
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };
  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        showToast("☕ Másolva: " + email);
      } catch {
        showToast(email);
      }
    });
  }

  /* ---------- Hero: adathálózat a háttérben ---------- */
  const canvas = document.getElementById("network");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, nodes = [], running = true, raf;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
      }));
    };
    const mouse = { x: -9999, y: -9999 };
    canvas.parentElement.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(232, 180, 140, ${(1 - d / LINK) * 0.22})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 180) {
          ctx.strokeStyle = `rgba(255, 200, 175, ${(1 - md / 180) * 0.45})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 214, 190, 0.8)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); if (running) draw(); });
    new IntersectionObserver(([entry]) => {
      const vis = entry.isIntersecting;
      if (vis && !running) { running = true; draw(); }
      else if (!vis) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  }
})();
