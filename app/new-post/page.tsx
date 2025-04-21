// app/new-post/page.tsx
import PostForm from '@/components/PostForm'; // Adjust path if needed
import Link from 'next/link';

export default function NewPostPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gray-100 space-y-8">
        <PostForm />

        <div className="text-center mt-6">
            <Link href="/" className="text-blue-600 hover:underline">
                Back to Home
            </Link>
        </div>
    </main>
  );
}
