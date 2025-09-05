import { JobVideo } from '@/assets/videos/jobVideos';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface JobVideoPlayerProps {
  videos: JobVideo[];
  initialIndex?: number;
}

interface VideoPlayerProps {
  video: JobVideo;
  isActive: boolean;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
}

const VideoPlayer = ({ video, isActive, isPlaying, onTogglePlayPause }: VideoPlayerProps) => {
  const player = useVideoPlayer(video.uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (isActive && isPlaying) {
      player.play();
    } else {
      player.pause();
      if (!isActive) {
        player.currentTime = 0;
      }
    }
  }, [isActive, isPlaying, player]);

  return (
    <TouchableOpacity
      style={styles.videoContainer}
      onPress={onTogglePlayPause}
      activeOpacity={1}
    >
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />
    </TouchableOpacity>
  );
};

const JobVideoPlayer: React.FC<JobVideoPlayerProps> = ({ 
  videos, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const translateY = useSharedValue(0);

  const getCurrentVideos = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    const nextIndex = (currentIndex + 1) % videos.length;
    
    return {
      previous: videos[prevIndex],
      current: videos[currentIndex],
      next: videos[nextIndex],
      prevIndex,
      nextIndex,
    };
  };

  const { previous, current, next, prevIndex, nextIndex } = getCurrentVideos();

  const goToNext = () => {
    setCurrentIndex(nextIndex);
    translateY.value = 0;
  };

  const goToPrevious = () => {
    setCurrentIndex(prevIndex);
    translateY.value = 0;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      runOnJS(setIsScrolling)(true);
      runOnJS(setIsPlaying)(false);
    },
    onActive: (event) => {
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const shouldGoToNext = event.translationY < -SCREEN_HEIGHT * 0.25;
      const shouldGoToPrevious = event.translationY > SCREEN_HEIGHT * 0.25;

      runOnJS(setIsScrolling)(false);

      if (shouldGoToNext) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 }, () => {
          runOnJS(goToNext)();
          runOnJS(setIsPlaying)(true);
        });
      } else if (shouldGoToPrevious) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
          runOnJS(goToPrevious)();
          runOnJS(setIsPlaying)(true);
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
        runOnJS(setIsPlaying)(true);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const renderVideoItem = (video: JobVideo, isActive: boolean = false) => (
    <View style={styles.videoContainer}>
      <VideoPlayer 
        video={video} 
        isActive={isActive} 
        isPlaying={isPlaying} 
        onTogglePlayPause={togglePlayPause} 
      />
      
      <View style={styles.overlay}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{video.title}</Text>
          <Text style={styles.companyName}>{video.company}</Text>
          <Text style={styles.location}>{video.location}</Text>
          <Text style={styles.salary}>{video.salary}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View 
        style={styles.playPauseOverlay}
        pointerEvents="none"
      >
        {!isPlaying && isActive && !isScrolling && (
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶️</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={[styles.videoWrapper, { top: -SCREEN_HEIGHT }]}>
            {renderVideoItem(previous)}
          </View>

          <View style={styles.videoWrapper}>
            {renderVideoItem(current, true)}
          </View>

          <View style={[styles.videoWrapper, { top: SCREEN_HEIGHT }]}>
            {renderVideoItem(next)}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    alignItems: 'flex-end',
  },
  jobInfo: {
    flex: 1,
    marginRight: 20,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  companyName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  location: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  salary: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    alignItems: 'center',
    gap: 15,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 24,
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 32,
    marginLeft: 5,
  },
});

export default JobVideoPlayer;

