const API_URL = "http://127.0.0.1:8000";

let editingProductId = null;
let categoryChart = null;

function getCategoryIcon(category){

    category = category.toLowerCase();

    if(category==="electronics") return "💻";

    if(category==="food") return "🍔";

    if(category==="book") return "📚";

    if(category==="clothes") return "👕";

    return "📦";

}

function showToast(message){

    const toast=document.getElementById("toast");

    if(!toast) return;

    toast.innerText=message;

    toast.style.display="block";

    setTimeout(function(){

        toast.style.display="none";

    },2000);

}

function clearForm(){

    document.getElementById("name").value="";

    document.getElementById("price").value="";

    document.getElementById("stock").value="";

    document.getElementById("category").value="";

    editingProductId=null;

}

async function loadProductCount(){

    const response=await fetch(`${API_URL}/products/count`);

    const data=await response.json();

    document.getElementById("product-count").innerText=data.count;

}

async function loadStatistics(){

    const response=await fetch(`${API_URL}/statistics`);

    const data=await response.json();

    document.getElementById("total-stock").innerText=data.total_stock;

    document.getElementById("total-value").innerText=data.total_value+" PLN";

    document.getElementById("average-price").innerText=data.average_price+" PLN";

    const response2=await fetch(`${API_URL}/products`);

    const products=await response2.json();

    const categories=new Set();

    products.forEach(function(product){

        categories.add(product.category);

    });

    document.getElementById("category-count").innerText=categories.size;

    let percent=data.total_stock;

    if(percent>100){

        percent=100;

    }

    document.getElementById("progress-fill").style.width=percent+"%";

    document.getElementById("progress-text").innerText=percent+"% Inventory";

}

async function loadProducts(){

    const response=await fetch(`${API_URL}/products`);

    const products=await response.json();

    const searchText=document
        .getElementById("search")
        .value
        .toLowerCase();

    const productList=document.getElementById("product-list");

    productList.innerHTML="";

    products
    .filter(function(product){

        return product.name
        .toLowerCase()
        .includes(searchText);

    })
        .forEach(function(product){

        const stockStatus = product.stock > 0
            ? "🟢 In Stock"
            : "🔴 Out of Stock";

        const icon = getCategoryIcon(product.category);

        productList.innerHTML += `
            <div class="product-card">

                <div class="product-header">
                    <h3>${icon} ${product.name}</h3>
                    <span class="status-badge">${stockStatus}</span>
                </div>

                <p><strong>ID:</strong> ${product.id}</p>
                <p><strong>Price:</strong> ${product.price} PLN</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Category:</strong> ${product.category}</p>

                <button onclick="fillEditForm(${product.id}, '${product.name}', ${product.price}, ${product.stock}, '${product.category}')">
                    ✏ Edit
                </button>

                <button onclick="deleteProduct(${product.id})">
                    🗑 Delete
                </button>

            </div>
        `;

    });

}

async function addProduct(){

    const product = {
        name: document.getElementById("name").value,
        price: Number(document.getElementById("price").value),
        stock: Number(document.getElementById("stock").value),
        category: document.getElementById("category").value
    };

    if(editingProductId === null){

        await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        showToast("✅ Product added successfully");

    } else {

        await fetch(`${API_URL}/products/${editingProductId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        showToast("✏ Product updated successfully");

    }

    clearForm();
    refreshDashboard();

}

function fillEditForm(id, name, price, stock, category){

    editingProductId = id;

    document.getElementById("name").value = name;
    document.getElementById("price").value = price;
    document.getElementById("stock").value = stock;
    document.getElementById("category").value = category;

    showToast("✏ Edit mode active");

}

async function deleteProduct(productId){

    const confirmed = confirm("Are you sure you want to delete this product?");

    if(!confirmed){
        return;
    }

    await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE"
    });

    showToast("🗑 Product deleted successfully");

    refreshDashboard();

}

async function exportCSV(){

    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();

    let csv = "ID,Name,Price,Stock,Category\n";

    products.forEach(function(product){

        csv += `${product.id},${product.name},${product.price},${product.stock},${product.category}\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "products.csv";

    a.click();

    window.URL.revokeObjectURL(url);

    showToast("📥 CSV exported successfully");

}

function refreshDashboard(){

    loadProductCount();
    loadStatistics();
    loadProducts();
    loadCategoryChart();

}

function init(){

    refreshDashboard();

}
async function loadCategoryChart() {

    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();

    const categoryData = {};

    products.forEach(function(product){

        if(categoryData[product.category]){
            categoryData[product.category]++;
        }
        else{
            categoryData[product.category]=1;
        }

    });

    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    let maxIndex=0;

    for(let i=1;i<values.length;i++){
    
    if(values[i]>values[maxIndex]){
    
    maxIndex=i;
    
    }
    
    }
    
    document.getElementById("best-category").innerText=
    labels.length?labels[maxIndex]:"-";
    
    document.getElementById("total-categories").innerText=
    labels.length;

    const ctx = document.getElementById("categoryChart");

    if(!ctx){
        return;
    }

    if(categoryChart){
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx,{
        type:"bar",
        data:{
            labels:labels,
            datasets:[
                {
                    label:"Products",
                    data:values
                }
            ]
        }
    });

}
function toggleTheme(){

    document.body.classList.toggle("dark");

    const themeButton = document.getElementById("theme-button");

    if(document.body.classList.contains("dark")){
        themeButton.innerText = "☀️ Light Mode";
    }
    else{
        themeButton.innerText = "🌙 Dark Mode";
    }

}
function login(){

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if(email === "admin@test.com" && password === "1234"){

        document.getElementById("login-screen").style.display = "none";

        showToast("✅ Login successful");

    }
    else{

        alert("Wrong email or password");

    }
}
function logout(){

    document.getElementById("login-screen").style.display = "flex";

    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";

    showToast("🚪 Logged out successfully");

}
async function exportPDF(){

    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("E-Commerce Product Report",20,20);

    doc.setFontSize(11);

    let y=35;

    products.forEach(function(product){

        doc.text(
            `ID: ${product.id} | ${product.name} | ${product.price} PLN | Stock: ${product.stock} | ${product.category}`,
            20,
            y
        );

        y+=10;

        if(y>280){
            doc.addPage();
            y=20;
        }

    });

    doc.save("products-report.pdf");

    showToast("📄 PDF exported successfully");

}
init();