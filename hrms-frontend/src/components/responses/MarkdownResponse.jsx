
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownResponse({ content }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-700
      prose-headings:font-semibold
      prose-headings:text-gray-900
      prose-p:leading-7
      prose-strong:text-gray-900
      prose-a:text-blue-600
      prose-code:bg-gray-100
      prose-code:px-1
      prose-code:rounded
      prose-pre:bg-gray-900
      prose-pre:text-gray-100
      prose-table:border-collapse
      prose-th:bg-gray-100
      prose-th:px-3
      prose-th:py-2
      prose-td:border
      prose-td:border-gray-200
      prose-td:px-3
      prose-td:py-2">

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || ""}
      </ReactMarkdown>

    </div>
  );
}

export default MarkdownResponse;
