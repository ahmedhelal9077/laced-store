# Admin Dashboard & Backend Integration

We will build a fully functional Admin Dashboard (like Shopify) that allows you to manage your store's products in real-time. Since we don't have a traditional backend, we will upgrade your local server to handle these updates.

## Proposed Changes

### Server Backend (server_tcp.ps1)
#### [MODIFY] server_tcp.ps1
- Upgrade the PowerShell TCP server to accept POST requests at a new /api/save_products endpoint.
- It will parse incoming JSON data from the Admin panel and save it directly into js/data.js, permanently updating your live store.

### Admin Interface (admin.html & admin.js)
#### [NEW] admin.html
- Create a sleek, black-and-white dashboard interface mimicking modern e-commerce admin panels.
- Features: 
  - **Product List**: View all active products.
  - **Add/Edit Product Modal**: Forms to set Title, Price, Category (Mens/Ladies), Image URL, Description, and Available Sizes.
  - **Delete Functionality**.

#### [NEW] admin.js
- Handle fetching the current products from data.js.
- Provide the UI logic for adding, editing, and deleting items from the array.
- Handle sending the updated products array to the PowerShell server via etch('/api/save_products', { method: 'POST' }).

### Frontend Data (js/data.js)
#### [MODIFY] js/data.js
- Keep it as the single source of truth, but it will now be dynamically rewritten by the server whenever you save changes in the Admin panel.

## Verification Plan
1. Restart the local server (server_tcp.ps1).
2. Open dmin.html in the browser.
3. Edit an existing product's price or name.
4. Open the store on the mobile phone and verify the change appears instantly across all devices.
