import {syncSidebarActiveState} from "./utils.js"
import * as Data from "./data.js"
/**
 * Initializes and renders the Chart.js dashboard metrics
 * @param {Object} summary - The object returned from getDashboardSummary()
 * @returns {void}
 */
const renderDashboardCharts = (summary) => {
    // Locate our canvas elements
    const financialCtx = document.getElementById('financialChart');
    const statusCtx = document.getElementById('statusChart');
    
    if (!financialCtx || !statusCtx) return;

    // --- CHART 1: FINANCIAL COMPARISON (BAR) ---
    new Chart(financialCtx, {
        type: 'bar',
        data: {
            labels: ['Warehouse Value', 'Total Revenue (Sales)'],
            datasets: [{
                label: 'USD ($)',
                data: [summary.totalStockValue, summary.totalSalesValue],
                backgroundColor: [
                    'rgba(79, 70, 229, 0.85)',  /* Indigo to match your theme */
                    'rgba(22, 163, 74, 0.85)'   /* Clean Success Green */
                ],
                borderColor: ['#4f46e5', '#16a34a'],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Hiding extra legend box since labels are explicit
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // --- CHART 2: INVENTORY ACCESSIBILITY ALERTS (PIE) ---
    new Chart(statusCtx, {
        type: 'pie',
        data: {
            labels: ['Healthy Stock', 'Low Stock (< 5)', 'Out of Stock'],
            datasets: [{
                data: [
                    // Calculate perfectly healthy stock items remaining
                    summary.totalProducts - (summary.lowStockCount + summary.outOfStockCount),
                    summary.lowStockCount,
                    summary.outOfStockCount
                ],
                backgroundColor: [
                    '#e2e8f0',  /* Neutral Slate */
                    '#f97316',  /* Warning Orange */
                    '#ef4444'   /* Danger Red */
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
};
const dataSummary = Data.getDashboardSummary()
renderDashboardCharts(dataSummary)
syncSidebarActiveState()
