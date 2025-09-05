// Sample job video data structure
// Replace the uri values with actual video file paths when you have videos

export interface JobVideo {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  tags: string[];
  uri: string; // This should be the path to your video file
  thumbnail?: string;
}

export const jobVideos: JobVideo[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: '$120K - $180K',
    description: 'Join our team building the next generation of cloud infrastructure. Work with cutting-edge technologies and solve complex distributed systems challenges.',
    tags: ['React Native', 'TypeScript', 'AWS', 'Docker'],
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video URL
    thumbnail: 'https://placehold.co/300x400'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'DesignStudio',
    location: 'New York, NY',
    salary: '$90K - $130K',
    description: 'Create beautiful, user-centered designs that solve real problems. Work closely with engineers and product managers in an agile environment.',
    tags: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Sample video URL
    thumbnail: 'https://placehold.co/300x400'
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'AI Innovations',
    location: 'Austin, TX',
    salary: '$110K - $160K',
    description: 'Analyze large datasets to drive business insights. Build machine learning models and work with cross-functional teams to implement data-driven solutions.',
    tags: ['Python', 'Machine Learning', 'SQL', 'Tableau'],
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Sample video URL
    thumbnail: 'https://placehold.co/300x400'
  },
  {
    id: '4',
    title: 'Marketing Manager',
    company: 'GrowthCo',
    location: 'Remote',
    salary: '$80K - $120K',
    description: 'Lead marketing campaigns that drive user acquisition and engagement. Manage social media, content creation, and performance analytics.',
    tags: ['Digital Marketing', 'Analytics', 'Content Strategy', 'SEO'],
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Sample video URL
    thumbnail: 'https://placehold.co/300x400'
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudFirst',
    location: 'Seattle, WA',
    salary: '$130K - $170K',
    description: 'Build and maintain scalable infrastructure. Automate deployments, monitor systems, and ensure high availability across our platform.',
    tags: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // Sample video URL
    thumbnail: 'https://placehold.co/300x400'
  }
];
