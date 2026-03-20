import { Media } from './Media';

export interface Entry {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  date: string;
  time?: string;
  location?: string;
  weather?: string;
  media?: Media[];
}
