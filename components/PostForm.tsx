// components/PostForm.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { openDB, IDBPDatabase } from 'idb';

// --- IndexedDB Configuration ---
const DB_NAME = 'pwa-sync-posts-db';
const STORE_NAME = 'sync-posts';
const DB_VERSION = 1;

interface PostData {
  title: string;
  body: string;
  userId: number;
}

// --- IndexedDB Functions (similar to before, adapted for posts) ---
async function openPostsDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

async function savePostForSync(post: PostData) {
  const db = await openPostsDatabase();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add(post);
  await tx.done;
  console.log('Post saved to IndexedDB for background sync:', post);
}

// --- Register Background Sync Function ---
async function registerPostBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      // Use a specific tag for this sync type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (registration as any).sync.register('post-sync-tag');
      console.log('Background sync for posts registered successfully.');
    } catch (err) {
      console.error('Background sync registration failed:', err);
    }
  } else {
    console.warn('Background Sync is not supported.');
  }
}

// --- The Form Component ---
export default function PostForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect(() => {
  //   const handleOnline = () => {
  //     if ('serviceWorker' in navigator && 'SyncManager' in window) {
  //       navigator.serviceWorker.ready.then(reg => {
  //         reg.sync.register('post-sync-tag');
  //       });
  //     }
  //   };
  
  //   window.addEventListener('online', handleOnline);
  //   return () => window.removeEventListener('online', handleOnline);
  // }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('');
    setIsSubmitting(true);

    if (!title.trim() || !body.trim()) {
      setStatus('Title and body are required.');
      setIsSubmitting(false);
      return;
    }

    const postData: PostData = { title, body, userId: 1 }; // Hardcoded userId = 1

    // 1. Check Network Status
    if (navigator.onLine) {
      // 2. Online: Send directly to JSONPlaceholder
      setStatus('Sending post...');
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          // Even if online, API might fail, e.g., server error
          const errorText = await response.text();
          throw new Error(`API error! status: ${response.status}, ${errorText}`);
        }

        const responseData = await response.json();
        setStatus(`Post sent successfully! (ID: ${responseData.id})`);
        setTitle(''); // Clear form
        setBody('');
      } catch (error) {
        console.error('Failed to send post directly:', error);
        setStatus('Failed to send post. Saving for later sync.');
        // --- Fallback to Offline Sync even if online send failed ---
        try {
          await savePostForSync(postData);
          await registerPostBackgroundSync();
          setTitle(''); // Clear form
          setBody('');
        } catch (saveError) {
          console.error('Failed to save post for sync after direct send failed:', saveError);
          setStatus('Failed to send or save post.');
        }
        // --- End Fallback ---
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 3. Offline: Save to IndexedDB and Register Sync
      setStatus('Offline. Post saved and will be sent when online.');
      try {
        await savePostForSync(postData);
        await registerPostBackgroundSync();
        setTitle(''); // Clear form
        setBody('');
      } catch (error) {
        console.error('Failed to save post or register sync:', error);
        setStatus('Failed to save post for offline sending.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Body</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Post content..."
            rows={4}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-center text-gray-600">{status}</p>}
    </div>
  );
}
