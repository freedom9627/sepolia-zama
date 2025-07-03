# Sepolia代币领取工具 - Web版本

这是一个基于Next.js的现代化Web界面，用于管理和使用各种区块链工具，包括Sepolia代币领取工具。

## 功能特性

### 🎯 项目管理
- **项目选择界面**: 清晰的项目卡片展示
- **状态指示**: 实时显示项目可用状态
- **响应式设计**: 适配各种设备屏幕

### 🔧 Sepolia代币领取工具
- **网络配置**: 自定义RPC节点和合约地址
- **钱包管理**: 安全的私钥输入和验证
- **交易配置**: 可调节的Gas设置和领取间隔
- **实时监控**: 余额查询和交易状态
- **操作日志**: 详细的操作记录和错误信息
- **自动领取**: 支持定时循环领取功能

### 🎨 界面特性
- **现代化UI**: 使用Tailwind CSS的美观界面
- **响应式布局**: 支持桌面和移动设备
- **实时状态**: 动态更新网络和钱包状态
- **安全设计**: 私钥本地处理，不会上传到服务器

## 技术栈

- **Framework**: Next.js 14
- **UI Library**: Tailwind CSS
- **Icons**: Heroicons
- **Blockchain**: Web3.js
- **Deployment**: Vercel

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd web-ui
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **打开浏览器**
   访问 [http://localhost:3000](http://localhost:3000)

### 部署到Vercel

#### 方式一：自动部署（推荐）

1. **连接GitHub**
   - 将代码推送到GitHub仓库
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 点击"New Project"选择你的仓库

2. **配置项目**
   - Framework Preset: Next.js
   - Root Directory: `web-ui`（如果项目在子目录中）
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **部署**
   - 点击"Deploy"
   - Vercel会自动构建和部署
   - 每次推送代码都会自动重新部署

#### 方式二：命令行部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd web-ui
   vercel
   ```

4. **跟随提示完成配置**

### 环境变量（可选）

如果需要配置特定的RPC节点或其他设置，可以在Vercel中添加环境变量：

```
NEXT_PUBLIC_DEFAULT_RPC_URL=https://rpc.sepolia.ethpandaops.io
NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS=0x3edf60dd017ace33a0220f78741b5581c385a1ba
```

## 项目结构

```
web-ui/
├── pages/                 # Next.js页面
│   ├── index.js          # 主页（项目选择）
│   ├── sepolia-claimer.js # Sepolia代币领取工具
│   └── _app.js           # 应用入口
├── hooks/                # React hooks
│   └── useWeb3.js        # Web3交互逻辑
├── styles/               # 样式文件
│   └── globals.css       # 全局样式
├── public/               # 静态资源
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind配置
├── next.config.js        # Next.js配置
└── vercel.json          # Vercel部署配置
```

## 使用指南

### 1. 选择项目
- 访问主页查看可用的工具
- 点击"Sepolia代币领取工具"开始使用

### 2. 配置网络
- 在"网络配置"标签页输入RPC节点URL
- 确认合约地址正确
- 点击"连接网络"

### 3. 设置钱包
- 切换到"钱包配置"标签页
- 输入64位十六进制私钥
- 点击"验证私钥"确认
- 检查钱包余额

### 4. 调整设置
- 在"交易配置"标签页设置Gas价格和限制
- 配置自动领取间隔（建议不少于60秒）

### 5. 开始领取
- 使用"手动领取"进行单次测试
- 使用"开始自动领取"进行循环领取
- 在右侧面板查看实时状态和日志

## 安全提醒

⚠️ **重要安全事项**:

1. **仅限测试网**: 此工具仅用于Sepolia测试网，切勿用于主网
2. **私钥安全**: 私钥仅在浏览器本地处理，不会发送到服务器
3. **测试环境**: 建议在隔离的测试环境中使用
4. **备份私钥**: 确保私钥有安全的备份
5. **网络验证**: 始终确认连接到正确的测试网络

## 开发说明

### 添加新工具

1. **创建新页面**
   ```bash
   # 在pages目录创建新页面
   touch pages/new-tool.js
   ```

2. **更新主页**
   在 `pages/index.js` 的 `projects` 数组中添加新项目

3. **创建对应的Hook**
   如果需要区块链交互，创建相应的自定义Hook

### 自定义样式

- 修改 `tailwind.config.js` 调整主题颜色
- 在 `styles/globals.css` 中添加自定义CSS类
- 使用Tailwind的工具类进行快速样式调整

### 添加新功能

1. **状态管理**: 使用React useState和useEffect
2. **Web3交互**: 扩展 `hooks/useWeb3.js`
3. **UI组件**: 创建可复用的组件
4. **错误处理**: 添加适当的错误边界和用户反馈

## 故障排除

### 构建错误

```bash
# 清理依赖并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本（推荐18+）
node --version
```

### 部署问题

1. **检查vercel.json配置**
2. **确认package.json中的scripts**
3. **查看Vercel部署日志**
4. **检查环境变量设置**

### Web3连接问题

1. **检查RPC节点是否可用**
2. **确认网络ID正确（Sepolia: 11155111）**
3. **检查浏览器控制台错误信息**

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/new-feature`)
3. 提交更改 (`git commit -am 'Add new feature'`)
4. 推送到分支 (`git push origin feature/new-feature`)
5. 创建Pull Request

## 许可证

MIT License - 仅供学习和测试使用

## 支持

如有问题或建议，请提交Issue或Pull Request。 