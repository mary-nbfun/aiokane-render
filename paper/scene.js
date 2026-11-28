// papercraft / channel sample: AIとお金の実践室 — 3D segments of the 15 s cross-format sample.
// Two segments in one file, chosen by ?seg=title | ?seg=board (capture.py --page "index.html?seg=title"):
//   title (7 s)  the title board + coin rise; at the end the camera dives toward the coin and the coin
//                FOLDS FLAT onto the paper (transition 1, first half: the narrative element leaves 3D flat).
//   board (4.6 s) the summary board: panel, three nodes and chevrons rise in flow order, the banner last;
//                the final node starts rising at once (transition 2, second half: the lifted 2D node grows up).
// The 2D data segment between them is a givemotion composition (segments/data-2d/); ffmpeg joins the three.
//
// PAPER SPEC (short form; full spec in ../REPORT.md)
// BRIEF  AIとお金の実践室 sample; warm cream paper, deep ink-green, charcoal ink, restrained gold; no hype.
// PALETTE ground #EFE6D0, card #F8F2E2, ink #2E2A26, green #1F4D3A, gold #C29B3C / pale #E7CC7E.
// FORMAT 1920x1080, 30 fps. MOTION hinges only; one camera glide per segment. SOUND none (silent sample).

import * as P2 from 'papercraft/lib/paperkit-2d.js';
import { layeredCard } from 'papercraft/lib/paperkit-3d.js';
import { polarCameraPos } from 'papercraft/lib/paper-motion.js';
import { createHarness } from './harness.js';

const SEG = new URLSearchParams(location.search).get('seg') || 'title';
const C = {
  ground: '#EFE6D0', wash: '#E6DABD', wash2: '#EFE3C8', patch: '#DCE0C8', patch2: '#E9D9AE',
  card: '#F8F2E2', ink: '#2E2A26', green: '#1F4D3A', greenMid: '#2E6B4F', greenSoft: '#7FA88F',
  gold: '#C29B3C', goldPale: '#E7CC7E', goldDeep: '#9A7A2A',
};
const FONT = '"Noto Sans CJK JP", "Hiragino Sans", sans-serif';
const D = P2.draw2;
const text = (g, ink, str, x, y, size, color, weight = 700, align = 'center') => {
  g.save(); g.translate(x, y); g.scale(1, -1);
  g.font = weight + ' ' + size + 'px ' + FONT; g.textAlign = align; g.textBaseline = 'middle';
  g.fillStyle = ink(color, 'print'); g.fillText(str, 0, 0); g.restore();
};
const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

const H = createHarness({
  autoOpen: false, ground: C.ground,
  view: SEG === 'board' ? { pitch: 46, dist: 47, target: [13, 3.2, -3.2] } : { pitch: 46, dist: 39, target: [-13, 2.2, -4] },
  bounds: { x0: -52, x1: 52, z0: -42, z1: 28 },
});
const popup = (pts, paint, o = {}) => H.popup(pts, paint, o);

H.printGround(({ g, rnd, washes, torn, ribbon, drifts }) => {
  washes([C.wash, C.wash2, C.wash, C.wash2]);
  torn([[-24, -14], [-4, -15], [-3, 2], [-22, 4], [-26, -6]], P2.rgba(C.patch2, 0.55));
  torn([[6, -15], [26, -14], [27, 3], [8, 4], [5, -6]], P2.rgba(C.patch, 0.5));
  const pathX = (z) => -6 + z * 0.55 + Math.sin(z * 0.16) * 2.2;
  ribbon(pathX, 1.15, P2.rgba(C.goldPale, 0.4), undefined, undefined, 0.35);
  ribbon(pathX, 0.55, P2.rgba('#F4E3B2', 0.5), undefined, undefined, 0.3);
  drifts((x, y) => {
    g.fillStyle = P2.rgba(rnd() < 0.5 ? '#C9B98F' : '#B7A678', 0.5);
    g.beginPath(); g.ellipse(x, y, 1.6 + rnd() * 2, 1 + rnd() * 1.2, rnd() * 3, 0, 7); g.fill();
  });
});

// ---- shared piece designs ------------------------------------------------------------------------------------------
const sail = (w, h, col) => [P2.shape.mound(P2.rng(7), { w, h, lobes: 5, depth: 0.3 }),
  (P) => { P.gradient(P2.shade(col, 0.1), P2.shade(col, -0.14), 0.4); P.marks('leaf', { color: P2.shade(col, -0.3), alpha: 0.3, size: 0.07 }); P.innerShade(P2.shade(col, -0.5), { alpha: 0.35, blurPx: 8 }); }];
const tuft = (w, h, col) => [P2.shape.mound(P2.rng(11), { w, h, lobes: 7, depth: 0.42 }),
  (P) => { P.gradient(P2.shade(col, 0.12), P2.shade(col, -0.12), 0.4); P.marks('leaf', { color: P2.shade(col, -0.32), alpha: 0.4, size: 0.09 }); P.innerShade(P2.shade(col, -0.5), { alpha: 0.3, blurPx: 6 }); }];

if (SEG === 'title') {
  const titleBoard = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -8, 0, 16, 7, 0.25);
    g.fillStyle = ink(C.green); D.rect(g, -8, 5.9, 16, 1.1, 0.2);
    g.fillStyle = ink(C.goldPale); D.ell(g, 0, 6.45, 0.16, 0.16);
    g.fillStyle = ink(C.gold); D.rect(g, -3.4, 3.3, 6.8, 0.14, 0.05);
    text(g, ink, 'AIとお金の実践室', 0, 4.5, 1.66, C.ink, 800);
    text(g, ink, 'AI活用 × 副業 × NISA', 0, 2.35, 0.92, C.green, 700);
    text(g, ink, 'サカイの実践室', 0, 1.15, 0.66, '#6B6156', 500);
  }, { w: 16.4, h: 7.4, name: 'title board' });

  const coinFace = (P) => {
    const { box, g } = P;
    P.gradient(P2.shade(C.gold, 0.14), P2.shade(C.gold, -0.12), 0.5);
    P.draw(() => {
      const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2, r = box.w * 0.36;
      g.strokeStyle = P2.rgba(C.goldDeep, 0.85); g.lineWidth = 0.09;
      g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
      g.fillStyle = C.green;
      g.fillRect(cx - r * 0.045, cy - r * 0.52, r * 0.09, r * 0.62);
      g.beginPath(); g.ellipse(cx - r * 0.26, cy + r * 0.52, r * 0.24, r * 0.13, -0.6, 0, 7); g.fill();
      g.beginPath(); g.ellipse(cx + r * 0.26, cy + r * 0.52, r * 0.24, r * 0.13, 0.6, 0, 7); g.fill();
    });
    P.innerShade(P2.shade(C.gold, -0.55), { alpha: 0.35, blurPx: 8 });
  };
  const disc = (r) => { const p = []; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; p.push([Math.cos(a) * r, Math.sin(a) * r + r]); } return p; };
  const coinNode = layeredCard([
    { pts: disc(2.05), paint: (P) => { P.fill(P2.shade(C.gold, -0.2)); }, z: 0 },
    { pts: disc(1.9), paint: (P) => { P.fill(P2.shade(C.gold, -0.08)); }, z: 0.22 },
    { pts: disc(1.78), paint: coinFace, z: 0.44 },
  ], H.cardOpts(-6.4, 1.5, 1, null, 1));

  const titleH = popup(titleBoard[0], titleBoard[1], { x: -13.5, z: -6, height: 7 });
  const coinH = popup(null, null, { node: coinNode, height: 4.1, x: -6.4, z: 1.5, sway: 0.25 });
  const dress = [
    popup(...sail(11, 5.5, C.greenSoft), { x: -24, z: -13, sway: 0.3 }),
    popup(...sail(9, 4.4, P2.shade(C.greenSoft, -0.12)), { x: -3, z: -14, sway: 0.3 }),
    popup(...tuft(3.6, 2.2, C.greenMid), { x: -19.5, z: 2.5, sway: 0.7 }),
    popup(...tuft(3.0, 1.9, P2.shade(C.greenMid, 0.15)), { x: -8.5, z: 5.5, sway: 0.7 }),
  ];
  // camera: hold the title framing, then (4.4-6.6 s) dive toward the coin and steepen, watching it fall flat
  H.setCameraController((t, dt, ctx) => {
    const u = ease((t - 4.4) / 2.2);
    const tx = -13 + 6.6 * u, tz = -4 + 4.6 * u, dist = 39 - 19 * u, pitch = 46 + 17 * u;
    const pos = polarCameraPos({ target: [tx, 1.6, tz], azim: -0.1 + 0.12 * u, pitchDeg: pitch, dist, time: t });
    ctx.target.set(tx, 1.6, tz);
    ctx.camera.position.set(pos[0], pos[1], pos[2]);
    ctx.camera.lookAt(ctx.target);
    ctx.fitShadow(ctx.lights, ctx.target);
  });
  H.cue(0.3, () => H.fold(titleH, true));
  H.cue(0.95, () => H.fold(coinH, true));
  H.cue(1.45, () => dress.forEach((h, i) => H.fold(h, true, i * 0.09)));
  H.cue(5.15, () => H.fold(coinH, false));       // the coin falls flat onto the paper: transition 1 begins
} else {
  const boardPanel = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -15, 0, 30, 11.5, 0.3);
    g.fillStyle = ink(C.green); D.rect(g, -15, 9.3, 30, 2.2, 0.25);
    g.fillStyle = ink(C.gold); D.rect(g, -15, 9.05, 30, 0.25, 0.05);
    text(g, ink, 'まとめボード', -14.2, 10.4, 1.15, '#F8F2E2', 800, 'left');
    text(g, ink, 'この回の流れ', 14.2, 10.4, 0.72, C.goldPale, 500, 'right');
  }, { w: 30.6, h: 12.1, name: 'summary board' });
  const nodeCard = (num, main, sub, mainSize = 1.3) => P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -3.9, 0, 7.8, 4.9, 0.3);
    g.fillStyle = ink(C.green); D.ell(g, 0, 3.95, 0.52, 0.52);
    text(g, ink, String(num), 0, 3.95, 0.62, '#F8F2E2', 800);
    g.fillStyle = ink(C.gold); D.rect(g, -1.1, 2.92, 2.2, 0.1, 0.04);
    text(g, ink, main, 0, 2.1, mainSize, C.ink, 800);
    text(g, ink, sub, 0, 0.95, 0.68, '#6B6156', 500);
  }, { w: 8.2, h: 5.3, name: 'node ' + num });
  const chevron = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.gold); D.poly(g, [[-0.55, 0], [0.35, 0.85], [0.35, 1.7], [-0.55, 2.55], [-1.15, 1.7], [-1.15, 0.85]]);
  }, { w: 1.7, h: 2.9, name: 'chevron' });
  const banner = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.green); D.rect(g, -8.6, 0, 17.2, 1.7, 0.2);
    text(g, ink, '月1万円は「目標」— シミュレーションです', 0, 0.85, 0.78, '#F8F2E2', 700);
  }, { w: 17.6, h: 2.0, name: 'banner' });

  const boardH = popup(boardPanel[0], boardPanel[1], { x: 13, z: -7.5, height: 11.5 });
  const node3 = popup(...nodeCard(3, '新NISA', 'つみたて枠へ回す', 1.45), { x: 20.4, z: -2.2, height: 4.9 });
  const node1 = popup(...nodeCard(1, 'ChatGPT', 'AIに下書きを頼む'), { x: 5.6, z: -2.2, height: 4.9 });
  const arr1 = popup(chevron[0], chevron[1], { x: 9.3, z: -1.6, height: 2.55 });
  const node2 = popup(...nodeCard(2, '小さな仕事', 'まず1件、受けてみる'), { x: 13, z: -2.2, height: 4.9 });
  const arr2 = popup(chevron[0], chevron[1], { x: 16.7, z: -1.6, height: 2.55 });
  const bannerH = popup(banner[0], banner[1], { x: 13, z: 2.6, height: 1.7 });
  const dress = [
    popup(...tuft(3.2, 2.0, C.greenMid), { x: 23.5, z: 3.0, sway: 0.7 }),
    popup(...sail(10, 5.0, C.greenSoft), { x: 27, z: -13.5, sway: 0.3 }),
    popup(...tuft(3.4, 2.0, C.greenMid), { x: 3.0, z: 3.5, sway: 0.7 }),
  ];
  H.setCameraController((t, dt, ctx) => {
    const u = ease(t / 4.6);
    const dist = 47 - 3 * u;
    const pos = polarCameraPos({ target: [13, 3.2, -3.2], azim: -0.06 + 0.05 * u, pitchDeg: 46, dist, time: t });
    ctx.target.set(13, 3.2, -3.2);
    ctx.camera.position.set(pos[0], pos[1], pos[2]);
    ctx.camera.lookAt(ctx.target);
    ctx.fitShadow(ctx.lights, ctx.target);
  });
  // node 3 first: it is the element that began to lift at the end of the 2D segment; its rise completes here
  H.cue(0.1, () => { H.fold(boardH, true); H.fold(node3, true, 0.05); });
  H.cue(0.75, () => H.fold(node1, true));
  H.cue(1.1, () => H.fold(arr1, true));
  H.cue(1.45, () => H.fold(node2, true));
  H.cue(1.8, () => H.fold(arr2, true));
  H.cue(2.5, () => { H.fold(bannerH, true); dress.forEach((h, i) => H.fold(h, true, i * 0.08)); });
}

H.start();
