// Owner: Harold Paulino
import {OPEN_WEATHER_API_KEY} from './config';
export type Weather = {
  name: string;
  weather: {main: string; description: string; icon: string}[];
  main: {temp: number; feels_like: number; temp_min: number; temp_max: number; humidity: number; pressure: number};
  wind: {speed: number; deg: number};
  sys: {country: string};
  dt: number;
};
async function request(params: Record<string, string>): Promise<Weather> {
  if (!OPEN_WEATHER_API_KEY.trim()) {
    throw new Error('Set your OpenWeather API key in src/config.ts.');
  }
  const query = new URLSearchParams({...params, appid: OPEN_WEATHER_API_KEY, units: 'imperial'}).toString();
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(typeof body.message === 'string' ? body.message : 'Unable to load weather.');
  }
  return body as Weather;
}
export function weatherByCity(city: string) {
  return request({q: `${city.trim()},US`});
}
export function weatherByCoordinates(latitude: number, longitude: number) {
  return request({lat: String(latitude), lon: String(longitude)});
}
