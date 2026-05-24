#!/bin/bash
# init.sh - Clone all VistaRemote subprojects

echo "🚀 Starting to clone VistaRemote subprojects..."

# Clone server project
if [ ! -d "server" ]; then
  git clone git@github.com:VistaRemote/server.git
else
  echo "✅ server already exists, skipping clone"
fi

# Clone desktop project
if [ ! -d "desktop" ]; then
  git clone git@github.com:VistaRemote/desktop.git
else
  echo "✅ desktop already exists, skipping clone"
fi

# Clone mobile project
if [ ! -d "mobile" ]; then
  git clone git@github.com:VistaRemote/mobile.git
else
  echo "✅ mobile already exists, skipping clone"
fi

# Clone web project
if [ ! -d "web" ]; then
  git clone git@github.com:VistaRemote/web.git
else
  echo "✅ web already exists, skipping clone"
fi

# Clone docs project
if [ ! -d "docs" ]; then
  git clone git@github.com:VistaRemote/docs.git
else
  echo "✅ docs already exists, skipping clone"
fi

# Clone shared project
if [ ! -d "shared" ]; then
  git clone git@github.com:VistaRemote/shared.git
else
  echo "✅ shared already exists, skipping clone"
fi

# Clone deploy project
if [ ! -d "deploy" ]; then
  git clone git@github.com:VistaRemote/deploy.git
else
  echo "✅ deploy already exists, skipping clone"
fi

# Clone ai worker project
if [ ! -d "ai" ]; then
  git clone git@github.com:VistaRemote/ai.git
else
  echo "✅ ai already exists, skipping clone"
fi

echo "🎉 All projects initialized successfully!"
echo ""
echo "📌 Node.js >= 22.12 (see .nvmrc). Run: nvm use"
echo "📌 One-shot local dev:  ./dev.sh   (or  .\\dev.ps1  on Windows)"
echo "📌 Switch API env:      pnpm env:local | env:dev | env:sit | env:uat"
echo "📌 IDE sync:            node tooling/scripts/setup-ide-config.mjs"
echo "📌 Single-repo only?    cd desktop|mobile && node scripts/setup-dev.mjs"