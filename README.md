# Codex Halo

![Codex Halo](docs/images/codex-halo-hero.svg)

Codex Halo 是一个 Windows 桌面悬浮状态小窗，用一个可拖拽的光环显示 Codex 当前状态。

它会常驻系统托盘，不占任务栏；悬浮窗透明置顶，右键可以调整大小或隐藏。

## 功能

- 两种状态：`思考` / `完成`
- 监听本地 Codex session JSONL 日志推断状态
- C 形 SVG 圆角光环，外圈持续旋转
- 状态切换时颜色丝滑渐变，不重置旋转动画
- 中心只显示白色中文状态字
- 可拖拽悬浮窗
- 系统托盘常驻，不显示任务栏图标
- 右键设置比例：`10 / 20 / 30 / 40 / 50 / 60`
- 托盘右键：显示/隐藏、调整比例、退出
- 支持打包为 Windows 单文件便携版 `.exe`

## 状态规则

Codex 目前没有公开稳定的实时状态 API，本项目通过读取本机 `.codex/sessions/**/*.jsonl` 推断状态。

- `user_message`、`reasoning`、`function_call`、工作中的 `commentary` -> `思考`
- `final_answer` -> `完成`
- `完成` 会保持到下一次新的任务事件开始

## 使用

```bash
npm install
npm start
```

## 打包 Windows exe

```bash
npm run build:win
```

打包产物：

```text
dist/Codex-Halo.exe
```

## 开发验证

```bash
npm test
```

## 项目结构

```text
src/main/       Electron 主进程、托盘、状态监听、窗口配置
src/renderer/   悬浮窗 UI、拖拽、光环样式
src/shared/     状态模型
tests/          Node test 测试
docs/images/    README 介绍图
```

## 注意

状态监听依赖本地 Codex session 日志，因此它是实用型推断方案，不等同于官方实时状态 API。
