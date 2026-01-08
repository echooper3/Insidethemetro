import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { City } from '../types';

interface WeatherWidgetProps {
  city: City;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city }) => {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const [lat, lng] = city.coordinates;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&temperature_unit=fahrenheit`
        );
        const data = await response.json();
        
        if (data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode
          });
        }
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (loading) return <div className="animate-pulse h-8 w-16 bg-slate-200 rounded-full"></div>;
  if (!weather) return null;

  // Map WMO Weather Codes to Icons
  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun size={18} className="text-amber-500" />; // Clear/Mainly Clear
    if (code === 2 || code === 3) return <Cloud size={18} className="text-slate-400" />; // Cloudy
    if (code >= 45 && code <= 48) return <Wind size={18} className="text-slate-500" />; // Fog
    if (code >= 51 && code <= 67) return <CloudRain size={18} className="text-blue-400" />; // Drizzle/Rain
    if (code >= 71 && code <= 77) return <CloudSnow size={18} className="text-cyan-300" />; // Snow
    if (code >= 80 && code <= 82) return <CloudRain size={18} className="text-blue-500" />; // Showers
    if (code >= 95) return <CloudLightning size={18} className="text-purple-500" />; // Thunderstorm
    return <Sun size={18} className="text-amber-500" />;
  };

  const getWeatherDescription = (code: number) => {
      if (code === 0) return 'Clear';
      if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
      if (code >= 51) return 'Rainy';
      return 'Clear';
  };

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 shadow-sm text-sm font-medium text-slate-700 cursor-default" title={`Current weather in ${city.name}`}>
      {getWeatherIcon(weather.code)}
      <span>{weather.temp}°F</span>
      <span className="hidden sm:inline text-slate-400 text-xs border-l border-slate-300 pl-2 ml-1">
          {getWeatherDescription(weather.code)}
      </span>
    </div>
  );
};

export default WeatherWidget;