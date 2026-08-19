# dsh-workspace-menu

DSH 主页的工作区/会话增强菜单。

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

设置页里可以单独开关每个功能。

## 安装

从 Releases 下载 tgz，然后：

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-0.1.0.tgz
```

本地开发：

```bash
npm install
npm run build:client
```

## 说明

- 不修改 DSH 内置源码，通过 DOM 事件和 React fiber 定位工作区/会话行。
- “在资源管理器中打开”由 Host 调用系统文件管理器。
- 置顶和未读状态存在浏览器 localStorage。
- 新窗口打开依赖 `?session=<id>` 深链。
