import { Routes } from '@angular/router';
import { SharedComponent } from './shared/shared';

export const routes: Routes = [
  {
    path: 'shared/:token',
    component: SharedComponent
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  }
];