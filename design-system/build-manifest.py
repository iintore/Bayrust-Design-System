# Inventories every shipped visual asset in the frontend bundle for the design-system site.
import os, re, json, glob
fe = 'reference/frontend'
sprite = glob.glob(f'{fe}/icons-*.svg')[0]
s = open(sprite).read()
symbols = [{'id': m.group(1), 'viewBox': m.group(2)} for m in re.finditer(r'<symbol id="([^"]+)" viewBox="([^"]+)"', s)]
def family(name):
    base = re.sub(r'-[A-Za-z0-9_-]{8}\.(png|svg|jpg|webp|mp4|woff2|aif)$', '', name)
    for prefix, fam in [('window-manager-', 'Window Management'), ('command-', 'Command icons'), ('extension-', 'Extension icons'),
                        ('empty-state', 'Empty states'), ('meeting-', 'Meeting providers'), ('ai-', 'AI'), ('welcome', 'Onboarding'),
                        ('pro-', 'Pro'), ('theme', 'Themes'), ('wallpaper', 'Themes')]:
        if base.startswith(prefix): return fam, base
    if re.search(r'(day|night|cloud|rain|snow|sleet|thunder|fog|haze|wind|sun|moon|star|clear|drizzle|hail|tornado|hurricane|dust|smoke|mist|overcast)', base): return 'Weather', base
    return 'Other', base
assets = []
for f in sorted(os.listdir(fe)):
    ext = f.rsplit('.', 1)[-1]
    if ext not in ('png', 'svg', 'jpg', 'webp', 'mp4', 'woff2') or f.startswith('icons-'): continue
    fam, base = family(f)
    assets.append({'file': f, 'name': base, 'family': fam if ext not in ('mp4', 'woff2') else ('Video' if ext == 'mp4' else 'Fonts'), 'type': ext, 'bytes': os.path.getsize(f'{fe}/{f}')})
audio = [{'file': 'audio/dictation/' + f, 'name': f} for f in sorted(os.listdir('reference/audio/dictation'))]
json.dump({'source': '/Applications/Raycast.app 2.8.2 — Contents/Resources/macos-app_RaycastDesktopApp.bundle/Contents/Resources/frontend',
           'sprite': os.path.basename(sprite), 'symbols': symbols, 'assets': assets, 'audio': audio},
          open('design-system/site/manifest.json', 'w'), indent=1)
from collections import Counter
print(len(symbols), 'sprite symbols;', Counter(a['family'] for a in assets))
