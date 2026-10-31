# DSH Workspace Menu

**简体中文** · [English](README.en.md)

给 DSH 首页的工作区和会话加上右键菜单。双击也能打开：需要重命名、复制路径或归档会话时，不用再到处找按钮。

> **兼容性：** v2.0.0 及以后适用于 DSH 0.2.x（`>= 0.2.1-rc.3`）。DSH 0.1.x 请使用 [v1.2.0](https://github.com/0imzero/dsh-workspace-menu/releases/tag/v1.2.0)。

## 安装

通过 npm 安装：

```bash
dsh plugin --profile web add @0imzero/dsh-workspace-menu
```

也可以从 [Releases](https://github.com/0imzero/dsh-workspace-menu/releases/latest) 下载安装包，在安装包所在目录运行：

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-2.0.2.tgz
```

重启 DSH 后，在首页右键或双击工作区、会话即可使用。菜单项可以在 **设置 → 工作区菜单** 中分别开关；设置界面支持中文和英文。

从旧版包 `@dsh-external/dsh-workspace-menu` 切换到 npm 版时，请先移除旧版，避免重复加载。

## 能做什么

**工作区**

- 置顶或取消置顶、重命名
- 在文件管理器中打开、复制路径、新建会话
- 从列表中移除（保留磁盘文件），或删除工作区及其磁盘目录（二次确认）

**会话**

- 置顶或取消置顶、重命名、标记未读或已读
- 归档、取消归档、分叉会话
- 复制会话链接或标题，在新窗口中打开，打开所在目录
- 删除会话及其磁盘记录（二次确认）

## 使用说明

- 会话置顶与 DSH 自带的置顶功能共用状态；工作区置顶和会话未读标记保存在当前浏览器的 localStorage 中。
- 删除会话时会先归档并切到新对话；如果记录仍被 DSH 占用，插件会稍后重试。取消归档可取消尚未执行的删除。
- 文件管理器使用 Windows 资源管理器、macOS Finder，或 Linux 上可用的 `xdg-open`、`gio` 等程序。
- 新窗口使用插件提供的 `?session=<id>` 链接打开对应会话。
- 永久删除由插件的宿主路由处理，无需安装 `@mlgbnb/dsh-archive-manager`。会话记录位于 `$DSH_HOME/sessions/<工作区 slug>/<sessionId>/`。
- 插件通过 DOM 事件和 React fiber 定位工作区和会话行，不修改 DSH 内置源码。

## 本地开发

```bash
npm install
npm run build
npm test
```

## 许可证

[BSD 3-Clause](LICENSE)
