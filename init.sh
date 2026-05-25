#!/bin/bash
# init.sh - Clone all VistaRemote subprojects

echo "ðŸš€ Starting to clone VistaRemote subprojects..."

# Clone server project
if [ ! -d "server" ]; then
  git clone git@github.com:VistaRemote/server.git
else
  echo "âœ?server already exists, skipping clone"
fi

# Clone desktop project
if [ ! -d "desktop" ]; then
  git clone git@github.com:VistaRemote/desktop.git
else
  echo "âœ?desktop already exists, skipping clone"
fi

# Clone mobile project
if [ ! -d "mobile" ]; then
  git clone git@github.com:VistaRemote/mobile.git
else
  echo "âœ?mobile already exists, skipping clone"
fi

# Clone web project
if [ ! -d "web" ]; then
  git clone git@github.com:VistaRemote/web.git
else
  echo "âœ?web already exists, skipping clone"
fi

# Clone docs project
if [ ! -d "docs" ]; then
  git clone git@github.com:VistaRemote/docs.git
else
  echo "âœ?docs already exists, skipping clone"
fi

# Clone shared project
if [ ! -d "shared" ]; then
  git clone git@github.com:VistaRemote/shared.git
else
  echo "âœ?shared already exists, skipping clone"
fi

# Clone deploy project
if [ ! -d "deploy" ]; then
  git clone git@github.com:VistaRemote/deploy.git
else
  echo "âœ?deploy already exists, skipping clone"
fi

# Clone ai worker project
if [ ! -d "ai" ]; then
  git clone git@github.com:VistaRemote/ai.git
else
  echo "âœ?ai already exists, skipping clone"
fi

echo "ðŸŽ‰ All projects initialized successfully!"
echo ""
echo "ðŸ“Œ Node.js >= 24.11 (see .nvmrc). Run: nvm use"
echo "ðŸ“Œ One-shot local dev:  ./dev.sh   (or  .\\dev.ps1  on Windows)"
echo "ðŸ“Œ Switch API env:      pnpm env:local | env:dev | env:sit | env:uat"
echo "ðŸ“Œ IDE sync:            node tooling/scripts/setup-ide-config.mjs"
echo "ðŸ“Œ Subrepo docs:        pnpm setup:subrepo-docs"
echo "ðŸ“Œ Single-repo only?    cd desktop|mobile && node scripts/setup-dev.mjs"