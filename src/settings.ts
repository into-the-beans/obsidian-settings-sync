import { PluginSettingTab, App, Setting, Notice } from "obsidian";
import SettingsSyncPlugin from "./main";
import { formatPath, pluginData } from "./utilities";
import {
	getFoldersFromPluginsDirectory,
	getPluginSettingsFromDirectory,
} from "./filesystem-functions";

export interface syncPluginSettings {
	syncFolders: string[];
	syncPlugins: pluginData[];
}

export const DEFAULT_SETTINGS: syncPluginSettings = {
	syncFolders: [],
	syncPlugins: [],
};

export class SyncPluginSettingTab extends PluginSettingTab {
	plugin: SettingsSyncPlugin;
	once = true;

	constructor(app: App, plugin: SettingsSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async removeInvalidFolder(folder: string): Promise<void> {
		new Notice("Unable to get plugins from " + folder);
		this.plugin.settings.syncFolders =
			this.plugin.settings.syncFolders.filter((f) => f != folder);

		await this.plugin.saveSettings();
	}

	detectPlugins(): pluginData[] {
		const folders = this.plugin.settings.syncFolders;
		// folder name : plugins it has
		const pluginList: pluginData[] = [];
		for (const folder of folders) {
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
				const plugin: pluginData = {
					pluginFolder: folder,
					pluginSettings: pluginSettings,
				};
				pluginList.push(plugin);
			} catch (e) {
				console.error(e);
				this.removeInvalidFolder(folder);
			}
		}

		return pluginList;
	}

	// displayPlugins(): void {
	// 	this.containerEl.empty();
	// 	this.display();
	// 	for (const map of this.plugin.settings.syncPlugins) {
	// 		for (const [key, value] of map.entries()) {
	// 			this.containerEl.createEl("h2", { text: key });
	// 			for (const plugin of value) {
	// 				new Setting(this.containerEl)
	// 					.setName(plugin.name)
	// 					.setDesc(plugin.description)
	// 					.addToggle((toggle) =>
	// 						toggle
	// 							.setValue(plugin.synced)
	// 							.onChange(async (value) => {
	// 								plugin.synced = value;
	// 								this.plugin.saveSettings();
	// 							})
	// 							.setTooltip("Sync this plugin")
	// 					);
	// 			}
	// 		}
	// 	}
	// }

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: this.plugin.manifest.name });
		// @TODO fix overwriting already existing settings
		new Setting(containerEl)
			.setName("Config folder Directories")
			.setDesc(
				"Add the directories of the folders you want to sync (config folders should be in the root of the vault)"
			)
			.addButton((button) =>
				button.setButtonText("Detect Plugins").onClick(async () => {
					this.plugin.settings.syncPlugins = this.detectPlugins();
					await this.plugin.saveSettings();
					this.display();
					// this.displayPlugins();
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
						await this.plugin.saveSettings();
					})
			);
		for (const pluginData of this.plugin.settings.syncPlugins) {
			try {
				this.containerEl.createEl("h2", {
					text: pluginData.pluginFolder,
				});
				for (const plugin of pluginData.pluginSettings) {
					new Setting(this.containerEl)
						.setName(plugin.name)
						.setDesc(plugin.description)
						.addToggle((toggle) =>
							toggle
								.setValue(plugin.synced)
								.onChange(async (value) => {
									plugin.synced = value;
									await this.plugin.saveSettings();
								})
						)
						.setTooltip("Sync this plugin");
				}
			} catch (e) {
				console.log("Plugins Empty");
				console.log(e);
			}
		}
	}
}
