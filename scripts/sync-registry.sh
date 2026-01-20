#!/bin/bash

# Sync registry files from registry/ to apps/web/public/r/
# This script should be run after `pnpm build:registry`

set -e

echo "📦 Syncing registry files..."

# Copy JSON files
cp -v registry/*.json apps/web/public/r/

# Copy skills directory
rm -rf apps/web/public/r/skills
cp -rv registry/skills apps/web/public/r/

echo "✅ Registry files synced successfully!"
echo ""
echo "📝 Don't forget to:"
echo "  1. git add apps/web/public/r/"
echo "  2. git commit -m 'chore(web): update registry files'"
echo "  3. Deploy the website to make updates available"
