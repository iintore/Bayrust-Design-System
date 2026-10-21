# Builds site/flows.json from research/captures: per state, the best image (native WebKit composite >
# native WebKit > Chromium), any native child panels, and the live harness URL.
import json, os, glob
FLOWS = [
  ('onboarding', 'Onboarding', [('Standard (new user)', 'standard-'), ('Simplified (signed-in trial)', 'simplified-'), ('Classic user migration', 'classic-')]),
  ('launcher', 'Launcher', [('Root search & commands', '')]),
  ('ai-chat', 'AI Chat', [('Chat window', '')]),
  ('pro-walkthrough', 'Pro Walkthrough', [('Walkthrough', '')]),
  ('settings', 'Settings', [('Settings pages', '')]),
  ('notes', 'Notes', [('Notes window', '')]),
  ('theme-studio', 'Theme Studio', [('Theme Studio', '')]),
  ('feedback', 'Feedback', [('Send Feedback', '')]),
]
out = []
for fid, label, groups in FLOWS:
    d = f'research/captures/{fid}'
    if not os.path.exists(f'{d}/index.json'): continue
    states = json.load(open(f'{d}/index.json'))
    for s in states:
        wk = f'{d}/webkit/{s["id"]}'
        s['image'] = next((p for p in [wk + '--composite.png', wk + '.png', f'{d}/{s["id"]}.png'] if os.path.exists(p)), None)
        s['engine'] = 'webkit' if s['image'] and '/webkit/' in s['image'] else 'chromium'
        s['panels'] = sorted(os.path.basename(p) for p in glob.glob(wk + '--*.png') if 'composite' not in p)
        s['url'] = s['url'].replace('http://localhost:4317', '')
    out.append({'id': fid, 'label': label, 'groups': [{'label': g, 'prefix': p, 'states': [s for s in states if s['id'].startswith(p)]} for g, p in groups]})
json.dump(out, open('design-system/site/flows.json', 'w'), indent=1)
print([(f['label'], sum(len(g['states']) for g in f['groups'])) for f in out])
