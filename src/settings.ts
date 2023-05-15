import { PluginSettingTab, App, Setting, Notice } from "obsidian";
import SettingsSyncPlugin from "./main";
import { formatPath, individualPluginSettings } from "./utilities";
import {
	getFoldersFromPluginsDirectory,
	getPluginSettingsFromDirectory,
} from "./filesystem-functions";

export interface syncPluginSettings {
	syncFolders: string[];
	syncPlugins: Map<string, individualPluginSettings[]>[];
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

	detectPlugins(
		folders: string[]
	): Map<string, individualPluginSettings[]>[] {
		// folder name : plugins it has
		const pluginMaps: Map<string, individualPluginSettings[]>[] = [];
		folders.forEach((folder) => {
			const configDirectory = formatPath(
				this.plugin.vaultAbsoultePath + "/" + folder + "/"
			);
			let pluginNames: string[] = [];
			try {
				pluginNames = getFoldersFromPluginsDirectory(
					formatPath(configDirectory + "/plugins")
				);
				const pluginSettings = getPluginSettingsFromDirectory(
					configDirectory,
					pluginNames
				);
				const pluginMap = new Map<string, individualPluginSettings[]>();
				pluginMap.set(folder, pluginSettings);
				pluginMaps.push(pluginMap);
			} catch (e) {
				console.error(e);
				new Notice("Unable to get plugins from " + folder);
				this.plugin.settings.syncFolders =
					this.plugin.settings.syncFolders.filter((f) => f != folder);

				this.plugin.saveSettings();
			}
		});

		return pluginMaps;
	}

	displayPlugins(): void {
		this.containerEl.empty();
		this.display();
		for (const map of this.plugin.settings.syncPlugins) {
			for (const [key, value] of map.entries()) {
				this.containerEl.createEl("h2", { text: key });
				for (const plugin of value) {
					new Setting(this.containerEl)
						.setName(plugin.name)
						.setDesc(plugin.description)
						.addToggle((toggle) =>
							toggle
								.setValue(plugin.synced)
								.onChange(async (value) => {
									plugin.synced = value;
									this.plugin.saveSettings();
								})
								.setTooltip("Sync this plugin")
						);
				}
			}
		}
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
					this.plugin.saveSettings();
					this.displayPlugins();
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
							.map((path) => path);
						this.plugin.settings.syncFolders = paths;
						this.plugin.saveSettings();
					})
			);
	}
}
