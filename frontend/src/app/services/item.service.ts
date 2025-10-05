import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  getItems(listId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/list/${listId}/`);
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}/`);
  }

  createItem(listId: number, item: Partial<Item>): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/?list_id=${listId}`, item);
  }

  updateItem(id: number, item: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}/`, item);
  }

  toggleItem(id: number): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}/${id}/toggle/`, {});
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}