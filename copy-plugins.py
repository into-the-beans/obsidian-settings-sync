import os
import shutil


def main():
    loop = True

    while (loop):
        try:
            parent_folder = input(
                "Enter the path to the folder containing the plugins (.obsidian): ")
            parent_folder = os.path.join(parent_folder, "plugins")
            os.listdir(parent_folder)
            loop = False
        except FileNotFoundError:
            print("Please enter a valid path")
    loop = True
    while (loop):
        try:
            number_of_folders_to_copy_to = int(
                input("Enter the number of folders to copy: "))
            loop = False
        except ValueError:
            print("Please enter a valid number")

    plugins = os.listdir(parent_folder)

    for i in range(number_of_folders_to_copy_to):
        copy_directory = input(
            "Enter the path to the folder to copy to (.obsidian-mobile): ")
        copy_directory = os.path.join(copy_directory, "plugins")
        for plugin in plugins:
            plugin_folder_target = os.path.join(copy_directory, plugin)
            plugin_folder_source = os.path.join(parent_folder, plugin)
            if os.path.isdir(plugin_folder_target):
                # replace data.json
                try:
                    data_json_source = os.path.join(
                        plugin_folder_source, "data.json")
                    data_json_target = os.path.join(
                        plugin_folder_target, "data.json")
                    print("Copying " + data_json_source +
                          " to " + data_json_target)
                    shutil.copyfile(data_json_source, data_json_target)
                except FileNotFoundError:
                    print("data.json not found in " + plugin)
                    answer = input("copy folder? (y/n): ")
                    if answer == "y":
                        shutil.rmtree(plugin_folder_target)
                        print("Copying " + plugin_folder_source +
                              " to " + plugin_folder_target)
                        shutil.copytree(plugin_folder_source,
                                        plugin_folder_target)
                    else:
                        continue


if __name__ == "__main__":
    main()
