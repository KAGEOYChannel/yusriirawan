(function () {
  const footers = document.querySelectorAll('.zf-footer');
  if (!footers.length) return;

  function initFooter(footer) {
    if (footer.dataset.zfReady === 'true') return;
    footer.dataset.zfReady = 'true';

    const artPath = footer.dataset.zfArt || 'assets/images/zenitsu-footer.png';

    const seigaiha = document.createElement('div');
    seigaiha.className = 'zf-seigaiha';
    seigaiha.setAttribute('aria-hidden', 'true');

    const topBeam = document.createElement('div');
    topBeam.className = 'zf-top-beam';
    topBeam.setAttribute('aria-hidden', 'true');

    const scrim = document.createElement('div');
    scrim.className = 'zf-readability-scrim';
    scrim.setAttribute('aria-hidden', 'true');

    const artWrap = document.createElement('div');
    artWrap.className = 'zf-art-wrap';
    artWrap.setAttribute('aria-hidden', 'true');

    const artImg = document.createElement('img');
    artImg.className = 'zf-art-img';
    artImg.src = artPath;
    artImg.alt = '';
    artImg.width = 1024;
    artImg.height = 576;
    artImg.decoding = 'async';
    artWrap.appendChild(artImg);

    const canvas = document.createElement('canvas');
    canvas.className = 'zf-fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    footer.prepend(scrim);
    footer.prepend(canvas);
    footer.prepend(artWrap);
    footer.prepend(seigaiha);
    footer.prepend(topBeam);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = null;
    let inView = false;
    let lastTime = 0;
    let nextBoltIn = 900;

    const bolts = [];
    const sparks = [];

    function resize() {
      const rect = footer.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function subdivideBolt(x1, y1, x2, y2, displace, depth) {
      if (depth <= 0) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      const mx = (x1 + x2) * 0.5 + (Math.random() - 0.5) * displace;
      const my = (y1 + y2) * 0.5 + (Math.random() - 0.5) * displace;
      const left = subdivideBolt(x1, y1, mx, my, displace * 0.55, depth - 1);
      const right = subdivideBolt(mx, my, x2, y2, displace * 0.55, depth - 1);
      return left.slice(0, -1).concat(right);
    }

    function spawnBolt(x1, y1, x2, y2, intensity = 1) {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const pts = subdivideBolt(x1, y1, x2, y2, Math.min(72, dist * 0.24), 4);
      const branches = [];
      if (pts.length > 6 && Math.random() < 0.72) {
        const pivot = pts[Math.floor(pts.length * (0.3 + Math.random() * 0.4))];
        const bx = pivot.x + (Math.random() - 0.5) * 140;
        const by = pivot.y + (Math.random() - 0.45) * 90;
        branches.push(subdivideBolt(pivot.x, pivot.y, bx, by, 26, 3));
      }
      bolts.push({ pts, branches, life: 1, decay: 0.045 + Math.random() * 0.03, intensity });

      const count = Math.round(5 + intensity * 4);
      for (let i = 0; i < count; i++) {
        const p = pts[Math.floor(Math.random() * pts.length)];
        sparks.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 2.4,
          vy: -0.6 - Math.random() * 2.1,
          r: 1.2 + Math.random() * 2.1,
          life: 1,
          decay: 0.014 + Math.random() * 0.018
        });
      }
    }

    function spawnAmbientBolt() {
      const horizonY = height - Math.min(130, height * 0.28);
      const fromRight = Math.random() < 0.55;
      if (fromRight) {
        const sx = width * (0.62 + Math.random() * 0.34);
        const sy = horizonY + (Math.random() - 0.3) * 55;
        const ex = sx - (140 + Math.random() * 260);
        const ey = sy + (Math.random() - 0.5) * 70;
        spawnBolt(sx, sy, Math.max(16, ex), Math.min(height - 10, Math.max(24, ey)), 1);
      } else {
        const sx = width * (0.04 + Math.random() * 0.28);
        const sy = horizonY + (Math.random() - 0.25) * 50;
        const ex = sx + (120 + Math.random() * 240);
        const ey = sy + (Math.random() - 0.5) * 65;
        spawnBolt(sx, sy, Math.min(width - 16, ex), Math.min(height - 10, Math.max(24, ey)), 0.9);
      }
    }

    function spawnEmber() {
      if (sparks.length > 42) return;
      sparks.push({
        x: Math.random() * width,
        y: height - 8 - Math.random() * 44,
        vx: (Math.random() - 0.5) * 0.65,
        vy: -0.45 - Math.random() * 1.05,
        r: 1 + Math.random() * 1.9,
        life: 0.9,
        decay: 0.008 + Math.random() * 0.01
      });
    }

    function drawPath(points) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    function tick(now) {
      if (!inView) {
        rafId = null;
        return;
      }
      const dt = lastTime ? Math.min(60, now - lastTime) : 16;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      nextBoltIn -= dt;
      if (nextBoltIn <= 0) {
        spawnAmbientBolt();
        nextBoltIn = 1100 + Math.random() * 1900;
      }

      if (Math.random() < 0.32) spawnEmber();

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.life -= b.decay;
        if (b.life <= 0) {
          bolts.splice(i, 1);
          continue;
        }
        const flicker = b.life * (0.72 + Math.random() * 0.28);

        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 18 * b.intensity;
        ctx.strokeStyle = `rgba(245, 158, 11, ${flicker * 0.55})`;
        ctx.lineWidth = 5.5 * b.intensity;
        drawPath(b.pts);

        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = `rgba(250, 204, 21, ${flicker * 0.92})`;
        ctx.lineWidth = 2.4 * b.intensity;
        drawPath(b.pts);

        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 251, 235, ${flicker})`;
        ctx.lineWidth = 1.1;
        drawPath(b.pts);

        for (const br of b.branches) {
          ctx.strokeStyle = `rgba(250, 204, 21, ${flicker * 0.72})`;
          ctx.lineWidth = 1.4;
          drawPath(br);
          ctx.strokeStyle = `rgba(255, 251, 235, ${flicker * 0.85})`;
          ctx.lineWidth = 0.7;
          drawPath(br);
        }
      }

      ctx.shadowBlur = 0;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0 || s.y < -10) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(254, 240, 138, ${s.life})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      rafId = requestAnimationFrame(tick);
    }

    function syncLoop() {
      if (!inView) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    footer.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input')) return;
      const r = footer.getBoundingClientRect();
      const tx = e.clientX - r.left;
      const ty = e.clientY - r.top;
      const sx = tx > width * 0.5 ? width * 0.84 : width * 0.14;
      spawnBolt(sx, height - 18, tx, ty, 1.15);
    });

    if (matchMedia('(pointer: fine)').matches) {
      let lastSpark = 0;
      footer.addEventListener('mousemove', (e) => {
        if (!inView) return;
        const now = performance.now();
        if (now - lastSpark < 75) return;
        lastSpark = now;
        const r = footer.getBoundingClientRect();
        sparks.push({
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -0.7 - Math.random() * 1.1,
          r: 1.4 + Math.random() * 1.5,
          life: 0.85,
          decay: 0.024
        });
      }, { passive: true });
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        inView = entries.some((en) => en.isIntersecting);
        syncLoop();
      }, { threshold: 0.05 });
      io.observe(footer);
    } else {
      inView = true;
      syncLoop();
    }
  }

  footers.forEach(initFooter);
})();
