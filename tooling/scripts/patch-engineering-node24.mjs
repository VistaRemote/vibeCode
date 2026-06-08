import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const contrib = path.join(root, 'CONTRIBUTING.md');
let c = fs.readFileSync(contrib, 'utf8');
c = c.replace(
  /- \*\*Node\.js\*\* ≥ 22[^\n]+\n/,
  '- **Node.js** ≥ 24（推荐 `.nvmrc` 中的 **24.11 LTS**，与 Rspack/Rstest 及生产环境一致；见 [ADR-0005](./adr/0005-node-24-lts.md)）\n',
);
fs.writeFileSync(contrib, c, 'utf8');

const eng = path.join(root, 'spec/engineering-standards-spec.md');
let e = fs.readFileSync(eng, 'utf8');
if (!e.includes('FR-ENG-SUBREPO')) {
  e = e.replace(
    '## 11. RFC / Changelog',
    `## 11. 子仓库脚手架（FR-ENG-SUBREPO）

| ID | 规则 |
| :--- | :--- |
| FR-ENG-SUBREPO-01 | 各子仓根目录满足 [subrepo-scaffold-spec.md](./subrepo-scaffold-spec.md) FR-SUB-01～09 |
| FR-ENG-SUBREPO-02 | 新建子仓或 \`init\` 后运行 \`node tooling/scripts/sync-subrepo-scaffold.mjs\` |
| FR-ENG-SUBREPO-03 | \`README.md\` 须可独立阅读（含 LICENSE 与快速开始） |

---

## 12. RFC / Changelog`,
  );
  e = e.replace(
    '| 2026-05-24 | 1.1.0 | Zustand',
    '| 2026-05-24 | 1.3.0 | Node.js 24 LTS（ADR-0005）\n| 2026-05-24 | 1.2.0 | 子仓脚手架完备性\n| 2026-05-24 | 1.1.0 | Zustand',
  );
  fs.writeFileSync(eng, e, 'utf8');
}

console.log('patched');
