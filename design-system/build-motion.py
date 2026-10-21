# Inventories motion in the shipped frontend: CSS @keyframes, transition/animation declarations, and
# Framer Motion transition objects in JS — each with the file it came from.
import re, glob, json, os
from collections import Counter, defaultdict
fe = 'reference/frontend'
keyframes, transitions, animations = [], Counter(), Counter()
easings, durations = Counter(), Counter()
for f in sorted(glob.glob(f'{fe}/*.css')):
    s = open(f).read(); base = os.path.basename(f)
    for m in re.finditer(r'@keyframes ([\w-]+)\{((?:[^{}]*\{[^{}]*\})*)\}', s):
        keyframes.append({'name': m.group(1), 'file': base, 'css': f'@keyframes {m.group(1)}{{{m.group(2)}}}'})
    for m in re.finditer(r'(?<![-\w])transition:([^;}]+)', s): transitions[m.group(1).strip()] += 1
    for m in re.finditer(r'(?<![-\w])animation:([^;}]+)', s): animations[m.group(1).strip()] += 1
    for m in re.finditer(r'cubic-bezier\([^)]*\)|\b(?:ease-in-out|ease-out|ease-in|linear|ease)\b', s): easings[m.group(0)] += 1
    for m in re.finditer(r'(?<![\w.-])(\d*\.?\d+)(ms|s)\b', s):
        v = float(m.group(1)) * (1 if m.group(2) == 'ms' else 1000); durations[f'{v:g}ms'] += 1
motion = []
for f in sorted(glob.glob(f'{fe}/*.js')):
    s = open(f).read(); base = os.path.basename(f)
    for m in re.finditer(r'transition:\{((?:type:`spring`|duration:|ease:|stiffness:|damping:|mass:|bounce:|delay:)[^{}]{0,200})\}', s):
        motion.append({'file': base, 'transition': '{' + m.group(1) + '}'})
mc = Counter(x['transition'] for x in motion)
out = {
  'keyframes': keyframes,
  'cssTransitions': transitions.most_common(), 'cssAnimations': animations.most_common(),
  'easings': easings.most_common(), 'durations': durations.most_common(40),
  'framerMotionTransitions': [{'transition': k, 'count': v, 'files': sorted({x['file'] for x in motion if x['transition'] == k})[:6]} for k, v in mc.most_common()],
}
json.dump(out, open('design-system/site/motion.json', 'w'), indent=1)
print(len(keyframes), 'keyframes;', len(transitions), 'distinct CSS transitions;', len(animations), 'CSS animations;', len(mc), 'Framer Motion transition configs')
print('top easings', easings.most_common(6)); print('top durations', durations.most_common(10))
print('top FM', mc.most_common(5))
