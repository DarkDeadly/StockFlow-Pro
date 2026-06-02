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
 * Renders all products in a clean, responsive table
 * @param {Array|null} products - Optional array of products to render
 * @returns {void}
 */
const renderProducts = (products = null) => {
    const container = document.querySelector('.content-view__container');
    if (!container) return;

    // Clear and set title
    container.innerHTML = `<h1 class="content-view__title">All Products</h1>`;

    // Use provided products or fetch all
    const displayProducts = products || Data.getAllProducts(50).products;

    if (displayProducts.length === 0) {
        container.innerHTML += `<p class="empty-state">No products found in inventory.</p>`;
        return;
    }

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
                <tbody id="products-tbody">
                    ${displayProducts.map(product => {
                        const available = product.stockIn - product.stockOut;
                        const isLow = available < 5;

                        return `
                            <tr class="inventory-table__row ${isLow ? 'inventory-table__row--alert' : ''}" 
                                data-id="${product.id}">
                                <td class="inventory-table__cell font-medium">${product.name}</td>
                                <td class="inventory-table__cell">${product.category}</td>
                                <td class="inventory-table__cell text-muted">${product.sender || '—'}</td>
                                <td class="inventory-table__cell font-bold text-indigo">$${Number(product.price).toFixed(2)}</td>
                                <td class="inventory-table__cell">${available} units</td>
                                <td class="inventory-table__cell">
                                    <span class="badge ${isLow ? 'badge--danger' : 'badge--success'}">
                                        ${isLow ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                            </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML += tableHTML;

   
};

/**
 * Adds click listeners to all product rows
 */
const addRowClickListeners = () => {
    // use event delegation for better performance and to handle dynamic content
    const tableContainer = document.querySelector('.content-view__container')
    if (!tableContainer) return;
    tableContainer.addEventListener('click' , (e) => {
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

