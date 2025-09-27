// Bing每日一图API处理函数
export async function handleBingDailyImage(request, corsHeaders) {
  const url = new URL(request.url);
  const params = url.searchParams;
  
  const format = params.get('format') || 'json';
  const index = parseInt(params.get('index')) || 0;
  const mkt = params.get('mkt') || 'zh-CN';
  
  try {
    // 构建Bing API URL
    const bingUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=${index}&n=1&mkt=${mkt}`;
    
    // 获取Bing数据
    const response = await fetch(bingUrl);
    const data = await response.json();
    
    if (!data.images || data.images.length === 0) {
      return new Response(JSON.stringify({ error: 'No image found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const image = data.images[0];
    const imageUrl = `https://www.bing.com${image.url}`;
    const title = image.title || '';
    const copyright = image.copyright || '';
    const date = image.startdate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // 构建返回数据
    const imageData = {
      url: imageUrl,
      title: title,
      copyright: copyright,
      date: formatDate(date),
      original_url: imageUrl,
      thumbnail_url: imageUrl.replace('1920x1080', '480x270'),
      hd_url: imageUrl.replace('1920x1080', '1920x1200')
    };
    
    // 如果请求的是JSON格式
    if (format === 'json') {
      return new Response(JSON.stringify(imageData), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          // 不设置缓存头，让上层决定是否缓存
        }
      });
    }
    
    // 如果请求的是图片格式
    if (format === 'image') {
      // 直接获取原图
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      return new Response(imageBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/jpeg',
          // CF会自动缓存图片资源，这里设置合适的缓存头
          'Cache-Control': 'public, max-age=86400, s-maxage=604800', // 浏览器缓存1天，边缘缓存7天
        }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid format parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Bing API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch image',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 日期格式化函数
function formatDate(dateStr) {
  if (dateStr && dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return new Date().toISOString().slice(0, 10);
}