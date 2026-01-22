import { Plugin, TFile, TAbstractFile, Notice } from 'obsidian';
import { TitleDateSyncSettings, DEFAULT_SETTINGS, TitleDateSyncSettingTab } from './settings';
import { extractDate } from './utils';
// Note: path is node module, Obsidian environment might not have it polyfilled by default in all contexts,
// but usually rollup polyfills it or we can just use string manipulation for basename.
// We will use string manipulation to be safe and lightweight.

export default class TitleDateSyncPlugin extends Plugin {
    settings: TitleDateSyncSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new TitleDateSyncSettingTab(this.app, this));

        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => this.handleRename(file, oldPath))
        );
    }

    async handleRename(file: TAbstractFile, oldPath: string) {
        if (!(file instanceof TFile) || file.extension !== 'md') {
            return;
        }

        // Extract Basenames
        // oldPath is full path.
        const oldBasename = this.getBasename(oldPath);
        const newBasename = file.basename; // TFile.basename matches internal Obsidian basename logic

        const oldDate = extractDate(oldBasename);
        const newDate = extractDate(newBasename);

        // Conditions to proceed:
        // 1. New title must have a valid date.
        // We do strictly need oldDate to be present?
        // User feedback: "It doesn't work when changing from 'not a date' to 'date'".
        // So we should proceed if newDate is valid, regardless of oldDate.
        // The frontmatter check will prevent unnecessary writes if the date is already correct.
        if (newDate) {
            // Check keys logic
            // We need to check if the file has any of the target keys.
            // processFrontmatter gives us a chance to check and update atomically.
            await this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
                let updated = false;

                for (const key of this.settings.targetKeys) {
                    if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
                        // Key exists, let's update it.
                        // Standardize to YYYY-MM-DD for YAML
                        const newDateStr = newDate.format('YYYY-MM-DD');

                        // Avoid updating if already same (edge case)
                        if (frontmatter[key] !== newDateStr) {
                            frontmatter[key] = newDateStr;
                            updated = true;
                        }
                    }
                }

                if (updated) {
                    new Notice(`Date updated: ${newDate.format('YYYY-MM-DD')}`);
                    console.log(`[Title Date Sync] Updated date in ${file.path} to ${newDate.format('YYYY-MM-DD')}`);
                }
            });
        }
    }

    getBasename(path: string): string {
        // Simple basename extraction
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        // Remove extension if present
        return filename.replace(/\.[^/.]+$/, "");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
