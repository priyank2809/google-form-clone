const fs = require('fs');
const path = require('path');
const ghpages = require('gh-pages');

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

fs.copyFileSync('index.html', path.join('dist', 'index.html'));

fs.writeFileSync(path.join('dist', '.nojekyll'), '');

ghpages.publish('dist', {
    branch: 'gh-pages',
    message: 'Auto-generated deployment to GitHub Pages',
    dotfiles: true
}, function (err) {
    if (err) {
        console.error('Deployment error:', err);
    } else {
        console.log('Successfully deployed!');
    }
});