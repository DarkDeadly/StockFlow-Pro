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
       localStorage.setItem("stock" , JSON.stringify(Stock)) 
    } catch (error) {
       console.log(error) 
    }
}

/**
 * This function will load the data from the localStorage
 * @return {void} - This function does not return anything
 */

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem("stock")
        if (!data) return  // Nothing stored yet — exit silently

        const stockData = JSON.parse(data)
        Stock.length = 0          // this will assure no duplicates will be added 
        Stock.push(...stockData)  // Populate with stored data

    } catch (error) {
        console.error("Failed to load stock from storage:", error)
    }
}

/**
 * This function will add a Stock item to the Stock array and then save it to the localStorage
 * @param {object} item - The Stock form data to be added to the Stock array
 * we used object as a parameter type because the form data is an object and it will be easier to handle it as an object
 * @return {void} - This function does not return anything
 */

const addProduct = ({name , price , stockIn , sender , category }) => {
    // Validate the input data
    if (!name || !price || !stockIn || !sender || !category) {
        console.error("All fields are required")
        //alert("All fields are required") // will uncomment this when we work on the browser
        return
    }
    // Check if the product already exists in stock
    const existingProduct = Stock.find(item => item.name === name)
    if (existingProduct) {
        // If the product exists, update its stock
        existingProduct.stockIn += stockIn
        // Save the updated Stock array to localStorage
        saveToStorage()
        console.log(`Updated stock for ${existingProduct.name}. New stock: ${existingProduct.stockIn}`)
        return existingProduct
    }
    // If the product does not exist, create a new product object
    const newItem = {
        id : crypto.randomUUID(),
        name,
        price,
        stockIn,
        sender,
        category
    }
    // Add the new product to the Stock array
    Stock.push(newItem)
    // Save the updated Stock array to localStorage
    saveToStorage()
    console.log(`Added new product successfully`)
    return newItem
}

addProduct({
    name : "iPhone 14 Pro Max",
    price : 1200,
    stockIn : 10,
    sender : "Apple Inc.",
    category : "Electronics"
})

export { Stock, Sales }

### old notes

## SellProduct Function analysis
### Core Idea
Records a sale by validating the request, checking available stock, increasing stockOut on the product, creating a sale record, and persisting everything to localStorage. It acts as a strict gatekeeper for inventory integrity.
### Step-by-step Logic
- Validate all parameters first...
- Locate the product in Stock by id...
- Verify sufficient stock using availableStock = stockIn - stockOut...
- Create sale record...
- Update stockOut and save to localStorage...
### Real-world Analogy
Think of a pharmacy filling a prescription:
Pharmacist receives: { drugId: "IBU-200", patient: "John Doe", tablets: 30 }
Pharmacist checks the cabinet:
→ Drug found?
NO → "We don't carry this" (return null)
YES → check current available count (stockIn - stockOut)
→ Only 12 left but customer needs 30?
"Insufficient stock. Available: 12, Requested: 30" (return null)
→ Enough available?
Count out 30 tablets (increase dispensed count / stockOut += 30)
Record the transaction in the sales log (Sales.push)
Update the inventory book (saveToStorage)
Hand receipt to patient (return newSell)
### Tiny Applied Example
sellProduct(
    "550e8400-e29b-41d4-a716-446655440000",  // id from Stock item
    "Jane Smith",
    2
)
### Edge Cases & Defenses

- **Invalid / Missing Input**: id is null, quantity is 0, or customerName is empty → Early validation catches it and returns null.
- **Product Not Found**: Trying to sell a non-existent or deleted product → Clear error message.
- **Overselling**: Available stock is 5 but quantity requested is 10 → Reject with helpful message.
- **Negative or Zero Quantity**: Blocked in the first validation.
- **localStorage Failure**: Storage is full or blocked → Try-catch prevents crash (can be improved later).
- **Concurrent Sales**: Multiple quick sales of the same product → Always recalculates available stock in real-time.