import { api } from "./client";
import type { User } from "./auth";

/** GET /api/v1/users — all users (admin only). */
export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export interface ComplaintResponse {
  id: number;
  user_id: number;
  target_type: string;
  target_id: number;
  reason: string;
  status: string;
  created_at: string;
}

/** GET /api/v1/complaints — all complaints (admin only). */
export async function getComplaints(): Promise<ComplaintResponse[]> {
  const { data } = await api.get<ComplaintResponse[]>("/complaints");
  return data;
}
