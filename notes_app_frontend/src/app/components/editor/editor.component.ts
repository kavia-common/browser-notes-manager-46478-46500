import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnChanges {
  /** PUBLIC_INTERFACE: Note to display/edit */
  @Input() note: Note | null = null;

  /** PUBLIC_INTERFACE: Emits updated note when user edits */
  @Output() noteChange = new EventEmitter<Partial<Note>>();

  localTitle = '';
  localContent = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note']) {
      this.localTitle = this.note?.title ?? '';
      this.localContent = this.note?.content ?? '';
    }
  }

  onTitleChange(v: string) {
    this.localTitle = v;
    this.emitChanges();
  }

  onContentChange(v: string) {
    this.localContent = v;
    this.emitChanges();
  }

  private emitChanges() {
    if (!this.note) return;
    this.noteChange.emit({
      title: this.localTitle,
      content: this.localContent
    });
  }
}
