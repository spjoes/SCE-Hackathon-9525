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
  },
  {
    id: '2',
    title: 'AI Engineer',
    company: 'DeepSky',
    location: 'San Jose, CA',
    salary: '$90K - $140K',
    uri: 'https://rvaeseiisrojpkyhgsez.supabase.co/storage/v1/object/public/job_videos/Three.mp4',
    thumbnail: 'https://placehold.co/300x400'
  },
  {
    id: '3',
    title: 'Platform Engineer',
    company: 'Aptos Labs',
    location: 'San Jose, CA',
    salary: '$160K - $260K',
    uri: 'https://rvaeseiisrojpkyhgsez.supabase.co/storage/v1/object/public/job_videos/Four.mp4',
    thumbnail: 'https://placehold.co/300x400'
  },
  {
    id: '4',
    title: 'Scenario Engineer',
    company: 'Applied Intuition',
    location: 'Palo Alto, CA',
    salary: '$100K - $150K',
    uri: 'https://rvaeseiisrojpkyhgsez.supabase.co/storage/v1/object/public/job_videos/Two.mp4',
    thumbnail: 'https://placehold.co/300x400'
  }
];
