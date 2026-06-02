import * as Data from './data.js';
import {createElements} from "./utils.js"
const { searchProducts } = Data ; 

/**
 * This function is used to debounce a function it will delay the execution of the function until after a certain amount of time has passed since the last time it was called.
 * @param {Function} func - The function to debounce
 * @param {number} wait - The amount of time to wait before executing the function
 * @returns {Function} - The debounced function
 */

const debounce = (func , wait) => {
    let timeout ; 
    return function(...args) {
        clearTimeout(timeout) ;
        timeout = setTimeout(() => func.apply(this , args) , wait) ;
    }
}

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
        // we used the createElement and append instead of innerHTMl to prevent XSS attacks
        const tableRow = document.createElement('tr');
        tableRow.classList.add('inventory-table__row');
        if (isLow) tableRow.classList.add('inventory-table__row--alert');
        tableRow.dataset.id = product.id;

        const nameCell = createElements('td' , ['inventory-table__cell' , 'font-medium'], product.name);
        const categoryCell = createElements('td' , ['inventory-table__cell'], product.category);
        const senderCell = createElements('td' , ['inventory-table__cell', 'text-muted'], product.sender || '—');
        const priceCell = createElements('td' , ['inventory-table__cell', 'font-bold', 'text-indigo'], `$${Number(product.price).toFixed(2)}`);
        const availableCell = createElements('td' , ['inventory-table__cell'], `${available} units`);
        const statusCell = createElements('td' , ['inventory-table__cell']);
        const badge = createElements('span' , ['badge', isLow ? 'badge--danger' : 'badge--success'], isLow ? 'Low Stock' : 'In Stock');
        statusCell.appendChild(badge);
        tableRow.append(nameCell, categoryCell, senderCell, priceCell, availableCell, statusCell);
        tbody.appendChild(tableRow);
    });

};

/**
 * Adds click listeners to all product rows
 */
const addRowClickListeners = () => {
    // use event delegation for better performance and to handle dynamic content
    const container = document.querySelector('.content-view__container')
    if (!container) return;
    container.addEventListener('click' , (e) => {
        const row = e.target.closest('.inventory-table__row')
        if (row && row.dataset.id) {
            const productId = row.dataset.id;
            const product = Data.getProductById(productId);
            console.log('Clicked product:', product);
        }
    })
   
};

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
        if (query.trim() === '') {
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
addRowClickListeners();

initSearch() ;

