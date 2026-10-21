# Usage: python contact_sheet.py <captures-dir> [cols]
import glob, os, sys
from PIL import Image, ImageDraw
d = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 3
fs = sorted(f for f in glob.glob(d + '/*.png') if not os.path.basename(f).startswith('_'))
w = 520
ims = [Image.open(f).convert('RGB') for f in fs]
h = max(int(im.height * w / im.width) for im in ims)
rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, (h + 22) * rows), 'white')
for i, (f, im) in enumerate(zip(fs, ims)):
    im = im.resize((w, int(im.height * w / im.width)))
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    sheet.paste(im, (x, y + 22)); ImageDraw.Draw(sheet).text((x + 6, y + 5), os.path.basename(f), fill='black')
sheet.save(os.path.join(d, '_contact-sheet.png')); print(sheet.size)
