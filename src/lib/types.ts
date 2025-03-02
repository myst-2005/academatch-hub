
export enum School {
  Coding = "Coding",
  Marketing = "Marketing",
  Design = "Design"
}

export enum Batch {
  C1 = "C1",
  C2 = "C2",
  C3 = "C3",
  C4 = "C4",
  M1 = "M1",
  M2 = "M2",
  M3 = "M3",
  D1 = "D1",
  D2 = "D2",
  D3 = "D3"
}

export enum ApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected"
}

export interface Skill {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  user_id?: string;
  name: string;
  batch: Batch;
  school: School;
  skills: Skill[];
  yearsOfExperience: number;
  linkedinUrl: string;
  resumeUrl?: string;
  status: ApprovalStatus;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface SearchQuery {
  text: string;
  school?: School;
  batch?: Batch;
  skills?: string[];
  minExperience?: number;
}
