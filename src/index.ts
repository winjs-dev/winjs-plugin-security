import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cheerio, logger } from '@winner-fed/utils';
import type { IApi } from '@winner-fed/winjs';

interface SecurityConfig {
  sri: boolean;
}

export default (api: IApi) => {
  api.describe({
    key: 'security',
    enableBy: api.EnableBy.config,
    config: {
      schema({ zod }) {
        return zod.object({
          sri: zod.boolean(),
        });
      },
    },
  });

  // 增加检测 html 文件类型的功能
  api.onBuildHtmlComplete(
    async (html: { htmlFiles?: Array<{ path: string; content: string }> }) => {
      const config = api.config.security as SecurityConfig;

      // 只有当 sri 配置为 true 时才生成 SRI
      if (!config?.sri) {
        return;
      }

      const htmlFiles = html?.htmlFiles || [];
      if (api.env === 'development' || htmlFiles.length === 0) {
        return;
      }

      for (const { path, content } of htmlFiles) {
        const $ = cheerio.load(content);

        // Implement SRI for scripts and stylesheets.
        const scripts = $('script').filter('[src]');
        const stylesheets = $('link').filter('[href]');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const calculateIntegrityHashes = async (element: any) => {
          let source: string | Uint8Array | undefined;
          const $el = $(element);
          const attributeName = $el.attr('src') ? 'src' : 'href';
          const resourceUrl = $el.attr(attributeName);

          if (!resourceUrl) {
            return;
          }

          // 尝试读取资源文件计算hash
          try {
            // 构建资源文件的完整路径
            const resourcePath = resolve(
              api.paths.absOutputPath,
              resourceUrl.replace(/^\//, ''),
            );
            source = readFileSync(resourcePath);
          } catch (error) {
            logger.warn(`无法读取资源文件: ${resourceUrl}`, error);
            return;
          }

          if (source) {
            const hash = createHash('sha512').update(source).digest('base64');

            $el.attr('integrity', `sha512-${hash}`);

            // https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/crossorigin
            // 在进行跨域资源请求时，integrity 必须配合 crossorigin 使用，不然浏览器会丢弃这个资源的请求
            if (!$el.attr('crossorigin')) {
              $el.attr('crossorigin', 'anonymous');
            }
          }
        };

        // 处理所有script和link标签
        const promises: Promise<void>[] = [];

        scripts.each((_i: number, script: any) => {
          promises.push(calculateIntegrityHashes(script));
        });

        stylesheets.each((_i: number, style: any) => {
          promises.push(calculateIntegrityHashes(style));
        });

        await Promise.all(promises);

        // 写入修改后的HTML文件
        writeFileSync(resolve(api.paths.absOutputPath, path), $.html());
      }
    },
  );
};
