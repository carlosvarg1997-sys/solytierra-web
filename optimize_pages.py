import os

def optimize_index():
    path = 'index.html'
    if not os.path.exists(path):
        print("index.html not found.")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Wrap in main
    # Insert <main class="flex-grow"> right after </header>
    header_end = '</header>'
    if header_end in content and '<main' not in content:
        content = content.replace(header_end, header_end + '\n  <main class="flex-grow">', 1)
        # Insert </main> right before <!-- Footer -->
        footer_start = '<!-- Footer -->'
        if footer_start in content:
            content = content.replace(footer_start, '</main>\n\n  ' + footer_start, 1)

    # 2. Add resize parameters to googleusercontent URLs
    hero_url = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWNXhdt1PqCL34cr1gUMcbM-GH6ucVFD3c1h3L8lOaq9n5gmBrKMxEsYRFcOV4LhLKxx2cwlUigNBCYHpiEg6-ryVOj8WUUY6QY4-9jKVtTVHq_Tgrb6ABq2SXQgPNOApL9pdYeTUk5q2mK0ORpxFFFoouAJNZRs1xxBWogaw1JqcK1MT9BXyjhRsKBlt-r666hIbvYMmdsUC622id6e5sdQ9MFa6eIlyJZ82ZtVJRozaZo2bhxrpPbI4gO867Bml3keM3tH-5aKyv'
    content = content.replace(hero_url, hero_url + '=w1200')
    
    blue_url = 'https://lh3.googleusercontent.com/aida-public/AB6AXuANYS8eUuoAqEcSetR6brO1VMjizbYuFFLLE5MlHQ8bGnWLqLRwcpzTLp6EcXlRuhiQxkpyl93YqvQSEIgui6JQCk4ruxWQUG6KIJTTWlsW1h9Es649AQ3oUHgA_Md47aCIfpiJWs8HWZtDEfBKUHCqPrYDK-HguUPViW1K5D5CkVTV77cFpAqvCcSpIPFEcASwNl7n4EnUbCckkjSWGjU_vlfn0wEw12rXYBe7uTpfRR5X5UltvBuldcgNy0yqeUoofGVvZin9Gf5x'
    content = content.replace(blue_url, blue_url + '=w500')
    
    turq_url = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvA4tJdwbe09zF39HOz6bKkdrlKUKtIZS3Mo2X9SACusUuOn2FrEIsBrK2STf0QItSJIQP7F6_c8TtVRMvhD8s75DvZuCJvfkq4khpCQQhRYZRJtAl3UygJ3XorhCkqMZ0WBYNGcwOELQBnzTZj45gmMX95fO0B3e2CTaJA0waTSRor6RV4Y4KpQMABn6pEem_re16AWGoty5Q1kO-oJbcflXER2DQ3A1Pl-gB8NyLfnP822RNa0hU9abK9Wvx3DEPyn4Zn5IEd5gx'
    content = content.replace(turq_url, turq_url + '=w500')

    # 3. Heading hierarchy fixes (H3 to P tags)
    content = content.replace('<h3 class="text-xs font-bold tracking-widest text-tierra uppercase mb-3">Paso a Paso</h3>', 
                              '<p class="text-xs font-bold tracking-widest text-tierra-dark uppercase mb-3">Paso a Paso</p>')
    content = content.replace('<h3 class="text-xs font-bold tracking-widest text-turquesa uppercase mb-3">La Diferencia</h3>', 
                              '<p class="text-xs font-bold tracking-widest text-turquesa-dark uppercase mb-3">La Diferencia</p>')
    content = content.replace('<h3 class="text-xs font-bold tracking-widest text-fucsia uppercase mb-3">Diseños y Colores</h3>', 
                              '<p class="text-xs font-bold tracking-widest text-fucsia-dark uppercase mb-3">Diseños y Colores</p>')
    content = content.replace('<h3 class="text-xs font-bold tracking-widest text-tierra uppercase mb-3">Precios Claros</h3>', 
                              '<p class="text-xs font-bold tracking-widest text-tierra-dark uppercase mb-3">Precios Claros</p>')
    content = content.replace('<h3 class="text-xs font-bold tracking-widest text-turquesa uppercase mb-3">Opiniones</h3>', 
                              '<p class="text-xs font-bold tracking-widest text-turquesa-dark uppercase mb-3">Opiniones</p>')

    # 4. Input accessibility (suits slider)
    content = content.replace('<input type="range" id="suits-slider"', 
                              '<input type="range" id="suits-slider" aria-label="Deslizador para seleccionar cantidad de trajes"')

    # 5. Contrast improvements (notification bar & hero badge)
    content = content.replace('bg-gradient-to-r from-tierra to-sol text-white text-center py-2 px-4',
                              'bg-gradient-to-r from-tierra-dark to-tierra text-white text-center py-2 px-4')
    content = content.replace('text-tierra bg-tierra/10 border border-tierra/20 px-3 py-1.5',
                              'text-tierra-dark bg-tierra/10 border border-tierra/20 px-3 py-1.5')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html optimized successfully.")

def optimize_catalogo():
    path = 'catalogo.html'
    if not os.path.exists(path):
        print("catalogo.html not found.")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Wrap in main
    header_end = '</header>'
    if header_end in content and '<main' not in content:
        content = content.replace(header_end, header_end + '\n  <main class="flex-grow">', 1)
        footer_start = '<!-- Footer -->'
        if footer_start in content:
            content = content.replace(footer_start, '</main>\n\n  ' + footer_start, 1)

    # 2. Add resize parameters to mannequin images in grid
    blue_mannequin = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7DQ4lAIDd00eVqZZ6f3Wh1fOjegkdU28a0ebxvYR2TuC9cnAu8msW7a_4gk5vwru-pQXjNoBe_bF4eZXqoYRZ6Ti3iTE3UJidDNLmenxiCXh5HTvekWj472BODtEbM9XLpbMArk6U_t5AvpOTPqAbIt9caT4CTUT3akQJkWqZDCg66-uVc3ZRTrKswUM5X8OTWzdwY8REWl2D3KChmkd5gYuAU_Re2eCiJEBPEZeu-AImPqc6GpkftYYy_Hf60jmjcTQoz_huMrXc'
    content = content.replace(blue_mannequin, blue_mannequin + '=w500')
    
    red_mannequin = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnd7Rix5AfVfTfUmfUvjPBkxl50H_dR0A74eqvgbFjgqC6Ucrs96d9zGZ_bj5NDNUVHudI-RYP0Xj8JvO6LgSSaHHCzqlCbwFldCxd9sJ1NVjsl8Xvjel4Yb6i0Xf3-me-QxAdO0reJh1LnIsdpa-3nKdsTzsHY_MW7O9gyFOZqPCizlocgWOhWRcL-WSS1z6ypLNK8sgfICKNrMT5AdnSAv6cr7PBiz5nmOplP6lEPE8CE61zZAgWEsuOTWNOSP2xIrya2SmOlbpX'
    content = content.replace(red_mannequin, red_mannequin + '=w500')
    
    turq_mannequin = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvA4tJdwbe09zF39HOz6bKkdrlKUKtIZS3Mo2X9SACusUuOn2FrEIsBrK2STf0QItSJIQP7F6_c8TtVRMvhD8s75DvZuCJvfkq4khpCQQhRYZRJtAl3UygJ3XorhCkqMZ0WBYNGcwOELQBnzTZj45gmMX95fO0B3e2CTaJA0waTSRor6RV4Y4KpQMABn6pEem_re16AWGoty5Q1kO-oJbcflXER2DQ3A1Pl-gB8NyLfnP822RNa0hU9abK9Wvx3DEPyn4Zn5IEd5gx'
    content = content.replace(turq_mannequin, turq_mannequin + '=w500')
    
    diagram_img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmxwNLdco9OmMObW_Ei4NKpi5kW_DVxL5Hi9w2xulXAW-_WUCb51Ar3YsKh4GjHipj5ttA88Xb2b8HJhc9XE7sRx1hN5PcpUFa_FLIUnk9OuUHZ0lMpHw0gVpLJVifWbiZtnPjWUYYFDyHOVFGs75N2gKjhoJWDt_nbJBL_RcW8kJXtjpbxhzBAZa3MHiMVP6o2N3a3O3Ufx3R4Jc-5uIQr6V1SnPn0o_ModKgs65vd-RYndDidKTBO4bLCP7JQ0c7wr_pGhEI5kRZ'
    content = content.replace(diagram_img, diagram_img + '=w800')

    # 3. Add sr-only h2 to the grid section to satisfy sequential heading order
    grid_section = '<section class="py-12 md:py-16 bg-crema">'
    if grid_section in content and 'sr-only' not in content:
        content = content.replace(grid_section, grid_section + '\n    <h2 class="sr-only">Colección de Trajes Disponibles</h2>', 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("catalogo.html optimized successfully.")

if __name__ == '__main__':
    optimize_index()
    optimize_catalogo()
