import { Routes } from '@angular/router';
import { NotesPage } from './pages/notes/notes.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  { path: 'notes', component: NotesPage },
  { path: 'notes/:id', component: NotesPage },
  { path: '**', redirectTo: 'notes' },
];
