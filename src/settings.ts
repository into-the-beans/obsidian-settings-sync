import { PluginSettingTab, App, Setting } from "obsidian";
import SettingsSyncPlugin from "./main";
import { folder, pluginSettings } from "./utilities";

export interface syncPluginSettings {
	syncFolders: folder[];
	syncPlugins: pluginSettings[];
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

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue("")
					.onChange(async (value) => {})
			);
	}
}
