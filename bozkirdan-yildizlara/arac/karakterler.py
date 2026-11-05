#!/usr/bin/env python3
"""Bozkırdan Yıldızlara karakter üreticisi.

Dede, Ayşe, Kaan ve Tay'ı aynı stilde (yumuşak kâğıt kesme vektör) üretir.
Kullanım: python3 karakterler.py <çıktı_klasörü>
"""
import sys, os

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- ortak tanımlar
DEFS = """
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset=".55" stop-color="#ffe9c7"/><stop offset="1" stop-color="#fff4de"/></linearGradient>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6c9"/><stop offset="1" stop-color="#ffc766"/></radialGradient>
  <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c97a"/><stop offset="1" stop-color="#8fa856"/></linearGradient>
  <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb36a"/><stop offset="1" stop-color="#6f9250"/></linearGradient>
  <linearGradient id="kaftan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a8493"/><stop offset=".5" stop-color="#3aa7b6"/><stop offset="1" stop-color="#247786"/></linearGradient>
  <linearGradient id="robe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1dfb8"/><stop offset=".5" stop-color="#fff6e0"/><stop offset="1" stop-color="#eed9ac"/></linearGradient>
  <radialGradient id="skin" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fad7b2"/><stop offset="1" stop-color="#e8aa80"/></radialGradient>
  <linearGradient id="beard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe6ea"/></linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9803f"/><stop offset="1" stop-color="#8a4d22"/></linearGradient>
  <linearGradient id="hat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#efdcb6"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd86a"/><stop offset="1" stop-color="#e09a22"/></linearGradient>
  <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b3d22"/><stop offset="1" stop-color="#3d2012"/></linearGradient>
  <linearGradient id="hairk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#17100c"/></linearGradient>
  <linearGradient id="dress" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ef8a3c"/><stop offset=".5" stop-color="#ffab5a"/><stop offset="1" stop-color="#e07a2c"/></linearGradient>
  <linearGradient id="vestg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a9e4e"/><stop offset=".5" stop-color="#78bb62"/><stop offset="1" stop-color="#4a8c40"/></linearGradient>
  <linearGradient id="vestt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a8493"/><stop offset=".5" stop-color="#3aa7b6"/><stop offset="1" stop-color="#247786"/></linearGradient>
  <linearGradient id="coat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d28a4c"/><stop offset="1" stop-color="#b9713a"/></linearGradient>
  <linearGradient id="coatd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b87a40"/><stop offset="1" stop-color="#9a5f2e"/></linearGradient>
  <linearGradient id="pants" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a3a"/><stop offset="1" stop-color="#6e4428"/></linearGradient>
  <pattern id="motif" width="28" height="28" patternUnits="userSpaceOnUse">
    <rect width="28" height="28" fill="#c8402f"/>
    <path d="M14 3 L25 14 L14 25 L3 14 Z" fill="#ffd86a"/>
    <path d="M14 9 L19 14 L14 19 L9 14 Z" fill="#c8402f"/>
  </pattern>
  <pattern id="motif2" width="20" height="20" patternUnits="userSpaceOnUse">
    <rect width="20" height="20" fill="#2a8493"/>
    <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="#ffd86a"/>
    <circle cx="10" cy="10" r="3" fill="#c8402f"/>
  </pattern>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.2" fill="#ffffff" opacity=".14"/></pattern>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#5a3a18" flood-opacity=".28"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
"""

def wrap(inner, vb, extra_style="", bg=""):
    w, h = vb.split()[2:]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}">'
            f'{DEFS}{extra_style}{bg}{inner}</svg>')

# ---------------------------------------------------------------- sahne (arka plan)
def scene():
    return """
<rect width="800" height="1000" fill="url(#sky)"/>
<circle cx="620" cy="210" r="130" fill="#ffd27a" opacity=".35"/>
<circle cx="620" cy="210" r="82" fill="url(#sun)"/>
<g fill="#fff" opacity=".85"><ellipse cx="150" cy="150" rx="70" ry="24"/><ellipse cx="190" cy="136" rx="46" ry="22"/><ellipse cx="520" cy="95" rx="60" ry="18"/></g>
<path d="M0 640 Q160 540 320 610 T640 590 T800 620 L800 1000 L0 1000Z" fill="url(#hill1)"/>
<!-- çadır (büyütülmüş, ayrıntılı) -->
<g filter="url(#sh)" transform="translate(40 470) scale(1.7)">
  <path d="M0 120 L0 62 L124 62 L124 120 Z" fill="#fff1d4"/>
  <path d="M0 62 Q62 -6 124 62 Z" fill="#fff8e6"/>
  <path d="M-6 64 Q62 -22 130 64 L124 72 Q62 -2 0 72Z" fill="#c8402f"/>
  <rect x="0" y="94" width="124" height="9" fill="url(#motif)"/>
  <rect x="0" y="64" width="124" height="5" fill="#e0a33a"/>
  <path d="M28 66 L28 118 M62 66 L62 118 M96 66 L96 118" stroke="#e9d3a4" stroke-width="2"/>
  <path d="M42 120 L42 82 Q62 70 82 82 L82 120 Z" fill="#7a4624"/>
  <path d="M62 74 L62 120" stroke="#5e3318" stroke-width="2"/>
  <circle cx="56" cy="102" r="2.5" fill="url(#gold)"/><circle cx="68" cy="102" r="2.5" fill="url(#gold)"/>
  <rect x="58" y="-16" width="8" height="22" rx="3" fill="#7a4624"/>
  <path d="M62 -16 L62 -34" stroke="#7a4624" stroke-width="3"/>
  <path d="M62 -34 L80 -29 L62 -24Z" fill="#c8402f"/>
</g>
<path d="M0 760 Q220 680 460 740 T800 720 L800 1000 L0 1000Z" fill="url(#hill2)"/>
<g fill="#ffe27a"><circle cx="90" cy="860" r="5"/><circle cx="700" cy="900" r="5"/><circle cx="640" cy="820" r="4"/><circle cx="150" cy="930" r="4"/></g>
<ellipse cx="400" cy="935" rx="200" ry="22" fill="#4a5a2a" opacity=".35" filter="url(#soft)"/>
"""

# ---------------------------------------------------------------- Dede
def dede_face(expr):
    """Göz, kaş ve ağız. Dönüş: (ağız, gözler, kaşlar, ek)"""
    mouth = ""
    eyes = ""
    brows = ""
    extra = ""
    if expr == "gulen":
        mouth = ('<path d="M368 424 Q400 462 432 424 Q400 440 368 424Z" fill="#b5483f"/>'
                 '<path d="M378 432 Q400 454 422 432 Q400 442 378 432Z" fill="#f08a82"/>')
        eyes = _eyes(0, 0, 17, 21, 12, 16)
        brows = ('<path d="M322 304 Q350 280 382 300 Q352 296 322 304Z" fill="#fff" stroke="#d3dde2" stroke-width="3"/>'
                 '<path d="M418 300 Q450 280 478 304 Q448 296 418 300Z" fill="#fff" stroke="#d3dde2" stroke-width="3"/>')
    elif expr == "saskin":
        mouth = ('<ellipse cx="400" cy="440" rx="21" ry="25" fill="#8f2f2a"/>'
                 '<ellipse cx="400" cy="452" rx="12" ry="9" fill="#f08a82"/>')
        eyes = _eyes(0, 0, 22, 28, 10, 13, pupil_dy=2)
        brows = ('<path d="M320 282 Q350 246 384 276 Q352 270 320 282Z" fill="#fff" stroke="#d3dde2" stroke-width="3"/>'
                 '<path d="M416 276 Q450 246 480 282 Q448 270 416 276Z" fill="#fff" stroke="#d3dde2" stroke-width="3"/>')
        extra = ('<path d="M290 260 l-18 -10 M300 232 l-16 -14 M510 260 l18 -10 M500 232 l16 -14" '
                 'stroke="#e0a33a" stroke-width="5" stroke-linecap="round" fill="none"/>')
    elif expr == "dusunceli":
        mouth = ('<path d="M376 430 Q396 438 426 424" fill="none" stroke="#a24a3a" stroke-width="6" stroke-linecap="round"/>')
        eyes = _eyes(-8, -9, 17, 21, 12, 16, pupil_dy=0, look=True)
        brows = ('<path d="M322 312 Q350 300 382 306 Q352 302 322 312Z" fill="#fff" stroke="#d3dde2" stroke-width="3"/>'
                 '<path d="M418 290 Q452 262 482 292 Q450 282 418 290Z" fill="#fff" stroke="#d3dde2" stroke-width="3"/>')
        extra = ('<g filter="url(#sh)"><circle cx="560" cy="200" r="9" fill="#fff"/><circle cx="590" cy="160" r="14" fill="#fff"/>'
                 '<ellipse cx="650" cy="90" rx="58" ry="42" fill="#fff"/></g>'
                 '<text x="650" y="108" font-family="Arial,sans-serif" font-weight="700" font-size="58" fill="#e0a33a" text-anchor="middle">?</text>')
    return mouth, eyes, brows, extra

def _eyes(dx, dy, rx, ry, prx, pry, pupil_dy=0, look=False):
    # dx,dy: bakış yönü kayması
    s = ""
    for cx in (350, 450):
        s += (f'<ellipse cx="{cx}" cy="334" rx="{rx}" ry="{ry}" fill="#fff"/>'
              f'<ellipse cx="{cx+2+dx}" cy="{338+dy+pupil_dy}" rx="{prx}" ry="{pry}" fill="#4a2c1a"/>'
              f'<circle cx="{cx+2+dx}" cy="{340+dy+pupil_dy}" r="{max(prx-5,4)}" fill="#1b0f08"/>'
              f'<circle cx="{cx+7+dx}" cy="{331+dy+pupil_dy}" r="4.5" fill="#fff"/>'
              f'<circle cx="{cx-4+dx}" cy="{345+dy+pupil_dy}" r="2" fill="#fff"/>')
        s += f'<path d="M{cx-18} 330 Q{cx} {312-(ry-21)} {cx+18} 330" fill="none" stroke="#6b4630" stroke-width="3" stroke-linecap="round"/>'
    return s

def dede_arm_left():
    # Sol kol: ayrı, koyu kenarlı kol + kıvrımlı bol kol ağzı
    return """
<g filter="url(#sh)">
  <path d="M276 480 Q222 520 226 592 L304 604 Q300 548 332 500 Z" fill="#1f6b79"/>
  <path d="M282 484 Q232 522 236 588 L298 598 Q296 548 326 504 Z" fill="url(#kaftan)"/>
  <path d="M250 530 Q262 560 262 590" stroke="#1f6b79" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
  <path d="M236 584 Q268 604 302 592 L306 620 Q270 640 232 616Z" fill="#fff6e0"/>
  <path d="M232 612 Q270 636 306 618" stroke="#e0a33a" stroke-width="8" fill="none" stroke-linecap="round"/>
</g>
"""

def dede(expr="gulen", with_scene=True, animate=False):
    mouth, eyes, brows, extra = dede_face(expr)
    a = animate
    s = scene() if with_scene else ""
    # gövde
    s += """
<g filter="url(#sh)">
  <rect x="338" y="880" width="124" height="62" rx="10" fill="#e7d3a3"/>
  <path d="M310 880 L360 880 L362 925 Q380 935 395 928 L395 948 L300 948 Q292 925 310 880Z" fill="#7b3f22"/>
  <path d="M440 880 L490 880 Q508 925 500 948 L405 948 L405 928 Q420 935 438 925Z" fill="#7b3f22"/>
  <path d="M300 938 Q345 950 395 938 L395 948 L300 948Z" fill="#4a2312"/>
  <path d="M405 938 Q455 950 500 938 L500 948 L405 948Z" fill="#4a2312"/>
</g>
<g filter="url(#sh)">
  <path d="M265 470 Q400 430 535 470 L590 890 Q400 925 210 890 Z" fill="url(#kaftan)"/>
  <path d="M265 470 Q400 430 535 470 L590 890 Q400 925 210 890 Z" fill="url(#dots)"/>
  <path d="M345 460 L455 460 L478 905 Q400 918 322 905 Z" fill="url(#robe)"/>
  <path d="M400 460 L400 910" stroke="#d9c08a" stroke-width="4"/>
  <circle cx="400" cy="560" r="5" fill="#d9c08a"/><circle cx="400" cy="640" r="5" fill="#d9c08a"/><circle cx="400" cy="720" r="5" fill="#d9c08a"/><circle cx="400" cy="800" r="5" fill="#d9c08a"/>
  <path d="M345 460 L322 905" stroke="#e0a33a" stroke-width="12" fill="none"/>
  <path d="M455 460 L478 905" stroke="#e0a33a" stroke-width="12" fill="none"/>
  <path d="M212 862 Q400 898 588 862 L590 892 Q400 928 210 892Z" fill="url(#motif)"/>
  <path d="M212 862 Q400 898 588 862" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <path d="M300 640 Q400 656 500 640 L504 690 Q400 706 296 690Z" fill="#c8402f"/>
  <path d="M300 640 Q400 656 500 640" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <circle cx="400" cy="672" r="26" fill="url(#gold)"/><circle cx="400" cy="672" r="14" fill="#c8402f"/><circle cx="400" cy="672" r="5" fill="#ffd86a"/>
  <path d="M440 692 Q470 760 452 820" stroke="#c8402f" stroke-width="9" fill="none" stroke-linecap="round"/>
</g>
"""
    s += dede_arm_left()
    # sağ kol (kopuza uzanan) + kopuz + eller
    s += '<g id="sagkol">' if a else "<g>"
    s += """
<g filter="url(#sh)" stroke-linecap="round" fill="none">
  <path d="M505 500 Q555 650 352 748" stroke="#1f6b79" stroke-width="72"/>
  <path d="M505 500 Q555 650 352 748" stroke="url(#kaftan)" stroke-width="64"/>
</g></g>
"""
    s += '<g id="kopuz">' if a else "<g>"
    s += """
<g filter="url(#sh)" transform="rotate(-18 330 770)">
  <rect x="318" y="462" width="26" height="320" rx="11" fill="url(#wood)"/>
  <rect x="318" y="462" width="9" height="320" rx="4" fill="#e3a468" opacity=".6"/>
  <path d="M312 456 Q331 430 350 456 L350 478 L312 478Z" fill="#7a4624"/>
  <circle cx="320" cy="470" r="5" fill="url(#gold)"/><circle cx="342" cy="470" r="5" fill="url(#gold)"/>
  <ellipse cx="331" cy="800" rx="86" ry="108" fill="#7a4624"/>
  <ellipse cx="331" cy="796" rx="80" ry="102" fill="url(#wood)"/>
  <path d="M331 700 Q290 760 296 860 M331 700 Q372 760 366 860" stroke="#8a4d22" stroke-width="3" fill="none" opacity=".6"/>
  <ellipse cx="331" cy="790" rx="26" ry="32" fill="#4a2410"/>
  <ellipse cx="331" cy="790" rx="34" ry="40" fill="none" stroke="url(#gold)" stroke-width="5"/>
"""
    s += ('<g id="teller"><path d="M324 470 L324 840 M338 470 L338 840" stroke="#fff3cf" stroke-width="2.4"/></g>'
          if a else '<path d="M324 470 L324 840 M338 470 L338 840" stroke="#fff3cf" stroke-width="2.4"/>')
    s += """
  <rect x="304" y="838" width="54" height="10" rx="4" fill="#4a2410"/>
  <path d="M345 460 Q380 440 372 410" stroke="#c8402f" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="372" cy="406" r="8" fill="#c8402f"/>
</g></g>
"""
    # eller
    s += """
<g filter="url(#sh)" fill="url(#skin)">
  <ellipse cx="268" cy="610" rx="28" ry="26"/>
  <circle cx="246" cy="622" r="10"/><circle cx="260" cy="634" r="10"/><circle cx="278" cy="636" r="10"/><circle cx="292" cy="626" r="10"/>
</g>
"""
    s += '<g id="sagel" filter="url(#sh)" fill="url(#skin)">' if a else '<g filter="url(#sh)" fill="url(#skin)">'
    s += """
  <ellipse cx="352" cy="752" rx="28" ry="24"/>
  <circle cx="336" cy="768" r="9"/><circle cx="350" cy="774" r="9"/><circle cx="366" cy="772" r="9"/>
</g>
"""
    # kafa
    s += '<g id="kafa">' if a else "<g>"
    s += """
<g filter="url(#sh)">
  <ellipse cx="292" cy="360" rx="22" ry="30" fill="#e3a47a"/>
  <ellipse cx="508" cy="360" rx="22" ry="30" fill="#e3a47a"/>
  <ellipse cx="400" cy="345" rx="112" ry="118" fill="url(#skin)"/>
</g>
<g filter="url(#sh)">
  <path d="M282 372 Q285 540 400 600 Q515 540 518 372 Q500 450 400 448 Q300 450 282 372Z" fill="url(#beard)"/>
</g>
<path d="M310 420 Q322 520 400 580 M350 440 Q360 520 400 585 M490 420 Q478 520 400 580 M450 440 Q440 520 400 585" stroke="#cfd9de" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>
"""
    s += mouth
    s += """
<path d="M400 402 Q352 372 304 414 Q338 436 400 416 Q462 436 496 414 Q448 372 400 402Z" fill="url(#beard)" stroke="#d3dde2" stroke-width="2.5"/>
<path d="M404 408 Q458 392 484 410 M396 408 Q342 392 316 410" stroke="#cfd9de" stroke-width="3" fill="none"/>
<ellipse cx="400" cy="378" rx="22" ry="17" fill="#eaa57c"/>
<ellipse cx="394" cy="372" rx="8" ry="5" fill="#f7c9a4" opacity=".8"/>
<circle cx="334" cy="392" r="20" fill="#f08a78" opacity=".45"/><circle cx="466" cy="392" r="20" fill="#f08a78" opacity=".45"/>
"""
    s += '<g id="gozler">' if a else "<g>"
    s += eyes + "</g>"
    s += """
<path d="M312 322 l-14 -6 M312 334 l-16 0 M312 346 l-14 6 M488 322 l14 -6 M488 334 l16 0 M488 346 l14 6" stroke="#cf9a72" stroke-width="3" stroke-linecap="round"/>
"""
    s += brows
    s += """
<g filter="url(#sh)">
  <path d="M282 270 Q280 150 400 138 Q520 150 518 270 Q400 238 282 270Z" fill="url(#hat)"/>
  <path d="M345 160 Q400 130 455 160" stroke="#e9d3a4" stroke-width="4" fill="none"/>
  <path d="M278 256 Q400 222 522 256 L526 296 Q400 262 274 296Z" fill="#c8402f"/>
  <path d="M276 262 Q400 228 524 262 L526 280 Q400 246 274 280Z" fill="url(#motif)" opacity=".95"/>
  <path d="M274 296 Q400 262 526 296" stroke="url(#gold)" stroke-width="5" fill="none"/>
  <circle cx="400" cy="132" r="17" fill="url(#gold)"/><circle cx="396" cy="127" r="6" fill="#fff6c9" opacity=".8"/>
</g>
<g fill="#fff6e0" stroke="#e9d3a4" stroke-width="2"><circle cx="300" cy="278" r="12"/><circle cx="330" cy="272" r="12"/><circle cx="362" cy="268" r="12"/><circle cx="400" cy="266" r="12"/><circle cx="438" cy="268" r="12"/><circle cx="470" cy="272" r="12"/><circle cx="500" cy="278" r="12"/></g>
"""
    s += "</g>"  # kafa
    s += extra
    return s

# ---------------------------------------------------------------- yüz parçası (çocuklar)
def kid_eyes(cx, cy, r=15, lash=True):
    s = ""
    for x in (cx - 40, cx + 40):
        s += (f'<ellipse cx="{x}" cy="{cy}" rx="{r}" ry="{r+4}" fill="#fff"/>'
              f'<ellipse cx="{x+1}" cy="{cy+3}" rx="{r-4}" ry="{r}" fill="#4a2c1a"/>'
              f'<circle cx="{x+1}" cy="{cy+5}" r="{r-9}" fill="#1b0f08"/>'
              f'<circle cx="{x+6}" cy="{cy-3}" r="5" fill="#fff"/><circle cx="{x-3}" cy="{cy+9}" r="2.2" fill="#fff"/>')
        if lash:
            s += (f'<path d="M{x-r-1} {cy-4} Q{x} {cy-r-10} {x+r+1} {cy-4}" fill="none" stroke="#3a2418" stroke-width="3.5" stroke-linecap="round"/>')
    return s

# ---------------------------------------------------------------- Ayşe
def ayse():
    return """
<ellipse cx="250" cy="765" rx="150" ry="16" fill="#4a5a2a" opacity=".3" filter="url(#soft)"/>
<!-- örgüler (arkada) -->
<g filter="url(#sh)">
  <path d="M158 250 Q112 330 128 430 Q150 470 168 430 Q158 340 190 280Z" fill="url(#hair)"/>
  <path d="M342 250 Q388 330 372 430 Q350 470 332 430 Q342 340 310 280Z" fill="url(#hair)"/>
  <path d="M132 330 q14 -10 30 0 M128 370 q16 -10 32 0 M130 408 q14 -10 30 0 M368 330 q-14 -10 -30 0 M372 370 q-16 -10 -32 0 M370 408 q-14 -10 -30 0" stroke="#2c170c" stroke-width="3" fill="none" opacity=".5"/>
  <rect x="124" y="428" width="48" height="12" rx="6" fill="#c8402f"/>
  <rect x="328" y="428" width="48" height="12" rx="6" fill="#c8402f"/>
</g>
<!-- botlar -->
<g filter="url(#sh)">
  <path d="M198 700 L238 700 L240 742 Q222 752 196 746Z" fill="#7b3f22"/>
  <path d="M262 700 L302 700 L304 746 Q278 752 260 742Z" fill="#7b3f22"/>
  <path d="M194 736 Q220 750 240 740 L240 752 L194 752Z" fill="#c8402f"/>
  <path d="M260 740 Q282 750 306 736 L306 752 L260 752Z" fill="#c8402f"/>
  <rect x="204" y="650" width="28" height="56" fill="#fff6e0"/>
  <rect x="268" y="650" width="28" height="56" fill="#fff6e0"/>
</g>
<!-- elbise -->
<g filter="url(#sh)">
  <path d="M182 440 Q250 410 318 440 L370 690 Q250 722 130 690Z" fill="url(#dress)"/>
  <path d="M182 440 Q250 410 318 440 L370 690 Q250 722 130 690Z" fill="url(#dots)"/>
  <path d="M132 660 Q250 692 368 660 L370 692 Q250 724 130 692Z" fill="url(#motif)"/>
  <path d="M132 660 Q250 692 368 660" stroke="url(#gold)" stroke-width="4" fill="none"/>
  <path d="M196 440 L196 575 Q250 592 304 575 L304 440 Q250 424 196 440Z" fill="url(#vestt)"/>
  <path d="M196 440 L196 575 Q250 592 304 575 L304 440" stroke="#e0a33a" stroke-width="5" fill="none"/>
  <path d="M250 438 L250 586" stroke="#1f6b79" stroke-width="3"/>
  <path d="M190 580 Q250 600 310 580 L312 606 Q250 626 188 606Z" fill="#c8402f"/>
  <circle cx="250" cy="598" r="12" fill="url(#gold)"/>
</g>
<!-- kollar -->
<g filter="url(#sh)" stroke-linecap="round" fill="none">
  <path d="M188 456 Q150 520 160 580" stroke="#e5d5ac" stroke-width="38"/>
  <path d="M188 456 Q150 520 160 580" stroke="#fff6e0" stroke-width="32"/>
  <path d="M312 456 Q362 380 372 318" stroke="#e5d5ac" stroke-width="38"/>
  <path d="M312 456 Q362 380 372 318" stroke="#fff6e0" stroke-width="32"/>
</g>
<g filter="url(#sh)" fill="url(#skin)">
  <circle cx="160" cy="596" r="21"/>
  <circle cx="372" cy="304" r="21"/>
  <circle cx="358" cy="284" r="8"/><circle cx="372" cy="280" r="8"/><circle cx="386" cy="284" r="8"/><circle cx="394" cy="298" r="8"/>
</g>
<path d="M356 322 q16 12 32 0" stroke="#c8402f" stroke-width="7" fill="none" stroke-linecap="round"/>
<rect x="226" y="330" width="48" height="130" rx="18" fill="#e3a47a"/>
<g transform="translate(0 56)">
<g filter="url(#sh)">
  <ellipse cx="258" cy="262" rx="108" ry="106" fill="url(#hair)"/>
  <ellipse cx="156" cy="272" rx="14" ry="20" fill="#e3a47a"/><ellipse cx="344" cy="272" rx="14" ry="20" fill="#e3a47a"/>
  <ellipse cx="250" cy="262" rx="96" ry="98" fill="url(#skin)"/>
</g>
<path d="M154 232 Q170 140 250 134 Q330 140 346 232 Q320 176 250 172 Q180 176 154 232Z" fill="url(#hair)"/>
<path d="M200 168 Q232 196 250 172 Q268 196 300 168 Q282 150 250 150 Q218 150 200 168Z" fill="url(#hair)"/>
<path d="M156 176 Q250 118 344 176 L346 200 Q250 150 154 200Z" fill="url(#motif)"/>
<path d="M156 176 Q250 118 344 176" stroke="url(#gold)" stroke-width="4" fill="none"/>
<circle cx="250" cy="150" r="9" fill="url(#gold)"/>
""" + kid_eyes(250, 262, 14) + """
<ellipse cx="250" cy="296" rx="9" ry="7" fill="#e8aa80"/>
<path d="M222 322 Q250 352 278 322 Q250 334 222 322Z" fill="#b5483f"/>
<path d="M230 328 Q250 346 270 328 Q250 336 230 328Z" fill="#f08a82"/>
<circle cx="190" cy="312" r="16" fill="#f08a78" opacity=".5"/><circle cx="310" cy="312" r="16" fill="#f08a78" opacity=".5"/>
<path d="M210 232 Q226 224 240 232 M260 232 Q274 224 290 232" stroke="#5b3320" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>
"""

# ---------------------------------------------------------------- Kaan
def kaan():
    return """
<ellipse cx="250" cy="765" rx="150" ry="16" fill="#4a5a2a" opacity=".3" filter="url(#soft)"/>
<!-- botlar -->
<g filter="url(#sh)">
  <path d="M196 700 L240 700 L242 742 Q224 752 194 746Z" fill="#6b3a1f"/>
  <path d="M260 700 L304 700 L306 746 Q276 752 258 742Z" fill="#6b3a1f"/>
  <path d="M192 736 Q220 750 242 740 L242 752 L192 752Z" fill="#3f2010"/>
  <path d="M258 740 Q280 750 308 736 L308 752 L258 752Z" fill="#3f2010"/>
  <path d="M190 560 L240 560 L246 705 L194 705Z" fill="url(#pants)"/>
  <path d="M260 560 L310 560 L306 705 L254 705Z" fill="url(#pants)"/>
  <path d="M196 690 Q220 702 244 692 L244 706 L196 706Z" fill="#c8402f"/>
  <path d="M256 692 Q282 702 304 690 L304 706 L256 706Z" fill="#c8402f"/>
</g>
<!-- gömlek + yelek -->
<g filter="url(#sh)">
  <path d="M176 436 Q250 408 324 436 L336 580 Q250 600 164 580Z" fill="#fff6e0"/>
  <path d="M184 440 L184 584 Q250 604 316 584 L316 440 Q250 426 184 440Z" fill="url(#vestg)"/>
  <path d="M184 440 L184 584 Q250 604 316 584 L316 440" stroke="#e0a33a" stroke-width="5" fill="none"/>
  <path d="M250 436 L250 598" stroke="#3d7a34" stroke-width="3"/>
  <circle cx="250" cy="480" r="4" fill="url(#gold)"/><circle cx="250" cy="520" r="4" fill="url(#gold)"/>
  <path d="M164 566 Q250 590 336 566 L338 598 Q250 622 162 598Z" fill="#c8402f"/>
  <path d="M164 566 Q250 590 336 566" stroke="url(#gold)" stroke-width="4" fill="none"/>
  <path d="M290 596 Q316 650 304 690" stroke="#c8402f" stroke-width="9" fill="none" stroke-linecap="round"/>
</g>
<!-- sol kol (belde) -->
<g filter="url(#sh)" stroke-linecap="round" fill="none">
  <path d="M182 460 Q132 520 172 580" stroke="#e5d5ac" stroke-width="40"/>
  <path d="M182 460 Q132 520 172 580" stroke="#fff6e0" stroke-width="34"/>
</g>
<g filter="url(#sh)" fill="url(#skin)"><circle cx="176" cy="580" r="21"/></g>
<!-- sağ kol (yukarıda, merak) -->
<g filter="url(#sh)" stroke-linecap="round" fill="none">
  <path d="M318 458 Q370 400 364 330" stroke="#e5d5ac" stroke-width="40"/>
  <path d="M318 458 Q370 400 364 330" stroke="#fff6e0" stroke-width="34"/>
</g>
<g filter="url(#sh)" fill="url(#skin)">
  <circle cx="364" cy="312" r="21"/>
  <rect x="356" y="262" width="14" height="52" rx="7"/>
  <circle cx="346" cy="318" r="8"/><circle cx="382" cy="322" r="8"/>
</g>
<rect x="226" y="330" width="48" height="130" rx="18" fill="#e3a47a"/>
<g transform="translate(0 56)">
<g filter="url(#sh)">
  <ellipse cx="156" cy="272" rx="14" ry="20" fill="#e3a47a"/><ellipse cx="344" cy="272" rx="14" ry="20" fill="#e3a47a"/>
  <ellipse cx="250" cy="262" rx="98" ry="100" fill="url(#skin)"/>
</g>
<path d="M150 252 Q144 150 250 140 Q356 150 350 252 Q338 196 300 188 Q270 210 240 188 Q196 196 160 226Z" fill="url(#hairk)"/>
<path d="M226 150 Q222 106 252 104 Q244 130 262 144Z" fill="url(#hairk)"/>
<path d="M262 148 Q290 114 306 122 Q294 140 286 160Z" fill="url(#hairk)"/>
""" + kid_eyes(250, 266, 14, lash=False) + """
<ellipse cx="250" cy="298" rx="9" ry="7" fill="#e8aa80"/>
<path d="M214 318 Q250 358 286 318 Q250 336 214 318Z" fill="#b5483f"/>
<path d="M226 326 Q250 350 274 326 Q250 338 226 326Z" fill="#f08a82"/>
<path d="M232 322 l6 8 l8 -8 M254 322 l6 8 l8 -8" fill="#fff" stroke="#fff" opacity="0"/>
<circle cx="188" cy="312" r="16" fill="#f08a78" opacity=".5"/><circle cx="312" cy="312" r="16" fill="#f08a78" opacity=".5"/>
<g fill="#c9835a"><circle cx="222" cy="296" r="2.5"/><circle cx="232" cy="302" r="2.5"/><circle cx="214" cy="304" r="2.5"/><circle cx="278" cy="296" r="2.5"/><circle cx="268" cy="302" r="2.5"/><circle cx="286" cy="304" r="2.5"/></g>
<path d="M206 236 Q222 226 238 234 M262 234 Q278 226 294 236" stroke="#2a1a12" stroke-width="5.5" fill="none" stroke-linecap="round"/>
</g>
"""

# ---------------------------------------------------------------- Tay
def tay():
    return """
<ellipse cx="360" cy="560" rx="260" ry="20" fill="#4a5a2a" opacity=".3" filter="url(#soft)"/>
<!-- kuyruk -->
<path d="M190 270 Q86 270 80 410 Q112 390 128 336 Q138 410 112 454 Q190 408 208 300Z" fill="url(#hair)" filter="url(#sh)"/>
<path d="M120 380 Q116 420 110 440 M146 340 Q150 380 140 410" stroke="#2c170c" stroke-width="3" fill="none" opacity=".5"/>
<!-- uzak bacaklar -->
<g filter="url(#sh)">
  <path d="M206 380 L246 380 L240 520 L214 520Z" fill="url(#coatd)"/>
  <ellipse cx="227" cy="526" rx="24" ry="12" fill="#3b2416"/>
  <path d="M446 380 L486 380 L478 520 L452 520Z" fill="url(#coatd)"/>
  <ellipse cx="465" cy="526" rx="24" ry="12" fill="#3b2416"/>
</g>
<!-- gövde -->
<g filter="url(#sh)">
  <ellipse cx="340" cy="330" rx="180" ry="104" fill="url(#coat)"/>
  <path d="M190 360 Q200 430 250 440 Q220 400 232 360Z" fill="#c4813f" opacity=".5"/>
</g>
<!-- yakın bacaklar -->
<g filter="url(#sh)">
  <path d="M250 392 L292 392 L284 524 L254 524Z" fill="url(#coat)"/>
  <path d="M250 392 L292 392 L290 420 L252 420Z" fill="#c4813f" opacity=".5"/>
  <ellipse cx="270" cy="530" rx="26" ry="13" fill="#3b2416"/>
  <path d="M402 392 L444 392 L438 524 L410 524Z" fill="url(#coat)"/>
  <ellipse cx="424" cy="530" rx="26" ry="13" fill="#3b2416"/>
  <path d="M258 500 h22 M413 500 h22" stroke="#f3e2c0" stroke-width="7" stroke-linecap="round"/>
</g>
<!-- boyun -->
<g filter="url(#sh)">
  <path d="M440 300 Q470 220 500 150 L600 214 Q560 262 520 346 Q480 340 440 300Z" fill="url(#coat)"/>
</g>
<!-- yele -->
<g filter="url(#sh)" fill="url(#hair)">
  <path d="M492 130 Q452 150 462 196 Q430 190 440 240 Q408 244 430 290 Q470 270 470 232 Q504 220 494 180Q520 166 514 132Z"/>
  <path d="M470 250 Q440 280 424 320 Q470 320 486 270Z"/>
</g>
<!-- örtü -->
<g filter="url(#sh)">
  <path d="M232 236 Q336 206 440 246 L450 330 Q336 366 222 330Z" fill="#fff6e0"/>
  <path d="M232 236 Q336 206 440 246 L444 272 Q336 236 228 264Z" fill="url(#motif)"/>
  <path d="M222 330 Q336 366 450 330 L452 306 Q336 342 220 306Z" fill="#c8402f"/>
  <path d="M232 236 Q336 206 440 246" stroke="url(#gold)" stroke-width="4" fill="none"/>
  <g fill="#c8402f"><circle cx="262" cy="338" r="7"/><circle cx="336" cy="352" r="7"/><circle cx="410" cy="340" r="7"/></g>
</g>
<!-- kafa -->
<g filter="url(#sh)">
  <path d="M520 118 L496 60 L560 98Z" fill="#b9713a"/>
  <path d="M524 112 L508 78 L548 104Z" fill="#f4b7a0"/>
  <ellipse cx="566" cy="196" rx="88" ry="70" transform="rotate(22 566 196)" fill="url(#coat)"/>
  <ellipse cx="632" cy="236" rx="52" ry="42" transform="rotate(22 632 236)" fill="#f3d3a8"/>
</g>
<path d="M556 130 Q590 170 626 210 Q634 222 622 224 Q582 196 546 150Z" fill="#fff" opacity=".95"/>
<ellipse cx="650" cy="246" rx="6" ry="9" fill="#7a4a2a"/>
<path d="M620 262 Q636 276 654 266" stroke="#7a3a2a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<ellipse cx="588" cy="196" rx="18" ry="22" fill="#fff"/>
<ellipse cx="591" cy="200" rx="14" ry="18" fill="#4a2c1a"/>
<circle cx="591" cy="203" r="9" fill="#1b0f08"/>
<circle cx="597" cy="193" r="6" fill="#fff"/><circle cx="586" cy="209" r="2.6" fill="#fff"/>
<path d="M568 190 Q590 166 612 190" stroke="#3a2418" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="574" cy="240" r="16" fill="#f08a78" opacity=".5"/>
<path d="M530 134 Q512 120 540 112 Q560 120 556 138Z" fill="url(#hair)"/>
<path d="M518 124 Q500 110 520 96" stroke="#3d2012" stroke-width="5" fill="none" stroke-linecap="round"/>
<circle cx="440" cy="300" r="9" fill="url(#gold)"/>
"""

# ---------------------------------------------------------------- yazma
def save(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(content)

# Dede ifadeleri (şeffaf arka plan) + sahneli ana görsel
for e in ("gulen", "saskin", "dusunceli"):
    save(f"dede_{e}.svg", wrap(dede(e, with_scene=False), "0 0 800 1000"))
save("dede_v3.svg", wrap(dede("gulen", with_scene=True), "0 0 800 1000"))

# Çocuklar ve tay
save("ayse.svg", wrap(ayse(), "0 0 500 800"))
save("kaan.svg", wrap(kaan(), "0 0 500 800"))
save("tay.svg", wrap(tay(), "0 0 720 600"))

# İfade sayfası: üç Dede yan yana
def nested(inner, x, y, w, h, vb):
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{vb}">{inner}</svg>'

expr_sheet = (
    '<rect width="2400" height="1200" fill="#fbf3df"/>'
    + nested(dede("gulen", False), 0, 100, 800, 1000, "0 0 800 1000")
    + nested(dede("saskin", False), 800, 100, 800, 1000, "0 0 800 1000")
    + nested(dede("dusunceli", False), 1600, 100, 800, 1000, "0 0 800 1000")
    + '<g font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="#7a4624" text-anchor="middle">'
      '<text x="400" y="80">Gülen</text><text x="1200" y="80">Şaşkın</text><text x="2000" y="80">Düşünceli</text></g>'
)
save("dede_ifadeler.svg", wrap(expr_sheet, "0 0 2400 1200"))

# Kadro sayfası
cast = (
    scene().replace('width="800" height="1000"', 'width="2400" height="1000"')
    + nested(dede("gulen", False), 40, 0, 800, 1000, "0 0 800 1000")
    + nested(ayse(), 820, 160, 500, 800, "0 0 500 800")
    + nested(kaan(), 1260, 160, 500, 800, "0 0 500 800")
    + nested(tay(), 1700, 340, 600, 500, "0 0 720 600")
)
cast_inner = cast.replace('<rect width="2400" height="1000" fill="url(#sky)"/>', '', 1)
cast_bg = '<rect width="2400" height="1000" fill="url(#sky)"/>'
cast_scene = ('<path d="M0 700 Q400 620 800 690 T1600 680 T2400 700 L2400 1000 L0 1000Z" fill="url(#hill2)"/>')
cast_final = (cast_bg + cast_scene
              + nested(dede("gulen", False), 40, 0, 800, 1000, "0 0 800 1000")
              + nested(ayse(), 820, 160, 500, 800, "0 0 500 800")
              + nested(kaan(), 1260, 160, 500, 800, "0 0 500 800")
              + nested(tay(), 1700, 340, 600, 500, "0 0 720 600"))
save("kadro.svg", wrap(cast_final, "0 0 2400 1000"))

# Animasyonlu Dede
ANIM_CSS = """
<style>
  #gozler > * { transform-box: fill-box; transform-origin: center; animation: blink 3s infinite; }
  @keyframes blink { 0%,90%,100% { transform: scaleY(1); } 94% { transform: scaleY(.08); } }
  #kafa { transform-origin: 400px 470px; animation: bob 3s ease-in-out infinite; }
  @keyframes bob { 0%,100% { transform: rotate(-1.6deg); } 50% { transform: rotate(1.6deg); } }
  #sagel { animation: strum .6s ease-in-out infinite; }
  @keyframes strum { 0%,100% { transform: translate(0,-12px); } 50% { transform: translate(6px,14px); } }
  #kopuz { transform-origin: 330px 770px; animation: shake .6s ease-in-out infinite; }
  @keyframes shake { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(.9deg); } }
  #teller { animation: vib .15s linear infinite; }
  @keyframes vib { 0%,100% { transform: translateX(0); } 50% { transform: translateX(1.4px); } }
</style>
"""
save("dede_animasyon.svg", wrap(dede("gulen", with_scene=True, animate=True), "0 0 800 1000", extra_style=ANIM_CSS))
print("tamam:", sorted(os.listdir(OUT)))
