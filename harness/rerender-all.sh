#!/bin/zsh
# Re-renders every flow (Chromium DOM/token capture + native WebKit images), then tokens and the flow index.
cd "$(dirname "$0")/.."
for f in onboarding launcher ai-chat pro-walkthrough settings notes theme-studio feedback; do
  node harness/capture.mjs harness/states/$f.json > /dev/null 2>&1 && node harness/capture-native.mjs harness/states/$f.json > /dev/null 2>&1
  echo "$(date +%T) $f done"
done
rm -f research/captures/settings/webkit/00-account.png   # Account needs trusted input; keep its Chromium capture
(cd harness && node organisms.mjs > /dev/null 2>&1) && echo "$(date +%T) organisms done"
(cd harness && node extract-tokens.mjs > /dev/null 2>&1) && echo "$(date +%T) tokens done"
python3 design-system/build-flows.py && echo "$(date +%T) ALL DONE"
