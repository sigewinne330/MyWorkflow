import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*', // 匹配所有以/api/开头的请求
        destination: 'http://47.120.47.121:8150/api/:path*', // 转发到后端服务
      },
    ];
  },
};

export default nextConfig;
