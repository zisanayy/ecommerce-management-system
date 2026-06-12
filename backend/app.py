from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models import Product
from backend.database import (
    create_products_table,
    add_product,
    get_all_products,
    delete_product,
    update_product,
    get_total_stock,
    get_total_value,
    get_average_price
)

app = FastAPI(
    title="E-Commerce Management System",
    description="Portfolio project by Zişan",
    version="1.0.0"
)

create_products_table()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "project": "E-Commerce Management System",
        "developer": "Zişan",
        "status": "Running",
        "version": "1.0.0"
    }


@app.post("/products")
def create_product(product: Product):
    add_product(
        product.name,
        product.price,
        product.stock,
        product.category
    )

    return {
        "message": "Product saved to database successfully",
        "product": product
    }
@app.get("/products")
def get_products():
    return get_all_products()


@app.get("/products/count")
def product_count():
    products = get_all_products()

    return {
        "count": len(products)
    }

@app.delete("/products/{product_id}")
def remove_product(product_id: int):
    delete_product(product_id)

    return {
        "message": "Product deleted successfully",
        "product_id": product_id
    }

@app.put("/products/{product_id}")
def edit_product(product_id: int, product: Product):
    update_product(
        product_id,
        product.name,
        product.price,
        product.stock,
        product.category
    )

    return {
        "message": "Product updated successfully",
        "product_id": product_id,
        "product": product
    }
@app.get("/statistics")
def statistics():

    return {
        "total_stock": get_total_stock(),
        "total_value": get_total_value(),
        "average_price": get_average_price()
    }