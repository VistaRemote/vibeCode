# 开源与商业授权 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-LICENSE-001` |
| **版本** | 1.0.0 |
| **法律文本** | Meta-Repo 根目录 [LICENSE](../LICENSE) |
| **关联** | [commercial-tier-spec.md](./commercial-tier-spec.md) |

---

## 1. 授权模型（双轨）

| 使用场景 | 是否收费 | 授权来源 |
| :--- | :--- | :--- |
| **个人、非盈利**（学习、自用、不参与营利活动） | **免费** | 遵守 [LICENSE](../LICENSE) 开源条款即可 |
| **任何商业使用** | **一律收费** | 须签署 **商业许可协议**（联系版权方） |

**商业使用**包括但不限于：公司内部部署服务员工、对外提供远程协助/SaaS、集成进商业产品、托管运营收费、为第三方提供运维而获利等。  
**个人非盈利**与「是否注册公司」无关，以**是否构成营利性使用**为准；有疑问时按商业使用处理并申请许可。

---

## 2. 开源范围（各子仓库）

| 仓库 | 许可证 | 说明 |
| :--- | :--- | :--- |
| `shared` `server` `web` `desktop` `mobile` `docs` `deploy` `ai`（推理编排） | **LICENSE**（见根目录） | 可阅读、修改、再分发（非商业） |
| **`ai-finetune`（建议独立私有仓）** | **闭源 / 商业许可** | 微调脚本、训练数据管线、专有 LoRA/权重配方 **不** 进入公开仓库 |
| 预训练 **基础权重**（如 Llama） | 遵循上游模型许可证 | 与本项目 LICENSE 正交 |

---

## 3. 大模型微调是否独立项目？

**建议：是，单独闭源仓库（或商业插件包）。**

| 维度 | 公开 `ai` 仓库 | 独立 `ai-finetune`（私有） |
| :--- | :--- | :--- |
| 内容 | BullMQ、LangChain 推理、RAG、调 python-worker | 数据集清洗、LoRA/QLoRA 训练、评估、导出 `model bundle` |
| 许可证 | 开源 LICENSE（非商业免费） | 闭源，仅授权客户 |
| 交付 | Docker 镜像可构建 | 合同交付 **加密 model bundle** + 导入工具 |
| 耦合 | 通过 `MODEL_BUNDLE_PATH` / 版本 API 加载 | 不污染主仓库 Git 历史 |

公开仓 **禁止** 提交：客户语料、微调后权重、训练 notebook 含 PII。  
详见 [ai-finetune-spec.md](./ai-finetune-spec.md)。

---

## 4. 与 SaaS 套餐的关系

- **开源 LICENSE** 解决「能否部署、修改代码」。
- **[commercial-tier-spec](./commercial-tier-spec.md)** 解决「线上功能与试用（SFU、降云等）」。
- 二者独立：**自托管商业客户** 仍须商业 LICENSE；**SaaS 订阅** 另按套餐计费。

---

## 5. 功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-LIC-01 | 各子仓库根目录或 README 指向 Meta-Repo LICENSE | |
| FR-LIC-02 | 安装/启动日志打印授权摘要（非商业 / 商业须授权） | P2 |
| FR-LIC-03 | Admin 可登记客户「商业许可编号」与到期日 | Enterprise 运维 P2 |

---

## 6. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 个人非盈利免费；商业一律收费；微调独立闭源仓建议 |
