/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out',
    assetPrefix: '',
    reactStrictMode: true,
    images: {
        unoptimized: true
    },
    basePath: '',
    trailingSlash: false,
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
        return config;
    },
};

export default nextConfig;