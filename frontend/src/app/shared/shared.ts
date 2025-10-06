import { Component, OnInit, OnDestroy } from '@angular/core';  // AGREGAR OnDestroy
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';  // AGREGAR
import { ShareService } from '../services/share.service';
import { ItemService } from '../services/item.service';
import { AuthService } from '../services/auth.service';
import { List } from '../models/list.model';
import { Item } from '../models/item.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-shared',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared.html',
  styleUrls: ['./shared.css']
})
export class SharedComponent implements OnInit, OnDestroy {  // AGREGAR OnDestroy
  sharedList: List | null = null;
  items: Item[] = [];
  currentUser: User | null = null;
  loading = true;
  error = '';

  showItemModal = false;
  editingItem: Partial<Item> = { name: '', checked: false };
  isEditMode = false;
  
  private pollingSubscription?: Subscription;  // AGREGAR

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shareService: ShareService,
    private itemService: ItemService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
    });

    const shareToken = this.route.snapshot.paramMap.get('token');
    if (shareToken) {
      this.loadSharedList(shareToken);
      this.startPolling();  // AGREGAR
    }
  }

  ngOnDestroy() {  // AGREGAR
    this.stopPolling();
  }

  startPolling(): void {  // AGREGAR
    this.pollingSubscription = interval(3000).subscribe(() => {
      if (this.sharedList) {
        this.loadItems();
      }
    });
  }

  stopPolling(): void {  // AGREGAR
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadSharedList(token: string) {
    this.shareService.getSharedList(token).subscribe({
      next: (list) => {
        this.sharedList = list;
        this.loadItems();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Lista no encontrada o el link ha expirado';
        this.loading = false;
      }
    });
  }

  loadItems() {
    if (!this.sharedList) return;

    this.itemService.getItems(this.sharedList.id!).subscribe({
      next: (items) => this.items = items,
      error: (err) => console.error('Error loading items:', err)
    });
  }

  openItemModal(item?: Item) {
    this.isEditMode = !!item;
    this.editingItem = item ? { ...item } : { name: '', checked: false };
    this.showItemModal = true;
  }

  closeItemModal() {
    this.showItemModal = false;
    this.editingItem = { name: '', checked: false };
  }

  saveItem() {
    if (!this.editingItem.name?.trim() || !this.sharedList) return;

    if (this.isEditMode && this.editingItem.id) {
      this.itemService.updateItem(this.editingItem.id, this.editingItem).subscribe({
        next: () => {
          this.loadItems();
          this.closeItemModal();
        },
        error: (err) => console.error('Error updating item:', err)
      });
    } else {
      this.itemService.createItem(this.sharedList.id!, this.editingItem).subscribe({
        next: () => {
          this.loadItems();
          this.closeItemModal();
        },
        error: (err) => console.error('Error creating item:', err)
      });
    }
  }

  toggleItem(item: Item) {
    this.itemService.toggleItem(item.id!).subscribe({
      next: () => this.loadItems(),
      error: (err) => console.error('Error toggling item:', err)
    });
  }

  deleteItem(item: Item) {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;

    this.itemService.deleteItem(item.id!).subscribe({
      next: () => this.loadItems(),
      error: (err) => console.error('Error deleting item:', err)
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  get completedCount(): number {
    return this.items.filter(i => i.checked).length;
  }
}