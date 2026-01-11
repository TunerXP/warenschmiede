import os
import json

def generate_inventory(root_dir):
    inventory = {
        "html": [],
        "images": [],
        "docs": [],
        "downloads": []
    }

    ignore_dirs = {'.git', '.vscode', 'node_modules', '.vs', '__pycache__'}
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
    doc_extensions = {'.md', '.txt'}
    download_extensions = {'.zip', '.pdf', '.stl', '.gcode'}

    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            file_path = os.path.join(root, file)
            # Make path relative to root_dir and replace backslashes with slashes
            rel_path = os.path.relpath(file_path, root_dir).replace('\\', '/')

            _, ext = os.path.splitext(file)
            ext = ext.lower()

            if ext == '.html':
                inventory["html"].append(rel_path)
            elif ext in image_extensions:
                inventory["images"].append(rel_path)
            elif ext in doc_extensions:
                inventory["docs"].append(rel_path)
            elif ext in download_extensions:
                inventory["downloads"].append(rel_path)

    # Sort lists for consistency
    for key in inventory:
        inventory[key].sort()

    with open('site_inventory.json', 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    print(f"Inventory generated with {len(inventory['html'])} html files, {len(inventory['images'])} images, {len(inventory['docs'])} docs, {len(inventory['downloads'])} downloads.")

if __name__ == "__main__":
    generate_inventory('.')
