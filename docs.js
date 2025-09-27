
// 获取文档列表
export async function getDocsList(corsHeaders) {
  const docs = [
    {
      name: 'bing-daily-image',
      title: 'Bing每日一图API',
      description: '获取Bing搜索引擎的每日精美壁纸'
    },
    {
      name: 'weather',
      title: '天气查询API',
      description: '获取指定城市的天气信息'
    }
  ];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>API 文档中心</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .doc-item { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 5px; }
        .doc-item:hover { background-color: #f9f9f9; }
        .doc-title { color: #0066cc; text-decoration: none; font-size: 18px; font-weight: bold; }
        .doc-desc { color: #666; margin-top: 10px; }
        .back-link { color: #0066cc; text-decoration: none; }
      </style>
    </head>
    <body>
      <a href="/" class="back-link">← 返回首页</a>
      <h1>📚 API 文档中心</h1>
      ${docs.map(doc => `
        <div class="doc-item">
          <a href="/docs/${doc.name}" class="doc-title">${doc.title}</a>
          <div class="doc-desc">${doc.description}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 获取具体文档内容
export async function getDocContent(docName, corsHeaders) {
  const docs = {
    'bing-daily-image': {
      title: 'Bing每日一图API',
      content: `
# Bing每日一图API

## 接口地址
\`GET /api/bing-daily-image\`

## 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| format | string | 否 | 返回格式，支持 json、image，默认为 json |
| index | number | 否 | 图片索引，0为今天，1为昨天，最大7，默认为0 |
| mkt | string | 否 | 市场代码，如 zh-CN、en-US，默认为 zh-CN |
| archive | number | 否 | 设置为1时启用7天缓存 |

## 返回示例

### JSON格式 (默认)
\`\`\`json
{
  "url": "https://www.bing.com/th?id=OHR.xxx&rf=LaDigue_1920x1080.jpg",
  "title": "图片标题",
  "copyright": "版权信息",
  "date": "2024-01-01"
}
\`\`\`

### 图片格式
直接返回图片文件，可用于 \`<img>\` 标签

## 使用示例
\`\`\`javascript
// 获取JSON数据
fetch('/api/bing-daily-image')
  .then(res => res.json())
  .then(data => console.log(data));

// 直接获取图片
// <img src="/api/bing-daily-image?format=image" />

// 启用缓存
fetch('/api/bing-daily-image?archive=1')
  .then(res => res.json())
  .then(data => console.log(data));
\`\`\`
      `
    },
    'weather': {
      title: '天气查询API',
      content: `
# 天气查询API

## 接口地址
\`GET /api/weather\`

## 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| city | string | 是 | 城市名称，支持中英文 |
| archive | number | 否 | 设置为1时启用7天缓存 |

## 返回示例
\`\`\`json
{
  "city": "北京",
  "temperature": "15°C",
  "weather": "晴",
  "humidity": "45%",
  "wind": "东风2级",
  "updateTime": "2024-01-01 12:00:00"
}
\`\`\`

## 使用示例
\`\`\`javascript
// 查询天气
fetch('/api/weather?city=北京')
  .then(res => res.json())
  .then(data => console.log(data));

// 启用缓存
fetch('/api/weather?city=北京&archive=1')
  .then(res => res.json())
  .then(data => console.log(data));
\`\`\`
      `
    }
  };
  
  const doc = docs[docName];
  if (!doc) {
    return new Response('文档未找到', { 
      status: 404, 
      headers: corsHeaders 
    });
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${doc.title}</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          max-width: 900px; margin: 0 auto; padding: 20px; 
          line-height: 1.6; color: #333;
        }
        .back-link { color: #0066cc; text-decoration: none; margin-bottom: 20px; display: inline-block; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        code { 
          background: #f4f4f4; padding: 2px 6px; border-radius: 3px; 
          font-family: 'Consolas', 'Monaco', monospace;
        }
        pre { 
          background: #f8f9fa; padding: 20px; border-radius: 5px; overflow-x: auto;
          border-left: 4px solid #3498db;
        }
        pre code { background: none; padding: 0; }
      </style>
    </head>
    <body>
      <a href="/docs" class="back-link">← 返回文档列表</a>
      ${markdownToHtml(doc.content)}
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 简单的 Markdown 转 HTML
function markdownToHtml(markdown) {
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
    .replace(/\n/gim, '<br>');
}