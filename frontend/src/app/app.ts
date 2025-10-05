// src/app/app.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ListService } from './services/list.service';
import { ItemService } from './services/item.service';
import { List } from './models/list.model';
import { Item } from './models/item.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  lists: List[] = [];
  selectedList: List | null = null;
  items: Item[] = [];
  
  showListModal = false;
  showItemModal = false;
  editingList: Partial<List> = { title: '', description: '' };
  editingItem: Partial<Item> = { name: '', checked: false };
  isEditMode = false;

  constructor(
    private listService: ListService,
    private itemService: ItemService
  ) {}

  ngOnInit() {
    this.loadLists();
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

  // List operations
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

  // Item operations
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
      // Actualizar item existente
      this.itemService.updateItem(this.editingItem.id, this.editingItem).subscribe({
        next: () => {
          this.loadItems(this.selectedList!.id!);
          this.closeItemModal();
        },
        error: (err) => console.error('Error updating item:', err)
      });
    } else {
      // Crear nuevo item (ahora pasa listId como primer parámetro)
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
    // toggleItem ahora no recibe parámetros, el backend lo maneja
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
}