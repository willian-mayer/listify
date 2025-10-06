export interface List {
  id?: number;
  title: string;
  description?: string;
  user_id?: number;
  share_token?: string | null;  // NUEVO
  is_shared?: boolean;           // NUEVO
  created_at?: string;
  updated_at?: string;
}

// NUEVO - Para la respuesta de compartir
export interface ShareLinkResponse {
  share_token: string;
  share_url: string;
}