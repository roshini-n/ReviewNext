import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private isNative = Capacitor.isNativePlatform();
  private deviceInfo: any = null;

  constructor() {
    this.initializeMobileFeatures();
  }

  private async initializeMobileFeatures() {
    if (this.isNative) {
      // Get device information
      this.deviceInfo = await Device.getInfo();
      
      // Set up app state listeners
      this.setupAppStateListeners();
      
      // Set up keyboard listeners
      this.setupKeyboardListeners();
    }
  }

  // Device Information
  async getDeviceInfo() {
    if (!this.deviceInfo && this.isNative) {
      this.deviceInfo = await Device.getInfo();
    }
    return this.deviceInfo;
  }

  isIOS(): boolean {
    return this.deviceInfo?.platform === 'ios';
  }

  isAndroid(): boolean {
    return this.deviceInfo?.platform === 'android';
  }

  isMobile(): boolean {
    return this.isNative;
  }

  // Status Bar Management
  async setStatusBarStyle(isDark: boolean = false) {
    if (this.isNative) {
      try {
        await StatusBar.setStyle({
          style: isDark ? Style.Dark : Style.Light
        });
      } catch (error) {
        console.warn('Status bar style not supported on this platform');
      }
    }
  }

  async setStatusBarColor(color: string) {
    if (this.isNative && this.isAndroid()) {
      try {
        await StatusBar.setBackgroundColor({ color });
      } catch (error) {
        console.warn('Status bar color not supported on this platform');
      }
    }
  }

  async hideStatusBar() {
    if (this.isNative) {
      try {
        await StatusBar.hide();
      } catch (error) {
        console.warn('Hide status bar not supported on this platform');
      }
    }
  }

  async showStatusBar() {
    if (this.isNative) {
      try {
        await StatusBar.show();
      } catch (error) {
        console.warn('Show status bar not supported on this platform');
      }
    }
  }

  // Keyboard Management
  private setupKeyboardListeners() {
    if (this.isNative) {
      Keyboard.addListener('keyboardWillShow', info => {
        document.body.classList.add('keyboard-open');
        // Adjust viewport if needed
        this.adjustViewportForKeyboard(info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
        this.resetViewport();
      });
    }
  }

  private adjustViewportForKeyboard(keyboardHeight: number) {
    // Add CSS class or adjust styles for keyboard
    const viewportHeight = window.innerHeight - keyboardHeight;
    document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
  }

  private resetViewport() {
    document.documentElement.style.removeProperty('--viewport-height');
  }

  async hideKeyboard() {
    if (this.isNative) {
      try {
        await Keyboard.hide();
      } catch (error) {
        console.warn('Hide keyboard not supported');
      }
    }
  }

  // Haptic Feedback
  async vibrate(style: ImpactStyle = ImpactStyle.Medium) {
    if (this.isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.warn('Haptics not supported on this device');
      }
    }
  }

  async vibrateSuccess() {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (error) {
        console.warn('Haptics not supported on this device');
      }
    }
  }

  async vibrateError() {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (error) {
        console.warn('Haptics not supported on this device');
      }
    }
  }

  async vibrateWarning() {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch (error) {
        console.warn('Haptics not supported on this device');
      }
    }
  }

  // App State Management
  private setupAppStateListeners() {
    if (this.isNative) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          this.onAppResume();
        } else {
          this.onAppPause();
        }
      });

      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          // Handle exit app or show exit confirmation
          this.handleAppExit();
        }
      });
    }
  }

  private onAppResume() {
    // Handle app resume
    console.log('App resumed');
    // You can add logic here for refreshing data, etc.
  }

  private onAppPause() {
    // Handle app pause
    console.log('App paused');
    // You can add logic here for saving state, etc.
  }

  private async handleAppExit() {
    // You can show a confirmation dialog here
    // For now, we'll just exit
    if (this.isNative) {
      try {
        await App.exitApp();
      } catch (error) {
        console.warn('Exit app not supported');
      }
    }
  }

  // Network Status (you might want to add @capacitor/network plugin for this)
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Screen Orientation (you might want to add @capacitor/screen-orientation plugin for this)
  isPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  isLandscape(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  // Safe Area Utilities
  getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: style.getPropertyValue('env(safe-area-inset-right)') || '0px'
    };
  }

  // Theme Support
  async updateStatusBarForTheme(isDarkTheme: boolean) {
    await this.setStatusBarStyle(!isDarkTheme); // Invert because dark theme needs light status bar
    
    if (this.isAndroid()) {
      const color = isDarkTheme ? '#000000' : '#004D35';
      await this.setStatusBarColor(color);
    }
  }

  // Utility Methods
  addMobileClass() {
    if (this.isNative) {
      document.body.classList.add('mobile-app');
      
      if (this.isIOS()) {
        document.body.classList.add('ios');
      } else if (this.isAndroid()) {
        document.body.classList.add('android');
      }
    }
  }

  removeMobileClass() {
    document.body.classList.remove('mobile-app', 'ios', 'android');
  }

  // Touch and Scroll Utilities
  preventPullToRefresh() {
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  private handleTouchStart(e: TouchEvent) {
    // Store the initial touch position
    (this as any).initialY = e.touches[0].clientY;
  }

  private handleTouchMove(e: TouchEvent) {
    // Prevent pull-to-refresh when scrolling down from the top
    const currentY = e.touches[0].clientY;
    const initialY = (this as any).initialY;
    
    if (initialY <= currentY && window.scrollY === 0) {
      e.preventDefault();
    }
  }
}