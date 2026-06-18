import base64
from PIL import Image, ImageDraw, ImageFont

# Buat gambar baru dengan background transparan
img = Image.new('RGBA', (200, 80), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Warna - RGB format
lite_color = (15, 23, 42)   # #0f172a - Biru Tua
pos_color = (59, 130, 246)  # #3b82f6 - Biru Benhur

# Gunakan font system
try:
    font = ImageFont.truetype('arial.ttf', 50)
except:
    font = ImageFont.load_default()

# Gambar teks
draw.text((10, 10), 'Lite', fill=lite_color, font=font)
draw.text((110, 10), 'POS', fill=pos_color, font=font)

# Simpan PNG transparan
output_path = 'D:/AndroidPos/src/assets/logo.png'
img.save(output_path, 'PNG')

# Buat versi untuk struk - background putih
img_receipt = Image.new('RGB', (200, 80), (255, 255, 255))
draw_receipt = ImageDraw.Draw(img_receipt)
draw_receipt.text((10, 10), 'Lite', fill=lite_color, font=font)
draw_receipt.text((110, 10), 'POS', fill=pos_color, font=font)

receipt_path = 'D:/AndroidPos/src/assets/receipt_logo.jpg'
img_receipt.save(receipt_path, 'JPEG', quality=95)

print("Logo PNG:", output_path)
print("Receipt logo:", receipt_path)