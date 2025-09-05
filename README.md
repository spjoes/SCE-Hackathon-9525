# JobSwipe: Tiktok-like Job Discovery Platform

JobSwipe is a mobile application built with React Native and Expo to revolutionize the job search experience. It presents job opportunities in a brainrot-short-form video format, allowing users to swipe through listings.

## ✨ Features

- **Vertical Video Feed**: An immersive, full-screen video feed for browsing job posts.
- **Gesture Navigation**: Intuitively swipe up and down to discover new job opportunities.
- **Detailed Job Information**: Each video is accompanied by essential details like job title, company, location, and salary.

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Video Playback**: `expo-video`
- **Animations & Gestures**: `react-native-reanimated`, `react-native-gesture-handler`
- **Navigation**: Expo Router (file-based routing)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed.
- Expo Go app on your mobile device or an emulator/simulator setup.

### Installation & Running

1.  Install NPM packages:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npx expo start
    ```
This will open the Expo developer tools in your browser. You can then scan the QR code with the Expo Go app on your phone or run the app on an emulator/simulator.

## 📂 Project Structure

The main logic for the application can be found in the following files:

-   `app/index.tsx`: The main screen of the app that renders the video player.
-   `components/JobVideoPlayer.tsx`: The core component for the video feed, handling gestures, state management, and video playback.
-   `assets/videos/jobVideos.ts`: A mock data source for the job video listings.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
