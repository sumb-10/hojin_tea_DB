import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 간단히 도메인만 쓰는 방법
    domains: ["lh3.googleusercontent.com"],

    // 혹은 더 안전하게 remotePatterns 사용
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**", // query가 붙는 구글 아바타 URL 전체 허용
      },
    ],
  },
};

export default nextConfig;
