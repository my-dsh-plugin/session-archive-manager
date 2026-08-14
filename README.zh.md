# session-archive-manager

在 DeepSeek Harness 设置页查看归档会话，支持取消归档、删除、批量删除与全量删除 —— 补上 Harness 本身缺失的归档会话管理入口。

> English: [README.md](README.md)

## 功能

- **查看**全部归档会话：标题、工作区、工作目录与最近更新时间。归档会话会被所有会话列表隐藏，只有这里能看到。
- **取消归档**单个或选中的会话：归档时保留的工作区归属槽位会被恢复，会话重新出现在原有位置。
- **删除**单个会话、**删除所选**或**全量删除**全部归档会话，均有内联确认，防止误删。
- **实时刷新**：列表跟随宿主的归档集合与会话摘要实时更新；操作通过运行时 store 即时生效。

## 依赖要求

- 需要包含 `workspace.unarchiveSession` 与 `workspace.deleteSession` RPC、以及运行时 `workspaces.unarchiveSession` / `workspaces.deleteSession` 动作的 DeepSeek Harness 版本。本插件只提供界面，全部操作依赖这些核心 API。
- 需要把插件接入 web profile（见下）。

## 安装

1. 克隆到 harness checkout 旁边并安装：

   ```sh
   git clone https://github.com/my-dsh-plugin/session-archive-manager.git
   pnpm install
   ```

2. 在 web profile 的 `package.json` dependencies 中链接：

   ```json
   "dependencies": {
     "dsh-session-archive-manager": "link:/path/to/session-archive-manager"
   }
   ```

3. 在 profile 的 `dsh.profile.bundles` 列表中加入：

   ```json
   "dsh": {
     "profile": {
       "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-session-archive-manager"]
     }
   }
   ```

4. 重启 Harness。设置页中「插件」之后会出现「归档会话」入口。

## 开发

```sh
pnpm build      # tsc + tsdown + 客户端 bundle（需要旁边的 harness checkout）
pnpm typecheck  # 宿主与客户端类型检查
pnpm test       # 控制器单元测试
```

客户端 bundle 使用 harness 共享预设（`packages/client/tsdown.client.ts`）构建；git 安装则直接使用预构建的 `lib/client.js`。

## 已知限制与待办

- 删除正在运行的会话会被拒绝（会话处于活动状态）；请先关闭会话再删除。
- 被删除会话产生的附件不会被垃圾回收，仍留在附件库中；附件库按内容寻址，且被日志导出共享。
- 会话搜索索引会在下一次对账时移除已删除的会话；运行中的 Web 客户端侧边栏从自己的 store 刷新，可能在下次列表刷新前仍显示该行。

## 许可证

Apache-2.0
