export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithCounts extends Post {
  nickname: string;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, 'nickname' | 'avatar_url'>;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  post_id: string | null;
  type: 'like' | 'comment';
  is_read: boolean;
  created_at: string;
  actor?: Pick<Profile, 'nickname' | 'avatar_url'>;
  post?: Pick<Post, 'title' | 'image_url'>;
}

export type NavTab = 'home' | 'popular' | 'latest' | 'following' | 'mypage';
