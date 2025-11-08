import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-black dark:text-white" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-black dark:text-white" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-black dark:text-white" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-3 mb-2 text-black dark:text-white" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />,
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-black dark:text-white" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="overflow-x-auto" {...props} />,
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400" 
              {...props} 
            />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-300 dark:border-gray-600" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
          th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-semibold border border-gray-300 dark:border-gray-600" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-2 border border-gray-300 dark:border-gray-600" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
