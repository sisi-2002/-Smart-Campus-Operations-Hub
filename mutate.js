const fs = require('fs');
const file = 'c:/Users/Asus/Documents/GitHub/-Smart-Campus-Operations-Hub/smart-campus-client/src/pages/HomePage.jsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/background: 'rgba\(255,255,255,0\.95\)'/g, "background: '#0a192f'");
c = c.replace(/background: 'rgba\(255,255,255,0\.98\)'/g, "background: '#0f172a'");
c = c.replace(/borderBottom: '1px solid rgba\(226,232,240,0\.6\)'/g, "borderBottom: '1px solid rgba(255,255,255,0.05)'");
c = c.replace(/background: '#fff'/g, "background: 'rgba(255,255,255,0.05)'");

c = c.replace(/color: '#0f172a'/g, "color: '#f8fafc'");
c = c.replace(/color: '#475569'/g, "color: '#cbd5e1'");
c = c.replace(/span style={{ color: '#ea580c' }}/g, "span style={{ color: '#ea580c' }}");

// Replace old indigo colors with orange gradients
c = c.replace(/#6366f1/g, "#f97316");
c = c.replace(/#4f46e5/g, "#ea580c");

fs.writeFileSync(file, c);
console.log('Colors Successfully Refactored to Dark Orange theme like the images');
