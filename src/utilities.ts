import { normalizePath } from "obsidian";

export interface pluginSettings {
	name: string; // from name in manifest.json
	id: string; // from id in manifest.json
	description: string; // from description in manifest.json
	path: string; // the path to the plugin folder
	synced: boolean; // whether the plugin is synced or not
}

export function formatPath(path: string, directory: boolean): string {
	if (path.length == 0) return path;
	path = normalizePath(path);
	if (directory && !path.endsWith("/")) path += "/";
	return path;
}
