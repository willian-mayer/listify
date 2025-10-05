// src/app/services/list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { List } from '../models/list.model';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = `${environment.apiUrl}/lists`;

  constructor(private http: HttpClient) {}

  // Obtener todas las listas
  getLists(): Observable<List[]> {
    return this.http.get<List[]>(this.apiUrl);
  }

  // Obtener una lista específica (incluye sus items)
  getList(id: number): Observable<List> {
    return this.http.get<List>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva lista
  createList(list: Partial<List>): Observable<List> {
    return this.http.post<List>(this.apiUrl, list);
  }

  // Actualizar una lista
  updateList(id: number, list: Partial<List>): Observable<List> {
    return this.http.put<List>(`${this.apiUrl}/${id}`, list);
  }

  // Eliminar una lista
  deleteList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}