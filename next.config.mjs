/** @type {import('next').NextConfig} */
const nextConfig = {
    //output: "export",
    assetPrefix: "",
    trailingSlash: false,
    /*async rewrites() {
        return [
          {
            source: "/termsofuse",
            destination: "/termsofuse.html",
          },
          {
            source: "/privacy",
            destination: "/privacy.html",
          },
        ];
    },*/
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
