#!/usr/bin/env python3
import os
import json

def format_schools_text(schools):
    """Formats a list of schools into a natural Spanish comma-separated list with 'y' at the end."""
    if not schools:
        return ""
    if len(schools) == 1:
        return schools[0]
    return ", ".join(schools[:-1]) + " y " + schools[-1]

def generate_schools_html(schools):
    """Generates a list of HTML LI items for the schools list."""
    html_items = []
    for school in schools:
        item = f"""              <li class="flex items-center gap-3 text-sm text-carbon-light">
                <span class="text-sol"><svg class="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>
                <span>{school}</span>
              </li>"""
        html_items.append(item)
    return "\n".join(html_items)

def main():
    # Paths (relative to the script's directory for robust local execution)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, 'data', 'comunas.json')
    template_path = os.path.join(base_dir, 'comunas', '_template.html')
    output_dir = os.path.join(base_dir, 'comunas')

    print(f"Base Directory: {base_dir}")
    print(f"Reading JSON from: {json_path}")
    print(f"Reading template from: {template_path}")

    # Load data
    if not os.path.exists(json_path):
        print(f"Error: {json_path} does not exist.")
        return

    if not os.path.exists(template_path):
        print(f"Error: {template_path} does not exist.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        comunas_data = json.load(f)

    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()

    os.makedirs(output_dir, exist_ok=True)

    print(f"Starting generation for {len(comunas_data)} comunas...")

    for item in comunas_data:
        comuna_name = item.get('comuna')
        slug = item.get('slug')
        title = item.get('title')
        description = item.get('description')
        schools = item.get('schools', [])
        custom_text = item.get('customText')

        # Format schools representations
        schools_list_text = format_schools_text(schools)
        schools_list_html = generate_schools_html(schools)

        # Replace placeholders
        page_content = template_content
        page_content = page_content.replace('{{title}}', title)
        page_content = page_content.replace('{{description}}', description)
        page_content = page_content.replace('{{comuna}}', comuna_name)
        page_content = page_content.replace('{{slug}}', slug)
        page_content = page_content.replace('{{customText}}', custom_text)
        page_content = page_content.replace('{{schools_list}}', schools_list_html)
        page_content = page_content.replace('{{schools_list_text}}', schools_list_text)

        # Write output file
        output_file_name = f"{slug}.html"
        output_file_path = os.path.join(output_dir, output_file_name)

        with open(output_file_path, 'w', encoding='utf-8') as f:
            f.write(page_content)

        print(f"Generated: {output_file_path}")

    print("Programmatic SEO Comunas Generation Completed Successfully!")

if __name__ == '__main__':
    main()
