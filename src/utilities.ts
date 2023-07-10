import * as path from "path";
export interface individualPluginSettings {
	name: string; // from name in manifest.json
	id: string; // from id in manifest.json
	description: string; // from description in manifest.json
	path: string; // the path to the plugin folder
	synced: boolean; // whether the plugin is synced or not
}

export function formatPath(directory: string): string {
	if (directory.length == 0) return directory;
	directory = directory.replace(/"/g, "");
	const pathTokens = directory.split("/");
	const formattedPath = path.join(...pathTokens);
	return formattedPath;
}

export interface pluginData {
	pluginFolder: string;
	pluginSettings: individualPluginSettings[];
}
