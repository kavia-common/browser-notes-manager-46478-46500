import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  /** PUBLIC_INTERFACE: Array of notes to display. */
  @Input() notes: Note[] = [];
  /** PUBLIC_INTERFACE: Currently selected note ID. */
  @Input() selectedId: string | null = null;

  /** PUBLIC_INTERFACE: Emits when a note is selected. */
  @Output() selectNote = new EventEmitter<string>();
  /** PUBLIC_INTERFACE: Emits when user requests a new note. */
  @Output() newNote = new EventEmitter<void>();
  /** PUBLIC_INTERFACE: Emits when user requests deletion of a note. */
  @Output() deleteNote = new EventEmitter<string>();
  /** PUBLIC_INTERFACE: Emits search query updates. */
  @Output() searchChange = new EventEmitter<string>();

  query = signal<string>('');

  onSearchChange(val: string) {
    this.query.set(val);
    this.searchChange.emit(val);
  }

  isSelected(note: Note): boolean {
    return this.selectedId === note.id;
  }
}
