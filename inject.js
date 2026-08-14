const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const syncJS = `
    async function syncProducts() {
      const btn = document.getElementById('sync-products-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing... Please wait';
      btn.disabled = true;
      try {
        const res = await fetch('https://stockoutlet.pro/products.json?limit=250');
        const data = await res.json();
        
        if (!data || !data.products) throw new Error('Invalid format');
        
        const mapped = data.products.map(p => {
           let sizes = [];
           if (p.variants && p.variants.length > 0) {
             sizes = [...new Set(p.variants.map(v => v.title).filter(t => t !== 'Default Title'))];
           }
           let body = p.body_html ? p.body_html.replace(/<[^>]*>?/gm, '').substring(0, 150) : 'Premium imported footwear.';
           return {
             id: p.id,
             name: p.title,
             brand: p.vendor || 'LACED',
             price: p.variants && p.variants[0] ? parseFloat(p.variants[0].price) : 0,
             image: p.images && p.images.length > 0 ? p.images[0].src : '',
             isNew: true,
             description: body,
             sizes: sizes.length > 0 ? sizes : ['41', '42', '43', '44', '45']
           };
        });

        const saveRes = await fetch('/api/save_products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapped)
        });
        
        if (saveRes.ok) {
          alert('Successfully synced ' + mapped.length + ' products!');
          loadProducts();
        } else {
          alert('Failed to save products to server.');
        }
      } catch (err) {
        console.error(err);
        alert('Error syncing products: ' + err.message);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
`;

const splitHtml = html.split('</script>');
const beforeLast = splitHtml.slice(0, splitHtml.length - 2).join('</script>') + '</script>' + splitHtml[splitHtml.length - 2] + syncJS + '</script>' + splitHtml[splitHtml.length - 1];
fs.writeFileSync('admin.html', beforeLast, 'utf8');
console.log('Successfully injected syncJS');
