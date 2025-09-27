// md-converter.js - Markdown 转 HTML
async function convertMDToHTML(mdContent, title = 'Document') {
  // 简单的 Markdown 解析器
  let html = mdContent
    // 标题
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 链接和图片
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    // 粗体和斜体
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 列表
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|p|c])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; margin: 0 auto; padding: 20px; 
            line-height: 1.6; color: #333; 
        }
        h1, h2, h3 { color: #2c3e50; }
        code { 
            background: #f4f4f4; padding: 2px 4px; border-radius: 3px; 
            font-family: 'Courier New', monospace; 
        }
        pre { 
            background: #f8f8f8; padding: 15px; border-radius: 5px; 
            overflow-x: auto; border-left: 4px solid #007acc; 
        }
        pre code { background: none; padding: 0; }
        a { color: #007acc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="content">
        ${html}
    </div>
</body>
</html>
  `;
}