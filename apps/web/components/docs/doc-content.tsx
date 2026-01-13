import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { CodeCopyButton } from '@/components/code-copy-button';
import { CodeBlockCommand } from '@/components/code-block-command';

interface DocContentProps {
  content: string;
}

// 辅助函数：从 children 中提取代码文本
function extractCodeText(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractCodeText).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return extractCodeText(element.props.children);
  }
  return '';
}

// MDX 组件映射
const components = {
  // 自定义代码块包装
  pre: ({
    children,
    __raw__,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & { __raw__?: string }) => {
    // 获取代码内容
    const codeContent = __raw__ || extractCodeText(children);

    return (
      <div className="group relative my-4">
        <pre
          {...props}
          className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-50"
        >
          {children}
        </pre>
        {codeContent && (
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <CodeCopyButton
              code={codeContent}
              className="bg-zinc-800 hover:bg-zinc-700"
            />
          </div>
        )}
      </div>
    );
  },
  // 内联代码
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // 检查是否是代码块中的 code（有 data-language 属性）
    if (props['data-language' as keyof typeof props]) {
      return <code {...props}>{children}</code>;
    }
    // 内联代码样式
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  // 表格样式
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border-b px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b px-4 py-2" {...props}>
      {children}
    </td>
  ),
  // 自定义组件
  CodeCopyButton,
  CodeBlockCommand,
};

export async function DocContent({ content }: DocContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypePrettyCode,
                {
                  theme: 'github-dark',
                  keepBackground: true,
                  onVisitLine(node: { children: unknown[] }) {
                    // 防止空行折叠
                    if (node.children.length === 0) {
                      node.children = [{ type: 'text', value: ' ' }];
                    }
                  },
                },
              ],
            ],
          },
        }}
      />
    </article>
  );
}
