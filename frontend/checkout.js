document.addEventListener('DOMContentLoaded', initCheckoutPage);

let cart = [];
let products = []; // We need product data to display summary correctly

// --- Helper Functions (Copied from app.js for consistency and avoiding global issues) ---
const getUserId = () => {
    return localStorage.getItem('userId');
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const getUsername = () => {
    return localStorage.getItem('username');
};

const getUserEmail = () => {
    // Assuming email is stored in localStorage after login. You should store it there
    // when a user successfully logs in, for example: localStorage.setItem('userEmail', userData.email);
    return localStorage.getItem('userEmail') || ''; // Provide default empty string if not found
};

// --- Form Element References ---
const checkoutForm = document.getElementById('checkoutForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const streetInput = document.getElementById('street');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');
const zipCodeInput = document.getElementById('zipCode');
const summaryItemsDiv = document.getElementById('summaryItems');
const summaryTotalSpan = document.getElementById('summaryTotal');

const radioCod = document.getElementById('radioCod');
const radioOnline = document.getElementById('radioOnline');
const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');
const upiIdInput = document.getElementById('upiId'); // Reusing for generic payment input
const payNowBtn = document.getElementById('payNowBtn');
const placeOrderBtn = document.querySelector('.place-order-btn'); // The main form submit button

// --- Modal Elements ---
const orderConfirmationModal = document.getElementById('orderConfirmationModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalOrderId = document.getElementById('modalOrderId');
const modalPaymentMethod = document.getElementById('modalPaymentMethod');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');


// --- Input Validation ---
const showError = (element, message) => {
    const errorDiv = document.getElementById(`${element.id}Error`);
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
    }
};

const hideError = (element) => {
    const errorDiv = document.getElementById(`${element.id}Error`);
    if (errorDiv) {
        errorDiv.innerText = '';
        errorDiv.style.display = 'none';
    }
};

const validateInput = (inputElement, regex, errorMessage) => {
    if (!inputElement) return true; // Element might not exist (e.g., upiId if COD is selected)

    const value = inputElement.value.trim();
    if (!value) {
        showError(inputElement, 'This field is required.');
        return false;
    }
    if (regex && !regex.test(value)) {
        showError(inputElement, errorMessage);
        return false;
    }
    hideError(inputElement);
    return true;
};

const validateForm = () => {
    let isValid = true;

    // Validate each input field. The `&& isValid` ensures it short-circuits if one fails.
    isValid = validateInput(fullNameInput, null, '') && isValid;
    isValid = validateInput(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format.') && isValid;
    isValid = validateInput(phoneInput, /^[0-9]{10}$/, 'Phone number must be 10 digits.') && isValid;
    isValid = validateInput(streetInput, null, '') && isValid;
    isValid = validateInput(cityInput, null, '') && isValid;
    isValid = validateInput(stateInput, null, '') && isValid;
    isValid = validateInput(zipCodeInput, /^[0-9]{6}$/, 'Zip code must be 6 digits.') && isValid;

    return isValid;
};

// --- Display Cart Summary ---
const displayCartSummary = () => {
    summaryItemsDiv.innerHTML = '';
    let calculatedTotal = 0;

    if (cart.length === 0) {
        summaryItemsDiv.innerHTML = '<p style="text-align: center; color: #555;">Your cart is empty. Please go back and add items.</p>';
        summaryTotalSpan.innerText = '₹0';
        return;
    }

    cart.forEach(item => {
        const productInfo = products.find(p => p._id === item.product_id); // Use _id
        if (productInfo) {
            const itemTotal = productInfo.price * item.quantity;
            calculatedTotal += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('order-item');
            itemDiv.innerHTML = `
                <span>${productInfo.name} (x${item.quantity})</span>
                <span>₹${itemTotal.toLocaleString()}</span>
            `;
            summaryItemsDiv.appendChild(itemDiv);
        } else {
            console.warn(`Product with ID ${item.product_id} not found in fetched products for summary.`);
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('order-item');
            itemDiv.innerHTML = `
                <span>Unknown Product (ID: ${item.product_id}) (x${item.quantity})</span>
                <span>N/A</span>
            `;
            summaryItemsDiv.appendChild(itemDiv);
        }
    });

    summaryTotalSpan.innerText = `₹${calculatedTotal.toLocaleString()}`;
};

// --- Show/Hide Online Payment Details based on radio button ---
const toggleOnlinePaymentDetails = () => {
    if (radioOnline.checked) {
        onlinePaymentDetails.style.display = 'block';
        upiIdInput.setAttribute('required', 'true');
        placeOrderBtn.style.display = 'none'; // Hide main Place Order button for online
    } else {
        onlinePaymentDetails.style.display = 'none';
        upiIdInput.removeAttribute('required');
        placeOrderBtn.style.display = 'block'; // Show main Place Order button for COD
        hideError(upiIdInput); // Clear error if was previously shown
    }
};

// --- Show Order Confirmation Modal ---
const showOrderConfirmationModal = (title, message, orderId, paymentMethod) => {
    modalTitle.innerText = title;
    modalMessage.innerText = message;
    modalOrderId.innerText = orderId || 'N/A';
    modalPaymentMethod.innerText = paymentMethod;
    orderConfirmationModal.classList.add('show');
};

// --- Hide Order Confirmation Modal ---
const hideOrderConfirmationModal = () => {
    orderConfirmationModal.classList.remove('show');
};

// --- Order Placement Function (called by COD or simulated payment) ---
const placeOrder = async (paymentStatus = 'Pending') => {
    console.log('Attempting to place order with paymentStatus:', paymentStatus);

    const userId = getUserId();
    const authToken = getAuthToken();

    const customerInfo = {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: {
            street: streetInput.value.trim(),
            city: cityInput.value.trim(),
            state: stateInput.value.trim(),
            zipCode: zipCodeInput.value.trim()
        }
    };

    const orderItems = cart.map(item => {
        const productInfo = products.find(p => p._id === item.product_id);
        return {
            productId: item.product_id,
            productName: productInfo ? productInfo.name : 'Unknown Product',
            quantity: item.quantity,
            price: productInfo ? productInfo.price : 0
        };
    });

    const totalAmount = parseFloat(summaryTotalSpan.innerText.replace('₹', '').replace(/,/g, ''));
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    const orderPayload = {
        userId,
        items: orderItems,
        totalAmount,
        customerInfo,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: paymentStatus // Set actual payment status based on flow
    };

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Order placed successfully:', data);
            localStorage.removeItem('cart'); // Clear cart after successful order
            cart = []; // Empty local cart array

            showOrderConfirmationModal(
                'Order Placed Successfully!',
                'Your order has been confirmed and will be processed shortly.',
                data.orderId,
                selectedPaymentMethod
            );
        } else {
            console.error('Order placement failed:', data.message);
            alert(data.message || 'Failed to place order. Please try again.');
        }
    } catch (error) {
        console.error('Network error placing order:', error);
        alert('An error occurred while placing your order. Please try again later.');
    }
};

// --- Event Listeners ---
checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!validateForm()) {
        console.log('Form validation failed.');
        alert('Please fill in all required fields correctly.');
        return;
    }

    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (selectedPaymentMethod === 'Cash On Delivery') {
        await placeOrder('Pending'); // For COD, payment status is Pending initially
    } else if (selectedPaymentMethod === 'Online Payment') {
        // Trigger the payment simulation modal
        onlinePaymentDetails.style.display = 'block'; // Ensure it's visible if not already
        payNowBtn.focus(); // Give focus to the pay button
        // The actual order placement will happen after simulated payment
    }
});

radioCod.addEventListener('change', toggleOnlinePaymentDetails);
radioOnline.addEventListener('change', toggleOnlinePaymentDetails);

payNowBtn.addEventListener('click', async () => {
    // Basic validation for UPI ID/Card Number
    if (!validateInput(upiIdInput, null, 'Payment details are required.')) {
        return;
    }

    // Simulate a payment process
    payNowBtn.disabled = true;
    payNowBtn.innerText = 'Processing...';
    console.log('Simulating online payment...');

    // Simulate API call delay
    setTimeout(async () => {
        const paymentSuccess = Math.random() > 0.1; // 90% chance of success

        payNowBtn.disabled = false;
        payNowBtn.innerText = 'Pay Now';

        if (paymentSuccess) {
            alert('Simulated Payment Successful!');
            await placeOrder('Paid'); // Place order with 'Paid' status
            upiIdInput.value = ''; // Clear input
            onlinePaymentDetails.style.display = 'none'; // Hide payment details
            placeOrderBtn.style.display = 'block'; // Show main place order button
        } else {
            alert('Simulated Payment Failed. Please try again.');
            console.error('Simulated payment failed.');
        }
    }, 2000); // 2 second delay for simulation
});

continueShoppingBtn.addEventListener('click', () => {
    hideOrderConfirmationModal();
    window.location.href = 'index.html'; // Redirect to home page
});

// --- Initialization for Checkout Page ---
async function initCheckoutPage() {
    console.log('--- initCheckoutPage Called ---');

    // 1. Check login status
    if (!getAuthToken()) {
        alert('You need to be logged in to access the checkout page.');
        window.location.href = 'login.html'; // Redirect to login page if not logged in
        return;
    }

    // 2. Load cart from local storage
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
    }

    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        window.location.href = 'index.html'; // Redirect to home if cart is empty
        return;
    }

    // 3. Fetch products (needed for displaying names/prices in summary)
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products for checkout summary. Status: ' + response.status);
        }
        products = await response.json();
        console.log('Products fetched for checkout summary:', products);
    } catch (error) {
        console.error('Error fetching products for checkout:', error);
        alert('Could not load product details for summary. Please try again later. Error: ' + error.message);
        return;
    }

    // 4. Display cart summary
    displayCartSummary();

    // 5. Pre-fill customer info if available (e.g., from user profile or login data)
    // You'd typically fetch this from your backend based on userId
    const userEmailFromStorage = getUserEmail(); // Ensure login.js saves user email
    const usernameFromStorage = getUsername(); // Ensure login.js saves username

    if (usernameFromStorage) fullNameInput.value = usernameFromStorage;
    if (userEmailFromStorage) emailInput.value = userEmailFromStorage;
    // For phone, address, etc., you'd need to fetch from a user profile endpoint

    // 6. Initialize payment method display
    toggleOnlinePaymentDetails(); // Set initial visibility based on default radio selection (COD)
}