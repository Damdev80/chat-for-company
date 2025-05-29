import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/vs2015.css'
import '../styles/markdown.css'

const testMarkdown = `
# Prueba de Markdown

**Texto en negrita** y *texto en cursiva*

## Código JavaScript

\`\`\`javascript
function saludar() {
  console.log("¡Hola mundo!");
}
saludar();
\`\`\`

## Lista de tareas

- [x] Tarea completada
- [ ] Tarea pendiente
- Elemento normal

## Tabla

| Nombre | Edad | Ciudad |
|--------|------|--------|
| Juan   | 25   | Madrid |
| Ana    | 30   | Barcelona |

## Código inline

Esto es \`código inline\` en el texto.
`

export default function MarkdownTest() {
  return (
    <div className="p-4 bg-[#1E1E2E] text-white">
      <h2 className="text-xl font-bold mb-4">Prueba de ReactMarkdown</h2>      <div className="bg-[#2D2D3A] p-4 rounded-lg prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: ({inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <pre className="bg-[#1E1E2E] p-3 rounded-lg border border-[#3C3C4E] overflow-x-auto my-2">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code className="bg-[#1E1E2E] px-1.5 py-0.5 rounded text-sm border border-[#3C3C4E] text-[#4ADE80]" {...props}>
                  {children}
                </code>
              )
            },
            table: ({children}) => (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-[#3C3C4E] rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({children}) => (
              <thead className="bg-[#2D2D3A]">
                {children}
              </thead>
            ),
            tbody: ({children}) => (
              <tbody className="divide-y divide-[#3C3C4E]">
                {children}
              </tbody>
            ),
            tr: ({children}) => (
              <tr className="hover:bg-[#2D2D3A]">
                {children}
              </tr>
            ),
            td: ({children}) => (
              <td className="px-3 py-2 text-sm border-r border-[#3C3C4E] last:border-r-0">
                {children}
              </td>
            ),
            th: ({children}) => (
              <th className="px-3 py-2 text-sm font-bold text-white border-r border-[#3C3C4E] last:border-r-0 text-left">
                {children}
              </th>
            )
          }}
        >
          {testMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  )
}
