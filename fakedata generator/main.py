import random
import uuid
from faker import Faker

fake = Faker()

# Product names and associated categories
product_catalog = {
    "Wireless Mouse": "Electronics",
    "Bluetooth Headphones": "Electronics",
    "USB-C Charger": "Electronics",
    "Laptop Stand": "Office",
    "Smart Watch": "Wearables",
    "External SSD": "Electronics",
    "Webcam": "Electronics",
    "Portable Speaker": "Audio",
    "Ergonomic Keyboard": "Office",
    "HD Monitor": "Electronics",
    "Ceramic Coffee Mug": "Home & Kitchen",
    "Silicone Baking Mat": "Home & Kitchen",
    "LED Fairy Lights": "Home & Decor",
    "Cotton Bath Towel": "Home & Kitchen",
    "Aromatherapy Diffuser": "Home & Decor",
    "Stainless Steel Water Bottle": "Outdoors",
    "Leather Wallet": "Fashion",
    "Mini Succulent Planter": "Home & Decor",
    "Wooden Desk Organizer": "Office",
    "Spiral Notebook": "Office",
    "Bamboo Toothbrush": "Personal Care",
    "Essential Oil Set": "Beauty & Wellness",
    "Electric Kettle": "Home & Kitchen",
    "Folding Umbrella": "Outdoors",
    "Yoga Mat": "Fitness",
    "Velvet Throw Blanket": "Home & Decor",
    "Travel Toiletry Bag": "Travel",
    "Wireless Doorbell": "Home Improvement",
    "Clip-On Reading Light": "Home & Decor",
    "Noise Cancelling Earplugs": "Health",
    "Smartphone Tripod": "Photography",
    "Magnetic Whiteboard": "Office",
    "Gel Ink Pen Set": "Office",
    "Reusable Grocery Bags": "Eco-Friendly",
    "Digital Kitchen Scale": "Home & Kitchen",
    "Scented Candles": "Home & Decor",
    "Portable Blender": "Home & Kitchen",
    "Laptop Cleaning Kit": "Electronics",
    "Running Shoes": "Fitness",
    "Hair Dryer Brush": "Beauty & Wellness",
    "Pocket Notebook": "Office",
    "Bluetooth Shower Speaker": "Audio",
    "Eco-Friendly Lunch Box": "Home & Kitchen",
    "Stainless Steel Knife Set": "Home & Kitchen",
    "Rechargeable Hand Warmer": "Outdoors",
    "Pet Hair Remover": "Pet Supplies",
    "Indoor Plant Grow Light": "Gardening",
    "DIY Candle Making Kit": "Crafts",
    "Memory Foam Pillow": "Home & Kitchen",
    "Sleep Mask": "Travel",
    "Electric Screwdriver": "Tools",
    "Smartphone Ring Holder": "Accessories",
    "Face Roller": "Beauty & Wellness",
    "Silicone Ice Cube Tray": "Home & Kitchen",
    "Fabric Shaver": "Home & Kitchen",
    "Wool Beanie": "Fashion",
    "Wall Mounted Coat Rack": "Home & Decor",
    "Cork Bulletin Board": "Office",
    "Camping Lantern": "Outdoors",
    "Drawing Tablet": "Electronics",
    "Plush Stuffed Animal": "Toys",
    "Digital Thermometer": "Health",
    "Floating Bookshelf": "Home & Decor",
    "Mason Jar Set": "Home & Kitchen",
    "Screen Protector": "Accessories",
    "Microfiber Duster": "Home & Kitchen",
    "LED Makeup Mirror": "Beauty & Wellness",
    "Electric Wine Opener": "Home & Kitchen",
    "Wireless Security Camera": "Home Security",
    "Smart Light Strip": "Home & Decor",
    "Thermal Flask": "Outdoors",
    "Stainless Steel Straws": "Eco-Friendly",
    "Coloring Book for Adults": "Books",
    "Instant Film Camera": "Photography",
    "Sleep Sound Machine": "Home & Wellness",
    "Portable Tool Set": "Tools",
    "Cordless Vacuum": "Home & Kitchen",
    "Pet Water Fountain": "Pet Supplies",
    "Travel Neck Pillow": "Travel",
    "Magnetic Spice Rack": "Home & Kitchen",
    "Portable Fire Pit": "Outdoors",
    "Hammock Chair": "Outdoors",
    "Standing Desk Converter": "Office",
    "Embroidery Starter Kit": "Crafts",
    "Silicone Oven Mitts": "Home & Kitchen",
    "Windproof Lighter": "Outdoors",
    "Compost Bin": "Eco-Friendly",
    "Wrist Support Brace": "Health",
    "Paint-by-Number Kit": "Crafts",
    "Magnetic Charging Cable": "Electronics",
    "Indoor Herb Garden Kit": "Gardening",
    "Fitness Tracker Watch": "Wearables",
    "Detangling Hair Brush": "Beauty & Wellness",
    "Wireless Barcode Scanner": "Office",
    "Customizable Keychain": "Accessories",
    "Electric Heating Pad": "Health",
    "Wall Art Print": "Home & Decor",
    "Leather Journal": "Office",
    "Bathroom Scale": "Health",
    "Resistance Bands Set": "Fitness",
    "Portable Picnic Blanket": "Outdoors",
    "Electric Facial Cleanser": "Beauty & Wellness",
    "Mini Fridge": "Home & Kitchen",
    "Camping Stove": "Outdoors",
    "Popsocket Grip": "Accessories",
    "Kids’ Art Supplies": "Toys",
    "Chef’s Apron": "Home & Kitchen",
    "Cooling Gel Pillow": "Home & Kitchen",
    "Bluetooth Key Finder": "Electronics",
    "Hiking Backpack": "Outdoors"
}

# Optional suffixes
suffixes = [
    "", " - Black", " - White", " - Red", " - Blue", " - Compact", " - Large",
    " - 2025 Edition", " v2", " Pro", " Max", " Mini", " with Case", " + Charger"
]

# Generate 500 fake product entries
products = []
for _ in range(2500):
    base_name = random.choice(list(product_catalog.keys()))
    category = product_catalog[base_name]
    suffix = random.choice(suffixes)
    product_id = str(uuid.uuid4())
    product_name_variant = base_name + suffix
    price = round(random.uniform(20.0, 500.0), 2)
    offer_price = random.choice([None, round(price * random.uniform(0.7, 0.95), 2)])

    # Tags generated from base name + category + suffix words
    name_tags = base_name.lower().replace("-", "").split()
    suffix_tags = suffix.lower().replace("-", "").replace("+", "").split()
    tags = list(set(name_tags + suffix_tags + category.lower().split()))

    product = {
        "product_id": product_id,
        "product_name": product_name_variant,
        "product_price": price,
        "product_rating": round(random.uniform(1.0, 5.0), 1),
        "product_seller": fake.company(),
        "offer_price": offer_price,
        "stock_quantity": random.randint(0, 1000),
        "product_category": category,
        "product_tags": tags
    }
    products.append(product)

# Print first 5 for preview
for p in products[:5]:
    print(p)
print(f"Total products generated: {len(products)}")
# Save to JSON file
import json
with open('products.json', 'w') as f:
    json.dump(products, f, indent=4)