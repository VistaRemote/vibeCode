# Changelog

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号与 **各子仓库 tag** 及 Meta 里程碑对齐。

**用户可见**变更需同步 `docs/` 文档站（见 [spec/docs-spec.md](./spec/docs-spec.md)）。

---

## [Unreleased]

### Added

- Meta-Repo：路线图 `ROADMAP.md`、迭代计划 `plan/implementation-plan.md`、ADR、插件架构 Spec
- 工程：`prompts/` 目录与 AI Code Review 门禁规范
- 协作：`release-planning-spec`、`team-collaboration-spec`、`quality-gates-spec`

### Changed

- 加强工程规范：Zustand（禁 Redux）、BEM 命名、后端分层与 UUIDv7

---

## [M0] - 2026-05-24

### Added

- Spec 体系（SDD、implementation-status、architecture-foundation）
- 各子仓初版：shared、server、web、desktop、mobile、ai、docs、deploy
- Meta-Repo：init/dev 脚本、Biome 分层、Conventional Commits、`.gitignore` 模板
- 领域骨架：配对、计费权益、信令、录制 Spec、Agent 分发 Spec

---

## 子仓库变更

各子仓库可在自身根目录维护 `CHANGELOG.md`（推荐）。Meta 本文件记录 **跨仓里程碑** 与对外发布说明。

| 仓库 | 说明 |
| :--- | :--- |
| shared | 契约变更必须写 changelog + SemVer tag |
| server / web / … | 按服务发版记录 |
