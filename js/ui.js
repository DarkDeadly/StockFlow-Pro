import * as Data from './data.js';
import { createElements, debounce, createDetailElements, syncSidebarActiveState, showFeedback } from "./utils.js"


/**
 * Renders the products in the DOM
 * @param {Array} products - The products to render (optional)
 * @returns {void}
 */

const renderProducts = (products = null) => {
    const container = document.querySelector('.content-view__container');
    if (!container) return;

    const displayProducts = products || Data.getAllProducts(50).products;

    // Handle empty state first
    if (displayProducts.length === 0) {
        container.innerHTML = `
            <h1 class="content-view__title">All Products</h1>
            <p class="empty-state">No products found in inventory.</p>
        `;
        return;
    }

    // Static safe structure
    container.innerHTML = `
        <h1 class="content-view__title">All Products</h1>
        <div class="table-responsive">
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Sender</th>
                        <th>Price</th>
                        <th>Available</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="products-tbody"></tbody>
            </table>
        </div>
    `;

    const tbody = container.querySelector('#products-tbody');
    if (!tbody) return;

    displayProducts.forEach(product => {
        const available = product.stockIn - product.stockOut;
        const isLow = available < 5;

        const tableRow = document.createElement('tr');
        tableRow.classList.add('inventory-table__row');
        if (isLow) tableRow.classList.add('inventory-table__row--alert');
        tableRow.dataset.id = product.id;

        const nameCell = createElements('td', ['inventory-table__cell', 'font-medium'], product.name);
        const categoryCell = createElements('td', ['inventory-table__cell'], product.category);
        const senderCell = createElements('td', ['inventory-table__cell', 'text-muted'], product.sender || '—');
        const priceCell = createElements('td', ['inventory-table__cell', 'font-bold', 'text-indigo'], `$${Number(product.price).toFixed(2)}`);
        const availableCell = createElements('td', ['inventory-table__cell'], `${available} units`);

        const statusCell = createElements('td', ['inventory-table__cell']);
        const badge = createElements('span', ['badge', isLow ? 'badge--danger' : 'badge--success'], isLow ? 'Low Stock' : 'In Stock');
        statusCell.appendChild(badge);

        // Action cell with Sell and Edit buttons
        const actionCell = createElements('td', ['inventory-table__cell', 'action-cell']);

        const sellButton = createElements('button', ['btn', 'btn--sell', 'btn--sm'], 'Sell');
        sellButton.dataset.action = 'sell';
        sellButton.dataset.id = product.id;

        const editButton = createElements('button', ['btn', 'btn--edit', 'btn--sm'], 'Restock');
        editButton.dataset.action = 'edit';
        editButton.dataset.id = product.id;

        actionCell.appendChild(sellButton);
        actionCell.appendChild(editButton);

        tableRow.append(nameCell, categoryCell, senderCell, priceCell, availableCell, statusCell, actionCell);
        tbody.appendChild(tableRow);
    });
};

const initModal = (modalName, btn) => {
    const modal = document.querySelector(`#${modalName}`);
    if (!modal) return;

    const closeBtn = document.querySelector(`#${btn}`);
    if (!closeBtn) return;

    // These listeners live FOREVER - only added once
    closeBtn.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });
};

/**
 * Adds click listeners to all product rows
 */
const addRowClickListeners = () => {
    // use event delegation for better performance and to handle dynamic content
    const container = document.querySelector('.content-view__container')
    if (!container) return;
    container.addEventListener('click', (e) => {
        const sellButton = e.target.closest('.btn--sell')
        const fillButton = e.target.closest('.btn--edit')

        // handle sell button FIRST
        if (sellButton) {
            e.stopPropagation()
            const row = sellButton.closest('.inventory-table__row')
            if (!row || !row.dataset.id) return;
            const result = Data.getProductById(row.dataset.id)
            if (result.success && result.product) {
                sellProduct(result.product)
            }
            return;
        }

        // handle fillStock button 
        if (fillButton) {
            e.stopPropagation()
            const row = fillButton.closest('.inventory-table__row')
            if (!row || !row.dataset.id) return;
            const result = Data.getProductById(row.dataset.id)
            if (result.success && result.product) {
                fillStock(result.product)
            }
            return;
        }

        // then handle row click
        const row = e.target.closest('.inventory-table__row')
        if (!row || !row.dataset.id) return;
        const result = Data.getProductById(row.dataset.id)
        if (result.success && result.product) {
            showProductDetails(result.product)
        }
    })

};

const showProductDetails = (product) => {
    if (!product) return;

    const modal = document.querySelector('#product-modal');

    if (!modal) return;

    const dialogBody = modal.querySelector('#modal-body');

    if (!dialogBody) return;

    const available = product.stockIn - product.stockOut;
    const isLow = available < 5;

    // Clear previous content
    dialogBody.innerHTML = '';

    // Grid container
    const grid = createElements('div', ['modal-detail-grid']);



    grid.append(
        createDetailElements('Name', product.name),
        createDetailElements('Category', product.category),
        createDetailElements('Sender', product.sender || '—'),
        createDetailElements('Price', `$${Number(product.price).toFixed(2)}`, ['text-indigo', 'font-bold']),
        createDetailElements('Stock Status', `${available} units available`, ['badge', isLow ? 'badge--danger' : 'badge--success']),
    )


    dialogBody.append(grid);

    modal.showModal();
};
/**
 * Handles the selling of a product by showing a modal with a form to input the quantity to sell and the receiver's name. It validates the input and calls the Data.sellProduct function to update the stock and sales data, then provides feedback to the user based on the result.
 * @param {Object} product - The product object that is being sold
 * @returns {void}  
 
 */
const sellProduct = (product) => {
    if (!product) return;

    const modal = document.querySelector('#sell-form-modal')
    if (!modal) return;

    const form = document.querySelector('#sellProductForm')
    if (!form) return;

    // --- THE CLONE FIX ---
    // cloneNode(true) copies the form and all its children
    // but strips all event listeners that were attached via JS
    // this prevents listener stacking across multiple modal opens
    const freshForm = form.cloneNode(true)
    form.parentNode.replaceChild(freshForm, form)

    // re-query inputs from the fresh clone
    // the old references point to the detached form now
    const quantityInput = freshForm.querySelector('#productQuantity')
    const receiverInput = freshForm.querySelector('#productReceiver')
    const userFeedback = document.querySelector('.user-feedback')

    // show product info at the top of the modal
    const modalContainer = document.querySelector('.product-details')
    const available = product.stockIn - product.stockOut
    // while checking the available stock if it is < 0 we launch delete function (future feature)
    modalContainer.innerHTML = ''
    modalContainer.append(
        createDetailElements('Name', product.name),
        createDetailElements('Available', available + ' units')
    )

    freshForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const quantity = parseInt(quantityInput.value, 10) // always pass radix 10
        const receiver = receiverInput.value.trim()

        if (isNaN(quantity) || quantity <= 0) {
            showFeedback(userFeedback, 'Please enter a valid quantity to sell.', 'error')
            return;
            // form stays open, listener stays active
            // this is why { once: true } didn't work here
        }
        if (!receiver) {
            showFeedback(userFeedback, 'Please enter a receiver name.', 'error')
            return;
        }
        const result = Data.sellProduct(product.id, receiver, quantity)

        if (result.success) {
            showFeedback(userFeedback, 'Product sold successfully!', 'success')
            freshForm.reset()
            renderProducts() // update the table
            modal.close()    // close only on success
        } else {
            showFeedback(userFeedback, result.error || 'Failed to sell product.', 'error')
        }
    })

    modal.showModal()
}

/**
 * Adding new stockIn to the product
 * @return {void} 
 */
const fillStock = (product) => {
    if (!product) return
    const modal = document.getElementById("restock__dialog")
    if (!modal) return
    const dialogBody = modal.querySelector('#restock-modal-body');

    if (!dialogBody) return;
    const available = product.stockIn - product.stockOut;
    const productDetail = document.querySelector(".productDetail")
    // Clear previous content
   productDetail.innerHTML = ''
   productDetail.append(
        createDetailElements('Name', product.name),
        createDetailElements('Available', available + ' units')
   )
   const form = document.getElementById('refillStock')
   const userfeedback = modal.querySelector('.user-feedback')
   // cloning the form 

   const newForm = form.cloneNode(true)
   form.parentNode.replaceChild(newForm , form)

   const stockIn = newForm.querySelector('#quantityAdd')
   newForm.addEventListener('submit' , ( e ) => {
    e.preventDefault()
    const quantity = parseInt(stockIn.value, 10)
    if (isNaN(quantity) || quantity <= 0 ) {
        userfeedback.innerHTML=''
        showFeedback(userfeedback, 'Please enter a valid quantity to add.', 'error')
        return;
    } 
    const result =Data.restockProduct(product.id , quantity)
    if (result.success) {
        renderProducts()
        modal.close()

    }

   })
   modal.showModal()
}
/**
 * Connects the search input to the searchProducts function
 * @returns {void}
 */
const initSearch = () => {
    const searchInput = document.getElementById('searchBar');
    if (!searchInput) {
        console.warn('searchBar element not found in DOM');
        return;
    }

    const handleSearch = debounce((query) => {
        // Show all products when search is cleared
        if (query === '') {
            const { products = [] } = Data.getAllProducts(50);
            renderProducts(products);
            return;
        }

        const result = Data.searchProducts(query, 50);

        if (result.success) {
            renderProducts(result.products);
        } else {
            renderProducts([]);  // triggers empty state in renderProducts
        }
    }, 300);  // ← wait time is required

    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value.trim());  // trim at the source
    });
};

renderProducts()
addRowClickListeners()
initModal('product-modal', 'modal-close-btn')
initModal('sell-form-modal', 'sell-modal-close-btn')
initModal('restock__dialog', 'restock-modal-close-btn')
initSearch()
syncSidebarActiveState()

