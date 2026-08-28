import os
import urllib.request
from PIL import Image

images_to_process = [
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAWNXhdt1PqCL34cr1gUMcbM-GH6ucVFD3c1h3L8lOaq9n5gmBrKMxEsYRFcOV4LhLKxx2cwlUigNBCYHpiEg6-ryVOj8WUUY6QY4-9jKVtTVHq_Tgrb6ABq2SXQgPNOApL9pdYeTUk5q2mK0ORpxFFFoouAJNZRs1xxBWogaw1JqcK1MT9BXyjhRsKBlt-r666hIbvYMmdsUC622id6e5sdQ9MFa6eIlyJZ82ZtVJRozaZo2bhxrpPbI4gO867Bml3keM3tH-5aKyv",
        "dest": "assets/images/hero.webp",
        "width": 1200
    },
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuANYS8eUuoAqEcSetR6brO1VMjizbYuFFLLE5MlHQ8bGnWLqLRwcpzTLp6EcXlRuhiQxkpyl93YqvQSEIgui6JQCk4ruxWQUG6KIJTTWlsW1h9Es649AQ3oUHgA_Md47aCIfpiJWs8HWZtDEfBKUHCqPrYDK-HguUPViW1K5D5CkVTV77cFpAqvCcSpIPFEcASwNl7n4EnUbCckkjSWGjU_vlfn0wEw12rXYBe7uTpfRR5X5UltvBuldcgNy0yqeUoofGVvZin9Gf5x",
        "dest": "assets/images/traje_azul.webp",
        "width": 600
    },
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBvA4tJdwbe09zF39HOz6bKkdrlKUKtIZS3Mo2X9SACusUuOn2FrEIsBrK2STf0QItSJIQP7F6_c8TtVRMvhD8s75DvZuCJvfkq4khpCQQhRYZRJtAl3UygJ3XorhCkqMZ0WBYNGcwOELQBnzTZj45gmMX95fO0B3e2CTaJA0waTSRor6RV4Y4KpQMABn6pEem_re16AWGoty5Q1kO-oJbcflXER2DQ3A1Pl-gB8NyLfnP822RNa0hU9abK9Wvx3DEPyn4Zn5IEd5gx",
        "dest": "assets/images/traje_turquesa.webp",
        "width": 600
    },
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuB7DQ4lAIDd00eVqZZ6f3Wh1fOjegkdU28a0ebxvYR2TuC9cnAu8msW7a_4gk5vwru-pQXjNoBe_bF4eZXqoYRZ6Ti3iTE3UJidDNLmenxiCXh5HTvekWj472BODtEbM9XLpbMArk6U_t5AvpOTPqAbIt9caT4CTUT3akQJkWqZDCg66-uVc3ZRTrKswUM5X8OTWzdwY8REWl2D3KChmkd5gYuAU_Re2eCiJEBPEZeu-AImPqc6GpkftYYy_Hf60jmjcTQoz_huMrXc",
        "dest": "assets/images/catalogo_azul.webp",
        "width": 600
    },
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCnd7Rix5AfVfTfUmfUvjPBkxl50H_dR0A74eqvgbFjgqC6Ucrs96d9zGZ_bj5NDNUVHudI-RYP0Xj8JvO6LgSSaHHCzqlCbwFldCxd9sJ1NVjsl8Xvjel4Yb6i0Xf3-me-QxAdO0reJh1LnIsdpa-3nKdsTzsHY_MW7O9gyFOZqPCizlocgWOhWRcL-WSS1z6ypLNK8sgfICKNrMT5AdnSAv6cr7PBiz5nmOplP6lEPE8CE61zZAgWEsuOTWNOSP2xIrya2SmOlbpX",
        "dest": "assets/images/catalogo_rojo.webp",
        "width": 600
    },
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuATxGX1KP8srwrl5MkAJfc4b83iMvvLAbGVxBWY6_UyB5CDtTx0O4f2rQ_VM2HA_PpOBkukiFY8RoiKoKrbxjs3Org9ioFTxQ_oav9KNubtsq0tSIq7QfMSQghwFFdrJiI6KVpJATuL3vmrQkZxkKo1_d44BW4vWRIGhoN8Z-0au_1QGRWKaPXf3YO0nwwlYyu8eTLEyqqzkNjkgOwIb1qFHZcHypST6BZI68Mi06KM2kJqUit-lXHGXnKwWsZ8lXAhP5E6IWFFbxa_",
        "dest": "assets/images/catalogo_verde.webp",
        "width": 600
    },
    {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAmxwNLdco9OmMObW_Ei4NKpi5kW_DVxL5Hi9w2xulXAW-_WUCb51Ar3YsKh4GjHipj5ttA88Xb2b8HJhc9XE7sRx1hN5PcpUFa_FLIUnk9OuUHZ0lMpHw0gVpLJVifWbiZtnPjWUYYFDyHOVFGs75N2gKjhoJWDt_nbJBL_RcW8kJXtjpbxhzBAZa3MHiMVP6o2N3a3O3Ufx3R4Jc-5uIQr6V1SnPn0o_ModKgs65vd-RYndDidKTBO4bLCP7JQ0c7wr_pGhEI5kRZ",
        "dest": "assets/images/diagrama.webp",
        "width": 800
    }
]

def download_and_optimize():
    os.makedirs("assets/images", exist_ok=True)
    
    # 1. Optimize the generated red image PNG to WebP
    red_png = "assets/images/traje_tobas_rojo.png"
    red_webp = "assets/images/traje_tobas_rojo.webp"
    if os.path.exists(red_png):
        print(f"Converting and resizing local red PNG to WebP: {red_png} -> {red_webp}")
        try:
            with Image.open(red_png) as img:
                target_width = 600
                width_percent = (target_width / float(img.size[0]))
                if width_percent < 1.0:
                    height_size = int((float(img.size[1]) * float(width_percent)))
                    img = img.resize((target_width, height_size), Image.Resampling.LANCZOS)
                img.save(red_webp, "WEBP", quality=75)
            print(f"Red WebP size: {os.path.getsize(red_webp) // 1024} KB")
        except Exception as e:
            print(f"Error converting red PNG: {e}")

    # 2. Download and optimize external images
    for item in images_to_process:
        url = item["url"]
        dest = item["dest"]
        target_width = item["width"]
        
        temp_file = dest + ".temp"
        print(f"Downloading {url[:50]}... -> {dest}")
        
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req) as response:
                with open(temp_file, 'wb') as out_file:
                    out_file.write(response.read())
            
            with Image.open(temp_file) as img:
                width_percent = (target_width / float(img.size[0]))
                if width_percent < 1.0:
                    height_size = int((float(img.size[1]) * float(width_percent)))
                    img = img.resize((target_width, height_size), Image.Resampling.LANCZOS)
                
                img.save(dest, "WEBP", quality=75)
            
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
            print(f"Optimized {dest} successfully. Size: {os.path.getsize(dest) // 1024} KB")
        except Exception as e:
            print(f"Error processing {dest}: {e}")
            if os.path.exists(temp_file):
                os.remove(temp_file)

    # 3. Replace in HTML files
    html_files = ["index.html", "catalogo.html"]
    for html_file in html_files:
        if not os.path.exists(html_file):
            continue
            
        with open(html_file, 'r', encoding='utf-8') as f:
            html = f.read()

        # Update URLs (both with and without resize parameter)
        for item in images_to_process:
            url = item["url"]
            dest = item["dest"]
            html = html.replace(url + '=w1200', dest)
            html = html.replace(url + '=w800', dest)
            html = html.replace(url + '=w500', dest)
            html = html.replace(url, dest)
            
        # Update local red image
        html = html.replace("assets/images/traje_tobas_rojo.png", "assets/images/traje_tobas_rojo.webp")
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Updated image paths in {html_file}")

if __name__ == '__main__':
    download_and_optimize()
