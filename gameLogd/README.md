# 🎯 ReviewNext

**A comprehensive review and rating platform for games, books, movies, web series, electronic gadgets, and beauty products.**

ReviewNext is a modern Angular-based web application that allows users to discover, review, and rate products across multiple categories. Built with Angular 19, Angular Material, and powered by Firebase, it offers a seamless experience across web and mobile platforms.

## 🌟 Features

### 📱 Multi-Platform Support
- **Web Application**: Responsive design optimized for desktop and tablet
- **Progressive Web App (PWA)**: Installable web app with offline capabilities
- **Mobile Apps**: Native Android and iOS applications via Capacitor

### 🎮 Product Categories
- **Games**: Video games, board games, mobile games
- **Books**: Fiction, non-fiction, educational materials
- **Movies**: Films across all genres and languages  
- **Web Series**: TV shows, streaming content, documentaries
- **Electronic Gadgets**: Smartphones, laptops, accessories
- **Beauty Products**: Cosmetics, skincare, wellness products

### 👥 Role-Based Access Control

#### 🔍 **Visitor** (No Registration Required)
- Browse all product categories
- View product details and specifications
- Read reviews and ratings from other users
- Search and filter products
- Access trending and popular items

#### 👤 **Registered User** 
- All visitor privileges
- Create and submit reviews with ratings
- Edit and delete own reviews
- Add new products to any category
- Create and manage personal lists
- Profile management with avatar selection
- Review history and statistics

#### 🛡️ **Admin**
- Complete system access
- Moderate and edit all reviews
- Manage product listings across categories
- User management capabilities
- Content moderation tools
- System analytics and reporting

## 🚀 Quick Start

### 🌐 Access the Website

**Live Website**: [Your deployed URL here]

### 💻 Local Development

#### Prerequisites
- **Node.js** 18+ and npm
- **Angular CLI** 19+
- **Git**

#### Installation

```bash
# Clone the repository
git clone https://github.com/roshini-n/ReviewNext.git
cd ReviewNext/gameLogd

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4200/`

#### Environment Setup

1. **Firebase Configuration**: Create your Firebase project and update configuration in `src/environments/`
2. **API Keys**: Configure any external API keys for enhanced features

## 🔧 Available Commands

### Web Development
```bash
# Start development server
npm start

# Build for production  
npm run build

# Run tests
npm test

# Watch for changes (development build)
npm run watch
```

### 📱 Mobile Development

#### Prerequisites for Mobile
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Capacitor CLI**: `npm install -g @capacitor/cli`

#### Android Commands
```bash
# Build and sync Android project
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android

# Run on Android device
npx cap run android
```

#### iOS Commands  
```bash
# Build and sync iOS project
npm run build  
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run on iOS device
npx cap run ios
```

### 🔄 Development Workflow
```bash
# Live reload on device (Android)
npx cap run android --livereload --external

# Live reload on device (iOS)  
npx cap run ios --livereload --external
```

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Angular 19 with standalone components
- **UI Library**: Angular Material + PrimeNG
- **Styling**: CSS3 with responsive design
- **State Management**: Angular services with RxJS
- **Mobile**: Capacitor for native app deployment

### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Storage**: Firebase Storage (for images)

### Build & Deployment
- **Build Tool**: Angular CLI with Webpack
- **Mobile Build**: Capacitor
- **PWA**: Angular Service Worker

## 📂 Project Structure

```
gameLogd/
├── src/
│   ├── app/
│   │   ├── components/          # UI components
│   │   ├── services/           # Business logic services
│   │   ├── models/            # Data models and interfaces
│   │   ├── guards/            # Route guards
│   │   └── styles/            # Global styles
│   ├── assets/                # Static assets
│   └── environments/          # Environment configs
├── android/                   # Android Capacitor project
├── ios/                      # iOS Capacitor project
└── public/                   # Public assets
```

## 🎨 Features Overview

### User Authentication
- Email/password registration and login
- Social authentication (Google, Facebook)
- Password reset functionality
- Profile management

### Review System
- 5-star rating system
- Detailed text reviews
- Review editing and deletion
- Review moderation (admin)

### Product Management
- Category-based organization
- Advanced search and filtering
- User-submitted products
- Rich media support (images)

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Dark/light theme support

## 🔐 Security Features

- Firebase security rules
- Input validation and sanitization  
- Role-based access control
- Secure authentication flows

## 🚀 Deployment

### Web Deployment
```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### Mobile App Store Deployment
```bash
# Android - Generate signed APK
cd android
./gradlew assembleRelease

# iOS - Archive for App Store
# Use Xcode to archive and upload
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development Team

- **Frontend**: Angular 19 + Angular Material
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Mobile**: Capacitor (Android & iOS)
- **Deployment**: Firebase Hosting + App Stores

## 📞 Support

For support and questions:
- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/roshini-n/ReviewNext/issues)
- 📚 Documentation: [Wiki](https://github.com/roshini-n/ReviewNext/wiki)

---

**ReviewNext** - *Discover, Review, and Rate Everything!* 🌟
