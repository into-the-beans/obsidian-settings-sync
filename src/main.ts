import { App, Editor, MarkdownView, Modal, Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	SyncPluginSettingTab,
	syncPluginSettings,
} from "./settings";
import { formatPath, rootVaultPluginSettings } from "./utilities";
import * as fs from "fs";

// Remember to rename these classes and interfaces!

export default class SettingsSyncPlugin extends Plugin {
	settings: syncPluginSettings;
	rootPlugins: rootVaultPluginSettings[];
	enabledPugins: string[];

	getRootVaultPlugins(): string[] {
		// get the plugins from the folders
		const plugin_folder = formatPath(
			this.app.vault.configDir + "/plugins",
			true
		);
		console.log(plugin_folder);

		// get the names of all the folder in the plugins folder
		const plugins = fs
			.readdirSync(plugin_folder, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
		return plugins;
	}

	getRootPluginSettings(pluginNames: string[]): rootVaultPluginSettings[] {
		const pluginSettings: rootVaultPluginSettings[] = [];
		pluginNames.forEach((plugin) => {
			const manifestPath = formatPath(
				this.app.vault.configDir +
					"/plugins" +
					"/" +
					plugin +
					"/manifest.json",
				false
			);
			console.log(manifestPath);
			const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
			const individualPluginSettings: rootVaultPluginSettings = {
				name: manifest.name,
				id: manifest.id,
				description: manifest.description,
				path: formatPath(
					this.app.vault.configDir + "/plugins" + "/" + plugin,
					true
				),
				enabled: this.enabledPugins.includes(manifest.name),
			};
			pluginSettings.push(individualPluginSettings);
		});

		return pluginSettings;
	}

	getEnabledPlugins(): string[] {
		const communityPluginsJSONPath = formatPath(
			this.app.vault.configDir + "/community-plugins.json",
			false
		);
		return JSON.parse(fs.readFileSync(communityPluginsJSONPath, "utf8"));
	}

	async onload() {
		await this.loadSettings();
		this.enabledPugins = this.getEnabledPlugins();
		this.rootPlugins = this.getRootPluginSettings(
			this.getRootVaultPlugins()
		);
		console.log(this.rootPlugins);
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SyncPluginSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {
		// to implement
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
