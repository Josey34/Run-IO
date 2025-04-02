# Run-IO

## Description

Run-IO is a React Native Expo application designed to track and enhance your running experience. Built with TypeScript and JavaScript, it offers features similar to popular running apps like Strava, including real-time tracking, statistics, and social features.

## Features

-   **User Authentication**: Secure login and registration system
-   **Real-time Run Tracking**: Track your runs with GPS and get live statistics
-   **Statistics Dashboard**: View detailed statistics of your running history
-   **Challenge System**: Participate in running challenges
-   **Weather Integration**: Get real-time weather updates for your runs
-   **Interactive Maps**: Visual representation of your running routes
-   **Performance Analytics**: Detailed analysis of your running performance

## Technologies Used

-   React Native
-   Expo
-   TypeScript
-   JavaScript
-   Expo Location
-   React Native Maps
-   Expo Router
-   Chart.js for statistics

## Prerequisites

Before you begin, ensure you have installed:

-   Node.js (version 16 or higher)
-   npm or yarn
-   Expo CLI (`npm install -g expo-cli`)
-   Android Studio (for Android development)
-   Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Josey34/Run-IO.git
cd Run-IO
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm start
```

## Building the App

### Development Build

For testing during development:

```bash
npm run build:development
# or
eas build -p android --profile development
```

### Preview Build (APK)

For sharing with testers:

```bash
npm run build:preview
# or
eas build -p android --profile preview
```

### Production Build

For Play Store submission:

```bash
npm run build:production
# or
eas build -p android --profile production
```

### Build Configuration

The project uses EAS Build with different profiles:

```json
{
    "development": {
        "developmentClient": true,
        "distribution": "internal"
    },
    "preview": {
        "distribution": "internal",
        "android": {
            "buildType": "apk"
        }
    },
    "production": {
        "android": {
            "buildType": "app-bundle"
        }
    }
}
```

## Environment Setup

1. **Configure app.json:**

    - Update the `android.package` name
    - Set appropriate permissions
    - Configure adaptive icons

2. **Set up eas.json:**

    - Define build profiles
    - Configure build settings

3. **Android Setup:**
    - Configure SDK paths
    - Set up necessary permissions

## Available Scripts

```json
{
    "scripts": {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web",
        "build:development": "eas build --profile development --platform android",
        "build:preview": "eas build --profile preview --platform android",
        "build:production": "eas build --profile production --platform android",
        "build:list": "eas build:list",
        "build:logs": "eas build:logs"
    }
}
```

## Troubleshooting

If you encounter build issues:

1. Clear the build cache:

```bash
eas build:clean
```

2. Rebuild with verbose logging:

```bash
eas build -p android --profile preview --clear-cache --verbose
```

3. Common issues:
    - Ensure all permissions are properly configured in app.json
    - Check that all native dependencies are compatible
    - Verify Android SDK setup is correct

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Josey34 - GitHub: [@Josey34](https://github.com/Josey34)

Project Link: [https://github.com/Josey34/Run-IO](https://github.com/Josey34/Run-IO)
