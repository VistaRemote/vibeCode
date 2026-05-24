# 大模型微调（闭源）Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-AI-FT-001` |
| **版本** | 1.0.0 |
| **可见性** | **闭源**（独立仓库，不纳入公开 Meta-Repo 克隆列表） |
| **关联** | [ai-platform-spec.md](./ai-platform-spec.md) · [licensing-spec.md](./licensing-spec.md) |

---

## 1. 结论：是否独立项目？

**是。** 微调 toolchain 与公开 `ai` 推理服务 **必须分离**：

| 公开 `ai` | 私有 `ai-finetune`（建议仓库名） |
| :--- | :--- |
| 运行时推理、队列、RAG、回调 server | 数据准备、训练、评估、导出 |
| 开源 LICENSE（个人非盈利免费） | 商业许可 / 闭源 |
| 不含客户数据与权重文件 | 含组织专属语料与 LoRA 适配器 |

---

## 2. 私有仓职责

```text
ai-finetune/                    # 私有 Git，仅授权人员
├── datasets/                   # .gitignore 默认忽略真实数据
│   └── schema/                 # 可提交的 JSON Schema
├── train/
│   ├── lora_qwen.py            # 示例：QLoRA
│   └── eval_harness.py
├── export/
│   └── bundle_packager.py      # 生成加密 model bundle
├── deploy/
│   └── Dockerfile.train        # GPU 训练镜像（非运行时）
└── README.md                   # 导入 ai 运行时说明
```

---

## 3. 与公开 `ai` 的集成

| 步骤 | 说明 |
| :--- | :--- |
| 1. 训练 | 在 `ai-finetune` 用客户脱敏语料产出 `bundle-v1.tar.enc` |
| 2. 交付 | 客户将 bundle 挂载到私有化 `ai`：`MODEL_BUNDLE_PATH=/data/bundles/v1` |
| 3. 推理 | 公开 `ai` 的 `LlmClient` / LangGraph 读取 bundle 元数据（`adapter_config.json`） |
| 4. 版本 | `GET /internal/models/active` 返回当前 bundle 版本（server 鉴权） |

**禁止**：在 CI 公开仓库拉取私有 bundle；**禁止** 将 bundle 提交到 Git。

---

## 4. 技术栈（训练侧）

| 组件 | 选型 |
| :--- | :--- |
| 语言 | **Python**（PyTorch、PEFT、TRL） |
| 基座 | 客户自托管权重（Qwen / Llama 等，遵守上游许可） |
| 编排 | 可选 MLflow / 简单 Makefile |
| GPU | 训练机独立；与 Ollama 推理机可分离 |

Node/TS **不参与** 训练循环，仅消费导出产物。

---

## 5. 功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-FT-01 | 导出 bundle 含 manifest（版本、基座 hash、适配器类型） | `ai` 可校验 |
| FR-FT-02 | 训练环境与客户生产网络隔离 | 文档化 |
| FR-FT-03 | 删除客户合同后销毁语料与 bundle 副本 | 合规流程 |

---

## 6. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 独立闭源微调仓；与公开 ai 推理解耦 |
