// components/markdown-editor/MarkdownPreview.tsx
interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-5 mb-3 text-gray-800 dark:text-gray-100">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-700 dark:text-gray-200">{line.substring(4)}</h3>;
      }
      
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Code inline
      line = line.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
      // Links
      line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
      
      // Blockquote
      if (line.startsWith('> ')) {
        return <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-3 text-gray-600 dark:text-gray-300 italic">{line.substring(2)}</blockquote>;
      }
      
      // List items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-6 my-1">{line.substring(2)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={index} className="ml-6 my-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      
      // Code block
      if (line.startsWith('```')) {
        const codeBlockEnd = text.indexOf('```', index + 3);
        if (codeBlockEnd !== -1) {
          const codeContent = text.substring(index + 3, codeBlockEnd);
          return (
            <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm">
              <code>{codeContent}</code>
            </pre>
          );
        }
      }
      
      // Image
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        return (
          <div key={index} className="my-4">
            <img 
              src={imageMatch[2]} 
              alt={imageMatch[1]} 
              className="max-w-full h-auto rounded-lg shadow-md"
            />
            {imageMatch[1] && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">{imageMatch[1]}</p>}
          </div>
        );
      }
      
      // Table
      if (line.includes('|')) {
        const cells = line.split('|').filter(cell => cell.trim());
        if (cells.length > 1) {
          return (
            <tr key={index}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          );
        }
      }
      
      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        return <hr key={index} className="my-6 border-gray-300 dark:border-gray-700" />;
      }
      
      // Paragraph
      if (line.trim()) {
        return <p key={index} className="my-3 leading-relaxed text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: line }} />;
      }
      
      return <br key={index} />;
    });
  };

  return (
    <div className="prose dark:prose-invert max-w-none">
      {renderMarkdown(content)}
    </div>
  );
}