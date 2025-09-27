// 天气API处理函数
export async function handleWeather(request, env, corsHeaders) {
  const url = new URL(request.url);
  const params = url.searchParams;
  
  const city = params.get('city');
  
  if (!city) {
    return new Response(JSON.stringify({ 
      error: 'Missing city parameter',
      example: '/api/weather?city=北京'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // 这里使用免费天气API，你可以替换为其他API
    // 示例使用 OpenWeatherMap 或其他免费服务
    const weatherData = await getWeatherData(city, env);
    
    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Weather API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 获取天气数据
async function getWeatherData(city, env) {
  // 模拟天气数据，实际使用时替换为真实API
  // 例如使用 OpenWeatherMap、和风天气等
  
  const mockData = {
    '北京': {
      city: '北京',
      temperature: '15°C',
      weather: '晴',
      humidity: '45%',
      wind: '东风2级',
      pressure: '1013hPa',
      visibility: '10km',
      updateTime: new Date().toLocaleString('zh-CN')
    },
    '上海': {
      city: '上海',
      temperature: '18°C',
      weather: '多云',
      humidity: '65%',
      wind: '南风3级',
      pressure: '1015hPa',
      visibility: '8km',
      updateTime: new Date().toLocaleString('zh-CN')
    }
  };
  
  if (mockData[city]) {
    return mockData[city];
  }
  
  // 实际API调用示例（需要API密钥）
  /*
  if (env.WEATHER_API_KEY) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${env.WEATHER_API_KEY}&units=metric&lang=zh_cn`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return {
      city: data.name,
      temperature: `${Math.round(data.main.temp)}°C`,
      weather: data.weather[0].description,
      humidity: `${data.main.humidity}%`,
      wind: `${data.wind.speed}m/s`,
      pressure: `${data.main.pressure}hPa`,
      visibility: `${(data.visibility / 1000).toFixed(1)}km`,
      updateTime: new Date().toLocaleString('zh-CN')
    };
  }
  */
  
  // 默认返回模拟数据
  return {
    city: city,
    temperature: '未知',
    weather: '数据暂不可用',
    humidity: '未知',
    wind: '未知',
    pressure: '未知',
    visibility: '未知',
    updateTime: new Date().toLocaleString('zh-CN'),
    note: '这是示例数据，请配置真实的天气API'
  };
}