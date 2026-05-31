import * as Data from './data.js';

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
 * Renders all the products in a dense tabular administration view
 * @returns {void} 
 */
const renderProducts = (products = null) => {
    const container = document.querySelector('.content-view__container');
    if (!container) return;

    // Clear and set up page title early
    container.innerHTML = `<h1 class="content-view__title">All Products</h1>`;

    // Extract raw payload array cleanly
    const displayProducts = products || Data.getAllProducts(50).products;
    
    if (displayProducts.length === 0) {
        container.innerHTML += `<p class="text-muted">No products found.</p>`;
        return;
    }

    // Build the complete template in perfect top-down HTML order
    const tableHTML = `
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
                <tbody>
                    ${displayProducts.map(product => {
                        // Calculate metrics safely within the scope of each individual product loop pass
                        const available = product.stockIn - product.stockOut;
                        const isLow = available < 5;
                        
                        return `
                            <tr class="inventory-table__row ${isLow ? 'inventory-table__row--alert' : ''}">
                                <td class="inventory-table__cell font-medium">${product.name}</td>
                                <td class="inventory-table__cell">${product.category}</td>
                                <td class="inventory-table__cell text-muted">${product.sender}</td>
                                <td class="inventory-table__cell font-bold text-indigo">$${Number(product.price).toFixed(2)}</td>
                                <td class="inventory-table__cell">${available} units</td>
                                <td class="inventory-table__cell">
                                    <span class="badge ${isLow ? 'badge--danger' : 'badge--success'}">
                                        ${isLow ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Append the completed layout chunk to your viewport in one single render step
    container.innerHTML += tableHTML;
};
renderProducts()

/**
 * This function is a connector for the search input it will listen for the input event and then call the search function with the value of the input 
 * @returns {void} 
 */

/*
const searchInputConnector = () => {
    const searchInput = document.getElementById('searchBar') 
    searchInput.addEventListener('input' , debounce(() => {
        const query = searchInput.value.trim();
        searchProducts(query);
    } , 300) )
}

searchInputConnector() ;*/

