import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import CodeCopyButton from './CodeCopyButton';
import { MemoizedMarkdown } from './MemoizedMarkdown';

interface AIChatMessageProps {
    message: string;
    isStreaming?: boolean;
}

export default function AIChatMessage({ message, isStreaming = false }: AIChatMessageProps) {
    // 如果正在流式传输，使用优化的渲染
    if (isStreaming) {
        return <MemoizedMarkdown content={message} id={`ai-message-${Date.now()}`} />;
    }

    // 自定义预格式化代码块组件（包含复制功能）
    const Pre = ({ children, ...props }: any) => {
        return (
            <pre className="relative rounded-md my-4" {...props}>
                <div className="absolute top-2 right-1 m-2 z-30">
                    <CodeCopyButton>{children}</CodeCopyButton>
                </div>
                {children}
            </pre>
        );
    };

    return (
        <div className="ai-chat-message prose max-w-4xl relative dark:prose-invert">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                    pre: Pre,
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div style={{
                                position: 'relative',
                                maxWidth: '100%', // 设置最大宽度
                                overflowX: 'auto',   // 水平方向溢出滚动
                            }}>
                                <SyntaxHighlighter
                                    style={oneDark as any}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md my-4 overflow-y-auto"
                                    showLineNumbers={true}
                                    wrapLines={true}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className={`${className} px-1 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // 可以添加其他自定义组件渲染
                    a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
                    ),
                    p: ({ node, ...props }) => (
                        <p {...props} className="my-3" />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc pl-6 my-3" />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal pl-6 my-3" />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table {...props} className="border-collapse border border-gray-300 dark:border-gray-700" />
                        </div>
                    ),
                    th: ({ node, children }) => (
                        <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800" >
                            {children}
                        </th>
                    ),
                    td: ({ node, children }) => (
                        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" >
                            {children}
                        </td>
                    ),
                }}
            >
                {message}
            </ReactMarkdown>
        </div>
    );
}
