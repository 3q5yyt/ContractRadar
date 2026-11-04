# Windows 部署说明

项目包含三部分：HarmonyOS 客户端、Spring Boot 后端、Vue 3 管理端。Windows 上一键脚本主要解决后端和管理端的环境与依赖，DevEco Studio 和鸿蒙模拟器需要手动安装。

## 一、一键脚本

仓库根目录提供：

- `setup-windows.ps1`：主脚本
- `setup-windows.bat`：双击运行入口（自动用 Bypass 执行 PowerShell）

如果仓库还没拉到本地，先下载脚本：

```powershell
irm https://raw.githubusercontent.com/3q5yyt/ContractRadar/main/setup-windows.ps1 -OutFile setup-windows.ps1
irm https://raw.githubusercontent.com/3q5yyt/ContractRadar/main/setup-windows.bat -OutFile setup-windows.bat
```

然后运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

或者直接双击 `setup-windows.bat`。

### 脚本会自动完成

- 检查 Git、Java、Node.js/npm
- 缺少时通过 `winget` 安装：
  - Git
  - Eclipse Temurin JDK 21
  - Node.js LTS
- 设置 `JAVA_HOME` 和用户 PATH
- 设置 Git `core.longpaths` 和 `core.autocrlf`
- 克隆或更新 `https://github.com/3q5yyt/ContractRadar.git`
- 执行 `backend\mvnw.cmd -DskipTests package`
- 执行 `admin-web\npm ci`（失败时回退到 `npm install`）
- 生成：
  - `run-backend.bat`
  - `run-admin.bat`
  - `run-mysql.bat`
- 可选 `-StartServices` 自动打开后端和管理端窗口
- 可选 `-WithDocker` 启动 MySQL 容器

默认安装目录：`C:\ContractRadar`。  
**路径不要包含空格**，否则 DevEco Studio 可能拒绝打开工程。可以用 `-InstallRoot` 指定其他目录。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-windows.ps1 -InstallRoot "D:\ContractRadar"
```

## 二、需要手动完成的配置

### 1. 安装 DevEco Studio 和鸿蒙 SDK

脚本不会自动安装 DevEco Studio，因为安装包较大，且华为账号、SDK、模拟器镜像需要手动确认。

- 下载地址：<https://developer.huawei.com/consumer/cn/deveco-studio/>
- 安装后打开 DevEco Studio：
  - 安装 HarmonyOS SDK
  - 在 Device Manager 中创建 Phone 模拟器
  - 打开 `C:\ContractRadar\ContractRadar`（或你指定的安装目录）
  - `File > Project Structure > Signing Configs`
  - 勾选 `Automatically generate signature`
  - 按提示登录华为开发者账号

> 没有签名配置时，客户端只能编译出 unsigned HAP，不能安装到模拟器。

### 2. 配置 ModelScope API Key

编辑：

```text
entry\src\main\ets\config\AiConfig.ets
```

把 `API_KEY` 换成你的 ModelScope key：

```ts
static readonly USE_MOCK: boolean = false;
static readonly API_KEY: string = '你的 key';
static readonly BASE_URL: string = 'https://api-inference.modelscope.cn/v1';
static readonly MODEL: string = 'deepseek-ai/DeepSeek-V4.1-Flash-1017';
```

注意：

- 不要把真实 key 提交到 GitHub
- 如果只想演示 mock，把 `USE_MOCK` 设为 `true`
- 真实接口失败时会自动回退到 mock
- Logcat 过滤 `CR_AI` 可以看到请求和错误

### 3. 启动后端和管理端

脚本生成后，可以直接双击：

```text
run-backend.bat
run-admin.bat
```

或手动执行：

```cmd
cd backend
mvnw.cmd spring-boot:run

cd admin-web
npm run dev
```

地址：

- 后端：<http://localhost:8080>
- 管理端：<http://localhost:5173>
- 默认管理员：`admin / admin123`
- H2 控制台：<http://localhost:8080/h2-console>
- H2 JDBC URL：`jdbc:h2:file:./data/contractradar`
- H2 用户名：`sa`，密码为空

### 4. MySQL（可选）

后端默认使用 H2，不需要安装 MySQL。  
如果论文/答辩要求 MySQL 8.0：

1. 安装 Docker Desktop（需要 WSL2），并确保 Docker 正在运行
2. 双击 `run-mysql.bat`，或执行：

```cmd
docker compose up -d
```

3. 使用 MySQL profile 启动后端：

```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```

MySQL 默认配置：

```text
地址：localhost:3306
数据库：contract_radar
用户名：root
密码：root
```

如果本机已经安装 MySQL 8.0，也可以直接改 `backend/src/main/resources/application.yml` 中 `mysql` profile 的连接信息。

### 5. Windows 防火墙

第一次启动时 Windows 可能弹出防火墙提示：

- 允许 Java/Tomcat 使用 8080
- 允许 Node.js 使用 5173
- 如果只在本机访问，选择“专用网络”即可

## 三、当前缺少/未自动化的部分

| 项目 | 状态 | 说明 |
|---|---|---|
| Git | 脚本自动安装 | 通过 winget |
| JDK 21 | 脚本自动安装 | 通过 winget，设置 JAVA_HOME |
| Node.js LTS | 脚本自动安装 | 通过 winget |
| 后端依赖 | 脚本自动构建 | Maven Wrapper 自动下载 Maven |
| 管理端依赖 | 脚本自动安装 | `npm ci` / `npm install` |
| MySQL 8.0 | 可选 | 默认 H2；MySQL 需要 Docker 或本机安装 |
| Docker Desktop | 未自动安装 | 需要 WSL2，安装后可能要重启 |
| DevEco Studio | **手动** | 华为官网下载、登录、安装 SDK |
| HarmonyOS 模拟器 | **手动** | Device Manager 创建 Phone 模拟器 |
| 应用签名 | **手动** | DevEco 自动签名，需要华为账号 |
| ModelScope Key | **手动** | 写入 `AiConfig.ets`，不要提交 |
| 客户端接入后端 | 未完成 | 客户端当前直接调用 ModelScope；后端已有 `/api/client/*` 接口，可后续切换 |

## 四、验证清单

1. 运行 `run-backend.bat`，浏览器打开 <http://localhost:8080/api/client/templates>，应返回 JSON。
2. 运行 `run-admin.bat`，打开 <http://localhost:5173>，用 `admin / admin123` 登录。
3. 管理端能看到数据看板、用户、模板、规则、法条、分析反馈。
4. 在 DevEco Studio 中打开工程，配置自动签名，启动 Phone 模拟器。
5. 客户端首页点击“使用示例合同”或“开始分析”。
6. 分析页显示“AI 实时”或“示例”；Logcat 过滤 `CR_AI` 查看详情。

## 五、常见问题

### PowerShell 提示脚本被禁止

使用 `setup-windows.bat`，或执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

### winget 不存在

安装 Microsoft Store 的“应用安装程序”（App Installer），或手动安装：

- Git：<https://git-scm.com/download/win>
- Temurin JDK 21：<https://adoptium.net/temurin/releases/?version=21>
- Node.js LTS：<https://nodejs.org/en/download>

### 后端启动报 JAVA_HOME 不正确

在 Windows 终端执行：

```cmd
echo %JAVA_HOME%
java -version
```

如果为空，重新打开终端，或手动设置：

```cmd
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot"
```

### DevEco 打不开项目

检查路径是否包含空格或中文。建议放在 `C:\ContractRadar` 这类纯英文、无空格路径下。

### 客户端一直显示“示例”

说明真实 API 没有成功，常见原因：

- `USE_MOCK` 仍为 `true`
- `API_KEY` 为空或无效
- ModelScope 限流（HTTP 429）
- 模型 ID 不对
- 模拟器网络不可用

Logcat 过滤 `CR_AI` 可以看到 `analyze failed` 的具体原因。