import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { EditorComponent } from '../../components/editor/editor.component';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent, SidebarComponent, EditorComponent],
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.css']
})
export class NotesPage implements OnInit {
  notes = signal<Note[]>([]);
  selectedId = signal<string | null>(null);
  query = signal<string>('');

  filtered = computed(() => {
    const q = this.query();
    return q ? this.notesService.search(q) : this.notesService.getAll();
  });

  selectedNote = computed(() => {
    const id = this.selectedId();
    return id ? this.notesService.getById(id) ?? null : null;
  });

  constructor(
    private notesService: NotesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Sync with service
    this.notes.set(this.notesService.getAll());
    this.notesService.all$.subscribe(n => {
      this.notes.set(n);
    });

    // Keep URL in sync when selectedId changes
    effect(() => {
      const id = this.selectedId();
      if (id) {
        this.router.navigate(['/notes', id], { replaceUrl: true });
      } else {
        this.router.navigate(['/notes'], { replaceUrl: true });
      }
    });
  }

  ngOnInit(): void {
    // Initialize from route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedId.set(id);
      } else {
        // Ensure at least select first if present
        const first = this.notesService.getAll()[0];
        this.selectedId.set(first ? first.id : null);
      }
    });
  }

  onSearch(q: string) {
    this.query.set(q);
  }

  onSelect(id: string) {
    this.selectedId.set(id);
  }

  onCreate() {
    const created = this.notesService.create({ title: 'New note' });
    this.selectedId.set(created.id);
  }

  onDelete(id: string) {
    const wasSelected = this.selectedId() === id;
    this.notesService.delete(id);
    if (wasSelected) {
      const next = this.notesService.getAll()[0];
      this.selectedId.set(next ? next.id : null);
    }
  }

  onNoteChange(update: Partial<Note>) {
    const id = this.selectedId();
    if (!id) return;
    this.notesService.update(id, update);
  }
}
