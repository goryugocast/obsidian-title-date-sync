# Obsidian Title Date Sync

This plugin automatically updates date fields in YAML frontmatter when you rename a note that contains a date in its title.

## Features

- **Date Extraction**: Automatically detects dates in the filename (currently `YYMMDD` format).
- **Auto-Update**: If the extracted date changes upon renaming, the plugin updates the corresponding date field in the note's frontmatter.
- **Configurable**: Choose which YAML keys to update (e.g., `date`, `created_at`).
- **Safe**: Only updates fields that already exist. It will not add new fields to notes that don't have them.

## Future Plans

- Support for more flexible date formats (e.g., `YYYY-MM-DD`, `MM-DD-YYYY`).
- Currently, the logic defaults to `YYMMDD` (e.g., `240122` for Jan 22, 2024).

## Installation

1. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/obsidian-title-date-sync/` folder.
2. Enable the plugin in Obsidian Settings.

## Development

```bash
npm install
npm run dev
```
