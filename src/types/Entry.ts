import { Media } from './Media';

export interface Entry {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  date: string;
  media?: Media[];
}
