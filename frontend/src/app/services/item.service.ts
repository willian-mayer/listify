// src/app/services/item.service.ts
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

  // Obtener items de una lista específica
  getItems(listId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/list/${listId}`);
  }

  // Obtener un item específico
  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo item (el list_id va como query parameter)
  createItem(listId: number, item: Partial<Item>): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/?list_id=${listId}`, item);
  }

  // Actualizar un item
  updateItem(id: number, item: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  // Toggle del checkbox (usa el endpoint específico de toggle)
  toggleItem(id: number): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}/${id}/toggle`, {});
  }

  // Eliminar un item
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}