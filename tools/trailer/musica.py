"""Orquesta de cine sintetizada nota por nota para el tráiler (re menor, 120 BPM). Sin audio de terceros.
Instrumentos por síntesis aditiva: cuerdas (sección con vibrato), spiccato, cornos, trompetas, metales graves, coro, piano,
celesta; percusión: timbales, taikos, golpe grave, platillo, redoblante; efectos: subida, barrido, latido, tic-tac, sello.
La sala es una reverberación de convolución con caída distinta por frecuencia."""
import math

import numpy as np

SR = 44100
RNG = np.random.default_rng(2026)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def n(name):
    """'D4' → 62, 'Bb3' → 58, 'F#5' → 78."""
    p = NOTE[name[0]]
    i = 1
    while name[i] in '#b':
        p += 1 if name[i] == '#' else -1
        i += 1
    return 12 * (int(name[i:]) + 1) + p


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(t, d, a, r, dk=0.0, s=1.0):
    """Ataque a, caída opcional hasta s (constante dk), y salida r al final de d."""
    e = np.minimum(1.0, t / max(a, 1e-4))
    if dk:
        e = e * (s + (1 - s) * np.exp(-np.maximum(0, t - a) * dk))
    return e * np.clip((d - t) / max(r, 1e-4), 0, 1)


def lp(x, k):
    c = np.cumsum(np.concatenate([[0.0], x]))
    y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(len(x) - len(y))])


def fft_band(x, lo, hi):
    """Filtro pasa banda por FFT (bordes suaves)."""
    nf = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(nf, 1 / SR)
    g = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, nf)


def noise(d):
    return RNG.standard_normal(int(d * SR))


def stereo(x, pan=0.0):
    a = (pan + 1) * math.pi / 4
    return np.vstack([x * math.cos(a), x * math.sin(a)])


# ——— cuerdas, metales y voces ———
def section(midis, d, kind='str', vel=1.0, a=None, r=None):
    """Sección (varias voces desafinadas, vibrato y paneo) de cuerdas, cornos, trompetas, metales graves o coro."""
    cfg = {
        'str': dict(voices=6, det=0.006, vib=0.0035, a=0.25, r=0.5, top=5200, roll=1.0, bright=2600, spread=0.7),
        'horn': dict(voices=4, det=0.003, vib=0.002, a=0.07, r=0.25, top=3000, roll=0.5, bright=0, spread=0.4),
        'tpt': dict(voices=3, det=0.0025, vib=0.003, a=0.04, r=0.18, top=7000, roll=0.35, bright=0, spread=0.3),
        'low': dict(voices=4, det=0.003, vib=0.001, a=0.05, r=0.3, top=2500, roll=0.4, bright=0, spread=0.3),
        'choir': dict(voices=5, det=0.005, vib=0.004, a=0.45, r=0.7, top=4500, roll=0.0, bright=0, spread=0.8),
    }[kind]
    t = tt(d)
    A = env(t, d, a if a is not None else cfg['a'], r if r is not None else cfg['r'])
    out = np.zeros((2, len(t)))
    brass = kind in ('horn', 'tpt', 'low')
    if brass:   # el brillo crece con la fuerza del soplido (lo que hace sonar a metal)
        Bt = 1.2 + (2.5 if kind == 'horn' else 4.5 if kind == 'tpt' else 5.5) * vel * (A ** 1.4) * (1 + 0.6 * np.exp(-t * 6))
    for m in midis:
        f0 = hz(m)
        for v in range(cfg['voices']):
            f = f0 * (1 + RNG.normal(0, cfg['det'] / 2))
            rate = RNG.uniform(4.8, 6.4)
            vd = cfg['vib'] * np.minimum(1, t / 0.4)
            scoop = 1 - (0.012 * np.exp(-t * 25) if brass else 0)
            ph = 2 * math.pi * f * t * scoop + (vd * f / rate) * np.sin(2 * math.pi * rate * t + RNG.uniform(0, 6))
            sig = np.zeros_like(t)
            for k in range(1, int(cfg['top'] / f) + 1):
                fk = k * f
                if kind == 'str':
                    amp = 1 / k / (1 + (fk / cfg['bright']) ** 2)
                    if amp < 0.002:
                        break
                    sig += amp * np.sin(k * ph + RNG.uniform(0, 6))
                elif kind == 'choir':
                    amp = (math.exp(-((fk - 720) / 170) ** 2) + .75 * math.exp(-((fk - 1150) / 210) ** 2) + .3 * math.exp(-((fk - 2700) / 320) ** 2)
                           + .05 / k)
                    if amp > .01:
                        sig += amp * np.sin(k * ph + RNG.uniform(0, 6))
                else:
                    w = np.exp(-(k - 1) / Bt) / k ** cfg['roll']
                    sig += w * np.sin(k * ph + 0.3 * k)
            shimmer = 1 + 0.08 * np.sin(2 * math.pi * RNG.uniform(0.2, 0.7) * t + RNG.uniform(0, 6))
            out += stereo(sig * shimmer, RNG.uniform(-cfg['spread'], cfg['spread']))
    gain = {'str': 0.06, 'horn': 0.17, 'tpt': 0.13, 'low': 0.07, 'choir': 0.055}[kind]
    return out * A * gain * vel / math.sqrt(cfg['voices'])


def spiccato(m, vel=1.0, d=0.2):
    t = tt(d)
    out = np.zeros((2, len(t)))
    for v in range(3):
        f = hz(m) * (1 + RNG.normal(0, 0.002))
        sig = sum(np.sin(2 * math.pi * f * k * t + k * 1.3) / k / (1 + (k * f / 2400) ** 2) for k in range(1, int(5000 / f) + 1))
        out += stereo(sig, RNG.uniform(-0.5, 0.5))
    bow = fft_band(noise(d), 1500, 6000) * 0.04
    return (out + stereo(bow)) * (1 - np.exp(-t * 400)) * np.exp(-t * 18) * 0.12 * vel


def piano(m, d=2.5, vel=1.0):
    t = tt(d)
    f0 = hz(m)
    sig = np.zeros_like(t)
    for s, det in enumerate((-0.0008, 0, 0.0009)):
        for k in range(1, 18):
            fk = k * f0 * (1 + det) * math.sqrt(1 + 0.0004 * k * k)
            if fk > 9000:
                break
            sig += np.sin(2 * math.pi * fk * t) * (1 / k ** 1.1) * np.exp(-t * (0.9 + 0.35 * k)) * (0.6 if k == 1 else 1)
    hammer = fft_band(noise(0.03), 800, 5000) * np.exp(-tt(0.03) * 150) * 0.3
    sig[:len(hammer)] += hammer
    return stereo(sig * (1 - np.exp(-t * 900)) * 0.14 * vel, (m - 66) / 30)


def celesta(m, d=2.0, vel=1.0):
    t = tt(d)
    f = hz(m)
    sig = sum(a * np.sin(2 * math.pi * f * r * t) * np.exp(-t * k) for r, a, k in ((1, 1, 2.2), (2, .3, 4), (3.01, .12, 6), (4.2, .06, 9)))
    return stereo(sig * (1 - np.exp(-t * 2000)) * 0.12 * vel, RNG.uniform(-0.4, 0.4))


# ——— percusión ———
def timpani(m, vel=1.0, d=2.5):
    t = tt(d)
    f = hz(m)
    sig = sum(a * np.sin(2 * math.pi * f * r * t * (1 + 0.02 * np.exp(-t * 20))) * np.exp(-t * k)
              for r, a, k in ((1, 1, 1.6), (1.5, .5, 2.4), (1.99, .35, 3), (2.44, .2, 4)))
    hit = fft_band(noise(0.06), 200, 3000) * np.exp(-tt(0.06) * 60) * 0.5
    sig[:len(hit)] += hit
    return stereo(np.tanh(sig * 1.3) * 0.35 * vel, -0.15)


def timp_roll(m, d, vel=1.0):
    out = np.zeros((2, int((d + 2.5) * SR)))
    k, t0 = 0, 0.0
    while t0 < d:
        s = timpani(m, vel * (0.25 + 0.75 * t0 / d) * (0.85 + 0.15 * (k % 2)), 2.0)
        i = int(t0 * SR)
        out[:, i:i + s.shape[1]] += s[:, :out.shape[1] - i]
        t0 += 0.055
        k += 1
    return out


def taiko(vel=1.0, f0=48, d=1.8):
    t = tt(d)
    ph = 2 * math.pi * np.cumsum(f0 + 90 * np.exp(-t * 26)) / SR
    body = np.sin(ph) * np.exp(-t * 3.8) * (1 - np.exp(-t * 900))
    skin = lp(noise(d), 5) * np.exp(-t * 28) * 0.5
    return stereo(np.tanh(1.7 * (body + skin)) * 0.38 * vel, RNG.uniform(-0.2, 0.2))


def boom(vel=1.0, d=5.0):
    t = tt(d)
    ph = 2 * math.pi * np.cumsum(26 + 70 * np.exp(-t * 4.5)) / SR
    sub = np.tanh(2.4 * np.sin(ph) * np.exp(-t * 0.8)) * (1 - np.exp(-t * 300))
    crack = fft_band(noise(0.25), 60, 1500) * np.exp(-tt(0.25) * 18)
    sub[:len(crack)] += crack * 0.5
    return stereo(sub * 0.38 * vel)


def crash(vel=1.0, d=5.0):
    t = tt(d)
    out = []
    for _ in range(2):
        x = fft_band(noise(d), 3500, 16000) * (np.exp(-t * 1.1) * 0.8 + np.exp(-t * 6) * 0.6)
        x += fft_band(noise(d), 600, 3500) * np.exp(-t * 3) * 0.25
        out.append(x * (1 - np.exp(-t * 800)))
    return np.vstack(out) * 0.13 * vel


def reverse_crash(d=1.2, vel=1.0):
    return crash(vel, d * 1.5)[:, :int(d * SR)][:, ::-1] * np.linspace(0, 1, int(d * SR)) ** 1.5


def snare(vel=1.0, d=0.3):
    t = tt(d)
    x = fft_band(noise(d), 1200, 9000) * np.exp(-t * 20) * 0.7 + np.sin(2 * math.pi * 185 * t) * np.exp(-t * 35) * 0.5
    return stereo(x * 0.3 * vel, 0.15)


def whoosh(d=0.6, vel=1.0, up=True):
    t = tt(d)
    x = noise(d)
    seg = int(0.02 * SR)
    out = np.zeros_like(x)
    for i in range(0, len(x), seg):
        u = i / len(x)
        fc = 300 * 2 ** ((u if up else 1 - u) * 5)
        out[i:i + seg] = fft_band(x[i:i + seg * 2], fc * 0.6, fc * 1.6)[:len(x[i:i + seg])]
    return stereo(out * np.sin(math.pi * t / d) ** 2 * 0.25 * vel, 0.3 if up else -0.3)


def riser(d, vel=1.0):
    t = tt(d)
    u = t / d
    ph = 2 * math.pi * np.cumsum(hz(n('D3')) * 2 ** (u * 2)) / SR
    tone = sum(np.sin(k * ph) / k for k in range(1, 9))
    nz = fft_band(noise(d), 2000, 12000)
    return stereo((tone * 0.15 + nz * 0.15) * u ** 2.4 * vel)


def heartbeat(vel=1.0):
    return taiko(0.7 * vel, 36, 0.9)


def tick(hi=True):
    t = tt(0.05)
    x = fft_band(noise(0.05), 2500 if hi else 1600, 8000) * np.exp(-t * 160)
    return stereo(x * 0.25, 0.4 if hi else -0.4)


def stamp(vel=1.0):
    t = tt(0.4)
    thud = np.sin(2 * math.pi * 90 * t) * np.exp(-t * 18)
    slap = fft_band(noise(0.4), 400, 5000) * np.exp(-t * 40)
    return stereo((thud + slap * 0.6) * 0.5 * vel)


def shatter(vel=1.0, d=1.6):
    out = np.zeros((2, int(d * SR)))
    for _ in range(26):
        m = int(RNG.integers(n('A5'), n('E8')))
        s = celesta(m, 1.0, RNG.uniform(0.3, 1.0))
        i = int(RNG.uniform(0, 0.5) * SR)
        out[:, i:i + s.shape[1]] += s[:, :out.shape[1] - i]
    return out * vel


def roar(d=1.6):
    t = tt(d)
    out = np.zeros((2, len(t)))
    for m in (n('D1'), n('Eb2'), n('A1')):
        out += section([m], d, 'low', 1.0, a=0.12, r=0.6)
    growl = fft_band(noise(d), 80, 900) * (0.6 + 0.4 * np.sin(2 * math.pi * 28 * t)) * env(t, d, 0.1, 0.8) * 0.3
    return out + stereo(growl)


# ——— sala ———
def hall_ir(d=3.4):
    t = tt(d)
    irs = []
    for ch in range(2):
        ir = np.zeros_like(t)
        for lo, hi, rt in ((40, 250, 3.2), (250, 1000, 2.8), (1000, 3500, 2.2), (3500, 8000, 1.5), (8000, 18000, 0.9)):
            ir += fft_band(noise(d), lo, hi) * np.exp(-6.9 * t / rt)
        pre = int(0.024 * SR)
        ir = np.concatenate([np.zeros(pre), ir])[:len(t)]
        for k in range(6):
            j = int(RNG.uniform(0.008, 0.07) * SR)
            ir[j] += RNG.uniform(-0.6, 0.6) * 4
        irs.append(ir / np.sqrt((ir ** 2).sum()))
    return irs


def eq(x):
    """Ecualización final pensada para celular: fuera el subgrave, graves contenidos y más presencia."""
    nf = x.shape[1]
    f = np.fft.rfftfreq(nf, 1 / SR)
    g = 1 / (1 + (38 / np.maximum(f, 1)) ** 8)
    g *= 1 - 0.55 / (1 + (f / 110) ** 2)
    g *= 1 + 0.5 * np.exp(-((np.log2(np.maximum(f, 1) / 2600)) ** 2) / 0.8)
    return np.vstack([np.fft.irfft(np.fft.rfft(c) * g, nf) for c in x])


class Mix:
    def __init__(self, d):
        self.n = int(d * SR)
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))

    def add(self, t0, sig, g=1.0, rev=0.3):
        i = int(round(t0 * SR))
        if i >= self.n:
            return
        if sig.ndim == 1:
            sig = stereo(sig)
        sig = sig[:, :self.n - i] * g
        self.dry[:, i:i + sig.shape[1]] += sig
        self.wet[:, i:i + sig.shape[1]] += sig * rev

    def render(self):
        out = self.dry.copy()
        for c, ir in enumerate(hall_ir()):
            nn = self.n + len(ir) - 1
            nf = 1 << (nn - 1).bit_length()
            out[c] += np.fft.irfft(np.fft.rfft(self.wet[c], nf) * np.fft.rfft(ir, nf), nf)[:self.n] * 0.8
        out = eq(out)
        # compresión suave (bloques de 10 ms) y limitador
        blk = int(0.01 * SR)
        nb = self.n // blk
        rms = np.sqrt((out[:, :nb * blk] ** 2).reshape(2, nb, blk).mean(axis=(0, 2)) + 1e-12)
        sm = np.copy(rms)
        for i in range(1, nb):
            k = 0.5 if rms[i] > sm[i - 1] else 0.03
            sm[i] = sm[i - 1] + (rms[i] - sm[i - 1]) * k
        thr = np.percentile(sm, 70)
        gain = np.where(sm > thr, (sm / thr) ** (1 / 2.5 - 1), 1.0)
        g = np.interp(np.arange(self.n), np.arange(nb) * blk + blk / 2, gain)
        out *= g
        out /= np.percentile(np.abs(out), 99.9)
        out = np.tanh(out * 0.95)
        return out / np.abs(out).max() * 0.93


# ——— partitura ———
CH = {'Dm': ('D2', ('D3', 'A3', 'D4', 'F4')), 'Bb': ('Bb1', ('Bb2', 'F3', 'D4', 'F4')), 'F': ('F2', ('F3', 'C4', 'A4', 'C5')),
      'C': ('C2', ('C3', 'G3', 'E4', 'G4')), 'A': ('A1', ('A2', 'E3', 'C#4', 'E4')), 'D': ('D2', ('D3', 'A3', 'F#4', 'A4')),
      'Gm': ('G1', ('G2', 'D3', 'Bb3', 'D4'))}
CHOIR = {'Dm': ('D4', 'F4', 'A4'), 'Bb': ('D4', 'F4', 'Bb4'), 'F': ('C4', 'F4', 'A4'), 'C': ('C4', 'E4', 'G4'), 'A': ('C#4', 'E4', 'A4'),
         'D': ('D4', 'F#4', 'A4'), 'Gm': ('D4', 'G4', 'Bb4')}
OST = {'Dm': ('D3', 'A3', 'D3', 'F3'), 'Bb': ('Bb2', 'F3', 'Bb2', 'D3'), 'F': ('F2', 'C3', 'F3', 'A3'), 'C': ('C3', 'G3', 'C3', 'E3'),
       'A': ('A2', 'E3', 'A2', 'C#3'), 'D': ('D3', 'A3', 'D3', 'F#3'), 'Gm': ('G2', 'D3', 'G2', 'Bb2')}


def ms(names):
    return [n(x) for x in names]


def chord(m, t0, name, d, vel=1.0, choir=0.0, low=0.0, brass=0.0):
    bass, upper = CH[name]
    m.add(t0, section(ms([bass, bass[:-1] + str(int(bass[-1]) + 1)]), d + 0.4, 'str', vel), 1.0, 0.35)
    m.add(t0, section(ms(upper), d + 0.4, 'str', vel * 0.8), 1.0, 0.45)
    if choir:
        m.add(t0, section(ms(CHOIR[name]), d + 0.5, 'choir', choir), 1.0, 0.6)
    if low:
        m.add(t0, section(ms([bass, upper[0]]), d, 'low', low, a=0.04), 1.0, 0.3)
    if brass:
        m.add(t0, section(ms(upper[1:]), d, 'horn', brass), 1.0, 0.35)


def ostinato(m, t0, name, d, step=0.25, vel=1.0):
    notes = ms(OST[name])
    i = 0
    while i * step < d - 1e-6:
        m.add(t0 + i * step, spiccato(notes[i % 4], vel * (1.0 if i % 4 == 0 else 0.75)), 1.0, 0.25)
        m.add(t0 + i * step, spiccato(notes[i % 4] - 12, vel * 0.6), 1.0, 0.2)
        i += 1


def melody(m, t0, notes, kind='horn', vel=1.0, octave=0):
    t = t0
    for name, d in notes:
        if name:
            m.add(t, section([n(name) + 12 * octave], d + 0.12, kind, vel), 1.0, 0.4)
        t += d


THEME_A = [('D4', .75), ('A4', .25), ('A4', 1.0), ('Bb4', .75), ('A4', .25), ('G4', .5), ('F4', .5),
           ('A4', 1.5), ('C5', .5), ('G4', 1.0), ('E4', .5), ('G4', .5)]


def compose(dur):
    m = Mix(dur)
    # 0–4,2 · la PEP: cuerdas graves, piano triste y tic-tac
    chord(m, 0.0, 'Dm', 4.2, 0.5)
    for t0, name, d in ((0.4, 'A4', .5), (0.9, 'D5', .5), (1.4, 'F5', .5), (1.9, 'E5', .7), (2.6, 'D5', .5), (3.1, 'C5', .5)):
        m.add(t0, piano(n(name), 2.6, 0.9), 1.0, 0.5)
    for i in range(8):
        m.add(0.5 + i * 0.5, tick(i % 2 == 0), 0.8, 0.2)
    m.add(3.6, stamp(), 1.2, 0.3)
    m.add(3.6, timpani(n('D2'), 1.0), 1.0, 0.4)
    m.add(3.6, section(ms(['D2', 'A2']), 0.5, 'low', 1.0, a=0.02, r=0.3), 1.0, 0.4)
    # 4,2–8 · el caos: ostinato que acelera, reloj loco, subida
    chord(m, 4.2, 'Bb', 2.0, 0.7)
    chord(m, 6.2, 'A', 1.8, 0.9, choir=0.5)
    ostinato(m, 4.2, 'Bb', 2.0, 0.25, 0.8)
    ostinato(m, 6.2, 'A', 1.8, 0.125, 1.0)
    t0, dt = 4.2, 0.25
    while t0 < 7.9:
        m.add(t0, tick(int(t0 / dt) % 2 == 0), 0.6, 0.2)
        t0, dt = t0 + dt, max(0.06, dt * 0.93)
    m.add(6.0, riser(2.0), 1.0, 0.3)
    t0, dt = 7.0, 0.1
    while t0 < 8.0:
        m.add(t0, snare(0.4 + (t0 - 7.0) * 0.6), 1.0, 0.25)
        t0, dt = t0 + dt, max(0.035, dt * 0.88)
    m.add(6.8, reverse_crash(1.2), 1.0, 0.3)
    # 8 · NEXO LO HACE POR TI: re mayor triunfal
    m.add(8.0, boom(1.0), 1.0, 0.25)
    m.add(8.0, crash(1.0), 1.0, 0.45)
    m.add(8.0, taiko(1.0, 44), 1.0, 0.3)
    m.add(8.0, timpani(n('D2'), 1.0), 1.0, 0.4)
    chord(m, 8.0, 'D', 1.5, 1.1, choir=1.0, low=1.0, brass=1.0)
    chord(m, 9.5, 'Bb', 1.0, 0.9, choir=0.8, brass=0.6)
    for i, name in enumerate(('D6', 'F#6', 'A6', 'D7', 'A6', 'F#6', 'A6', 'D7')):
        m.add(8.1 + i * 0.1, celesta(n(name), 1.5, 0.8), 1.0, 0.6)
    m.add(10.0, reverse_crash(0.5), 0.6, 0.3)
    # 10,5–19 · el sótano: tema en los cornos
    for i, name in enumerate(('Dm', 'Bb', 'F', 'C')):
        t0 = 10.5 + i * 2
        chord(m, t0, name, 2.0, 0.75 + i * 0.08, choir=0.35 + i * 0.12)
        ostinato(m, t0, name, 2.0, 0.25, 0.45 + i * 0.12)
        m.add(t0, timpani(n(CH[name][0]) + 12, 0.7), 1.0, 0.4)
        if i >= 2:
            for k in (0, 0.75, 1.0, 1.5):
                m.add(t0 + k, taiko(0.45 + 0.15 * i, 52), 1.0, 0.3)
    for k in range(4):
        m.add(10.5 + k, taiko(0.3, 70, 0.6), 1.0, 0.15)              # pasos en la piedra
    melody(m, 10.5, THEME_A, 'horn', 0.9)
    melody(m, 10.5, THEME_A, 'horn', 0.5, octave=-1)
    m.add(16.3, reverse_crash(1.3), 0.8, 0.3)
    m.add(17.6, crash(0.7), 1.0, 0.5)
    for i, name in enumerate(('D6', 'A6', 'F6', 'D7', 'E6', 'C7')):
        m.add(16.4 + i * 0.18, celesta(n(name), 1.6, 0.8), 1.0, 0.6)
    m.add(17.6, section(ms(CHOIR['A']), 1.5, 'choir', 1.0), 1.0, 0.6)
    chord(m, 18.5, 'A', 0.5, 1.0, brass=0.8)
    m.add(17.7, riser(1.3), 1.0, 0.3)
    m.add(18.4, whoosh(0.6), 1.0, 0.3)
    # 19–25 · combate: ostinato en semicorcheas, taikos y golpes de metal
    m.add(19.0, boom(0.9), 1.0, 0.25)
    m.add(19.0, crash(0.8), 1.0, 0.4)
    m.add(19.1, roar(1.6), 1.0, 0.35)
    for t0, name, d in ((19.0, 'Dm', 2.0), (21.0, 'Bb', 2.0), (23.0, 'C', 1.0), (24.0, 'A', 1.0)):
        chord(m, t0, name, d, 0.85, choir=0.5)
        ostinato(m, t0, name, d, 0.125, 0.9)
        for k in np.arange(0, d, 0.5):
            m.add(t0 + k, taiko(0.85 if k % 1 == 0 else 0.55, 48 if k % 1 == 0 else 60), 1.0, 0.3)
        m.add(t0, section(ms([CH[name][0], CH[name][1][0]]), 0.35, 'low', 1.0, a=0.02, r=0.2), 1.0, 0.3)
        m.add(t0 + 0.75, section(ms([CH[name][0], CH[name][1][0]]), 0.25, 'low', 0.8, a=0.02, r=0.15), 1.0, 0.3)
    melody(m, 21.0, [('D5', .75), ('A5', .25), ('A5', 1.0)], 'tpt', 0.8)
    for i in range(3):
        m.add(20.6 + i * 0.12, whoosh(0.3, 0.6), 1.0, 0.2)
    for i, name in enumerate(('A5', 'D6', 'F6')):
        m.add(21.9 + i * 0.08, celesta(n(name), 1.0, 0.7), 1.0, 0.5)
    m.add(22.5, whoosh(0.45, 1.0), 1.0, 0.25)
    m.add(22.9, boom(1.0), 1.0, 0.25)
    m.add(22.9, crash(0.9), 1.0, 0.45)
    m.add(22.9, section(ms(['D3', 'F#3', 'A3', 'D4']), 0.8, 'tpt', 1.0, a=0.02, r=0.4), 1.0, 0.4)
    m.add(23.6, shatter(1.0), 1.0, 0.5)
    for i, name in enumerate(('D5', 'F#5', 'A5', 'D6')):
        m.add(24.4 + i * 0.07, celesta(n(name), 1.2, 0.9), 1.0, 0.5)
    # 25–29,5 · funciones: el tema crece
    for t0, name, mel in ((25.0, 'Dm', [('D5', .75), ('C5', .25), ('A4', .5)]), (26.5, 'Bb', [('Bb4', .75), ('A4', .25), ('G4', .5)]),
                          (28.0, 'F', [('A4', .75), ('C5', .25), ('D5', .5)])):
        chord(m, t0, name, 1.5, 1.0, choir=0.8, brass=0.5)
        ostinato(m, t0, name, 1.5, 0.125, 0.9)
        melody(m, t0, mel, 'tpt', 0.9)
        melody(m, t0, mel, 'horn', 0.7, octave=-1)
        m.add(t0, timpani(n(CH[name][0]) + 12, 0.9), 1.0, 0.4)
        m.add(t0, crash(0.4), 1.0, 0.4)
        for k in np.arange(0, 1.5, 0.25):
            m.add(t0 + k, taiko(0.5 if k % 0.5 else 0.8, 50), 1.0, 0.3)
        m.add(t0 - 0.3, whoosh(0.35, 0.7), 1.0, 0.2)
    # 29,5–35 · el Gólem de la PEP
    m.add(29.5, section(ms(['D1', 'D2']), 1.2, 'low', 0.6, a=0.8, r=0.3), 1.0, 0.4)
    m.add(29.5, section(ms(['D3', 'Eb3', 'A3']), 1.6, 'choir', 0.9), 1.0, 0.6)
    m.add(29.6, timp_roll(n('D2'), 1.0, 0.9), 1.0, 0.4)
    m.add(30.6, roar(2.0), 1.3, 0.4)
    m.add(30.6, boom(1.0), 1.0, 0.25)
    m.add(30.6, crash(0.8), 1.0, 0.45)
    riff = ['D2', 'D2', 'D2', 'Eb2', 'D2', 'D2', 'C2', 'D2']
    for i in range(int((33.4 - 31.0) / 0.25)):
        t0 = 31.0 + i * 0.25
        m.add(t0, section([n(riff[i % 8])], 0.22, 'low', 1.0, a=0.015, r=0.08), 1.0, 0.3)
        m.add(t0, taiko(0.8 if i % 2 == 0 else 0.5, 46), 1.0, 0.3)
    m.add(31.0, section(ms(['D5', 'Eb5']), 2.4, 'str', 0.9, a=0.3), 1.0, 0.4)
    m.add(31.0, section(ms(['D4', 'F4', 'A4']), 2.4, 'choir', 0.9), 1.0, 0.6)
    for t0 in (32.0, 32.4, 32.8):
        m.add(t0, section(ms(['A4', 'D5']), 0.3, 'tpt', 1.0, a=0.01, r=0.15), 1.0, 0.4)
        m.add(t0, celesta(n('D7'), 0.8, 1.0), 1.0, 0.4)
        m.add(t0, taiko(1.0, 40), 1.0, 0.3)
    m.add(32.9, reverse_crash(0.5), 1.0, 0.3)
    m.add(33.4, boom(1.2), 1.0, 0.25)
    m.add(33.4, crash(1.0), 1.0, 0.5)
    m.add(33.4, timpani(n('D2'), 1.0), 1.0, 0.4)
    m.add(33.7, shatter(1.2, 2.0), 1.0, 0.5)
    chord(m, 33.4, 'D', 1.6, 1.2, choir=1.2, low=1.0, brass=1.2)
    melody(m, 33.4, [('A4', .5), ('D5', 1.1)], 'tpt', 1.0)
    # 35–37 · silencio y latido
    for t0 in (35.4, 35.65, 36.2, 36.45):
        m.add(t0, heartbeat(1.0 if t0 in (35.4, 36.2) else 0.7), 1.0, 0.2)
    m.add(35.0, section(ms(['D2']), 2.0, 'str', 0.4, a=1.0, r=0.3), 1.0, 0.4)
    m.add(35.8, reverse_crash(1.2), 1.1, 0.3)
    m.add(36.3, section(ms(CHOIR['A']), 0.75, 'choir', 0.8, a=0.6, r=0.05), 1.0, 0.5)
    # 37–46,5 · título: el tema completo con toda la orquesta
    m.add(37.0, boom(1.2), 1.0, 0.25)
    m.add(37.0, crash(1.0), 1.0, 0.5)
    m.add(37.0, taiko(1.0, 40), 1.0, 0.3)
    for i, name in enumerate(('Dm', 'Bb', 'F', 'C')):
        t0 = 37.0 + i * 2
        chord(m, t0, name, 2.0, 1.1, choir=1.1, low=0.7, brass=0.8)
        ostinato(m, t0, name, 2.0, 0.125, 0.9)
        m.add(t0, timpani(n(CH[name][0]) + 12, 1.0), 1.0, 0.4)
        for k in np.arange(0, 2.0, 0.5):
            m.add(t0 + k, taiko(0.9 if k % 1 == 0 else 0.6, 48), 1.0, 0.3)
    title = [('D5', .75), ('A5', .25), ('A5', 1.0), ('Bb5', .75), ('A5', .25), ('G5', .5), ('F5', .5),
             ('A5', 1.5), ('C6', .5), ('G5', 1.0), ('E5', .5), ('E5', .5)]
    melody(m, 37.0, title, 'tpt', 0.9)
    melody(m, 37.0, title, 'horn', 0.9, octave=-1)
    for t0 in (39.0, 40.0):
        m.add(t0, taiko(1.0, 44), 1.0, 0.3)
    m.add(41.0, boom(1.0), 1.0, 0.25)
    m.add(41.0, crash(0.9), 1.0, 0.5)
    m.add(43.0, boom(0.9), 1.0, 0.25)
    m.add(43.0, crash(0.7), 1.0, 0.5)
    m.add(44.4, timp_roll(n('A1'), 0.6, 1.0), 1.0, 0.4)
    m.add(45.0, boom(1.1), 1.0, 0.25)
    m.add(45.0, crash(1.0), 1.0, 0.55)
    chord(m, 45.0, 'D', 1.5, 1.2, choir=1.2, low=1.0, brass=1.0)
    melody(m, 45.0, [('D5', 1.5)], 'tpt', 1.0)
    melody(m, 45.0, [('F#4', 1.5)], 'horn', 1.0)
    for i, name in enumerate(('D6', 'F#6', 'A6', 'D7')):
        m.add(45.0 + i * 0.08, celesta(n(name), 1.5, 0.9), 1.0, 0.6)
    return m.render()
