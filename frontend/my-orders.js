document.addEventListener('DOMContentLoaded', initMyOrdersPage);

const ordersContainer = document.getElementById('ordersContainer');

// --- Authentication Helper Functions (copy from app.js) ---
const isUserLoggedIn = () => {
    return localStorage.getItem('authToken') !== null;
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const getUserId = () => {
    return localStorage.getItem('userId');
};
// --- End Authentication Helper Functions ---


async function initMyOrdersPage() {
    console.log('My Orders page initialized.');

    if (!isUserLoggedIn()) {
        alert('Please log in to view your orders.');
        window.location.href = 'login.html'; // Redirect to login
        return;
    }

    await fetchAndDisplayOrders();
}

async function fetchAndDisplayOrders() {
    ordersContainer.innerHTML = '<p class="loading">Loading your orders...</p>'; // Show loading state

    const token = getAuthToken();
    if (!token) {
        ordersContainer.innerHTML = '<p class="empty-orders" style="color:red;">Error: Not authenticated. Please log in.</p>';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/orders/my-orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid, prompt login
                alert('Session expired. Please log in again.');
                localStorage.clear(); // Clear old token
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const orders = await response.json();
        console.log('Fetched orders:', orders);

        ordersContainer.innerHTML = ''; // Clear loading message

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-orders">You have no orders yet.</p>';
        } else {
            orders.forEach(order => {
                const orderDate = new Date(order.orderDate).toLocaleString(); // Format date
                const orderDiv = document.createElement('div');
                orderDiv.classList.add('order-item');
                orderDiv.innerHTML = `
                    <div class="order-header">
                        <span>Order ID: ${order._id.substring(0, 8)}...</span>
                        <span>Date: ${orderDate}</span>
                    </div>
                    <div class="order-details">
                        <p>Total Amount: ₹${order.totalAmount.toLocaleString()}</p>
                        <p>Status: <span class="status ${order.status}">${order.status}</span></p>
                        <p>Payment Method: ${order.paymentMethod}</p>
                        <p>Payment Status: ${order.paymentStatus}</p>
                        <p>Customer: ${order.customerInfo.fullName}</p>
                    </div>
                    <div class="order-items-list">
                        <h3>Items:</h3>
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <span>${item.productName} (x${item.quantity})</span>
                                <span>₹${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                ordersContainer.appendChild(orderDiv);
            });
        }

    } catch (error) {
        console.error('Error fetching orders:', error);
        ordersContainer.innerHTML = `<p class="empty-orders" style="color:red;">Could not load orders: ${error.message}</p>`;
    }
}