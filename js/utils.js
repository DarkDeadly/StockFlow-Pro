/**
 * this function is an utility function to create elements with classes and text content it will help us to reduce the amount of code we need to write when creating elements and also make our code more readable.
 * @param {string} tag - The HTML tag to create (e.g., 'div', 'span', 'td')
 * @param {Array} classNames - An array of class names to add to the element (optional)
 * @param {string} textContent - The text content to set for the element (optional)
 * @returns {HTMLElement} - The created HTML element with the specified tag, classes, and text content
 */

export const createElements = (tag , classNames = [] , textContent = '' ) => {
    const element = document.createElement(tag);
    classNames.forEach(className => element.classList.add(className));
    if (textContent) element.textContent = textContent;
    return element;
}


/**
 * This function is used to debounce a function it will delay the execution of the function until after a certain amount of time has passed since the last time it was called.
 * @param {Function} func - The function to debounce
 * @param {number} wait - The amount of time to wait before executing the function
 * @returns {Function} - The debounced function
 */

export const debounce = (func , wait) => {
    let timeout ; 
    return function(...args) {
        clearTimeout(timeout) ;
        timeout = setTimeout(() => func.apply(this , args) , wait) ;
    }
}
/**
 * This function is used to create a detail element it will create a p element with a strong element for the label and a span element for the value it will also add classes to the span element if provided.
 * @param {string} label - The label for the detail (e.g., 'Name', 'Category')
 * @param {string} value - The value for the detail (e.g., 'Laptop', 'Electronics')
 * @param {Array} classes - An array of class names to add to the value span element (optional)
 * @returns {HTMLElement} - The created detail element containing the label and value
 */
export const createDetailElements = (label, value, classes = []) => {
    const p = createElements('p');
    const strong = createElements('strong', [], `${label}: `);
    const span = createElements('span', classes, value);
    p.append(strong, span);
    return p;
}

/**
 * This function is used to show feedback to the user it will set the text content of the element to the message and add a class to the element based on the type of feedback (e.g., 'success', 'error').
 * @param {HTMLElement} element - The HTML element to show the feedback in
 * @param {string} message - The feedback message to display
 * @param {string} type - The type of feedback (e.g., 'success', 'error')
 * @returns {void}
 */

export const showFeedback = (element, message, type) => {
    if (!element) return
    element.textContent = message
    element.className = `user-feedback user-feedback--${type}`
}