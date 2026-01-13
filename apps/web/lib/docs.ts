import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const docsDirectory = path.join(process.cwd(), 'content/docs');

export interface DocMeta {
  slug: string;
  title: string;
  description?: string;
}

export interface Doc extends DocMeta {
  content: string;
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const docsNavByLocale: Record<
  string,
  Array<
    | { title: string; slug: string }
    | { title: string; items: Array<{ title: string; slug: string }> }
  >
> = {
  en: [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', slug: 'introduction' },
        { title: 'Installation', slug: 'installation' },
        { title: 'Configuration', slug: 'configuration' },
        { title: 'CLI', slug: 'cli' },
      ],
    },
    {
      title: 'Employees',
      items: [
        { title: 'PM', slug: 'pm' },
        { title: 'Frontend', slug: 'frontend' },
        { title: 'Backend', slug: 'backend' },
      ],
    },
  ],
  zh: [
    {
      title: '开始使用',
      items: [
        { title: '介绍', slug: 'introduction' },
        { title: '安装', slug: 'installation' },
        { title: '配置', slug: 'configuration' },
        { title: 'CLI', slug: 'cli' },
      ],
    },
    {
      title: '员工',
      items: [
        { title: 'PM', slug: 'pm' },
        { title: '前端工程师', slug: 'frontend' },
        { title: '后端工程师', slug: 'backend' },
      ],
    },
  ],
};

// 获取指定语言的导航
export function getDocsNav(locale: string) {
  return docsNavByLocale[locale] || docsNavByLocale.en;
}

// 扁平化的文档顺序列表（用于上下篇导航）
export function getFlatDocsOrder(locale: string): string[] {
  const nav = getDocsNav(locale);
  const order: string[] = [];
  for (const item of nav) {
    if ('slug' in item && item.slug) {
      order.push(item.slug);
    }
    if ('items' in item && item.items) {
      for (const subItem of item.items) {
        if (subItem.slug) {
          order.push(subItem.slug);
        }
      }
    }
  }
  return order;
}

/**
 * 获取单个文档
 */
export function getDoc(slug: string, locale: string = 'en'): Doc | null {
  const localeDir = path.join(docsDirectory, locale);
  const filePath = path.join(localeDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    // 如果当前语言没有，尝试回退到英文
    if (locale !== 'en') {
      return getDoc(slug, 'en');
    }
    return null;
  }

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      description: data.description,
      content,
    };
  } catch {
    return null;
  }
}

/**
 * 获取所有文档元数据
 */
export function getAllDocsMeta(locale: string = 'en'): DocMeta[] {
  const docs: DocMeta[] = [];
  const localeDir = path.join(docsDirectory, locale);

  function walk(dir: string, prefix = '') {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath, `${prefix}${file}/`);
      } else if (file.endsWith('.mdx')) {
        const slug = `${prefix}${file.replace('.mdx', '')}`;
        try {
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(fileContents);
          docs.push({
            slug,
            title: data.title || slug,
            description: data.description,
          });
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  walk(localeDir);
  return docs;
}

/**
 * 从 Markdown 内容中提取 TOC
 */
export function extractToc(content: string): TocItem[] {
  const toc: TocItem[] = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const seenIds = new Map<string, number>();

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    let id = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');

    // 处理重复 ID
    const count = seenIds.get(id) || 0;
    if (count > 0) {
      id = `${id}-${count}`;
    }
    seenIds.set(id.replace(/-\d+$/, ''), count + 1);

    toc.push({ id, title, level });
  }

  return toc;
}

/**
 * 获取上一篇和下一篇文档
 */
export function getPrevNextDocs(
  currentSlug: string,
  locale: string = 'en'
): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const order = getFlatDocsOrder(locale);
  const currentIndex = order.indexOf(currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prevSlug = currentIndex > 0 ? order[currentIndex - 1] : null;
  const nextSlug =
    currentIndex < order.length - 1 ? order[currentIndex + 1] : null;

  const allDocs = getAllDocsMeta(locale);

  return {
    prev: prevSlug ? allDocs.find((d) => d.slug === prevSlug) || null : null,
    next: nextSlug ? allDocs.find((d) => d.slug === nextSlug) || null : null,
  };
}
