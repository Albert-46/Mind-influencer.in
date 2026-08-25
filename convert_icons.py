import os
from PIL import Image

src_dir = r"d:\Projects\mind-influencer"
files = [
    ("android-chrome-512x512.png", "android-chrome-512x512.jpg"),
    ("android-chrome-192x192.png", "android-chrome-192x192.jpg"),
    ("apple-touch-icon.png", "apple-touch-icon.jpg"),
    ("favicon-16x16.png", "favicon-16x16.jpg"),
    ("favicon-32x32.png", "favicon-32x32.jpg")
]

# Convert png to jpg
for png, jpg in files:
    png_path = os.path.join(src_dir, png)
    jpg_path = os.path.join(src_dir, jpg)
    if os.path.exists(png_path):
        img = Image.open(png_path)
        # convert to RGB to save as JPEG
        rgb_im = img.convert('RGB')
        rgb_im.save(jpg_path, quality=95)
        print(f"Created {jpg}")
    else:
        print(f"File {png} not found!")

# create favicon.jpg from something, maybe android-chrome-192x192.png?
# the prompt says favicon.jpg is one of the supplied files. Wait, there's no favicon.png.
# Maybe favicon.ico exists and I can use it to create favicon.jpg?
if os.path.exists(os.path.join(src_dir, "android-chrome-192x192.png")):
    img = Image.open(os.path.join(src_dir, "android-chrome-192x192.png")).convert('RGB')
    img.save(os.path.join(src_dir, "favicon.jpg"), quality=95)
    print("Created favicon.jpg")
else:
    print("Could not create favicon.jpg")

# Generate favicon.ico from 16x16 and 32x32
icon16_path = os.path.join(src_dir, "favicon-16x16.png")
icon32_path = os.path.join(src_dir, "favicon-32x32.png")

if os.path.exists(icon16_path) and os.path.exists(icon32_path):
    img16 = Image.open(icon16_path)
    img32 = Image.open(icon32_path)
    # The requirement is: "favicon.ico file containing 16x16 and 32x32 icon sizes"
    icon_path = os.path.join(src_dir, "favicon.ico")
    img32.save(icon_path, format='ICO', sizes=[(16,16), (32,32)], append_images=[img16])
    print(f"Generated {icon_path}")
else:
    print("Could not find source files to create favicon.ico")

