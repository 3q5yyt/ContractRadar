# 合同雷达（ContractRadar）

面向毕业租房场景的合同风险审查系统，包含三部分：

- **HarmonyOS 客户端**：合同导入、风险分析、条款解释、建议修订版、合同对比、谈判助手、报告导出、历史记录。
- **Spring Boot 后端**：管理员登录、用户管理、合同模板、风险规则、法条库、分析记录与反馈、统计看板，以及客户端模板/法条/反馈接口。
- **Vue 3 管理端**：登录、数据看板、五类管理页面。

客户端默认使用内置样例合同，支持 ModelScope 真实 AI 分析和 mock 降级，适合在 DevEco Studio 模拟器上完成 5–7 分钟演示。

## 目录结构

```text
ContractRadar/
├── AppScope/                         鸿蒙应用级配置
├── entry/src/main/                   鸿蒙客户端
│   └── ets/
│       ├── common/Theme.ets          颜色、风险等级、评分色
│       ├── config/AiConfig.ets       AI API 配置
│       ├── data/SampleData.ets       样例合同、风险点、法条库
│       ├── model/Models.ets          数据模型
│       ├── pages/Index.ets           客户端页面与交互
│       ├── service/
│       │   ├── AiService.ets         AI 分析（mock + ModelScope）
│       │   ├── ClipboardService.ets  剪贴板
│       │   ├── DiffService.ets       文本差异对比
│       │   ├── HistoryService.ets    历史记录持久化
│       │   └── ReportService.ets     报告生成
│       └── entryability/EntryAbility.ets
├── backend/                          Spring Boot 后端
│   ├── src/main/java/com/contractradar/
│   │   ├── auth/                     JWT
│   │   ├── common/                   统一响应与异常处理
│   │   ├── config/                   CORS、拦截器、密码编码
│   │   ├── controller/               管理员接口与客户端接口
│   │   ├── entity/                   实体
│   │   ├── mapper/                   MyBatis-Plus Mapper
│   │   └── service/DataInitializer   种子数据
│   └── src/main/resources/
│       ├── application.yml           H2 默认，MySQL profile
│       └── schema.sql                建表脚本
├── admin-web/                        Vue 3 管理端
│   └── src/
│       ├── api/http.js               Axios 封装
│       ├── layouts/AdminLayout.vue   管理端布局
│       ├── router/index.js           路由与登录守卫
│       └── views/                    登录、看板、五类管理页面
├── docker-compose.yml                MySQL 8.0（可选）
├── setup-windows.ps1                 Windows 一键环境脚本
├── setup-windows.bat                 Windows 双击入口
├── WINDOWS.md                        Windows 部署与手动配置说明
└── README.md
```

## 快速启动

### 1. 启动后端（默认 H2，不需要安装 MySQL）

```bash
cd backend
export JAVA_HOME="/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home"
./mvnw spring-boot:run
```

- 后端地址：`http://localhost:8080`
- H2 控制台：`http://localhost:8080/h2-console`
- JDBC URL：`jdbc:h2:file:./data/contractradar`
- 用户名：`sa`，密码为空
- H2 数据文件在 `backend/data/`，已被 gitignore

### 2. 启动管理端

```bash
cd admin-web
npm install
npm run dev
```

- 管理端地址：`http://localhost:5173`
- Vite 已配置 `/api` 代理到 `http://localhost:8080`
- 默认管理员：`admin / admin123`

### 3. 使用 MySQL 8.0（可选）

如果 Docker 守护进程已启动：

```bash
docker compose up -d
cd backend
export JAVA_HOME="/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home"
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

MySQL 配置：

- 地址：`localhost:3306`
- 数据库：`contract_radar`
- 用户名：`root`
- 密码：`root`

`spring.sql.init.mode=always` 会执行 `schema.sql` 建表，`DataInitializer` 会插入种子数据。

### 4. 运行鸿蒙客户端

1. 打开 DevEco Studio，`File > Open` 选择 `ContractRadar` 目录。
2. 等待同步完成。
3. `File > Project Structure > Signing Configs`，勾选 `Automatically generate signature`，登录华为开发者账号。
4. 选择 Phone 模拟器，点击 Run。
5. 首页点击“使用示例合同”或“开始分析”。

命令行构建：

```bash
export DEVECO_SDK_HOME="/Applications/DevEco-Studio.app/Contents/sdk"
export NODE_HOME="/Applications/DevEco-Studio.app/Contents/tools/node"
export JAVA_HOME="/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home"
export PATH="$NODE_HOME/bin:$JAVA_HOME/bin:/Applications/DevEco-Studio.app/Contents/tools/ohpm/bin:/Applications/DevEco-Studio.app/Contents/tools/hvigor/bin:$PATH"

hvigorw --mode module -p product=default -p buildMode=debug assembleHap --no-daemon
```

> 命令行产物是 unsigned HAP，不能直接安装到模拟器；模拟器运行需要 DevEco 自动签名。

### 5. Windows 一键部署

Windows 上可以用脚本自动安装 Git/JDK/Node、拉取仓库、编译后端并安装管理端依赖：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

详细的手动步骤、缺失项和常见问题见 [WINDOWS.md](WINDOWS.md)。

## 管理端功能

| 模块 | 功能 |
|---|---|
| 数据看板 | 用户、模板、规则、法条、分析、反馈统计；风险分布；近 7 天分析次数 |
| 用户管理 | 搜索用户、启用/停用、删除 |
| 合同模板 | 新增、编辑、删除、启停，维护模板名称、分类和条款内容 |
| 风险规则 | 配置风险类型、关键词、等级、解释和修改建议 |
| 法条库 | 维护法律名称、条号、原文、关键词和生效时间 |
| 分析与反馈 | 查看分析记录、风险分和结构化结果；处理用户反馈 |

## 后端 API

管理员接口（除登录外都需要 `Authorization: Bearer <token>`）：

```text
POST   /api/admin/auth/login
GET    /api/admin/stats
GET    /api/admin/users
PUT    /api/admin/users/{id}/status
DELETE /api/admin/users/{id}
GET    /api/admin/templates
POST   /api/admin/templates
PUT    /api/admin/templates/{id}
DELETE /api/admin/templates/{id}
GET    /api/admin/risk-rules
POST   /api/admin/risk-rules
PUT    /api/admin/risk-rules/{id}
DELETE /api/admin/risk-rules/{id}
GET    /api/admin/laws
POST   /api/admin/laws
PUT    /api/admin/laws/{id}
DELETE /api/admin/laws/{id}
GET    /api/admin/analyses
GET    /api/admin/analyses/{id}
GET    /api/admin/feedback
PUT    /api/admin/feedback/{id}/status
```

客户端接口（不需要管理员 token）：

```text
GET  /api/client/templates
GET  /api/client/laws?keyword=
GET  /api/client/analyses?userId=
POST /api/client/feedback
```

## AI 配置

客户端 AI 配置在 `entry/src/main/ets/config/AiConfig.ets`：

```ts
export class AiConfig {
  static readonly USE_MOCK: boolean = false;
  static readonly API_KEY: string = '你的 ModelScope key';
  static readonly BASE_URL: string = 'https://api-inference.modelscope.cn/v1';
  static readonly MODEL: string = 'deepseek-ai/DeepSeek-V4.1-Flash-1017';
}
```

- `USE_MOCK = true` 或 key 为空时使用内置分析结果。
- 真实 API 失败、超时或返回 JSON 不合法时自动回退到 mock。
- 分析页会显示“AI 实时”或“示例”，Logcat 过滤 `CR_AI` 可看请求与错误。
- **不要把真实 key 提交到 GitHub**。本地配置好后直接 Run 即可。

## 5–7 分钟客户端演示

1. **0:00–0:30 首页**：介绍“签前 3 分钟，看清租房合同”，点击“开始分析”。
2. **0:30–2:00 合同分析**：风险分、风险分布、风险条款；点开“提前退租押金不退”。
3. **2:00–2:30 条款解释**：返回分析页，展开条款，点一条无风险条款展示解释。
4. **2:30–3:40 建议修订版 + 对比**：接受 3–4 条建议，生成对比，展示差异和风险分下降。
5. **3:40–4:40 谈判助手**：复制一条话术。
6. **4:40–5:30 导出报告**：生成并复制报告。
7. **5:30–6:00 历史记录**：展示本地保存的分析记录。

管理端演示：登录 → 数据看板 → 用户管理 → 合同模板 → 风险规则 → 法条库 → 分析与反馈。

## 当前限制

- 鸿蒙客户端当前直接调用 ModelScope；后端已提供客户端模板/法条/反馈接口，但客户端尚未全部切换到后端，后续可统一走后端代理。
- 合同导入以内置样例为主，未实现 PDF/图片 OCR。
- 报告导出为文本/Markdown，不是 PDF。
- 客户端历史记录保存在本机 preferences，没有云端同步。
- 法条库是演示用的小型集合，不是完整法律数据库。
- MySQL 模式需要本机或 Docker 中的 MySQL 8.0；默认 H2 模式无需额外安装。

## 后续可做

- 客户端接入后端 `/api/client/*`，把 AI 调用和 API Key 移到后端。
- 增加劳动合同、装修合同模板。
- 报告导出 PDF / 长图。
- 接入真实文件解析（PDF / 图片 OCR）。
- 用真实用户测试校准风险分类和话术。
