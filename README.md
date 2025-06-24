# Run-IO

## Overview

**Run-IO** is a React Native Expo application for tracking and improving your running experience. It provides real-time GPS tracking, personalized recommendations, statistics, challenges, and weather integration.

## Features

- **User Authentication**: Secure registration and login
- **Real-time Run Tracking**: GPS-based run tracking with live stats
- **Statistics Dashboard**: Visualize your running history and progress
- **Challenge System**: Daily and custom running challenges using machine learning
- **Weather Integration**: Real-time weather for your location
- **Interactive Maps**: Route visualization using React Native Maps
- **Performance Analytics**: In-depth analysis of your runs

## Tech Stack

- React Native (Expo)
- TypeScript & JavaScript
- Expo Location, Expo Router, Expo Sensors
- React Native Maps
- Chart.js (for statistics)
- Axios (API requests)
- EAS Build (for deployment)

## Prerequisites

- Node.js (16+, preferably 22)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

## Getting Started

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

- **Development Build:**
    ```bash
    npm run build:development
    # or
    eas build -p android --profile development
    ```

- **Preview Build (APK):**
    ```bash
    npm run build:preview
    # or
    eas build -p android --profile preview
    ```

- **Production Build:**
    ```bash
    npm run build:production
    # or
    eas build -p android --profile production
    ```

### EAS Build Profiles

See `eas.json` for build profiles. Example:
```json
{
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "android": { "buildType": "app-bundle" } }
}
```

## Environment Setup

- Configure `app.json` for package name, permissions, and icons.
- Set up `eas.json` for build profiles.
- Ensure Android/iOS permissions are set for location and background tasks.

## Scripts

```json
{
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
```

## Troubleshooting

- **Clear build cache:**
    ```bash
    eas build:clean
    ```
- **Rebuild with verbose logging:**
    ```bash
    eas build -p android --profile preview --clear-cache --verbose
    ```
- **Common issues:**
    - Check permissions in `app.json`
    - Ensure native dependencies are compatible
    - Verify Android/iOS SDK setup

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## License

MIT License. See [LICENSE](LICENSE).

## Contact

- GitHub: [@Josey34](https://github.com/Josey34)
- Project: [https://github.com/Josey34/Run-IO](https://github.com/Josey34/Run-IO)
- Linkedin: (www.linkedin.com/in/josey-takesan-88713230a)
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
