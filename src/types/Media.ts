export interface Media {
  id: string;
  entryId: string;
  type: "image" | "video" | "audio" | "file";
  path: string;
  preview?: string;
  createdAt: number;
}
