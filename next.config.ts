// import type { NextConfig } from "next";
import nextPwa from 'next-pwa';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      }
    ];
  }
  // reactStrictMode: true,
  /* config options here */
};

const withPWA = nextPwa({
  dest: 'public', // Service Worker 和相关文件将输出到 public 目录
  register: true, // 自动注册 Service Worker
  skipWaiting: true, // 强制等待中的 Service Worker 被激活
  disable: process.env.NODE_ENV === 'development', // 关键：在开发环境禁用 PWA，避免缓存干扰 HMR
  importScripts: ['/custom-sw.js'], // 导入自定义的 Service Worker 脚本
  runtimeCaching: [
    {
      urlPattern: /\/_next\/app-build-manifest\.json/,
      handler: 'NetworkOnly',  // 始终从网络获取，不缓存
      options: {
        cacheName: 'excluded-files',
        expiration: {
          maxEntries: 10
        }
      }
    },
    {
      
      urlPattern: /^https:\/\/jsonplaceholder\.typicode\.com/,
      handler: 'NetworkOnly'
    }
  ]
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
