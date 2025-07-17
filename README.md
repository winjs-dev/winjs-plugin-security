# winjs-plugin-security

一个为 WinJS 项目提供安全增强功能的插件，主要用于生成 SRI（Subresource Integrity）属性。

## 功能特性

- 自动为 HTML 文件中的 `<script>` 和 `<link>` 标签生成 SRI 属性
- 支持 SHA-256、SHA-384、SHA-512 哈希算法（可配置）
- 自动添加 `crossorigin="anonymous"` 属性以确保 SRI 正常工作
- 仅在生产环境下生效，开发环境自动跳过

## 安装

```bash
pnpm add @winner-fed/plugin-security
```

## 使用方法

在你的 `.winrc.ts` 配置文件中添加插件配置：

```typescript
import { defineConfig } from '@winner-fed/winjs';

export default defineConfig({
  plugins: ['@winner-fed/plugin-security'],
  security: {
    sri: true // 启用 SRI 功能
  },
});
```

## 配置选项

### `sri`

- **类型**: `boolean | { algorithm: 'sha256' | 'sha384' | 'sha512' }`
- **默认值**: 需要手动设置
- **描述**: 是否启用 SRI（子资源完整性）功能，以及可选的哈希算法配置

当设置为 `true` 时，插件会：

1. 扫描构建后的 HTML 文件
2. 为所有带有 `src` 属性的 `<script>` 标签添加 `integrity` 属性
3. 为所有带有 `href` 属性的 `<link>` 标签添加 `integrity` 属性
4. 自动添加 `crossorigin="anonymous"` 属性（如果不存在）

你也可以通过对象方式指定哈希算法：

```typescript
security: {
  sri: {
    algorithm: 'sha512' // 可选 'sha256' | 'sha384' | 'sha512'，默认 'sha512'
  }
}
```

## 示例

### 输入 HTML

```
