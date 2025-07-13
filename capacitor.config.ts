import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8da2f6ad10c846bc86fd5c6d7f52edd9',
  appName: 'NEXUS MINT',
  webDir: 'dist',
  server: {
    url: 'https://8da2f6ad-10c8-46bc-86fd-5c6d7f52edd9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0f23',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f0f23'
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;