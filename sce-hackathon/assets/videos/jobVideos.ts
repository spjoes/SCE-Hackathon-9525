export interface JobVideo {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  uri: string; 
  thumbnail?: string;
}

export const jobVideos: JobVideo[] = [
  {
    id: '1',
    title: 'Manufacturing Engineer',
    company: 'NxEdge',
    location: 'San Francisco, CA',
    salary: '$120K - $180K',
    uri: 'https://rvaeseiisrojpkyhgsez.supabase.co/storage/v1/object/public/job_videos/NxEdge.mp4',
    thumbnail: 'https://placehold.co/300x400'
  }
];
