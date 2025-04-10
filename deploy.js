const ghpages = require('gh-pages');
const path = require('path');

const options = {
    branch: 'gh-pages',
    repo: 'https://github.com/priyank2809/google-form-clone.git',
    message: 'Auto-generated commit',
    src: ['index.html', 'dist/**/*', '.nojekyll', 'CNAME'],
};

ghpages.publish(path.join(__dirname, '.'), options, function (err) {
    if (err) {
        console.error('Deployment error:', err);
    } else {
        console.log('Deployed successfully!');
    }
});