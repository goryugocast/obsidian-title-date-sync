import { App, PluginSettingTab, Setting } from 'obsidian';
import TitleDateSyncPlugin from './main';

export interface TitleDateSyncSettings {
    targetKeys: string[];
}

export const DEFAULT_SETTINGS: TitleDateSyncSettings = {
    targetKeys: ['date']
};

export class TitleDateSyncSettingTab extends PluginSettingTab {
    plugin: TitleDateSyncPlugin;

    constructor(app: App, plugin: TitleDateSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Title Date Sync Settings' });

        new Setting(containerEl)
            .setName('Target YAML Keys')
            .setDesc('Specify the YAML keys to update when the title date changes (one per line).')
            .addTextArea(text => text
                .setPlaceholder('date\ncreated_at')
                .setValue(this.plugin.settings.targetKeys.join('\n'))
                .onChange(async (value) => {
                    this.plugin.settings.targetKeys = value
                        .split('\n')
                        .map(k => k.trim())
                        .filter(k => k.length > 0);
                    await this.plugin.saveSettings();
                }));
    }
}
