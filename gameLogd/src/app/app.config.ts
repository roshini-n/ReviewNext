import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

const firebaseConfig = {
  apiKey: "AIzaSyBgnAfd9fgw6KIfvYSitl0sqr5_TkJRF3M",
  authDomain: "gamelogd.firebaseapp.com",
  projectId: "gamelogd",
  storageBucket: "gamelogd.firebasestorage.app",
  messagingSenderId: "510500857955",
  appId: "1:510500857955:web:49f548fc34e51d77d07056",
  measurementId: "G-84SCQEN0M4"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNativeDateAdapter(),
    [
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
      provideStorage(() => getStorage())
    ],
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }), provideAnimationsAsync()
  ],
};
