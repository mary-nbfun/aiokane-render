#!/usr/bin/env python3
"""Driver for the papercraft 3D segments, local VM and GitHub Actions runner alike.

Why not the kit's scripts/capture.py itself: its readiness poll calls wait_for_function with a
300 ms timeout in a tight loop; wait_for_function polls on requestAnimationFrame, and in a headless
browser whose rAF ticks slowly (SwiftShader) the poll never observes window.__papercraft.ready.
Observed identically on this VM and on an ubuntu-24.04 runner (run 46114294638: "the page never
became ready after 300 s", browser CPU idle). This driver polls readiness with plain evaluate()
calls instead. The video path is the kit's own WebCodecs approach (capture.py, MIT): frames stay
in the browser's GPU/encoder pipeline — every readback alternative measured here costs 2.5-11 s
per frame (ReadPixels stalls on SwiftShader), while an in-page step costs ~0.3 s.

    python render_ci.py still <seg> <sec> <out.png>
    python render_ci.py video <seg> <sec> <out.mp4>
The project folder is the parent of this file's folder (paper/ in the repo, channel/ locally:
set PC_PROJECT to override).
"""
import functools, http.server, json, os, re, secrets, subprocess, sys, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get('PC_PROJECT') or os.path.dirname(HERE)
W, H, FPS = 1920, 1080, 30
HK = 'window["__papercraft"]'
CAL = [(20, 20, 20), (128, 128, 128), (235, 235, 235), (200, 40, 40), (40, 180, 60), (50, 60, 200), (230, 200, 60), (60, 200, 200)]


def serve(upload_state):
    lock = threading.Lock()
    token = secrets.token_hex(12)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_POST(self):
            m = re.fullmatch(rf'/__pc_chunk/{token}/(\d+)', self.path)
            if not m:
                self.send_response(404); self.end_headers(); return
            n = int(self.headers.get('Content-Length', '0'))
            data = self.rfile.read(n) if n > 0 else b''
            with lock:
                fp, seq = upload_state.get('fp'), int(m[1])
                if fp is None or seq > upload_state.get('seq', 0):
                    self.send_response(409); self.end_headers(); return
                if seq == upload_state.get('seq', 0):
                    fp.write(data); upload_state['seq'] = seq + 1
            self.send_response(204); self.end_headers()

    class Server(http.server.ThreadingHTTPServer):
        request_queue_size = 128

    srv = Server(('127.0.0.1', 0), functools.partial(Handler, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1], f'/__pc_chunk/{token}'


def open_page(p, port, seg):
    b = p.chromium.launch(headless=True, args=['--enable-gpu', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': W, 'height': H})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html?capture&size={W}x{H}&seg={seg}')
    t0 = time.time()
    while time.time() - t0 < 240:
        try:
            if pg.evaluate(f'!!({HK} && {HK}.ready)'):
                break
        except Exception:
            pass
        time.sleep(2)
    else:
        print('PAGE ERRORS:', errs[:5], flush=True)
        raise SystemExit('page never became ready (evaluate poll, 240 s)')
    print(f'[{seg}] ready in {time.time()-t0:.0f}s, build {pg.evaluate(f"{HK}.buildMs")} ms', flush=True)
    if errs:
        print('PAGE ERRORS:', errs[:3], flush=True)
    return b, pg


def capture_webcodecs(pg, sec, fps, h264_path, upload_state, upload_url):
    """The kit's capture_webcodecs (scripts/capture.py), unchanged in substance."""
    preflight = pg.evaluate("""async ({ W, H, fps }) => {
      const cv = document.querySelector('canvas');
      if (!cv || typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return { ok: false, reason: 'no WebCodecs in this browser' };
      if (cv.width !== W || cv.height !== H) return { ok: false, reason: `the canvas is ${cv.width}x${cv.height}, not ${W}x${H}` };
      const base = { width: W, height: H, framerate: fps, avc: { format: 'annexb' } };
      const rate = Math.min(240_000_000, Math.max(40_000_000, Math.round(W * H * fps * 1.2)));
      const tries = [
        [{ bitrateMode: 'quantizer', hardwareAcceleration: 'prefer-hardware' }, 16],
        [{ bitrateMode: 'quantizer' }, 16],
        [{ bitrate: rate, bitrateMode: 'constant', hardwareAcceleration: 'prefer-hardware' }, null],
        [{ bitrate: rate }, null],
      ];
      for (const [extra, qp] of tries) for (const codec of ['avc1.640033', 'avc1.64002a', 'avc1.4d0033']) {
        try {
          const cfg = { codec, ...base, ...extra };
          const sup = await VideoEncoder.isConfigSupported(cfg);
          if (sup && sup.supported) return { ok: true, cfg, qp };
        } catch {}
      }
      return { ok: false, reason: 'no supported H.264 encoder configuration' };
    }""", {'W': W, 'H': H, 'fps': fps})
    if not preflight.get('ok'):
        return preflight
    t0 = time.perf_counter()
    with open(h264_path, 'wb') as fp:
        upload_state['fp'], upload_state['seq'] = fp, 0
        try:
            res = pg.evaluate("""async ({ hook, W, H, sec, fps, url, cal, cfg, qp }) => {
              const P = window[hook];
              const cv = document.querySelector('canvas');
              const n = Math.max(1, Math.round(sec * fps));
              const gop = Math.max(1, Math.round(fps / 2)), frameUs = Math.round(1e6 / fps);
              let encErr = null;
              let pending = [], pendingBytes = 0, seq = 0;
              const flushBytes = async () => {
                if (!pending.length) return;
                const merged = new Uint8Array(pendingBytes);
                let off = 0;
                for (const c of pending) { merged.set(c, off); off += c.byteLength; }
                pending = []; pendingBytes = 0;
                for (let tries = 0; ; tries++) {
                  try {
                    const resp = await fetch(`${url}/${seq}`, { method: 'POST', body: merged });
                    if (resp.ok) break;
                    throw new Error('chunk upload failed: ' + resp.status);
                  } catch (e) {
                    if (tries >= 3) throw e;
                    await new Promise((r) => setTimeout(r, 200));
                  }
                }
                seq++;
              };
              const enc = new VideoEncoder({
                output: (chunk) => {
                  const buf = new Uint8Array(chunk.byteLength);
                  chunk.copyTo(buf);
                  pending.push(buf); pendingBytes += buf.byteLength;
                },
                error: (e) => { encErr = String(e); },
              });
              enc.configure(cfg);
              const opts = (key) => (qp != null ? { keyFrame: key, avc: { quantizer: qp } } : { keyFrame: key });
              {
                const c = new OffscreenCanvas(W, H), g = c.getContext('2d');
                cal.forEach(([r, gg, b], i) => { g.fillStyle = `rgb(${r},${gg},${b})`; g.fillRect((i % 4) * W / 4, Math.floor(i / 4) * H / 2, W / 4 + 1, H / 2 + 1); });
                const vf = new VideoFrame(c, { timestamp: 0, duration: frameUs });
                enc.encode(vf, opts(true));
                vf.close();
              }
              P.restart();
              for (let i = 0; i < n; i++) {
                if (encErr) throw new Error(encErr);
                P.step(1 / fps, fps);
                const vf = new VideoFrame(cv, { timestamp: Math.round((i + 1) * 1e6 / fps), duration: frameUs });
                enc.encode(vf, opts((i % gop) === 0));
                vf.close();
                while (enc.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 1));
                if (pendingBytes >= 524288) await flushBytes();
              }
              await enc.flush();
              enc.close();
              if (encErr) throw new Error(encErr);
              await flushBytes();
              return { ok: true, frames: n };
            }""", {'hook': '__papercraft', 'W': W, 'H': H, 'sec': sec, 'fps': fps,
                   'url': upload_url, 'cal': CAL, 'cfg': preflight['cfg'], 'qp': preflight['qp']})
        finally:
            upload_state['fp'] = None
    res['elapsed'] = time.perf_counter() - t0
    return res


def detect_colour(h264_path):
    exe, best = 'ffmpeg', None
    for rng in ('pc', 'tv'):
        for mat, tag in (('bt709', 'bt709'), ('bt601', 'smpte170m')):
            r = subprocess.run([exe, '-v', 'error', '-color_range', rng, '-colorspace', tag, '-f', 'h264', '-i', h264_path, '-vf',
                                f'select=eq(n\\,0),scale=in_range={rng}:in_color_matrix={mat}:out_color_matrix=bt709:out_range=pc,format=rgb24,scale=32:16:flags=neighbor',
                                '-frames:v', '1', '-f', 'rawvideo', '-'], capture_output=True)
            px = r.stdout
            if r.returncode or len(px) < 32 * 16 * 3:
                continue
            err = 0.0
            for i, want in enumerate(CAL):
                o = (((i // 4) * 8 + 4) * 32 + (i % 4) * 8 + 4) * 3
                err += sum(abs(px[o + k] - want[k]) for k in range(3)) / 3
            err /= len(CAL)
            if best is None or err < best[2]:
                best = (rng, mat, err, tag)
    return best


def encode_mp4(h264_path, colour, fps, n, mp4):
    rng, mat, _, tag = colour
    to709 = 'out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv'
    vf = f'select=gte(n\\,1),setpts=PTS-STARTPTS,scale=in_range={rng}:in_color_matrix={mat}:{to709}'
    tmp = mp4 + '.tmp.mp4'
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-color_range', rng, '-colorspace', tag,
                        '-r', str(fps), '-f', 'h264', '-i', h264_path, '-vf', vf, '-frames:v', str(n),
                        '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', '18',
                        '-g', str(max(1, round(fps / 2))), '-bf', '2', '-colorspace', 'bt709',
                        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
                        '-an', '-movflags', '+faststart', tmp], capture_output=True, text=True)
    if r.returncode:
        print('ffmpeg failed:', r.stderr[-500:]); return None
    os.replace(tmp, mp4)
    return mp4


def main():
    mode, seg = sys.argv[1], sys.argv[2]
    from playwright.sync_api import sync_playwright
    upload_state = {'fp': None}
    port, upload_url = serve(upload_state)
    with sync_playwright() as p:
        b, pg = open_page(p, port, seg)
        if mode == 'still':
            sec, out = float(sys.argv[3]), sys.argv[4]
            os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
            t0 = time.time()
            pg.evaluate(f'() => {{ const P = {HK}; P.restart(); P.step(0); if ({sec} > 0) P.step({sec}, {FPS}); }}')
            pg.screenshot(path=out)
            print(f'still {out} stepped in {time.time()-t0:.0f}s', flush=True)
        elif mode == 'video':
            sec, out = float(sys.argv[3]), sys.argv[4]
            os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
            n = round(sec * FPS)
            h264_path = out + '.raw.h264'
            wc = capture_webcodecs(pg, sec, FPS, h264_path, upload_state, upload_url)
            if not wc.get('ok'):
                print('WebCodecs failed:', wc.get('reason')); sys.exit(1)
            print(f'{n} frames through WebCodecs in {wc["elapsed"]:.1f}s ({n / wc["elapsed"]:.1f} fps)', flush=True)
            colour = detect_colour(h264_path)
            if not colour or colour[2] > 10.0:
                print('colour check failed:', colour); sys.exit(1)
            print(f'encoder wrote {"full" if colour[0] == "pc" else "limited"}-range {colour[1]} (patches off by {colour[2]:.1f})', flush=True)
            if not encode_mp4(h264_path, colour, FPS, n, out):
                sys.exit(1)
            os.remove(h264_path)
            print(f'wrote {out}', flush=True)
        b.close()


if __name__ == '__main__':
    main()
