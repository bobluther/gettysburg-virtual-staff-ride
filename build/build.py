#!/usr/bin/env python3
"""Assemble the single self-contained HTML file."""
import json, base64, os, re, sys, time
BUILD = str(int(time.time()))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build")
OUT = os.path.join(ROOT, "Gettysburg-Staff-Ride-Simulator.html")

manifest = json.load(open(os.path.join(ROOT, "research", "images.json")))

assets, meta = {}, {}
missing = []
for r in manifest:
    k = r["key"]
    jpg = os.path.join(ROOT, "assets-src", k + ".jpg")
    png = os.path.join(ROOT, "assets-src", k + ".png")
    if os.path.exists(jpg):
        p, mime = jpg, "image/jpeg"
    elif os.path.exists(png):
        p, mime = png, "image/png"
    else:
        missing.append(k); continue
    b64 = base64.b64encode(open(p, "rb").read()).decode("ascii")
    assets[k] = "data:%s;base64,%s" % (mime, b64)
    meta[k] = {"title": r["title"], "license": r["license"], "caption": r["title"]}

if missing:
    print("WARNING missing optimized images:", missing)

assets_js = ("window.__BUILD=" + json.dumps(BUILD) + ";\n"
             "window.GBASSETS=" + json.dumps(assets) + ";\n"
             "window.__IMGMETA=" + json.dumps(meta) + ";")

template = open(os.path.join(B, "app.template.html"), encoding="utf-8").read()
content  = open(os.path.join(B, "content.js"), encoding="utf-8").read()
# optional CMH data modules (decisions, briefing book, maps manifest) — appended to content
for _extra in ("decisions_cmh.js", "briefingbook.js", "cmhmaps.js",
               "battle_day1.js", "battle_day2.js", "battle_day3.js",
               "unitinfo_union.js", "unitinfo_conf.js", "unitstate.js", "monuments.js"):
    _p = os.path.join(B, _extra)
    if os.path.exists(_p):
        content += "\n;/* " + _extra + " */\n" + open(_p, encoding="utf-8").read()
        print("included:", _extra)
engine   = open(os.path.join(B, "engine.js"), encoding="utf-8").read()
three    = open(os.path.join(B, "three.min.js"), encoding="utf-8").read()
geodem   = open(os.path.join(B, "geodem.js"), encoding="utf-8").read()
guide    = open(os.path.join(B, "guide.js"), encoding="utf-8").read()
engine3d = open(os.path.join(B, "engine3d.js"), encoding="utf-8").read()

def put(tpl, marker, payload):
    if marker not in tpl:
        print("ERROR: marker not found:", marker); sys.exit(1)
    return tpl.replace(marker, payload, 1)

html = put(template, "/*__ASSETS__*/", assets_js)
html = put(html, "/*__THREE__*/", three)
html = put(html, "/*__CONTENT__*/", content)
html = put(html, "/*__GEODEM__*/", geodem)
html = put(html, "/*__GUIDE__*/", guide)
html = put(html, "/*__ENGINE__*/", engine)
html = put(html, "/*__ENGINE3D__*/", engine3d)

open(OUT, "w", encoding="utf-8").write(html)

# sanity: no external asset references (http(s) outside of namespace/comments)
ext = re.findall(r'(?:src|href)\s*=\s*["\']https?://', html)
print("Embedded images :", len(assets))
print("External asset refs (src/href http):", len(ext))
print("BUILD           :", BUILD)
print("Output file     :", OUT)
print("Output size     : %.1f MB" % (os.path.getsize(OUT)/1048576))
