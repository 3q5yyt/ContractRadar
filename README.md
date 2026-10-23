# 合同雷达（ContractRadar）

面向毕业租房场景的鸿蒙合同风险审查 Demo。  
当前版本使用内置样例合同和 mock 分析结果，目标是在 DevEco Studio 模拟器上完成 5–7 分钟演示。

## 已实现功能

1. **合同导入**：内置《房屋租赁合同（示例）》；本地导入按钮目前为演示提示。
2. **合同分析**：16 条条款、9 个风险点、综合风险分、风险分布图。
3. **条款解释**：点击任意条款查看大白话解释；风险条款进入详情。
4. **生成建议修订版**：逐条接受/忽略修改建议，可一键全部接受。
5. **合同对比**：原文 vs 建议修订版，红绿 diff，风险分前后对比。
6. **谈判助手**：每个风险点提供温和/坚定两套话术，支持复制。
7. **导出报告**：生成文本版风险报告，支持复制。
8. **历史记录**：本地保存分析记录，可查看、清空。

## 目录结构

```text
ContractRadar/
├── AppScope/                         应用级配置
├── entry/src/main/
│   ├── ets/
│   │   ├── common/Theme.ets          颜色、风险等级、评分色
│   │   ├── config/AiConfig.ets       AI API 配置
│   │   ├── data/SampleData.ets       样例合同、风险点、法条库
│   │   ├── model/Models.ets          数据模型
│   │   ├── pages/Index.ets           全部页面与交互
│   │   ├── service/
│   │   │   ├── AiService.ets         AI 分析（mock + 真实 API）
│   │   │   ├── ClipboardService.ets  剪贴板
│   │   │   ├── DiffService.ets       LCS 文本 diff
│   │   │   ├── HistoryService.ets    历史记录持久化
│   │   │   └── ReportService.ets     报告生成
│   │   └── entryability/EntryAbility.ets
│   ├── resources/                    图标、字符串、启动页
│   └── module.json5                  模块配置与 INTERNET 权限
└── README.md
```

## 在 DevEco Studio 中运行

1. 打开 DevEco Studio，选择 `File > Open`，打开 `ContractRadar` 目录。
2. 等待工程同步完成。
3. 如果提示签名配置：
   - 打开 `File > Project Structure > Signing Configs`；
   - 勾选 `Automatically generate signature`；
   - 按提示登录华为开发者账号。
4. 选择 DevEco 的 Phone 模拟器，点击 Run。
5. 应用启动后点击“使用示例合同”或“开始分析”。

> 命令行构建已验证通过，但构建产物是 unsigned HAP，不能直接安装到模拟器。  
> 模拟器运行需要 DevEco Studio 自动签名。

### 命令行构建

```bash
export DEVECO_SDK_HOME="/Applications/DevEco-Studio.app/Contents/sdk"
export NODE_HOME="/Applications/DevEco-Studio.app/Contents/tools/node"
export JAVA_HOME="/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home"
export PATH="$NODE_HOME/bin:$JAVA_HOME/bin:/Applications/DevEco-Studio.app/Contents/tools/ohpm/bin:/Applications/DevEco-Studio.app/Contents/tools/hvigor/bin:$PATH"

hvigorw --mode module -p product=default -p buildMode=debug assembleHap --no-daemon
```

构建产物：

```text
entry/build/default/outputs/default/entry-default-unsigned.hap
```

## 接入真实 AI API

编辑 `entry/src/main/ets/config/AiConfig.ets`：

```ts
export class AiConfig {
  static readonly USE_MOCK: boolean = false;
  static readonly API_KEY: string = 'sk-你的key';
  static readonly BASE_URL: string = 'https://api.deepseek.com/v1/chat/completions';
  static readonly MODEL: string = 'deepseek-chat';
}
```

`AiService` 使用 OpenAI 兼容的 `chat/completions` 接口，并要求模型返回 JSON。  
如果接口失败、超时或 JSON 不合法，会自动回退到内置 mock 结果，保证演示不中断。

可替换的供应商示例：

| 供应商 | BASE_URL | MODEL |
|---|---|---|
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | `deepseek-chat` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | `glm-4-flash` |
| 通义千问（兼容模式） | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | `qwen-plus` |

注意：把 API Key 放在客户端只适合课程/毕设演示。正式上架应改成自己的后端代理，客户端不保存 Key。

## 5–7 分钟演示流程

1. **0:00–0:30 首页**：介绍“签前 3 分钟，看清租房合同”，点击“开始分析”。
2. **0:30–2:00 合同分析**：风险分 78、风险分布、9 个风险点；点开“提前退租押金不退”。
3. **2:00–2:30 条款解释**：返回分析页，展开全部条款，点一条无风险条款展示解释。
4. **2:30–3:40 建议修订版 + 对比**：接受 3–4 条建议，生成对比；展示红绿 diff 和风险分下降。
5. **3:40–4:40 谈判助手**：复制一条话术，说明可以直接发给房东。
6. **4:40–5:30 导出报告**：生成报告并复制，展示报告包含风险、法条、话术。
7. **5:30–6:00 历史记录**：展示本地保存的分析记录并收尾。

## 当前限制

- 默认 mock 分析，不调用真实模型；填入 API Key 后可切换。
- 合同导入目前以内置样例为主，未实现 PDF/图片 OCR。
- 导出报告为文本/Markdown，不是 PDF。
- 历史记录保存在本机 preferences，没有云端同步。
- 没有账号、支付、上架合规相关功能。
- 法条库是演示用的小型 curated 集合，不是完整法律数据库。

## 后续可做

- 接入真实合同文件解析（PDF / 图片 OCR）。
- 增加劳动合同、装修合同模板。
- 报告导出 PDF / 长图。
- 设置页：运行时输入 API Key、切换模型。
- 用真实用户测试校准风险分类和话术。