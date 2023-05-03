export interface pluginSettings {
	name: string; // from name in manifest.json
	id: string; // from id in manifest.json
	description: string; // from description in manifest.json
	path: string; // the path to the plugin folder
	synced: boolean; // whether the plugin is synced or not
}

export interface folder {
	name: string; // the name of the folder
	path: string; // the formatted path of the folder
}
