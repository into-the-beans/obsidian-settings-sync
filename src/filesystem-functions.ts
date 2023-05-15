import * as fs from "fs";
import { formatPath, individualPluginSettings } from "./utilities";

export function getFoldersFromPluginsDirectory(
	plugin_folder: string
): string[] {
	try {
		const plugins = fs
			.readdirSync(plugin_folder, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
		return plugins;
	} catch (e) {
		throw new Error(
			"Error reading plugins directory. Please check that the path is correct and that you have the correct permissions."
		);
	}
}

/**
 * Genereates a list of {@link individualPluginSettings} from a list of plugin names and an obsidian config directory.
 * @param {string[]} pluginNames - an array of plugin names which are also the names of the folders in the plugins directory.
 * @param {string} directory - the path to the obsidian config directory.
 * @return {individualPluginSettings[]} - an array of {@link individualPluginSettings} objects generated from the plugin manifest.json files.
 */
export function getPluginSettingsFromDirectory(
	directory: string,
	pluginNames: string[]
): individualPluginSettings[] {
	const pluginSettings: individualPluginSettings[] = [];
	pluginNames.forEach((plugin) => {
		const manifestPath = formatPath(
			directory + "/plugins/" + plugin + "/manifest.json"
		);
		const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
		const settings: individualPluginSettings = {
			name: manifest.name,
			id: manifest.id,
			description: manifest.description,
			path: formatPath(directory + "/plugins/" + plugin),
			synced: false,
		};
		pluginSettings.push(settings);
	});

	return pluginSettings;
}
