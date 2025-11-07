import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

// Configure Capacitor plugins for mobile
async function initializeApp() {
  if (Capacitor.isNativePlatform()) {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Default });
    await StatusBar.setBackgroundColor({ color: '#004D35' });
    
    // Configure Keyboard
    Keyboard.setAccessoryBarVisible({ isVisible: true });
    
    // Hide splash screen after app is ready
    await SplashScreen.hide();
  }
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => initializeApp())
  .catch((err) => console.error(err));