// import type { NextConfig } from "next";
import nextPwa from 'next-pwa';

const nextConfig = {
  // reactStrictMode: true,
  /* config options here */
};

const withPWA = nextPwa({
  dest: 'public', // Service Worker 和相关文件将输出到 public 目录
  register: false, // 自动注册 Service Worker
  skipWaiting: true, // 强制等待中的 Service Worker 被激活
  disable: process.env.NODE_ENV === 'development', // 关键：在开发环境禁用 PWA，避免缓存干扰 HMR
  importScripts: ['/custom-sw.js'], // 导入自定义的 Service Worker 脚本
  buildExcludes: ['app-build-manifest.json'], // 排除 app-build-manifest.json 文件
  runtimeCaching: [
    {
      urlPattern: /build-manifest/,
      handler: 'NetworkOnly' // 强制跳过缓存
    }
  ] // 清空默认缓存规则
  // scope: '/app', // 可选：定义 Service Worker 的作用域，默认为 '/'
  // sw: 'service-worker.js', // 可选：自定义 Service Worker 文件名
  // importScripts: [...] // 可选：导入其他脚本到 Service Worker
  // fallbacks: { // 可选：为离线访问定义回退页面
  //   document: '/offline', // 如果页面不可用，则回退到 /offline.html (需要在 pages 或 app 目录下创建)
  //   image: '/fallback-image.png', // 图片的回退
  //   font: '/fallback-font.woff2', // 字体的回退
  // },
  
});

export default withPWA(nextConfig);
