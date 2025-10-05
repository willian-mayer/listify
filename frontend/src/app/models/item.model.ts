export interface Item {
  id?: number;
  list_id: number;
  name: string;
  checked: boolean;
  created_at?: string;
  updated_at?: string;
}