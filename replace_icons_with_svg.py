import os
import re

svg_icons = {
    "chat": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>',
    "check_circle": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    "location_on": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    "verified_user": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
    "menu": '<svg class="w-8 h-8 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    "close": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    "info": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    "calculate": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-2h2v2zm0-4h-2v-2h2v2zm-4 4H7v-2h4v2zm0-4H7v-2h4v2zm8 4h-2v-6h2v6zm0-8H5V5h14v4z"/></svg>',
    "menu_book": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 5c-1.11-.9-2.45-1.5-4.48-1.5-2.03 0-3.92.83-5.52 2.11C9.4 4.33 7.51 3.5 5.48 3.5c-2.03 0-3.37.6-4.48 1.5v13.5c1.11-.9 2.45-1.5 4.48-1.5 2.03 0 3.92.83 5.52 2.11 1.6-1.28 3.49-2.11 5.52-2.11 2.03 0 3.37.6 4.48 1.5V5zM12 18.28c-1.6-1.28-3.49-2.11-5.52-2.11-2.03 0-3.37.6-4.48 1.5V5.5c1.11-.9 2.45-1.5 4.48-1.5 2.03 0 3.92.83 5.52 2.11v12.17z"/></svg>',
    "star": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    "schedule": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
    "celebration": '<svg class="w-12 h-12 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 22h20v-2H2v2zm1-3h18V8H3v11zm9-8.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm6.5 4c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-11 0c.83 0 1.5-.67 1.5-1.5S7.33 12 6.5 12 5 12.67 5 13.5 5.67 15 6.5 15z"/></svg>',
    "straighten": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z"/></svg>',
    "help": '<svg class="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>',
    "expand_more": '<svg class="w-5 h-5 fill-none stroke-current stroke-2 inline-block transition-transform duration-300" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    "expand_less": '<svg class="w-5 h-5 fill-none stroke-current stroke-2 inline-block transition-transform duration-300" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    
    # NEW MAPPINGS
    "call": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 3.99c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.59c0-.55-.45-1-1-1z"/></svg>',
    "mail": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    "share": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
    "school": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91v6.27h2V9L12 3z"/></svg>',
    "check_box": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    "clean_hands": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a5 5 0 00-5 5v3.66l-1.12-.38a1 1 0 00-1.28.62L4 12.5l5.22 5.23c.39.39.9.61 1.44.61H18a2 2 0 002-2v-6a2 2 0 00-2-2h-3V7a5 5 0 00-5-5zm1 14h-3.34l-3-3 .29-.82 3.55 1.21V7a2 2 0 014 0v4h2a2 2 0 010 4h-3.5z"/></svg>',
    "handshake": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.71 11.29l-3-3a1 1 0 00-1.42 0L14 11.59l-2.29-2.3a1 1 0 00-1.42 0l-3 3a1 1 0 000 1.42l3 3a1 1 0 001.42 0L14 14.41l2.29 2.3a1 1 0 001.42 0l3-3a1 1 0 000-1.42zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>',
    "payments": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>',
    "contact_support": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3h.5c4.69 0 8.5-3.81 8.5-8.5S16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm1.07-7.75l-.9.92C11.9 10.43 11.5 11 11.5 12h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H6.5c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>',
    "woman": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2.8 5.75L12.7 7.1C12.48 7.03 12.24 7 12 7c-.24 0-.48.03-.7.1L9.2 7.75A1 1 0 008.5 8.7v4.8c0 .55.45 1 1 1h.5v5.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5h.5c.55 0 1-.45 1-1V8.7c0-.46-.31-.86-.7-.95z"/></svg>',
    "man": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2 7h-4c-1.1 0-2 .9-2 2v6h2v5h4v-5h2v-6c0-1.1-.9-2-2-2z"/></svg>',
    "warning": '<svg class="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    "open_in_new": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    
    # NEWEST MAPPINGS FOR UNMAPPED ICONS
    "style": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.25 0 2.25-1 2.25-2.25 0-.53-.18-1.01-.49-1.4-.29-.39-.49-.86-.49-1.4 0-1.1.9-2 2-2H17c2.76 0 5-2.24 5-5 0-4.42-4.48-8-10-8zm-6.5 11c-.83 0-1.5-.67-1.5-1.5S4.67 10 5.5 10 7 10.67 7 11.5 6.33 13 5.5 13zm3-4C7.67 9 7 8.33 7 7.5S7.67 6 8.5 6 10 6.67 10 7.5 9.33 9 8.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S12.67 6 13.5 6 15 6.67 15 7.5 14.33 9 13.5 9zm4.5 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    "shield": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>',
    "verified": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7 3.1 5.51l.34 3.69L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    "apparel": '<svg class="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c-.67 0-1.2.46-1.39 1.09L7.33 7.82C6.51 8.35 6 9.27 6 10.32V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-9.68c0-1.05-.51-1.97-1.33-2.5l-3.28-4.73C13.2 2.46 12.67 2 12 2zm0 8.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>',
    "checkroom": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a3 3 0 00-3 3h2a1 1 0 012 0c0 .35-.11.66-.29.92l-5.6 8.08C6.44 14.93 6 15.91 6 17v2a2 2 0 002 2h8a2 2 0 002-2v-2c0-1.09-.44-2.07-1.11-3l-5.6-8.08A2.99 2.99 0 0012 2z"/></svg>',
    "chat_bubble": '<svg class="w-8 h-8 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
    "groups": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM5.5 10c.83 0 1.5-.67 1.5-1.5S6.33 7 5.5 7 4 7.67 4 8.5 4.67 10 5.5 10zm13 0c.83 0 1.5-.67 1.5-1.5S19.33 7 18.5 7s-1.5.67-1.5 1.5.67 10 1.5 10zM3.5 14c-1.67 0-5 1.17-5 3.5v2.5h5v-2.5c0-1.5.75-2.75 2-3.5H3.5zm17 0c-.5 0-1.25.75-1.25 2.25v2.75H24v-2.5c0-2.33-3.33-3.5-5-3.5z"/></svg>',
    "security": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
    "support_agent": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12v5c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-3v8h3c1.66 0 3-1.34 3-3v-5c0-5.52-4.48-10-10-10z"/></svg>',
    "explore": '<svg class="w-6 h-6 fill-current inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-4-2 2-4 4 2-2 4z"/></svg>'
}

def replace_icons_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Robust regex to find any <span ... class="...material-symbols-outlined...">icon_name</span>
    # regardless of order of attributes or position of class inside tag
    pattern = r'<span\s+[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*(.*?)\s*</span>'
    
    def replacer(match):
        icon_name = match.group(1).strip()
        if icon_name in svg_icons:
            return svg_icons[icon_name]
        print(f"Warning: Icon '{icon_name}' in {file_path} is not mapped to SVG!")
        return match.group(0)

    new_content, count = re.subn(pattern, replacer, content)
    
    # Clean up Google Font Material Symbols links completely if present
    font_pattern = r'<link\s+[^>]*Material\+Symbols\+Outlined[^>]*>'
    new_content, font_count = re.subn(font_pattern, '', new_content)
    
    new_content, font_count_2 = re.subn(r'<link\s+[^>]*Material\s+Symbols\s+Outlined[^>]*>', '', new_content)

    if count > 0 or font_count > 0 or font_count_2 > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Replaced {count} icons and cleaned font links in {file_path}")

def main():
    # Process root HTML files
    for file in os.listdir('.'):
        if file.endswith('.html'):
            replace_icons_in_file(file)
            
    # Process comunas HTML files
    comunas_dir = 'comunas'
    if os.path.exists(comunas_dir):
        for file in os.listdir(comunas_dir):
            if file.endswith('.html'):
                replace_icons_in_file(os.path.join(comunas_dir, file))

if __name__ == '__main__':
    main()
