import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

const firebaseConfig = {
  apiKey: "AIzaSyC-rE5cWnoZKkzHdZUQpv31zidgrOAVp0k",
  authDomain: "reviewnext-69cb0.firebaseapp.com",
  projectId: "reviewnext-69cb0",
  storageBucket: "reviewnext-69cb0.firebasestorage.app",
  messagingSenderId: "586900651706",
  appId: "1:586900651706:web:b8c229bbac401e0f884c83",
  measurementId: "G-D461RQ7FTG"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
