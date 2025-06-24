// Fetch the menu data from the local JSON file and the backend API
document.addEventListener("DOMContentLoaded", function () {
    fetchMenuItems();
});

function fetchMenuItems() {
    fetch("data.json")  // Load menu items from local data.json
        .then(response => response.json())
        .then(data => {
            renderMenuItems(data.menuItems);  // Render menu items from local JSON
            syncWithBackendAPI();  // Optionally sync with backend API for future updates
        })
        .catch(error => console.error("Error fetching menu data from local JSON: ", error));
}

// Sync data with backend API (optional)
function syncWithBackendAPI() {
    fetch("http://localhost:3000/api/menu")  // Fetch menu items from backend API
        .then(response => response.json())
        .then(data => {
            console.log("Data synced from backend API: ", data);

        })
        .catch(error => console.error("Error syncing with backend API: ", error));
}
// Function to render the menu items dynamically on the page
function renderMenuItems(items) {
    const menuContainer = document.getElementById("menu-items");
    items.forEach(item => {
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");

        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span>€${item.price.toLocaleString()}</span>  <!-- Changed to € (Euro) -->
        `;

        menuContainer.appendChild(menuItem);
    });
}

let currentOrderItems = [];

document.addEventListener("DOMContentLoaded", function () {
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener("submit", addItemToOrder);

    // Set up Place Order button handler
    const placeOrderButton = document.getElementById('placeOrderButton');
    placeOrderButton.addEventListener("click", placeOrder);
    
    // Load previous orders if needed
    loadOrders();
});

// Add an item to the current order (store the dish _id)
function addItemToOrder(event) {
    event.preventDefault();
    console.log('event', event);

    // const dishElement = document.querySelector('#dish option'); // this is where you are getting element
    
    const dishElementDropdown = document.querySelector("#order-form #dish")
    const dishElement = dishElementDropdown.options[dishElementDropdown.selectedIndex];
    const dishName = dishElement.text;
    const dishId = dishElement.getAttribute("data-id"); // this is where you get data-id of dish element

    // console.log(dishId);
    // console.log(dishName);

    console.log(`dish is: ${dishId}`)

    if (!dish) {
        alert('Please select a dish.');
        return;
    }

    currentOrderItems.push(dishId); // putting dishId in [], final array would be [1,3,5,4]
    updateCurrentItemsList();
}

// Update the current items list
function updateCurrentItemsList() {
    const currentItemsList = document.getElementById('currentItemsList');
    currentItemsList.innerHTML = '';

    currentOrderItems.forEach((id, index) => { // [1,2,3]
        const itemDropdown = document.querySelector(`#dish`);
        const dropdownVal = (`option[data-id="${id}"]`);
        const dishName = itemDropdown.querySelector(dropdownVal).text;

        const li = document.createElement('li');
        li.textContent = dishName;
        
        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete';
        deleteButton.textContent = ' 🗑️ ';
        deleteButton.onclick = () => removeItemFromCurrentOrder(index);
        li.appendChild(deleteButton);

        currentItemsList.appendChild(li);
    });
}

// Remove an item from the current order
function removeItemFromCurrentOrder(index) {
    currentOrderItems.splice(index, 1);
    updateCurrentItemsList();
}

// Place the order with the current items
async function placeOrder() {
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethod = 'credit-card'; // Or dynamically get this from the user if available

    if (!name || !address || currentOrderItems.length === 0) {
        alert('Please fill in all fields and add at least one item.');
        return;
    }

    const order = {
        name,
        address,
        paymentMethod, // Add the payment method
        dishes: currentOrderItems  // Use dish ids here [1,2,3]
    };

    console.log("Sending order:", order); // Add this log to check the order data
    

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Order placed successfully!');
            resetOrderForm();  // Reset the form and current items after a successful order
        } else {
            alert('Error placing order: ' + result.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order');
    }
}


// Reset the form and current items
function resetOrderForm() {
    document.getElementById('name').value = '';
    document.getElementById('address').value = '';
    currentOrderItems = [];
    updateCurrentItemsList();
}

// Load orders from the server
async function loadOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();
        const orderList = document.getElementById('orderList');
        orderList.innerHTML = '';

        orders.forEach(order => {
            orderList.appendChild(createOrderListItem(order));
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Create a list item for an order
function createOrderListItem(order) {
    const li = document.createElement('li');
    li.id = order._id;

    const orderText = document.createElement('span');
    orderText.textContent = `${order.name} (${order.dishes.map(dish => dish.name).join(', ')}) - ${order.address}`;
    li.appendChild(orderText);

    const deleteButton = document.createElement('span');
    deleteButton.className = 'delete';
    deleteButton.textContent = ' x ';
    deleteButton.onclick = () => deleteOrder(order._id);
    li.appendChild(deleteButton);

    return li;
}

// Delete an order
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, { method: 'DELETE' });
        if (response.ok) {
            document.getElementById(orderId).remove();
        }
    } catch (error) {
        console.error('Error deleting order:', error);
    }
}
