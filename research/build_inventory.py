# Maps every component displayName in the shipped frontend to its module and export alias.
import re, glob, json, os
root = 'reference/frontend'
inv = []
for f in sorted(glob.glob(f'{root}/*.js')):
    s = open(f).read()
    exports = {}
    for m in re.finditer(r'export\{([^}]*)\}', s):
        for part in m.group(1).split(','):
            part = part.strip()
            if ' as ' in part: local, alias = part.split(' as '); exports[local.strip()] = alias.strip()
            elif part: exports[part] = part
    for m in re.finditer(r'([A-Za-z_$][\w$]*)\.displayName=`([A-Za-z0-9_.]+)`', s):
        local, name = m.group(1), m.group(2)
        inv.append({'name': name, 'module': os.path.basename(f), 'local': local, 'export': exports.get(local)})
by = {}
for e in inv: by.setdefault(e['name'], []).append(e)
json.dump(by, open('research/component-inventory.json', 'w'), indent=1, sort_keys=True)
exported = sum(1 for v in by.values() if any(x['export'] for x in v))
print(len(by), 'components;', exported, 'exported from their module')
