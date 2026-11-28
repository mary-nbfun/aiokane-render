// papercraft / channel sample: AIとお金の実践室 — 3D segments of the 15 s cross-format sample.
// Segments chosen by ?seg= :
//   title (6.2 s)  the title board + coin rise (approved opening, unchanged 0-4.2 s); then transition 1 is
//                  completed INSIDE the engine: the camera glides to a top-down view of the coin as it folds
//                  flat, and the three chart paper cards slide into alignment around it; 5.9-6.2 s fully still.
//   board (4.6 s)  the summary board: panel, three nodes and chevrons rise in flow order, the banner last;
//                  the final node starts rising at once (transition 2, second half).
//   steps / persona / evidence / chapter / coin / endcard — still-frame scenes for the style-frame set
//                  (rendered locally as PNGs at a fixed time; same ground, same paper language).
// The 2D data segment between title and board is a givemotion composition (../data-2d/); ffmpeg joins the three.
//
// PAPER SPEC (short form; full spec in ../REPORT.md)
// BRIEF  AIとお金の実践室 sample; warm cream paper, deep ink-green, charcoal ink, restrained gold; no hype.
// PALETTE ground #EFE6D0, card #F8F2E2, ink #2E2A26, green #1F4D3A, gold #C29B3C / pale #E7CC7E.
// FORMAT 1920x1080, 30 fps. MOTION hinges only; one camera glide per segment. SOUND none (silent sample).
// BACKGROUND RULE (channel-wide): the printed paper ground below is THE stable background layer of every
// scene and frame; where the foreground is information-dense, the background is softened (tilt-shift /
// blur + lower contrast) so the foreground always wins.

import * as P2 from 'papercraft/lib/paperkit-2d.js';
import { layeredCard, imageCard } from 'papercraft/lib/paperkit-3d.js';
import { polarCameraPos } from 'papercraft/lib/paper-motion.js';
import { createHarness } from './harness.js';

const SEG = new URLSearchParams(location.search).get('seg') || 'title';
const C = {
  ground: '#EFE6D0', wash: '#E6DABD', wash2: '#EFE3C8', patch: '#DCE0C8', patch2: '#E9D9AE',
  card: '#F8F2E2', ink: '#2E2A26', green: '#1F4D3A', greenMid: '#2E6B4F', greenSoft: '#7FA88F',
  gold: '#C29B3C', goldPale: '#E7CC7E', goldDeep: '#9A7A2A', track: '#E2D5B8', muted: '#6B6156',
};
const FONT = '"Noto Sans CJK JP", "Hiragino Sans", sans-serif';
const D = P2.draw2;
const text = (g, ink, str, x, y, size, color, weight = 700, align = 'center') => {
  g.save(); g.translate(x, y); g.scale(1, -1);
  g.font = weight + ' ' + size + 'px ' + FONT; g.textAlign = align; g.textBaseline = 'middle';
  g.fillStyle = ink(color, 'print'); g.fillText(str, 0, 0); g.restore();
};
const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

const VIEWS = {
  title: { pitch: 46, dist: 39, target: [-13, 2.2, -4] },
  board: { pitch: 46, dist: 47, target: [13, 3.2, -3.2] },
  steps: { pitch: 44, dist: 42, target: [0, 2.0, -2.5] },
  persona: { pitch: 42, dist: 30, target: [0, 2.6, -1] },
  evidence: { pitch: 40, dist: 34, target: [0, 2.2, -0.8] },
  chapter: { pitch: 44, dist: 37, target: [0, 2.2, -2] },
  coin: { pitch: 50, dist: 16, target: [0, 1.5, 0] },
  endcard: { pitch: 44, dist: 40, target: [0, 2.0, -1] },
  ground: { pitch: 85, dist: 22, target: [-6.4, 0.3, -0.55] },
  cardtex: { pitch: 85, dist: 7.5, target: [0, 0.2, -1.0] },
};
const H = createHarness({
  autoOpen: false, ground: C.ground,
  view: VIEWS[SEG] || VIEWS.title,
  lens: SEG === 'evidence' ? { focusBand: 0.18, maxBlur: 26 } : {},
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
const makeCoin = (x, z) => layeredCard([
  { pts: disc(2.05), paint: (P) => { P.fill(P2.shade(C.gold, -0.2)); }, z: 0 },
  { pts: disc(1.9), paint: (P) => { P.fill(P2.shade(C.gold, -0.08)); }, z: 0.22 },
  { pts: disc(1.78), paint: coinFace, z: 0.44 },
], H.cardOpts(x, z, 1, null, 1));

// a flat chart paper card (never folded: it lies on the ground from the start). Piece coords: x centred, y 0..h;
// lying flat with yaw 0 its centre lands at (x, z - h/2), so popup z = centreZ + h/2.
const stripPiece = (expr) => P2.drawnPiece((g, ink) => {
  g.fillStyle = ink(C.card); D.rect(g, -5.75, 0, 11.5, 1.7, 0.16);
  g.fillStyle = ink(C.track); D.rect(g, 0.1, 0.4, 5.25, 0.9, 0.08);
  text(g, ink, expr, -5.35, 0.85, 0.8, C.ink, 800, 'left');
}, { w: 11.9, h: 2.1, name: 'chart strip ' + expr });
const amountPiece = P2.drawnPiece((g, ink) => {
  g.fillStyle = ink(C.card); D.rect(g, -2.7, 0, 5.4, 2.2, 0.18);
  g.strokeStyle = ink(C.goldDeep); g.lineWidth = 0.05; D.rect(g, -2.45, 0.25, 4.9, 1.7, 0.12);
  text(g, ink, '= 10,000円', 0, 1.38, 0.95, C.green, 800);
  text(g, ink, '目標', 0, 0.58, 0.5, C.goldDeep, 700);
}, { w: 5.8, h: 2.6, name: 'amount card' });

if (SEG === 'ground') {
  // bare paper ground at the title segment's end camera (top-down over the coin's flat centre).
  // No pieces at all: this still is the 2D data segment's background, so the transition-1 splice
  // shares literally the same ground pixels as the 3D end frame.
} else if (SEG === 'title') {
  const titleBoard = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -8, 0, 16, 7, 0.25);
    g.fillStyle = ink(C.green); D.rect(g, -8, 5.9, 16, 1.1, 0.2);
    g.fillStyle = ink(C.goldPale); D.ell(g, 0, 6.45, 0.16, 0.16);
    g.fillStyle = ink(C.gold); D.rect(g, -3.4, 3.3, 6.8, 0.14, 0.05);
    text(g, ink, 'AIとお金の実践室', 0, 4.5, 1.66, C.ink, 800);
    text(g, ink, 'AI活用 × 副業 × NISA', 0, 2.35, 0.92, C.green, 700);
    text(g, ink, '境の実践室', 0, 1.15, 0.66, '#6B6156', 500);
  }, { w: 16.4, h: 7.4, name: 'title board' });

  const coinNode = makeCoin(-6.4, 1.5);

  const titleH = popup(titleBoard[0], titleBoard[1], { x: -13.5, z: -6, height: 7 });
  const coinH = popup(null, null, { node: coinNode, height: 4.1, x: -6.4, z: 1.5, sway: 0.25 });
  const dress = [
    popup(...sail(11, 5.5, C.greenSoft), { x: -24, z: -13, sway: 0.3 }),
    popup(...sail(9, 4.4, P2.shade(C.greenSoft, -0.12)), { x: -3, z: -14, sway: 0.3 }),
    popup(...tuft(3.6, 2.2, C.greenMid), { x: -19.5, z: 2.5, sway: 0.7 }),
    popup(...tuft(3.0, 1.9, P2.shade(C.greenMid, 0.15)), { x: -8.5, z: 5.5, sway: 0.7 }),
  ];
  // the three chart paper cards lie flat around the coin from the start (the coin's flat centre is
  // (-6.4, -0.55): its disc centre sits 2.05 in front of its hinge line). During 4.6-5.8 s they slide
  // the last stretch into alignment; before that they rest scattered where they lie.
  const flatA = popup(...stripPiece('5,000円 × 2件'), { x: -6.4, z: -3.15, yaw: 0 });
  const flatB = popup(...stripPiece('2,500円 × 4件'), { x: -6.4, z: 3.75, yaw: 0 });
  const flatM = popup(amountPiece[0], amountPiece[1], { x: -1.15, z: 0.55, yaw: 0 });
  const slides = [
    { h: flatA, dx: -1.8, dz: -0.8, r: 0.10 },
    { h: flatB, dx: 1.8, dz: 0.8, r: -0.10 },
    { h: flatM, dx: 1.2, dz: 1.4, r: 0.12 },
  ];
  for (const s of slides) { s.bx = s.h.group.position.x; s.bz = s.h.group.position.z; }
  H.onStep((t) => {
    const u = ease((t - 4.6) / 1.2), k = 1 - u;
    for (const s of slides) {
      s.h.group.position.x = s.bx + s.dx * k;
      s.h.group.position.z = s.bz + s.dz * k;
      s.h.group.rotation.y = s.r * k;
    }
  });
  // camera: hold the approved title framing until 4.2 s, then glide to top-down over the coin's flat
  // centre (-6.4, -0.55) while it falls flat; the drift dies out so 5.9-6.2 s is a true still frame.
  H.setCameraController((t, dt, ctx) => {
    const u = ease((t - 4.2) / 1.7);
    const tx = -13 + 6.6 * u, ty = 1.6 - 1.3 * u, tz = -4 + 3.45 * u;
    const dist = 39 - 17 * u, pitch = 46 + 39 * u;
    const pos = polarCameraPos({ target: [tx, ty, tz], azim: -0.1 + 0.1 * u, pitchDeg: pitch, dist, time: t, drift: 0.12 * (1 - u) });
    ctx.target.set(tx, ty, tz);
    ctx.camera.position.set(pos[0], pos[1], pos[2]);
    ctx.camera.lookAt(ctx.target);
    ctx.fitShadow(ctx.lights, ctx.target);
  });
  H.cue(0.3, () => H.fold(titleH, true));
  H.cue(0.95, () => H.fold(coinH, true));
  H.cue(1.45, () => dress.forEach((h, i) => H.fold(h, true, i * 0.09)));
  H.cue(4.7, () => H.fold(coinH, false));        // the coin falls flat onto the paper: transition 1, inside the engine
} else if (SEG === 'board') {
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
} else if (SEG === 'steps') {
  // style frame 4: three step cards standing in a depth row on the same paper ground (near sharp, far soft)
  const stepCard = (step, main, sub) => P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -4.3, 0, 8.6, 5.2, 0.3);
    g.fillStyle = ink(C.gold); D.rect(g, -4.3, 4.35, 8.6, 0.85, 0.2);
    text(g, ink, step, -3.9, 4.78, 0.62, C.green, 800, 'left');
    text(g, ink, main, 0, 2.85, 1.35, C.ink, 800);
    text(g, ink, sub, 0, 1.25, 0.72, C.muted, 500);
    g.fillStyle = ink(C.gold); D.rect(g, -1.1, 3.62, 2.2, 0.1, 0.04);
  }, { w: 9.0, h: 5.6, name: 'step card ' + step });
  const s1 = popup(...stepCard('STEP 1', 'ChatGPT', '小さな仕事を1件受ける'), { x: -10.5, z: -7, height: 5.2 });
  const s2 = popup(...stepCard('STEP 2', '逆算', '5,000円 × 2件で組む'), { x: 0, z: -3.5, height: 5.2 });
  const s3 = popup(...stepCard('STEP 3', '新NISA', 'つみたて枠へ回す'), { x: 10.5, z: 0, height: 5.2 });
  const d1 = popup(...tuft(3.2, 2.0, C.greenMid), { x: -16, z: 1, sway: 0.7 });
  const d2 = popup(...sail(9, 4.4, C.greenSoft), { x: 17, z: -10, sway: 0.3 });
  H.cue(0.3, () => { H.fold(s1, true); H.fold(d1, true); });
  H.cue(0.5, () => H.fold(s2, true));
  H.cue(0.7, () => { H.fold(s3, true); H.fold(d2, true); });
} else if (SEG === 'persona') {
  // style frame 5: the channel persona as a laminated image card standing on the paper
  window.__imgPending = true;
  const img = new Image();
  img.onload = () => {
    const node = imageCard(img, { height: 6.4, paper: H.paper, rim: 0.05 });
    const ph = popup(null, null, { node, height: 6.4, x: -1.5, z: -1.5 });
    const coinH = popup(null, null, { node: makeCoin(5.5, 1), height: 4.1, x: 5.5, z: 1, sway: 0.25 });
    const t1 = popup(...tuft(3.4, 2.1, C.greenMid), { x: -8.5, z: 2, sway: 0.7 });
    H.cue(0.3, () => { H.fold(ph, true); H.fold(t1, true); });
    H.cue(0.55, () => H.fold(coinH, true));
    window.__imgPending = false;
  };
  img.onerror = () => { window.__imgPending = false; console.error('avatar image failed to load'); };
  img.src = 'assets/avatar.webp';
} else if (SEG === 'evidence') {
  // style frame 6: an "official page snapshot" as a thick paper-framed card, slightly turned, with a
  // source strip lying flat in front. Indicative layout only, stamped SAMPLE. Info-dense foreground:
  // this seg runs with a tighter focus band / stronger tilt-shift so the paper ground behind softens.
  const snap = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -6.5, 0, 13, 8.6, 0.25);
    g.fillStyle = ink(C.green); D.rect(g, -6.5, 7.1, 13, 1.5, 0.2);
    text(g, ink, '国税庁', -6.0, 7.85, 0.95, '#F8F2E2', 800, 'left');
    text(g, ink, '確定申告特集', 6.0, 7.85, 0.6, C.goldPale, 500, 'right');
    text(g, ink, '申告書の作成の流れ', -6.0, 6.35, 1.0, C.ink, 800, 'left');
    g.fillStyle = ink(C.gold); D.rect(g, -6.0, 5.72, 4.2, 0.1, 0.04);
    g.fillStyle = ink('#CFC4AB');
    D.rect(g, -6.0, 4.95, 11.6, 0.34, 0.06); D.rect(g, -6.0, 4.35, 10.2, 0.34, 0.06); D.rect(g, -6.0, 3.75, 11.9, 0.34, 0.06);
    g.strokeStyle = ink(C.greenMid); g.lineWidth = 0.045;
    for (let r = 0; r < 3; r++) { D.rect(g, -6.0, 1.15 + r * 0.72, 7.4, 0.62, 0.04); D.rect(g, 1.6, 1.15 + r * 0.72, 4.4, 0.62, 0.04); }
    text(g, ink, '手順', -5.7, 2.85, 0.5, C.green, 700, 'left');
    text(g, ink, '目安', 1.9, 2.85, 0.5, C.green, 700, 'left');
    g.strokeStyle = ink(C.goldDeep); g.lineWidth = 0.07; D.rect(g, 3.1, 5.35, 3.1, 1.15, 0.08);
    text(g, ink, 'SAMPLE', 4.65, 5.92, 0.62, C.goldDeep, 800);
  }, { w: 13.4, h: 9.0, name: 'evidence snapshot card' });
  const srcStrip = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -5.5, 0, 11, 1.5, 0.14);
    text(g, ink, '出典：国税庁ウェブサイト（イメージ図）', 0, 0.75, 0.54, C.muted, 500);
  }, { w: 11.4, h: 1.9, name: 'source strip' });
  const evH = popup(snap[0], snap[1], { x: 0, z: -2.5, yaw: -0.3, edge: 0.16, height: 8.6 });
  popup(srcStrip[0], srcStrip[1], { x: 0.5, z: 1.95, yaw: 0 });   // flat on the ground: centre (0.5, 1.2), close enough to the focal plane to stay readable
  const t1 = popup(...tuft(3.0, 1.9, C.greenMid), { x: -10.5, z: 3.5, sway: 0.7 });
  H.cue(0.3, () => { H.fold(evH, true); H.fold(t1, true); });
} else if (SEG === 'chapter') {
  // style frame 7: a big chapter card with the coin-and-sprout vignette beside it
  const chap = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -6.25, 0, 12.5, 7, 0.3);
    g.fillStyle = ink(C.green); D.rect(g, -6.25, 5.9, 12.5, 1.1, 0.2);
    g.fillStyle = ink(C.goldPale); D.ell(g, 0, 6.45, 0.16, 0.16);
    text(g, ink, '第2章', 0, 3.9, 2.5, C.ink, 800);
    g.fillStyle = ink(C.gold); D.rect(g, -2.6, 2.35, 5.2, 0.13, 0.05);
    text(g, ink, '逆算で「目標」を置く', 0, 1.35, 0.95, C.green, 700);
  }, { w: 12.9, h: 7.4, name: 'chapter card' });
  const chH = popup(chap[0], chap[1], { x: -3.5, z: -3, height: 7 });
  const coinH = popup(null, null, { node: makeCoin(7.6, 0.6), height: 4.1, x: 7.6, z: 0.6, sway: 0.25 });
  const t1 = popup(...tuft(3.2, 2.0, C.greenMid), { x: 12.5, z: 3.5, sway: 0.7 });
  const t2 = popup(...tuft(2.8, 1.8, P2.shade(C.greenMid, 0.15)), { x: -11.5, z: 2.5, sway: 0.7 });
  H.cue(0.3, () => H.fold(chH, true));
  H.cue(0.6, () => { H.fold(coinH, true); H.fold(t1, true); H.fold(t2, true); });
} else if (SEG === 'coin') {
  // style frame 8: the paper coin + sprout as a tilt-shift macro hero
  const coinH = popup(null, null, { node: makeCoin(0, 0), height: 4.1, x: 0, z: 0, sway: 0.25 });
  const t1 = popup(...tuft(3.4, 2.1, C.greenMid), { x: -5.2, z: 1.8, sway: 0.7 });
  const t2 = popup(...tuft(2.8, 1.8, P2.shade(C.greenMid, 0.15)), { x: 5.0, z: 2.4, sway: 0.7 });
  const s1 = popup(...sail(9, 4.6, C.greenSoft), { x: -9, z: -8, sway: 0.3 });
  H.cue(0.3, () => { H.fold(coinH, true); H.fold(t1, true); H.fold(t2, true); H.fold(s1, true); });
} else if (SEG === 'cardtex') {
  // one flat chart strip filling the frame: native-resolution card-paper + track-recess textures
  // for the 2D data segment's cards (same material, cropped — no flat CSS colours).
  popup(...stripPiece(''), { x: 0, z: 0, yaw: 0 });
} else if (SEG === 'endcard') {
  // style frame 9: paper end card — channel name card, small persona card, disclaimer strip flat in front
  const main = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -7.5, 0, 15, 6.2, 0.3);
    g.fillStyle = ink(C.green); D.rect(g, -7.5, 5.1, 15, 1.1, 0.2);
    g.fillStyle = ink(C.goldPale); D.ell(g, 0, 5.65, 0.15, 0.15);
    text(g, ink, 'AIとお金の実践室', 0, 3.85, 1.5, C.ink, 800);
    g.fillStyle = ink(C.gold); D.rect(g, -3.0, 2.55, 6.0, 0.12, 0.05);
    text(g, ink, 'ご視聴ありがとうございました', 0, 1.5, 0.85, C.green, 700);
  }, { w: 15.4, h: 6.6, name: 'end card main' });
  const disc2 = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink(C.card); D.rect(g, -7.5, 0, 15, 1.7, 0.14);
    text(g, ink, '収益は保証されません／本動画は投資助言ではありません', 0, 0.85, 0.47, C.muted, 500);
  }, { w: 15.4, h: 2.1, name: 'disclaimer strip' });
  const mH = popup(main[0], main[1], { x: -3, z: -2.5, height: 6.2 });
  popup(disc2[0], disc2[1], { x: 0, z: 4.9, yaw: 0 });   // flat: centre (0, 4.05)
  H.cue(0.3, () => H.fold(mH, true));
  window.__imgPending = true;
  const img = new Image();
  img.onload = () => {
    const node = imageCard(img, { height: 3.6, paper: H.paper, rim: 0.05 });
    const ph = popup(null, null, { node, height: 3.6, x: 8.6, z: -1 });
    H.cue(0.55, () => H.fold(ph, true));
    window.__imgPending = false;
  };
  img.onerror = () => { window.__imgPending = false; console.error('avatar image failed to load'); };
  img.src = 'assets/avatar.webp';
}

H.start();
