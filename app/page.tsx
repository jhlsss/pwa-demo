'use client'

import Link from 'next/link';

export default function Home() {
  // useEffect(() => {
  //   if (
  //     process.env.NODE_ENV === 'production' &&
  //     'serviceWorker' in navigator
  //   ) {
  //     navigator.serviceWorker.register('/sw.js', {
  //       scope: '/',
  //       updateViaCache: 'none' // 禁用缓存
  //     }).then(reg => {
  //       console.log('Registration succeeded. Scope is:', reg.scope);
  //       reg.update(); // 强制更新
  //     });
  //   }
  // }, []);

  return (


    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      {/* 顶部标题栏 */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          欢迎来到我的 Next.js PWA 应用!
        </p>
      </div>

      {/* 内容区域 - 网格布局 */}
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2 lg:text-left gap-8">

        {/* 左侧卡片：主页信息 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center"> {/* 添加 flex */}
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">主页</h2>
          <p className="text-gray-700">
            这是应用的主页。尝试将此应用添加到您的主屏幕，并测试离线访问。
          </p>
        </div>

        {/* 右侧卡片：导航到关于页面 */}
        {/* 这里是之前被截断的部分，现在是完整的 Link 组件 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center"> {/* 增加垂直和水平居中 */}
          <Link
            href="/about"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 text-center block w-full md:w-auto" // 适应性宽度
          >
            <h2 className="mb-3 text-2xl font-semibold">
              关于页面{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt; {/* 修改了箭头方向 */}
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              点击这里跳转到关于页面，测试 PWA 离线导航。
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
