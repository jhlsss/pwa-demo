// public/custom-sw.js

// --- Use Native IndexedDB API in Service Worker (more reliable than loading idb lib sometimes) ---
const DB_NAME_SW = 'pwa-sync-posts-db';
const STORE_NAME_SW = 'sync-posts';
const DB_VERSION_SW = 1; // Must match frontend version

console.log('Custom SW script (custom-sw.js) loaded.');

function openPostsDatabaseSW() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME_SW, DB_VERSION_SW);
    request.onerror = () => {
      console.error('SW DB error:', request.error);
      reject('Database error: ' + request.error);
    };
    request.onsuccess = (event) => {
      resolve(event.target.result); // Resolve with the DB instance
    };
    // Upgrade needed logic should primarily live in the frontend component's openDB call,
    // but it's good practice to include it here too in case the SW runs first.
    request.onupgradeneeded = (event) => {
      console.log('SW DB upgrade needed.');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME_SW)) {
        db.createObjectStore(STORE_NAME_SW, { keyPath: 'id', autoIncrement: true });
        console.log(`SW DB: Object store ${STORE_NAME_SW} created.`);
      }
    };
  });
}

async function getPostsForSyncSW() {
  const db = await openPostsDatabaseSW();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME_SW, 'readonly');
    const store = transaction.objectStore(STORE_NAME_SW);
    const request = store.getAll(); // Get all items in the store

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // console.log('SW: Posts fetched from IDB:', request.result);
      resolve(request.result); // Resolve with the array of posts
    };
  });
}

async function deletePostAfterSyncSW(id) {
  const db = await openPostsDatabaseSW();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME_SW, 'readwrite');
    const store = transaction.objectStore(STORE_NAME_SW);
    const request = store.delete(id); // Delete by primary key (id)

    request.onerror = () => {
      console.error(`SW DB: Failed to delete post id ${id}:`, request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log(`SW DB: Post id ${id} deleted successfully after sync.`);
      resolve(request.result);
    };
  });
}

// --- Sync Event Listener ---
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event triggered, tag:', event.tag); // 确保这行能打印
  if (event.tag === 'post-sync-tag') {
    console.log('SW: Sync event received for tag:', event.tag);
    event.waitUntil(
      syncPostsToServer().catch(err => {
        console.error('SW: Sync process failed:', err);
        // The sync will be retried automatically by the browser later
      })
    );
  }
});

// --- Core Sync Logic ---
async function syncPostsToServer() {
  console.log('SW: Attempting to sync posts to server...');
  const postsToSync = await getPostsForSyncSW(); // Get posts from IDB

  if (!postsToSync || postsToSync.length === 0) {
    console.log('SW: No posts found in IndexedDB to sync.');
    return; // Nothing to do
  }

  console.log(`SW: Found ${postsToSync.length} posts to sync.`);

  // Use Promise.all to process all sync operations concurrently (optional, could do sequentially)
  // We'll do it sequentially here for clearer logging and error handling per item
  for (const post of postsToSync) {
    console.log(`SW: Syncing post id: ${post.id}, title: ${post.title}`);
    try {
      // Prepare data for JSONPlaceholder (it ignores extra fields like 'id')
      const payload = {
        title: post.title,
        body: post.body,
        userId: post.userId,
      };

      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) { // Check for 2xx status codes (specifically 201 for create)
        const responseData = await response.json(); // API returns the created post
        console.log(`SW: Post id ${post.id} synced successfully to server (Server ID: ${responseData.id}).`);
        // **IMPORTANT:** Delete from IndexedDB only after successful POST
        await deletePostAfterSyncSW(post.id);
      } else {
        // Handle non-network errors (e.g., 4xx, 5xx from server)
        console.error(`SW: Server returned error for post id ${post.id}:`, response.status, response.statusText);
        // Depending on the error, you might want to retry or give up.
        // For 4xx errors, retrying might not help. For 5xx, retrying might work.
        // If we don't delete, the browser WILL retry the sync later.
        // Let's assume for now non-ok responses mean we should keep it for retry.
        throw new Error(`Server error: ${response.status}`); // Throw to signal sync didn't complete for this item
      }
    } catch (error) {
      // Handle network errors or the thrown server error
      console.error(`SW: Failed to sync post id ${post.id}:`, error);
      // **IMPORTANT:** Do NOT delete the item from IndexedDB if fetch failed.
      // Throwing an error here signals to the SyncManager that the sync attempt failed,
      // and it should be retried later.
      throw error;
    }
  }

  console.log('SW: Finished processing sync batch.');
  // Optional: Show a notification after a successful sync batch
  self.registration.showNotification('Posts Synced', {
    body: `Synced ${postsToSync.length} offline posts.`,
    icon: '/icons/icon-192x192.png', // Use your actual icon path
    badge: '/icons/icon-96x96.png', // Optional: for Android notification bar
  });
}

// Optional: Ensure SW takes control immediately
self.addEventListener('activate', (event) => {
  console.log('SW activating.');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key)) // 清理旧缓存
      ).then(() => self.clients.claim()); // 立即接管控制
    })
  );
});

// Optional: Skip waiting phase for faster updates during development
self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('SW installing.');
  // event.waitUntil(self.skipWaiting()); // Uncomment for faster SW updates
});
