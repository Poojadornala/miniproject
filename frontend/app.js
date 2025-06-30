// frontend/app.js

// --- DOM Element References ---
let openShopping = document.querySelector('.icon-cart');
let closeShopping = document.querySelector('.close');
let listProduct = document.querySelector('.listProduct');
let listCart = document.querySelector('.listCart');
let body = document.querySelector('body');
let total = document.querySelector('.total');         // Selects element with class 'total' for total price
let quantity = document.querySelector('.icon-cart span'); // Corrected: Selects the span inside icon-cart for total quantity
let checkoutButton = document.querySelector('.checkOut');
let usernameDisplay = document.querySelector('#usernameDisplay'); // For displaying logged-in username

// NEW: DOM references for Product Detail Popup
let productDetailPopupOverlay = document.querySelector('.product-detail-popup-overlay');
let closePopupBtn = document.querySelector('.close-popup-btn');
let popupImage = document.querySelector('.popup-image');
let popupName = document.querySelector('.popup-name');
let popupPrice = document.querySelector('.popup-price');
let popupDescription = document.querySelector('.popup-description');
let addCartPopupBtn = document.querySelector('.addCart-popup');

// --- Data Arrays ---
let products = []; // Stores product data fetched from the backend
let cart = [];     // Stores items currently in the user's cart

// --- Authentication Helper Functions ---
const isUserLoggedIn = () => {
    return localStorage.getItem('authToken') !== null;
};

const getUserId = () => {
    return localStorage.getItem('userId');
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const getUsername = () => {
    return localStorage.getItem('username');
};

const updateUsernameDisplay = () => {
    if (isUserLoggedIn() && usernameDisplay) {
        usernameDisplay.textContent = `Hello, ${getUsername()}!`;
        usernameDisplay.style.display = 'block'; // Show if logged in
    } else if (usernameDisplay) {
        usernameDisplay.textContent = '';
        usernameDisplay.style.display = 'none'; // Hide if not logged in
    }
};

// --- Product Display Functions ---
const addProductsToHTML = () => {
    listProduct.innerHTML = ''; // Clear existing products
    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('item');
            // CRITICAL: Use product._id for MongoDB's default ID
            newProduct.dataset.id = product._id;
            newProduct.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/200x200/cccccc/000000?text=No+Image';">
                <h2>${product.name}</h2>
                <div class="price">₹${product.price.toLocaleString()}</div>
                <button class="addCart">Add To Cart</button>
            `;
            listProduct.appendChild(newProduct);
        });
    } else {
        listProduct.innerHTML = '<p style="text-align: center; color: red;">No products available at the moment. Please ensure the backend database is populated.</p>';
    }
};

// --- Cart Logic Functions ---

// Event listener for opening the shopping cart tab
openShopping.addEventListener('click', () => {
    body.classList.add('showCart');
});

// Event listener for closing the shopping cart tab
closeShopping.addEventListener('click', () => {
    body.classList.remove('showCart');
});

// Event delegation for "Add To Cart" buttons on the product list (both main list and popup)
listProduct.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id);
    }
});

/**
 * Adds a product to the cart or increments its quantity if already present.
 * @param {string} product_id - The _id of the product to add.
 */
const addToCart = (product_id) => {
    console.log('--- addToCart Called ---'); // DEBUG
    console.log('Attempting to add product_id:', product_id); // DEBUG

    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);

    if (positionThisProductInCart < 0) {
        // Product not in cart, add new item
        cart.push({
            product_id: product_id,
            quantity: 1,
        });
        console.log('Product added as new item.'); // DEBUG
    } else {
        // Product already in cart, increment quantity
        cart[positionThisProductInCart].quantity++;
        console.log('Product quantity incremented.'); // DEBUG
    }
    console.log('Current cart state after addToCart:', JSON.parse(JSON.stringify(cart))); // DEBUG (deep copy to avoid mutation issues in log)

    addCartToHTML();    // Update the cart UI
    addCartToMemory();  // Save cart to local storage
};

/**
 * Saves the current state of the cart array to local storage.
 */
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to local storage.'); // DEBUG
};

/**
 * Renders the items in the `cart` array into the HTML cart tab.
 */
const addCartToHTML = () => {
    console.log('--- addCartToHTML Called ---'); // DEBUG
    console.log('Rendering cart. Current cart:', JSON.parse(JSON.stringify(cart))); // DEBUG

    listCart.innerHTML = ''; // Clear current cart display
    let totalQuantity = 0;
    let totalPrice = 0;

    if (cart.length > 0) {
        // If cart has items, remove the "Your cart is empty" message
        const emptyMessage = listCart.querySelector('.emptyCartMessage');
        if (emptyMessage) {
            emptyMessage.remove();
            console.log('Removed empty cart message.'); // DEBUG
        }

        cart.forEach((item) => {
            totalQuantity += item.quantity; // Sum total quantity for cart icon
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.dataset.id = item.product_id;

            // Find the full product info from the 'products' array
            // CRITICAL: Use '_id' for matching with MongoDB IDs
            let positionProduct = products.findIndex((value) => value._id == item.product_id);

            if (positionProduct < 0) {
                console.warn(`Product with ID ${item.product_id} not found in fetched products. This item may be outdated or deleted. Skipping.`); // DEBUG
                // Optionally, you might want to remove this item from the cart here if it's no longer valid
                return; // Skip this item if product data isn't available
            }
            let info = products[positionProduct];
            totalPrice += info.price * item.quantity; // Calculate total price

            console.log(`Adding item to cart UI: ${info.name}, Quantity: ${item.quantity}`); // DEBUG

            newDiv.innerHTML = `
                <div class="image">
                    <img src="${info.image}" alt="${info.name}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/cccccc/000000?text=No+Image';">
                </div>
                <div class="name">${info.name}</div>
                <div class="totalPrice">₹${(info.price * item.quantity).toLocaleString()}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
            listCart.appendChild(newDiv);
        });
    } else {
        // If cart is empty, add the "Your cart is empty" message back
        listCart.innerHTML = '<p class="emptyCartMessage">Your cart is empty.</p>';
        console.log('Cart is empty, showing empty message.'); // DEBUG
    }

    console.log('Calculated totalQuantity:', totalQuantity); // DEBUG
    console.log('Calculated totalPrice:', totalPrice);      // DEBUG

    // Update the cart icon quantity display
    // 'quantity' is the span inside .icon-cart
    if (quantity) {
        quantity.innerText = totalQuantity;
        console.log('Updated cart icon quantity to:', totalQuantity); // DEBUG
    } else {
        console.warn('Cart icon quantity element (.icon-cart span) not found!'); // DEBUG
    }

    // Update the total price display in the cart summary
    // 'total' is the span inside .cart-summary .total
    const totalElementInSummary = document.querySelector('.cart-summary .total');
    if (totalElementInSummary) {
        totalElementInSummary.innerText = '₹' + totalPrice.toLocaleString();
        console.log('Updated cart total price in summary to:', '₹' + totalPrice.toLocaleString()); // DEBUG
    } else {
        console.warn('Total price element (.cart-summary .total) not found!'); // DEBUG
    }
    console.log('--- addCartToHTML Finished ---'); // DEBUG
};

// Event delegation for quantity change buttons (- / +) in the cart
listCart.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        // Get the product_id from the parent item div
        let product_id = positionClick.closest('.item').dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantity(product_id, type);
    }
});

/**
 * Changes the quantity of an item in the cart or removes it if quantity reaches 0.
 * @param {string} product_id - The _id of the product.
 * @param {string} type - 'plus' to increment, 'minus' to decrement.
 */
const changeQuantity = (product_id, type) => {
    console.log('--- changeQuantity Called ---'); // DEBUG
    console.log(`Changing quantity for product_id: ${product_id}, type: ${type}`); // DEBUG

    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);

    if (positionThisProductInCart >= 0) {
        switch (type) {
            case 'plus':
                cart[positionThisProductInCart].quantity++;
                break;
            default: // 'minus'
                cart[positionThisProductInCart].quantity--;
                if (cart[positionThisProductInCart].quantity <= 0) {
                    // Remove item from cart if quantity is 0 or less
                    cart.splice(positionThisProductInCart, 1);
                    console.log('Product removed from cart.'); // DEBUG
                }
        }
    }
    console.log('Current cart state after changeQuantity:', JSON.parse(JSON.stringify(cart))); // DEBUG

    addCartToHTML();    // Update the cart UI
    addCartToMemory();  // Save cart to local storage
    console.log('--- changeQuantity Finished ---'); // DEBUG
};

/**
 * Loads the cart data from local storage when the page loads.
 */
const getCartFromLocalstorage = () => {
    console.log('Attempting to load cart from local storage...'); // DEBUG
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        console.log('Cart loaded from local storage:', JSON.parse(JSON.stringify(cart))); // DEBUG
        addCartToHTML(); // Call this to render existing cart items
    } else {
        console.log('No cart found in local storage.'); // DEBUG
    }
};

// --- Checkout Logic (MODIFIED SECTION for redirection) ---
checkoutButton.addEventListener('click', () => {
    console.log('--- Checkout Button Clicked (app.js) ---'); // DEBUG

    if (!isUserLoggedIn()) {
        alert('Please log in to proceed with checkout.');
        window.location.href = 'login.html'; // Redirect to login page
        console.log('User not logged in, redirecting to login.'); // DEBUG
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        console.log('Cart is empty, cannot proceed to checkout page.'); // DEBUG
        return;
    }

    // Instead of making an API call here, we redirect to checkout.html
    // The cart data will be stored in localStorage and retrieved by checkout.js
    console.log('Redirecting to checkout.html...'); // DEBUG
    window.location.href = 'checkout.html';
});


// --- NEW: Product Detail Popup Logic ---

// Event listener for product image clicks to show details
listProduct.addEventListener('click', (event) => {
    let positionClick = event.target;
    // Check if the clicked element is an image within a product item
    if (positionClick.tagName === 'IMG' && positionClick.closest('.item')) {
        let product_id = positionClick.closest('.item').dataset.id;
        showProductDetail(product_id);
    }
});

// Event listener for closing the product detail popup using the 'x' button
closePopupBtn.addEventListener('click', () => {
    hideProductDetail();
});

// Event listener for closing popup when clicking outside the content (on the overlay)
productDetailPopupOverlay.addEventListener('click', (event) => {
    if (event.target === productDetailPopupOverlay) {
        hideProductDetail();
    }
});

/**
 * Displays the product detail popup for a given product ID.
 * @param {string} productId - The _id of the product to display.
 */
const showProductDetail = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
        popupImage.src = product.image;
        popupImage.alt = product.name;
        popupName.textContent = product.name;
        popupPrice.textContent = `₹${product.price.toLocaleString()}`;
        // Ensure description exists, otherwise provide a fallback
        popupDescription.textContent = product.description || 'No description available.';
        addCartPopupBtn.dataset.id = product._id; // Set product ID for add to cart button

        productDetailPopupOverlay.classList.add('active');
        body.classList.add('show-popup'); // For optional body blur/pointer-events defined in CSS
    } else {
        console.warn('Product not found for ID:', productId);
        alert('Product details could not be loaded.');
    }
};

/**
 * Hides the product detail popup.
 */
const hideProductDetail = () => {
    productDetailPopupOverlay.classList.remove('active');
    body.classList.remove('show-popup'); // For optional body blur/pointer-events defined in CSS
};

// Add to Cart from popup button
addCartPopupBtn.addEventListener('click', (event) => {
    const product_id = event.target.dataset.id;
    if (product_id) {
        addToCart(product_id);
        hideProductDetail(); // Close popup after adding to cart for a smoother UX
    }
});


// --- Initialization ---
/**
 * Initializes the application: fetches products and loads the cart.
 */
const initApp = () => {
    console.log('--- initApp Called (app.js) ---'); // DEBUG

    // Fetch products from backend
    fetch('http://localhost:3000/api/products')
        .then(response => {
            console.log('Response from /api/products (app.js):', response); // DEBUG
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText + ' (Status: ' + response.status + ')');
            }
            return response.json();
        })
        .then(data => {
            products = data;
            console.log('Products fetched (app.js):', JSON.parse(JSON.stringify(products))); // DEBUG
            addProductsToHTML();
            getCartFromLocalstorage(); // Load cart after products are available
            updateUsernameDisplay();
            console.log('initApp completed successfully (app.js).'); // DEBUG
        })
        .catch(error => {
            console.error('Error fetching products during initApp (app.js):', error); // DEBUG
            listProduct.innerHTML = '<p style="text-align: center; color: red;">Failed to load products. Please ensure the server is running and accessible, or check your internet connection. Error: ' + error.message + '</p>';
        });
};

// Ensure the app initializes when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);