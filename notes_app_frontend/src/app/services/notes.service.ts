import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Note } from '../models/note.model';
import { EnvService } from './env.service';

const LS_KEY = 'notes-app__notes';

/**
 * PUBLIC_INTERFACE
 * NotesService manages CRUD operations for notes. It persists to localStorage by default.
 * If NG_APP_API_BASE/NG_APP_BACKEND_URL are provided, this service is structured to later
 * integrate with a backend API; until then, it falls back to local storage.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private notes$ = new BehaviorSubject<Note[]>([]);
  private apiBase: string | null;

  constructor(private env: EnvService) {
    this.apiBase = env.apiBase;
    this.loadInitial();
  }

  /** PUBLIC_INTERFACE: Observable stream of all notes sorted by updatedAt desc. */
  get all$() {
    return this.notes$.asObservable();
  }

  /** PUBLIC_INTERFACE: Returns current notes snapshot. */
  getAll(): Note[] {
    return this.sorted([...this.notes$.getValue()]);
  }

  /** PUBLIC_INTERFACE: Get a note by id. */
  getById(id: string): Note | undefined {
    return this.notes$.getValue().find(n => n.id === id);
  }

  /** PUBLIC_INTERFACE: Create a new note. */
  create(partial: Partial<Note>): Note {
    const now = Date.now();
    const note: Note = {
      id: cryptoRandomId(),
      title: (partial.title ?? '').trim() || 'Untitled note',
      content: partial.content ?? '',
      tags: partial.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const next = this.sorted([note, ...this.notes$.getValue()]);
    this.notes$.next(next);
    this.persist();
    return note;
  }

  /** PUBLIC_INTERFACE: Update an existing note. */
  update(id: string, changes: Partial<Note>): Note | undefined {
    let updated: Note | undefined;
    const next = this.notes$.getValue().map(n => {
      if (n.id === id) {
        updated = {
          ...n,
          ...changes,
          title: (changes.title ?? n.title).trim() || 'Untitled note',
          updatedAt: Date.now(),
        };
        return updated!;
      }
      return n;
    });
    this.notes$.next(this.sorted(next));
    this.persist();
    return updated;
  }

  /** PUBLIC_INTERFACE: Delete a note. */
  delete(id: string): void {
    const next = this.notes$.getValue().filter(n => n.id !== id);
    this.notes$.next(this.sorted(next));
    this.persist();
  }

  /** PUBLIC_INTERFACE: Search notes by title/content/tags. */
  search(query: string): Note[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    return this.getAll().filter(n => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    });
  }

  private loadInitial() {
    // For now, ignore apiBase and use local storage. In future, fetch from backend if apiBase present.
    try {
      const raw = safeLocalStorageGetItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Note[];
        const normalized = parsed.map(p => ({
          ...p,
          title: (p.title ?? '').trim() || 'Untitled note',
          content: p.content ?? '',
          tags: p.tags ?? [],
          createdAt: p.createdAt ?? Date.now(),
          updatedAt: p.updatedAt ?? p.createdAt ?? Date.now(),
        }));
        this.notes$.next(this.sorted(normalized));
        return;
      }
    } catch {
      // ignore corruption and reset
    }
    // Seed with an example note
    const example: Note = {
      id: cryptoRandomId(),
      title: 'Welcome to Ocean Notes',
      content:
        'This is your first note. Use the editor to update content. Search from the sidebar. Your notes are saved locally.',
      tags: ['welcome'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.notes$.next([example]);
    this.persist();
  }

  private persist() {
    try {
      const payload = JSON.stringify(this.notes$.getValue());
      safeLocalStorageSetItem(LS_KEY, payload);
    } catch {
      // storage might be full or blocked; ignore
    }
  }

  private sorted(arr: Note[]): Note[] {
    return arr.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

/** Generate a random ID suitable for client-side entities. */
function cryptoRandomId(): string {
  const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : {};
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2, 11);
}

/** Safely access localStorage across environments (SSR/lint). */
function safeLocalStorageGetItem(key: string): string | null {
  try {
    const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : {};
    if (g.localStorage && typeof g.localStorage.getItem === 'function') {
      return g.localStorage.getItem(key);
    }
    return null;
  } catch {
    return null;
  }
}

function safeLocalStorageSetItem(key: string, value: string): void {
  try {
    const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : {};
    if (g.localStorage && typeof g.localStorage.setItem === 'function') {
      g.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}
