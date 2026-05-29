const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');
const sharedRoot = path.resolve(monorepoRoot, 'shared');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.blockList = [
  /[\\/]admin[\\/].*/,
  /[\\/]node_modules[\\/]@next[\\/].*/,
  /[\\/]node_modules[\\/]next[\\/].*/,
];

module.exports = config;
