import { PluginSettingTab, App, Setting } from "obsidian";
import SettingsSyncPlugin from "./main";
import { formatPath, individualPluginSettings } from "./utilities";
import {
	getFoldersFromPluginsDirectory,
	getPluginSettingsFromDirectory,
} from "./filesystem-functions";

export interface syncPluginSettings {
	syncFolders: string[];
	syncPlugins: Map<string, individualPluginSettings[]>;
}

export const DEFAULT_SETTINGS: syncPluginSettings = {
	syncFolders: [],
	syncPlugins: new Map<string, individualPluginSettings[]>(),
};

export class SyncPluginSettingTab extends PluginSettingTab {
	plugin: SettingsSyncPlugin;

	constructor(app: App, plugin: SettingsSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	detectPlugins(folders: string[]): Map<string, individualPluginSettings[]> {
		// folder name : plugins it has
		const pluginMap = new Map<string, individualPluginSettings[]>();
		folders.forEach((folder) => {
			const configDirectory = formatPath(
				this.plugin.vaultAbsoultePath + folder
			);
			const pluginNames = getFoldersFromPluginsDirectory(configDirectory);
			const pluginSettings = getPluginSettingsFromDirectory(
				configDirectory,
				pluginNames
			);
			pluginMap.set(folder, pluginSettings);
		});

		return pluginMap;
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
					this.plugin.settings.syncPlugins = this.detectPlugins(
						this.plugin.settings.syncFolders
					);
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
							.map((path) => formatPath(path));
						this.plugin.settings.syncFolders = paths;
						console.log(this.plugin.settings.syncFolders);
						this.plugin.saveSettings();
					})
			);
	}
}
