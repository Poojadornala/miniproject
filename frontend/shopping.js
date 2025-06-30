document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("product-list");

  try {
    const res = await fetch("http://localhost:5000/api/products");
    const products = await res.json();

    products.forEach(product => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.borderRadius = "8px";
      div.style.padding = "10px";
      div.style.width = "200px";
      div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="width:100%; height:150px; object-fit:cover;">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <button>Add to Cart</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "<p>⚠️ Failed to load products</p>";
    console.error(err);
  }
});
