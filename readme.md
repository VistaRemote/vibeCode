# VibeCode | VistaRemote 🚀

[English](./README.md) | [简体中文](./README.zh-CN.md)

> A cross-platform, real-time remote desktop control system.

Built with passion in China, designed for the global open-source community.

VistaRemote is a VibeCode core project: **WebRTC** real-time remote desktop (vs. legacy DVR-style monitoring), **self-hostable AI** for recording and insights, and a **TypeScript + MySQL** stack for easier hiring, customization, and Docker deployment.

**Why VistaRemote:** TypeScript-first, Spec-driven, **easy to customize** — best for teams that do **not** need billion-scale concurrency. [Positioning](https://github.com/VistaRemote/vista-remote/blob/main/docs/docs/en/architecture/positioning.mdx) · [Desktop performance](https://github.com/VistaRemote/vista-remote/blob/main/docs/docs/en/architecture/desktop-performance.mdx)

To ensure build stability across diverse environments (Node.js, React Native, Electron), this project adopts a **Multi-repo** architecture. This repository serves as the **Meta-Repo**, designed to help developers quickly initialize their environments, orchestrate the subprojects, and manage cross-repository local debugging.

---

## 🏗 Architecture & Subprojects

The VistaRemote ecosystem consists of 6 independent repositories:

| Module | Repository | Tech Stack | Description |
| :--- | :--- | :--- | :--- |
| **Server** | `server` | NestJS, TypeORM, **MySQL** | Signaling, admin APIs, plans, recording metadata, audit. |
| **AI** | `ai` | NestJS, BullMQ, LLM | Summaries, anomaly detection, efficiency reports. |
| **Desktop Agent** | `desktop` | Electron, Rsbuild, Ant Design | Controlled agent; renderer uses antd + Sass. |
| **Mobile Client** | `mobile` | React Native, antd-mobile | Mobile controller (Metro bundler). |
| **Web** | `web` | Rsbuild, Ant Design, Sass | **Client** (`apps/client`) + **Admin** (`apps/admin`). |
| **Shared Protocol** | `shared` | TypeScript | Core type definitions (Interfaces), WebRTC SDP structures, and remote command payload specs. |
| **Documentation** | `docs` | Rspress, MDX | System architecture design, API references, and deployment guides, built with Rspress for a unified and blazing-fast Rspack ecosystem. |

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure your local development environment has the following installed:
- **Git**
- **Node.js** (>= 18.x)
- **pnpm** or **Bun** (Recommended package managers)

### 2. One-Click Initialization

Clone this meta-repo and run the initialization script to automatically pull all subprojects:

```bash
# Grant execution permission
chmod +x init.sh

# Run the clone script
./init.sh
```

## 🔀 Git Workflow (Important!)

VistaRemote uses a flat Meta-Repo structure. **DO NOT use `git submodule` or `git subtree`.**
Each subproject (`server`, `desktop`, `shared`, etc.) has its own independent `.git` directory.

- **Commit Principle**: You must commit and push changes within the specific sub-directory.
- **IDE Setup**: We strongly recommend using **Cursor / VS Code Multi-Root Workspaces** (via `.code-workspace`) or **IntelliJ Directory Mappings** to manage all Git repositories simultaneously in a unified UI.
- For Git, IDE, and CI/CD releases, see the docs site (`cd docs && pnpm dev`) → **Engineering → CI/CD & Releases**, plus [Git Collaboration Spec](./spec/git-collaboration-spec.md) and [CI/CD Release Spec](./spec/cicd-release-spec.md).

---

## 📋 Specifications & Whitepaper

This project follows **Spec-Driven Development (SDD)**:

| Document | Description |
| :--- | :--- |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | **Developer entry** — commands, Spec order |
| [Spec Index](./spec/README.md) | SDD workflow and per-module specs |
| [SDD Spec](./spec/spec-driven-development-spec.md) | How to add FR-xxx and PR obligations |
| [Implementation status](./spec/implementation-status.md) | What is ready vs stub (read before coding) |
| [System Overview Spec](./spec/system-overview.md) | WebRTC P2P/SFU, signaling, security, milestones |
| [Documentation site](./docs/) | Rspress — run `cd docs && pnpm dev` → Developer handbook & User guide |
| [Whitepaper](docs/README.md) | `/whitepaper/` on the doc site |
| [Architecture](docs/README.md) | `/architecture/overview` on the doc site |

## License

- **Personal, non-commercial use**: free under [LICENSE](./LICENSE).
- **Commercial use**: requires a [commercial license](./COMMERCIAL-LICENSE.md) (all commercial use is paid).
- **Trial**: 14-day trial includes **WebRTC SFU** and **AI cloud fallback**; after trial, Pro/Enterprise required — see `spec/commercial-tier-spec.md`.
- **Model fine-tuning**: closed-source, separate private repo — see `spec/ai-finetune-spec.md`.
