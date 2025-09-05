import { jobVideos } from '@/assets/videos/jobVideos';
import JobVideoPlayer from '@/components/JobVideoPlayer';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <JobVideoPlayer videos={jobVideos} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
