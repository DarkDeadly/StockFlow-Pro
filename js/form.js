import * as Data from "./data.js"
import { showFeedback , syncSidebarActiveState } from './utils.js'
/**
 * Handles the add product functionality for creating a new product 
 * @returns {void}
 */
const handleAddProduct = () => {
    const form = document.querySelector('#productForm')
    if (!form) return

    const nameInput = document.getElementById('productName')
    const categoryInput = document.getElementById('productCategory')
    const quantityInput = document.getElementById('productQuantity')
    const priceInput = document.getElementById('productPrice')
    const supplierInput = document.getElementById('productSupplier')
    const userFeedback = document.querySelector('.user-feedback')

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        // Clear previous feedback
        showFeedback(userFeedback, '', '')

        // Get values
        const name = nameInput.value.trim()
        const category = categoryInput.value
        const stockIn = parseInt(quantityInput.value)
        const price = parseFloat(priceInput.value)
        const sender = supplierInput.value.trim()

        // Validate
        if (!name || !category || !sender) {
            showFeedback(userFeedback, 'Please fill in all text fields', 'error')
            return
        }

        if (isNaN(stockIn) || stockIn < 0) {
            showFeedback(userFeedback, 'Quantity must be a positive number', 'error')
            return
        }

        if (isNaN(price) || price < 0) {
            showFeedback(userFeedback, 'Price must be a positive number', 'error')
            return
        }

        // Submit
        const result = Data.addProduct({ name, category, stockIn, sender, price })

        if (result.success) {
            showFeedback(userFeedback, 'Product added successfully!', 'success')
            form.reset()
        } else {
            showFeedback(userFeedback, result.error, 'error')
        }
    })
}


handleAddProduct()
syncSidebarActiveState()