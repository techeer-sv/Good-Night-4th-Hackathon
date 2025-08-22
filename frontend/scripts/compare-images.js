const path = require('path');
const looksSame = require('looks-same');

const appImg = path.resolve(process.cwd(), 'test-results', 'visual', 'app-select.png');
const exampleImg = path.resolve(process.cwd(), 'test-results', 'visual', 'example-stitch.png');
const diffOut = path.resolve(process.cwd(), 'test-results', 'visual', 'diff.png');

looksSame.createDiff({
  reference: appImg,
  current: exampleImg,
  diff: diffOut,
  highlightColor: '#ff00ff',
  tolerance: 5,
}, function(err) {
  if (err) {
    console.error('Diff error', err);
    process.exit(1);
  }
  console.log('Wrote diff to', diffOut);
});
