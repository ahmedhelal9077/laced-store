const fs = require('fs');
const files = ['index.html', 'shop.html', 'checkout.html', 'product.html', 'admin.html'];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/src="js\/data\.js"/g, 'src="/api/products"');
  fs.writeFileSync(f, content, 'utf8');
});
console.log('Updated HTML files to point to dynamic API');
