import sqlite3

DATABASE_NAME = "ecommerce.db"


def create_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    return connection


def create_products_table():
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            category TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()

def add_product(name, price, stock, category):

    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO products
        (name, price, stock, category)

        VALUES (?, ?, ?, ?)
        """,
        (name, price, stock, category)
    )

    connection.commit()
    connection.close()
    
def get_all_products():
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT id, name, price, stock, category FROM products")

    rows = cursor.fetchall()

    connection.close()

    products = []

    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "price": row[2],
            "stock": row[3],
            "category": row[4]
        })

    return products    
def delete_product(product_id):
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM products WHERE id = ?",
        (product_id,)
    )

    connection.commit()
    connection.close()
def update_product(product_id, name, price, stock, category):
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE products
        SET name = ?, price = ?, stock = ?, category = ?
        WHERE id = ?
        """,
        (name, price, stock, category, product_id)
    )

    connection.commit()
    connection.close()    
def get_total_stock():
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT SUM(stock) FROM products"
    )

    result = cursor.fetchone()[0]

    connection.close()

    return result or 0


def get_total_value():
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT SUM(price * stock) FROM products"
    )

    result = cursor.fetchone()[0]

    connection.close()

    return result or 0


def get_average_price():
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT AVG(price) FROM products"
    )

    result = cursor.fetchone()[0]

    connection.close()

    return round(result or 0, 2)