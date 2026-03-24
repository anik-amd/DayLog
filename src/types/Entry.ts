import { Media } from './Media';

export interface Entry {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  date: string;
  time?: string;
  latitude?: number;
  longitude?: number;
  locationFull?: string;
  locationDisplay?: string;
  weather?: string;
  tags?: string;
  media?: Media[];
}
