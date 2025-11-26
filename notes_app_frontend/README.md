# Ocean Notes (Angular)

A modern, responsive notes application with an Ocean Professional theme.

- Sidebar for notes list with search
- Main editor for viewing/editing a note
- Create, edit, delete notes
- Local persistence using `localStorage` (will later be replaced by backend API)
- Responsive layout with top navigation

## Development server

Start the dev server (port configured to 3000 in `angular.json`):

```bash
npm install
npm run start
```

Open your browser at: http://localhost:3000

## Environment variables

If the following variables are provided by the environment, the app can later integrate with a backend. Until then, it falls back to localStorage:

- `NG_APP_API_BASE` or `NG_APP_BACKEND_URL`
- `NG_APP_FRONTEND_URL`
- `NG_APP_WS_URL`

See `.env.example` for a full list of supported variables.

## Building

```bash
npm run build
```

Artifacts are emitted to `dist/angular`.

## Tests

```bash
npm test
```

## Notes

- All data is stored locally in your browser under the key `notes-app__notes`.
- When a backend is added, the NotesService is prepared to read `NG_APP_API_BASE`/`NG_APP_BACKEND_URL` for API integration.
