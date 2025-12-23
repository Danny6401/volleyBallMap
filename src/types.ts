export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'mixed';

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  level: SkillLevel;
}

export interface Court {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  tags: string[];
  images: string[];
  timeSlots: TimeSlot[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
