import json
import csv

with open("products.json", "r") as f:
    data = json.load(f)

with open("products.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "product_id", "product_name", "product_price", "product_rating",
        "product_seller", "offer_price", "stock_quantity",
        "product_category", "product_tags"
    ])

    for p in data:
        writer.writerow([
            p["product_id"],
            p["product_name"],
            p["product_price"],
            p["product_rating"],
            p["product_seller"],
            p["offer_price"] if p["offer_price"] is not None else "",
            p["stock_quantity"],
            p["product_category"],
            "{" + ",".join(p["product_tags"]) + "}"
        ])
