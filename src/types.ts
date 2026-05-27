export interface Waypoint {
  id: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionZh?: string;
  address?: string;
  addressZh?: string;
  distance?: string;
  distanceZh?: string;
  rating?: number;
  imageUrl?: string;
  openStatus?: 'OPEN' | 'CLOSED';
}

export interface Route {
  id: string;
  name: string;
  nameZh?: string;
  category: string;
  categoryZh?: string;
  description: string;
  descriptionZh?: string;
  distanceNum: number; // in km
  durationMin: number; // in minutes
  rating: number;
  imageUrl: string;
  mapUrl: string;
  waypoints: Waypoint[];
}

export interface UserPersona {
  name: string;
  nameZh?: string;
  title: string;
  titleZh?: string;
  interests: string[];
  budgetLevel: 'budget' | 'mid' | 'luxury';
  pace: 'relaxed' | 'active';
  stats: {
    checkins: number;
    badges: number;
    latestAchievement: string;
    latestAchievementZh?: string;
  };
}

export interface GroupMember {
  id: string;
  name: string;
  nameZh?: string;
  distanceLeft: string;
  distanceLeftZh?: string;
  progress: number; // percentage
  status: 'lead' | 'following' | 'waypoint';
  waypointText: string;
  waypointTextZh?: string;
  avatar: string;
  role?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  textZh?: string;
  time: string;
  isMe: boolean;
}
