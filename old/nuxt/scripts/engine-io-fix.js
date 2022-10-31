// https://github.com/unjs/jiti/issues/87

const fs = require('fs-extra');
const path = require('path');

const targetedVersion = '6.2.0';
const engineIoDir = path.resolve(process.cwd(), 'node_modules/engine.io');

const pkgJsonPath = path.join(engineIoDir, 'package.json');
const { version } = fs.readJSONSync(pkgJsonPath);

if (version === targetedVersion) {
  const wrapperPath = path.join(engineIoDir, 'wrapper.mjs');
  const wrapper = fs.readFileSync(wrapperPath, { encoding: 'utf-8' });
  const modified = wrapper.replace('import lib', 'import * as lib');
  fs.writeFile(wrapperPath, modified);
}
