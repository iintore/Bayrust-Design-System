#!/bin/sh
# One-time setup after cloning: the tools (git submodules), the Node runtime Raycast's backend runs on, and the
# harness and docs dependencies. Safe to run again.
set -e
cd "$(dirname "$0")/.."

echo "› tools (submodules)"
git submodule update --init --recursive

# The sandboxed backend runs on the Node release Raycast 2.8.2 bundles (official build, not kept in git)
NODE=v22.23.3
DIR="harness/runtime/node-$NODE-darwin-arm64"
if [ ! -x "$DIR/bin/node" ]; then
  echo "› Node $NODE for the backend"
  mkdir -p harness/runtime
  curl -fsSL "https://nodejs.org/dist/$NODE/node-$NODE-darwin-arm64.tar.gz" | tar -xz -C harness/runtime "node-$NODE-darwin-arm64/bin/node"
fi

echo "› Python environment for the image scripts"
[ -x harness/.venv/bin/python ] || python3 -m venv harness/.venv
harness/.venv/bin/pip install -q Pillow

echo "› harness dependencies"
npm --prefix harness ci --no-audit --no-fund
echo "› docs dependencies"
npm --prefix design-system/docs ci --no-audit --no-fund

echo "Done. Run 'npm run harness' and, in another terminal, 'npm run docs' (http://localhost:5174)."
