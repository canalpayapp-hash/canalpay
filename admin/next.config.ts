import type { NextConfig } from 'next';
import path from 'path';

const monorepoRoot = path.resolve(__dirname, '..');

const nextConfig: NextConfig = {
  transpilePackages: ['@canalpay/shared'],
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
