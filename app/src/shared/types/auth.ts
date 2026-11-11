export interface UserProfile {
  username: string;
  picture: string;
}

export interface Session {
  token: string;
  expiresIn: number;
  profile: UserProfile | null;
}
