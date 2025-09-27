// 导入所有必要的模块
import { getDocsList, getDocContent } from './docs.js';
import { handleBingDailyImage } from './apis/bing-img.js';
import { handleWeather } from './apis/weather.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS 头部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // 处理 OPTIONS 请求
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // 路由分发
      if (path.startsWith('/docs')) {
        return await handleDocs(request, corsHeaders);
      } else if (path.startsWith('/api')) {
        return await handleApi(request, env, ctx, corsHeaders);
      } else if (path === '/') {
        return await handleHome(corsHeaders);
      } else {
        return new Response('404 Not Found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// 处理文档路由
async function handleDocs(request, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (path === '/docs' || path === '/docs/') {
    return await getDocsList(corsHeaders);
  }
  
  // 获取具体文档
  const docName = path.replace('/docs/', '');
  return await getDocContent(docName, corsHeaders);
}

// 处理 API 路由
async function handleApi(request, env, ctx, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams;
  
  // 检查是否需要使用 CF 缓存
  const useCache = searchParams.get('archive') === '1';
  
  // 如果启用缓存，创建缓存键
  let cacheKey;
  if (useCache) {
    cacheKey = new Request(url.toString(), request);
  }
  
  // 尝试从 CF 缓存获取响应
  if (useCache && cacheKey) {
    const cache = caches.default;
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      // 添加缓存命中标识
      const response = new Response(cachedResponse.body, cachedResponse);
      response.headers.set('X-Cache', 'HIT');
      return response;
    }
  }
  
  let response;
  
  // API 路由分发
  if (path === '/api/bing-img') {
    response = await handleBingDailyImage(request, corsHeaders);
  } else if (path === '/api/weather') {
    response = await handleWeather(request, corsHeaders);
  } else {
    response = new Response(JSON.stringify({ 
      error: 'API not found',
      available: ['/api/bing-img', '/api/weather']
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 如果启用缓存且响应成功，存储到 CF 缓存
  if (useCache && response.status === 200 && cacheKey) {
    // 克隆响应用于缓存
    const responseToCache = response.clone();
    
    // 设置缓存头
    responseToCache.headers.set('Cache-Control', 'public, max-age=604800'); // 7天
    responseToCache.headers.set('X-Cache', 'MISS');
    
    // 存储到 CF 缓存
    ctx.waitUntil(caches.default.put(cacheKey, responseToCache));
  }
  
  return response;
}

// 首页
async function handleHome(corsHeaders) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Documentation</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          max-width: 800px; margin: 0 auto; padding: 20px; 
          background: #f8f9fa; color: #333;
        }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .nav { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 15px; 
          margin: 20px 0; 
        }
        .nav-item { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          text-decoration: none; 
          color: #333;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .nav-item:hover { 
          background: #e3f2fd; 
          border-color: #2196f3;
          transform: translateY(-2px);
        }
        .nav-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
        .nav-desc { color: #666; font-size: 14px; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .feature { 
          background: #e8f5e8; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0;
          border-left: 4px solid #4caf50;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 API 服务中心</h1>
        
        <div class="feature">
          <strong>✨ 特性：</strong> 支持 Cloudflare 边缘缓存、CORS跨域、多种输出格式
        </div>
        
        <div class="nav">
          <a href="/docs" class="nav-item">
            <div class="nav-title">📚 文档中心</div>
            <div class="nav-desc">查看所有API的详细文档和使用说明</div>
          </a>
          <a href="/api/bing-img" class="nav-item">
            <div class="nav-title">🖼️ Bing每日一图</div>
            <div class="nav-desc">获取Bing搜索的精美每日壁纸</div>
          </a>
          <a href="/api/weather?city=北京" class="nav-item">
            <div class="nav-title">🌤️ 天气查询(未接入)</div>
            <div class="nav-desc">查询指定城市的实时天气信息</div>
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>💡 提示：在API请求中添加 <code>archive=1</code> 参数可启用7天边缘缓存</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600' // 首页缓存1小时
    }
  });
}