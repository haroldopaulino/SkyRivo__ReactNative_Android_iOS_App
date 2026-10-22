// Owner: Harold Paulino
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator, Image, Keyboard, PermissionsAndroid, Platform,
  Pressable, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Weather, weatherByCity, weatherByCoordinates} from './weather';

const colors = {
  background: '#07111F', surface: '#0D1B2D', surfaceVariant: '#16263A',
  foreground: '#EAF6FF', muted: '#B8C7D9', primary: '#45C7FF', secondary: '#8BD8FF', error: '#FFB4AB',
};
const lastCityKey = 'skyrivo_last_city';
const degrees = (value: number) => `${Math.round(value)}°F`;
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function WeatherRow({label, value}: {label: string; value: string}) {
  return <View style={styles.detailRow}><Text style={styles.muted}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

function WeatherCard({weather}: {weather: Weather}) {
  const condition = weather.weather[0];
  const updated = weather.dt > 0 ? new Date(weather.dt * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }) : '--';
  return <View style={styles.card}>
    <Text style={styles.cityTitle}>{[weather.name, weather.sys?.country].filter(Boolean).join(', ')}</Text>
    {condition?.icon ? <Image style={styles.weatherIcon} source={{uri: `https://openweathermap.org/img/wn/${condition.icon}@4x.png`}} accessibilityLabel={condition.description} /> : null}
    <Text style={styles.temperature}>{degrees(weather.main.temp)}</Text>
    <Text style={styles.description}>{capitalize(condition?.description || 'Current weather')}</Text>
    <View style={styles.details}>
      <WeatherRow label="Feels like" value={degrees(weather.main.feels_like)} />
      <WeatherRow label="Low / High" value={`${degrees(weather.main.temp_min)} / ${degrees(weather.main.temp_max)}`} />
      <WeatherRow label="Humidity" value={`${weather.main.humidity}%`} />
      <WeatherRow label="Wind" value={`${Math.round(weather.wind.speed)} mph`} />
      <WeatherRow label="Pressure" value={`${weather.main.pressure} hPa`} />
      <WeatherRow label="Updated" value={updated} />
    </View>
  </View>;
}

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadCity = useCallback(async (name: string) => {
    if (!name.trim()) {setError('Enter a US city.'); return;}
    setLoading(true); setError(null); Keyboard.dismiss();
    try {
      const result = await weatherByCity(name);
      await AsyncStorage.setItem(lastCityKey, name.trim());
      setWeather(result); setCity(name.trim());
    } catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to load weather.');}
    finally {setLoading(false);}
  }, []);
  const loadLocation = useCallback(async (fallback = true) => {
    setLoading(true); setError(null);
    try {
      if (Platform.OS === 'android') {
        const allowed = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (allowed !== PermissionsAndroid.RESULTS.GRANTED) {throw new Error('Location permission denied.');}
      }
      const position = await new Promise<{coords: {latitude: number; longitude: number}}>((resolve, reject) =>
        Geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy: false, timeout: 15000, maximumAge: 60000}),
      );
      const result = await weatherByCoordinates(position.coords.latitude, position.coords.longitude);
      setWeather(result); setCity(result.name);
      if (result.name) {await AsyncStorage.setItem(lastCityKey, result.name);}
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Current location is unavailable.');
      if (fallback) {
        const saved = await AsyncStorage.getItem(lastCityKey).catch(() => null);
        if (saved) {await loadCity(saved);}
      }
    } finally {setLoading(false);}
  }, [loadCity]);
  useEffect(() => {void loadLocation();}, [loadLocation]);
  return <SafeAreaProvider>
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <StatusBar backgroundColor={colors.background} barStyle="light-content" translucent={false} />
    <View style={styles.header}><Text style={styles.heading}>SkyRivo</Text></View>
    <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Look up current weather by US city.</Text>
      <View style={styles.searchRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput accessibilityLabel="City"
            autoCapitalize="words" returnKeyType="search" onSubmitEditing={() => void loadCity(city)}
            style={styles.input} value={city} onChangeText={setCity} />
        </View>
        <Pressable accessibilityRole="button" onPress={() => void loadCity(city)} style={styles.button}><Text style={styles.buttonText}>Search</Text></Pressable>
      </View>
      {loading && <ActivityIndicator style={styles.loading} color={colors.primary} size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {weather && <WeatherCard weather={weather} />}
    </ScrollView>
    </SafeAreaView>
  </SafeAreaProvider>;
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  header: {paddingHorizontal: 16, height: 64, justifyContent: 'center'},
  heading: {color: colors.foreground, fontSize: 22, fontWeight: '400'},
  scroll: {flex: 1}, content: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, gap: 18},
  subtitle: {color: colors.muted, fontSize: 16, fontWeight: '500'},
  searchRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  inputContainer: {flex: 1, minWidth: 0, height: 56, justifyContent: 'center'},
  inputLabel: {position: 'absolute', top: -7, left: 12, zIndex: 1, paddingHorizontal: 5,
    color: colors.muted, backgroundColor: colors.background, fontSize: 12},
  input: {height: 56, borderColor: colors.muted, borderWidth: 1, borderRadius: 5,
    paddingHorizontal: 16, paddingVertical: 0, color: colors.foreground, fontSize: 16},
  button: {backgroundColor: colors.primary, borderRadius: 24, paddingHorizontal: 20, height: 42, justifyContent: 'center'},
  buttonText: {color: '#001F2D', fontSize: 14, fontWeight: '600'},
  loading: {marginTop: 8}, error: {color: colors.error, fontSize: 14},
  card: {backgroundColor: colors.surface, borderRadius: 28, padding: 24, alignItems: 'center', width: '100%'},
  cityTitle: {color: colors.foreground, fontSize: 24, fontWeight: '700', textAlign: 'center'},
  weatherIcon: {height: 140, width: 140},
  temperature: {color: colors.foreground, fontSize: 57, fontWeight: '700'},
  description: {color: colors.secondary, fontSize: 21, marginTop: 4, textAlign: 'center'},
  details: {backgroundColor: colors.surfaceVariant, borderRadius: 20, padding: 18, width: '100%', marginTop: 20, gap: 12},
  detailRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10},
  muted: {color: colors.muted, fontSize: 14, flexShrink: 1},
  detailValue: {color: colors.foreground, fontSize: 14, fontWeight: '600', textAlign: 'right', flexShrink: 1},
});
