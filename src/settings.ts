import { PluginSettingTab, App, Setting } from "obsidian";
import SettingsSyncPlugin from "./main";
import { formatPath, individualPluginSettings } from "./utilities";
import { detectPlugins } from "./detect-plugins";

export interface syncPluginSettings {
	syncFolders: string[];
	syncPlugins: individualPluginSettings[];
}

export const DEFAULT_SETTINGS: syncPluginSettings = {
	syncFolders: [],
	syncPlugins: [],
};

export class SyncPluginSettingTab extends PluginSettingTab {
	plugin: SettingsSyncPlugin;

	constructor(app: App, plugin: SettingsSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: this.plugin.manifest.name });

		new Setting(containerEl)
			.setName("Config folder Directories")
			.setDesc(
				"Add the directories of the folders you want to sync (config folders should be in the root of the vault)"
			)
			.addButton((button) =>
				button.setButtonText("Detect Plugins").onClick(async () => {
					detectPlugins(this.plugin.settings.syncFolders);
				})
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(".obsidian-mobile")
					.setValue(this.plugin.settings.syncFolders.join("\n"))
					.onChange(async (value) => {
						const paths = value
							.trim()
							.split("\n")
							.map((path) => formatPath(path, true));
						this.plugin.settings.syncFolders = paths;
						console.log(this.plugin.settings.syncFolders);
						this.plugin.saveSettings();
					})
			);
	}
}
