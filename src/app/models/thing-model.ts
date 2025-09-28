// src/app/models/thing-model.ts

export interface Thing {
  id: string;
  name: string;
  description: string;
  location: string;
  photoURL: string;
  createdAt: string;
  owner: string;
  status: string;
  metadata: any;
}