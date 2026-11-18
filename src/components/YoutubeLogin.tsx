import { View, TouchableOpacity, Text } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';
import * as SecureStore from 'expo-secure-store';

const LOGIN_URL =
  'https://accounts.google.com/ServiceLogin?service=youtube&continue=https://music.youtube.com/';

interface Props {
  onLoginSuccess: (cookieString: string) => void;
  onClose: () => void;
}

export function YouTubeLogin({ onLoginSuccess, onClose }: Props) {
  const handleNavigationChange = async (navState: WebViewNavigation) => {
    if (navState.url.startsWith('https://music.youtube.com')) {
      const cookies = await CookieManager.get('https://music.youtube.com');
      if (cookies.SAPISID || cookies['__Secure-3PAPISID']) {
        const cookieString = Object.values(cookies)
          .map((c) => `${c.name}=${c.value}`)
          .join('; ');

        await SecureStore.setItemAsync('yt_cookie', cookieString);
        onLoginSuccess(cookieString);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center justify-between bg-neutral-900 px-4 py-3">
        <Text className="font-bold text-white">Iniciar sesión en YouTube</Text>
        <TouchableOpacity onPress={onClose} className="rounded bg-neutral-800 px-3 py-1">
          <Text className="text-xs text-white">Cerrar</Text>
        </TouchableOpacity>
      </View>

      <WebView
        source={{ uri: LOGIN_URL }}
        onNavigationStateChange={handleNavigationChange}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />
    </View>
  );
}
