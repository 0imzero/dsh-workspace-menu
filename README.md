# dsh-workspace-menu

把 DSH 主页的工作区和会话管理补齐：双击或右键，就能置顶、重命名、打开资源管理器、归档、分叉、复制、新窗口打开。所有开关都收在通用设置里，按需开启。

## 亮点

- **工作区操作**：置顶、重命名、在资源管理器中打开、复制路径、新建会话、删除工作区
- **会话操作**：置顶、重命名、标记未读/已读、归档、分叉、复制会话链接、复制会话标题、在新窗口中打开、打开所在目录
- **跨平台**：Windows 用资源管理器，macOS 用 Finder，Linux 自动选择 `xdg-open` / `gio` / 常见文件管理器
- **设置集成**：功能开关放在 DSH 通用设置里，支持折叠，逐项开关，不用的时候不会占菜单
- **不动内置源码**：通过 DOM 事件和 React fiber 定位工作区/会话行，不修改 DSH 自带代码

## 功能

Project 行（双击或右键）：

- 置顶 / 取消置顶
- 重命名
- 在资源管理器中打开
- 复制路径
- 新建会话
- 删除工作区

Chat 行（双击或右键）：

- 置顶 / 取消置顶
- 重命名
- 标记未读 / 已读
- 归档会话
- 分叉会话
- 复制会话链接
- 复制会话标题
- 在新窗口中打开
- 打开所在目录

设置集成在 DSH 通用设置（General）里，可以单独开关每个功能。

## 安装

从 Releases 下载 tgz，然后：

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-1.1.0.tgz
```

本地开发：

```bash
npm install
npm run build:client
```

## 说明

- “在资源管理器中打开”由 Host 调用系统文件管理器：Windows 用资源管理器，macOS 用 Finder，Linux 自动选择 `xdg-open` / `gio` / 常见文件管理器。
- 置顶和未读状态存在浏览器 localStorage。
- 新窗口打开依赖 `?session=<id>` 深链。
- 设置项位于 DSH 设置 → 通用设置，可折叠展开。
