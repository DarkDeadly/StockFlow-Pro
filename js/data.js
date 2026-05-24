/**
 * Data for the application which are the following:
 * - `Stock` which is the stock data for the applicaiton 
 * - `Sales` which is the sales data for the application
 */
let Stock = []
let Sales = []

/**
 * This function will store the data inside the localStorage
 * @return {void} - This function does not return anything  
 */

const saveToStorage = () => {
    try {
        localStorage.setItem("stock", JSON.stringify(Stock))
        localStorage.setItem("sales", JSON.stringify(Sales))
    } catch (error) {
        console.error(error)
    }
}

/**
 * This function will load the data from the localStorage
 * @return {void} - This function does not return anything
 */

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem("stock")
        const sale = localStorage.getItem("sales")
        if (data) {
            const stockData = JSON.parse(data)
            Stock.length = 0          // this will assure no duplicates will be added 
            Stock.push(...stockData)  // Populate with stored data
        }
        if (sale) {
            const salesData = JSON.parse(sale)
            Sales.length = 0
            Sales.push(...salesData)
        }



    } catch (error) {
        console.error("Failed to load stock from storage:", error)
    }
}

/**
 * Adds a new product or updates existing stock (Upsert operation)
 * @param {Object} product - Product data
 * @param {string} product.name
 * @param {number} product.price
 * @param {number} product.stockIn
 * @param {string} product.category
 * @param {string} product.sender
 * @returns {Object} The created or updated product
 */
const addProduct = ({ name, price, stockIn, category, sender }) => {
    if (!name || typeof price !== 'number' || price < 0 || typeof stockIn !== 'number' || stockIn < 0 || !category || !sender) {
        console.error("All fields are required and numeric fields must be non-negative");
        return null;
    }

    const existing = Stock.find(item => item.name === name);

    if (existing) {
        existing.stockIn += stockIn;
        saveToStorage();
        return existing;
    }

    const newItem = {
        id: crypto.randomUUID(),
        name,
        price,
        category,
        stockIn,
        stockOut: 0,
        sender
    };

    Stock.push(newItem);
    saveToStorage();
    return newItem;
};

/**
 * Records a sale, updates stockOut, and saves the transaction
 * @param {string} id - Product ID
 * @param {number} quantity - Quantity being sold
 * @param {string} customerName - Customer name
 * @returns {Object|null} The sale record or null if failed
 */

const sellProduct = (id, customerName, quantity) => {

    if (!id || !customerName || typeof quantity !== 'number' || quantity <= 0) {
        console.error("All fields are required and quantity must be a positive number");
        return null;
    }
    const product = Stock.find(item => item.id === id)
    if (!product) {
        // alert("product not found inside the stock check again")
        console.error("product not found")
        return null
    }
    const availableStock = product.stockIn - product.stockOut;
    if (availableStock < quantity) {
        console.error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
        return null;
    }
    // create new Sale object for the sold product
    const newSell = {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
        category: product.category,
        customerName,
        date: new Date().toISOString()
    };

    Sales.push(newSell);
    product.stockOut += quantity;

    saveToStorage();
    console.log(`✅ Sold ${quantity} x ${product.name} to ${customerName}`);
    return newSell
}

/**
 * Returns products that are below the low stock threshold
 * @param {number} [threshold=5] - The minimum stock level considered "low"
 * @returns {Array} Array of low stock products (empty array if none)
 */
const getLowStockProducts = (threshold = 5) => {
    if (typeof threshold !== 'number' || threshold < 0) {
        console.error("Threshold must be a non-negative number");
        return [];
    }

    const lowStockItems = Stock.filter(item => 
        (item.stockIn - item.stockOut) < threshold
    );

    if (lowStockItems.length === 0) {
        console.log("✅ No low stock products found.");
        return [];
    }

    console.warn(`⚠️ Low stock alert: ${lowStockItems.length} product(s)`);
    return lowStockItems;
};

/**
 * Returns a comprehensive dashboard summary of the current inventory and sales state
 * @returns {Object} Summary object with key metrics
 */
const getDashboardSummary = () => {
    const totalProducts = Stock.length;
    
    const totalStockValue = Stock.reduce((sum, item) => {
        return sum + (item.price * item.stockIn); // Total warehouse value
    }, 0);

    const totalSalesValue = Sales.reduce((sum, sale) => {
        return sum + (sale.total || 0);
    }, 0);

    const lowStockCount = getLowStockProducts(5).length;
    const outOfStockCount = Stock.filter(item => 
        (item.stockIn - item.stockOut) <= 0
    ).length;

    const summary = {
        totalProducts,
        totalStockValue: Math.round(totalStockValue),
        totalSalesValue: Math.round(totalSalesValue),
        lowStockCount,
        outOfStockCount,
        totalAvailableItems: Stock.reduce((sum, item) => sum + (item.stockIn - item.stockOut), 0)
    };

    console.log("📊 Dashboard Summary Generated:", summary);
    return summary;
};

/**
 * By providing the Id of the product this function will delete the product from the stock
 * @param {string} id  - the Id of the product to be deleted
 * @return {{success: boolean, stock: Product[], deleted?: Product, error?: string}}
 */
const deleteProduct = (id) => {
    if (typeof id !== 'string' || id.trim() === '') {
        return {
            success: false,
            stock: Stock,
            error: "Invalid ID: must be non-empty string"
        };
    }
    let deleted = null

    Stock = Stock.filter(item => {
        if (item.id === id) {
            deleted = item
            return false; // Exclude this item from the new array
        }
        return true; // Keep this item
    })
    if (!deleted) {
        return {
            success : false,
            stock : Stock,
            error : `No product found with ID: ${id}`
        }
    }
    saveToStorage()
    return {
        success: true,
        stock: Stock,
        deleted
    }
}
/**
 * Updates allowed fields of a product while protecting stockIn & stockOut
 * @param {string} id - Product ID
 * @param {Object} updates - Fields to update
 * @returns {{success: boolean, stock: Product[], updated?: Product, error?: string}}
 */
const updateProduct = (id, updates) => {
    if (typeof id !== 'string' || id.trim() === '') {
        return { success: false, stock: Stock, error: "Invalid ID: must be a non-empty string" };
    }

    if (typeof updates !== 'object' || updates === null || Object.keys(updates).length === 0) {
        return { success: false, stock: Stock, error: "Invalid updates: must be a non-empty object" };
    }

    const index = Stock.findIndex(item => item.id === id);
    if (index === -1) {
        return { success: false, stock: Stock, error: `No product found with ID: ${id}` };
    }

    const product = Stock[index];

    // Only allow specific safe fields
    const allowedUpdates = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.price !== undefined) allowedUpdates.price = updates.price;
    if (updates.category !== undefined) allowedUpdates.category = updates.category;

    if (Object.keys(allowedUpdates).length === 0) {
        return { success: false, stock: Stock, error: "No valid fields to update" };
    }

    const updatedProduct = { ...product, ...allowedUpdates };

    Stock[index] = updatedProduct;
    saveToStorage();

    return {
        success: true,
        stock: Stock,
        updated: updatedProduct,
        message: `Successfully updated ${updatedProduct.name}`
    };
};

export { Stock, Sales, addProduct, sellProduct, getLowStockProducts , getDashboardSummary, deleteProduct, updateProduct}