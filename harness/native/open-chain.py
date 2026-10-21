# Opens Raycast windows one at a time via deeplinks; each waits for its new window (the user approves
# Raycast's "Request to run" prompt) before the next. Usage: python3 open-chain.py
import json, subprocess, time, os
HERE = os.path.dirname(os.path.abspath(__file__))
def wins(): return [json.loads(l) for l in subprocess.run([f'{HERE}/rcwins'], capture_output=True, text=True).stdout.splitlines()]
# Deeplink = raycast://extensions/raycast/<slug(extension title)>/<slug(command title)> (frontend deeplink-*.js).
import sys
ALL = {
  'Settings': ['raycast://extensions/raycast/raycast/settings'],
  'Theme Studio': ['raycast://extensions/raycast/raycast/show-theme-studio'],
  'Send Feedback': ['raycast://extensions/raycast/raycast/send-feedback'],
  'Raycast Notes': ['raycast://extensions/raycast/raycast-notes/raycast-notes'],
}
STEPS = [(n, ALL[n]) for n in (sys.argv[1:] or ALL)]
for name, urls in STEPS:
  done = False
  for url in urls:
    before = {w['n'] for w in wins()}
    subprocess.run(['open', url])
    print(f'{name}: opened {url} — waiting for its window', flush=True)
    t0, prompted = time.time(), False
    while time.time() - t0 < 600:
      ws = wins()
      if any(w['t'] == 'Main Window' and w['on'] for w in ws): prompted = True
      new = [w for w in ws if w['n'] not in before and w['w'] >= 300 and w['h'] >= 200 and w['t'] not in ('Main Window',)]
      if new:
        print(f'{name}: window {new[0]["t"]!r} {int(new[0]["w"])}x{int(new[0]["h"])}', flush=True); done = True; break
      if not prompted and time.time() - t0 > 20: break  # no prompt within 20s: link didn't resolve
      time.sleep(0.5)
    if done: break
  if not done: print(f'{name}: no window appeared', flush=True)
  time.sleep(2)
print('CHAIN DONE', flush=True)
