import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { interval, Subscription } from 'rxjs';  // AGREGAR
import { AuthService } from './services/auth.service';
import { ListService } from './services/list.service';
import { ItemService } from './services/item.service';
import { AuthComponent } from './auth/auth';
import { User } from './models/user.model';
import { List } from './models/list.model';
import { Item } from './models/item.model';
import { ShareService } from './services/share.service';
import { ShareLinkResponse } from './models/list.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, AuthComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {  // AGREGAR OnDestroy
  currentUser: User | null = null;
  lists: List[] = [];
  selectedList: List | null = null;
  items: Item[] = [];
  
  showListModal = false;
  showItemModal = false;
  editingList: Partial<List> = { title: '', description: '' };
  editingItem: Partial<Item> = { name: '', checked: false };
  isEditMode = false;

  showShareModal = false;
  shareLink = '';
  isSharedRoute = false;
  
  private pollingSubscription?: Subscription;  // AGREGAR

  constructor(
    private authService: AuthService,
    private listService: ListService,
    private itemService: ItemService,
    private shareService: ShareService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isSharedRoute = event.url.includes('/shared/');
      }
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadLists();
        this.startPolling();  // AGREGAR
      } else {
        this.stopPolling();  // AGREGAR
        this.lists = [];
        this.selectedList = null;
        this.items = [];
      }
    });
  }

  ngOnDestroy() {  // AGREGAR
    this.stopPolling();
  }

  startPolling(): void {  // AGREGAR
    this.pollingSubscription = interval(3000).subscribe(() => {
      if (this.selectedList && this.currentUser && !this.isSharedRoute) {
        this.loadItems(this.selectedList.id!);
      }
    });
  }

  stopPolling(): void {  // AGREGAR
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  loadLists() {
    this.listService.getLists().subscribe({
      next: (lists) => {
        this.lists = lists;
        if (this.selectedList) {
          this.selectedList = lists.find(l => l.id === this.selectedList!.id) || null;
        }
      },
      error: (err) => console.error('Error loading lists:', err)
    });
  }

  selectList(list: List) {
    this.selectedList = list;
    this.loadItems(list.id!);
  }

  loadItems(listId: number) {
    this.itemService.getItems(listId).subscribe({
      next: (items) => this.items = items,
      error: (err) => console.error('Error loading items:', err)
    });
  }

  // ... resto del código igual
  openListModal(list?: List) {
    this.isEditMode = !!list;
    this.editingList = list ? { ...list } : { title: '', description: '' };
    this.showListModal = true;
  }

  closeListModal() {
    this.showListModal = false;
    this.editingList = { title: '', description: '' };
  }

  saveList() {
    if (!this.editingList.title?.trim()) return;

    if (this.isEditMode && this.editingList.id) {
      this.listService.updateList(this.editingList.id, this.editingList).subscribe({
        next: () => {
          this.loadLists();
          this.closeListModal();
        },
        error: (err) => console.error('Error updating list:', err)
      });
    } else {
      this.listService.createList(this.editingList).subscribe({
        next: () => {
          this.loadLists();
          this.closeListModal();
        },
        error: (err) => console.error('Error creating list:', err)
      });
    }
  }

  deleteList(list: List) {
    if (!confirm(`¿Eliminar la lista "${list.title}"?`)) return;

    this.listService.deleteList(list.id!).subscribe({
      next: () => {
        if (this.selectedList?.id === list.id) {
          this.selectedList = null;
          this.items = [];
        }
        this.loadLists();
      },
      error: (err) => console.error('Error deleting list:', err)
    });
  }

  openItemModal(item?: Item) {
    if (!this.selectedList) return;
    
    this.isEditMode = !!item;
    this.editingItem = item 
      ? { ...item } 
      : { name: '', checked: false };
    this.showItemModal = true;
  }

  closeItemModal() {
    this.showItemModal = false;
    this.editingItem = { name: '', checked: false };
  }

  saveItem() {
    if (!this.editingItem.name?.trim() || !this.selectedList) return;

    if (this.isEditMode && this.editingItem.id) {
      this.itemService.updateItem(this.editingItem.id, this.editingItem).subscribe({
        next: () => {
          this.loadItems(this.selectedList!.id!);
          this.closeItemModal();
        },
        error: (err) => console.error('Error updating item:', err)
      });
    } else {
      this.itemService.createItem(this.selectedList.id!, this.editingItem).subscribe({
        next: () => {
          this.loadItems(this.selectedList!.id!);
          this.closeItemModal();
        },
        error: (err) => console.error('Error creating item:', err)
      });
    }
  }

  toggleItem(item: Item) {
    this.itemService.toggleItem(item.id!).subscribe({
      next: () => this.loadItems(this.selectedList!.id!),
      error: (err) => console.error('Error toggling item:', err)
    });
  }

  deleteItem(item: Item) {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;

    this.itemService.deleteItem(item.id!).subscribe({
      next: () => this.loadItems(this.selectedList!.id!),
      error: (err) => console.error('Error deleting item:', err)
    });
  }

  get completedCount(): number {
    return this.items.filter(i => i.checked).length;
  }

  openShareModal(): void {
    if (!this.selectedList) return;

    if (this.selectedList.share_token) {
      this.shareLink = `${window.location.origin}/shared/${this.selectedList.share_token}`;
      this.showShareModal = true;
      return;
    }

    this.shareService.createShareLink(this.selectedList.id!).subscribe({
      next: (response: ShareLinkResponse) => {
        this.shareLink = response.share_url;
        this.showShareModal = true;
        if (this.selectedList) {
          this.selectedList.share_token = response.share_token;
          this.selectedList.is_shared = true;
        }
        this.loadLists();
      },
      error: (err) => console.error('Error creating share link:', err)
    });
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.shareLink = '';
  }

  copyShareLink(): void {
    navigator.clipboard.writeText(this.shareLink).then(() => {
      alert('¡Link copiado al portapapeles!');
    });
  }

  revokeShare(): void {
    if (!this.selectedList || !confirm('¿Desactivar el link compartido? Las personas que lo tengan ya no podrán acceder.')) {
      return;
    }

    this.shareService.revokeShareLink(this.selectedList.id!).subscribe({
      next: () => {
        if (this.selectedList) {
          this.selectedList.share_token = null;
          this.selectedList.is_shared = false;
        }
        this.closeShareModal();
        this.loadLists();
        alert('Link desactivado correctamente');
      },
      error: (err) => console.error('Error revoking share:', err)
    });
  }
}