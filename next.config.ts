import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "bk-ecommerce-shop.s3.ap-southeast-1.amazonaws.com",
			},
		],
	},
	// Thêm cấu hình ESLint để bỏ qua lỗi khi build
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
