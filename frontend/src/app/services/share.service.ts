import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ShareLinkResponse } from '../models/list.model';
import { List } from '../models/list.model';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private apiUrl = `${environment.apiUrl}/share`;

  constructor(private http: HttpClient) {}

  createShareLink(listId: number): Observable<ShareLinkResponse> {
    return this.http.post<ShareLinkResponse>(`${this.apiUrl}/${listId}/share`, {});
  }

  revokeShareLink(listId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${listId}/share`);
  }

  getSharedList(shareToken: string): Observable<List> {
    return this.http.get<List>(`${this.apiUrl}/shared/${shareToken}`);
  }
}