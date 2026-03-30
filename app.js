// INTELLIGENT INVENTORY FORECASTING & AUTO-REORDER SYSTEM
// PURE JAVASCRIPT - READY TO RUN

const StockStatus = {
    Critical: "🔴 CRITICAL",
    Low: "🟡 LOW", 
    OK: "🟢 OK",
    Excess: "📦 EXCESS"
};

class Product {
    constructor(data) {
        this.productNo = data.productNo;
        this.name = data.name;
        this.category = data.category;
        this.currentStock = data.currentStock;
        this.minStock = data.minStock;
        this.maxStock = data.maxStock;
        this.safetyStock = data.safetyStock;
        this.unitCost = data.unitCost;
        this.sellingPrice = data.sellingPrice;
        this.annualDemand = data.annualDemand;
        this.avgDailySales = data.avgDailySales;
        this.orderCost = data.orderCost;
        this.holdingCostPercent = data.holdingCostPercent;
        this.preferredSupplierNo = data.preferredSupplierNo;
        this.updateStatus();
    }
    
    updateStatus() {
        if (this.currentStock <= this.safetyStock) this.status = StockStatus.Critical;
        else if (this.currentStock <= this.minStock) this.status = StockStatus.Low;
        else if (this.currentStock >= this.maxStock) this.status = StockStatus.Excess;
        else this.status = StockStatus.OK;
    }
}

class Supplier {
    constructor(supplierNo, name) {
        this.supplierNo = supplierNo;
        this.name = name;
        this.leadTime = 7;
        this.qualityRating = 90;
        this.priceLevel = 5;
        this.reliability = 95;
        this.isPreferred = false;
        this.productsProvided = [];
    }
}

class ForecastEngine {
    constructor() {
        this.transactions = [];
        this.predictions = [];
    }
    
    recordSale(productNo, quantity) {
        this.transactions.push({ productNo, quantity, date: new Date() });
    }
    
    getAverageDailySales(productNo, days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const sales = this.transactions.filter(t => t.productNo === productNo && t.date >= cutoff);
        if (sales.length === 0) return 0;
        const total = sales.reduce((sum, t) => sum + t.quantity, 0);
        return total / days;
    }
    
    predictDemand(product, days) {
        const avgDaily = this.getAverageDailySales(product.productNo, 90);
        let predicted = avgDaily * days;
        if (predicted < 1) predicted = 10;
        predicted = Math.round(predicted);
        return { predictedQuantity: predicted, confidenceLower: predicted * 0.8, confidenceUpper: predicted * 1.2 };
    }
}

class ReorderEngine {
    constructor(forecastEngine) {
        this.forecastEngine = forecastEngine;
        this.purchaseOrders = [];
        this.alerts = [];
    }
    
    checkAndReorder(products, suppliers) {
        const created = [];
        for (const product of products) {
            if (product.currentStock > product.minStock) continue;
            
            const forecast = this.forecastEngine.predictDemand(product, 14);
            const reorderQty = Math.max(product.maxStock - product.currentStock, product.minStock);
            
            if (reorderQty <= 0) continue;
            
            const supplier = suppliers[0];
            const po = {
                orderNo: `PO-${Date.now()}`,
                supplierName: supplier.name,
                totalAmount: reorderQty * product.unitCost,
                lines: [{ productName: product.name, quantity: reorderQty }]
            };
            this.purchaseOrders.push(po);
            created.push(po);
            
            this.alerts.push(`Auto-order created for ${product.name}: ${reorderQty} units`);
        }
        return created;
    }
    
    getAlerts() { return this.alerts; }
}

console.log("\n" + "=".repeat(60));
console.log("   INTELLIGENT INVENTORY SYSTEM");
console.log("=".repeat(60));

// Create suppliers
const suppliers = [
    new Supplier("SUP-001", "TechDistributors Inc."),
    new Supplier("SUP-002", "Global Logistics"),
    new Supplier("SUP-003", "Budget Wholesale")
];

suppliers[0].leadTime = 5;
suppliers[1].leadTime = 10;
suppliers[2].leadTime = 14;

console.log("\n✅ SUPPLIERS LOADED:");
suppliers.forEach(s => console.log(`   ${s.supplierNo}: ${s.name} (Lead time: ${s.leadTime} days)`));

// Create products
const products = [
    new Product({ productNo: "P100", name: "Wireless Headphones", category: "Electronics", currentStock: 45, minStock: 50, maxStock: 500, safetyStock: 20, unitCost: 45, sellingPrice: 90, annualDemand: 5000, avgDailySales: 20, orderCost: 50, holdingCostPercent: 15, preferredSupplierNo: "SUP-001" }),
    new Product({ productNo: "P101", name: "USB-C Cable", category: "Electronics", currentStock: 120, minStock: 200, maxStock: 2000, safetyStock: 50, unitCost: 8, sellingPrice: 16, annualDemand: 15000, avgDailySales: 60, orderCost: 50, holdingCostPercent: 15, preferredSupplierNo: "SUP-001" }),
    new Product({ productNo: "P102", name: "Laptop Stand", category: "Accessories", currentStock: 30, minStock: 40, maxStock: 300, safetyStock: 15, unitCost: 35, sellingPrice: 70, annualDemand: 3000, avgDailySales: 12, orderCost: 40, holdingCostPercent: 15, preferredSupplierNo: "SUP-002" })
];

console.log("\n✅ PRODUCTS LOADED:");
products.forEach(p => console.log(`   ${p.productNo}: ${p.name} | Stock: ${p.currentStock} | Min: ${p.minStock} | Status: ${p.status}`));

// Initialize engines
const forecastEngine = new ForecastEngine();
const reorderEngine = new ReorderEngine(forecastEngine);

// Simulate sales history
console.log("\n📊 GENERATING SALES HISTORY...");
for (let day = 1; day <= 90; day++) {
    for (const product of products) {
        const dailySales = Math.floor(Math.random() * product.avgDailySales * 1.5);
        if (dailySales > 0) {
            forecastEngine.recordSale(product.productNo, dailySales);
        }
    }
}
console.log("   90 days of sales data generated");

// Run predictions
console.log("\n🤖 AI DEMAND FORECASTING:");
for (const product of products) {
    const prediction = forecastEngine.predictDemand(product, 14);
    console.log(`\n   📈 ${product.name}:`);
    console.log(`      Predicted demand (14 days): ${prediction.predictedQuantity} units`);
    console.log(`      Confidence: ${Math.round(prediction.confidenceLower)} - ${Math.round(prediction.confidenceUpper)} units`);
}

// Check and create auto-orders
console.log("\n🛒 AUTO-REORDER ENGINE:");
const autoOrders = reorderEngine.checkAndReorder(products, suppliers);

if (autoOrders.length > 0) {
    console.log(`\n   ✅ ${autoOrders.length} auto-orders created:`);
    autoOrders.forEach(po => {
        console.log(`      ${po.orderNo}: ${po.supplierName} - $${po.totalAmount.toFixed(2)}`);
        po.lines.forEach(line => {
            console.log(`         - ${line.productName}: ${line.quantity} units`);
        });
    });
} else {
    console.log("\n   ℹ️ No reorders needed");
}

// Show alerts
const alerts = reorderEngine.getAlerts();
if (alerts.length > 0) {
    console.log("\n🔔 SYSTEM ALERTS:");
    alerts.forEach(a => console.log(`   ${a}`));
}

// Final summary
console.log("\n" + "=".repeat(60));
console.log("   📊 SYSTEM SUMMARY");
console.log("=".repeat(60));
console.log(`   ✅ Products monitored: ${products.length}`);
console.log(`   ✅ Suppliers configured: ${suppliers.length}`);
console.log(`   ✅ Auto-orders created: ${autoOrders.length}`);

console.log("\n" + "=".repeat(60));
console.log("   ✅ SYSTEM RUNNING SUCCESSFULLY!");
console.log("=".repeat(60) + "\n");