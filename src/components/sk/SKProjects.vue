<template>
  <div class="sk-forum sk-portal-container">
    <!-- Header with gradient background -->
    <div class="sk-portal-header">
      <div class="sk-portal-header-content">
        <h1 class="sk-portal-title">
          SK Community Hub
        </h1>
        <p class="sk-portal-description">Connect, share, and grow with fellow SK members</p>
      </div>
      <div class="sk-portal-actions">
        <button class="sk-btn sk-btn-primary" @click="showPostModal = true">
          <i class="fas fa-plus"></i> Create Post
        </button>
      </div>
    </div>

    <div class="forum-container">
      <div class="forum-grid">
        <!-- Sidebar for filters -->
        <aside class="forum-sidebar sk-card">
          <div class="sk-card-body">
            <div class="sidebar-section">
              <h3>Filter Posts</h3>
              <button class="sk-btn sk-btn-secondary refresh-btn" @click="refreshPosts" :disabled="isRefreshing">
                <i class="fas" :class="isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
                {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
            <div class="filter-tabs">
              <button 
                v-for="tab in tabs" 
                :key="tab.id" 
                :class="['sk-btn', 'sk-btn-secondary', { active: activeTab === tab.id }]"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
        </aside>

        <!-- Main content area -->
        <main class="forum-main">
          <div class="search-box sk-form-group">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              class="sk-form-input"
              placeholder="Search posts..." 
              v-model="searchQuery"
            >
          </div>

          <!-- Posts list -->
          <div class="posts-grid">
            <div 
              v-for="post in filteredPosts" 
              :key="post.id" 
              class="post-card sk-card"
              :class="{ 'featured-post': post.isFeatured }"
            >
              <div class="sk-card-header post-header">
                <div class="author-info">
                  <div>
                    <h4>{{ post.authorName }}</h4>
                    <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                    <span v-if="post.isFeatured" class="sk-badge sk-badge-warning">
                      <i class="fas fa-star"></i> Featured
                    </span>
                  </div>
                </div>
                <div class="post-actions" v-if="post.authorId === currentUser?.uid || isAdmin">
                  <div class="dropdown">
                    <button class="dropdown-toggle sk-btn sk-btn-icon" type="button">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu sk-card">
                      <a href="#" @click.prevent="editPost(post)"><i class="fas fa-edit"></i> Edit</a>
                      <a href="#" @click.prevent="deletePost(post.id)"><i class="fas fa-trash"></i> Delete</a>
                      <a 
                        href="#" 
                        v-if="isAdmin" 
                        @click.prevent="toggleFeatured(post)"
                      >
                        <i class="fas fa-star"></i> {{ post.isFeatured ? 'Unfeature' : 'Feature' }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="sk-card-body post-content">
                <h3 @click="togglePostExpansion(post.id)" class="post-title">
                  {{ post.title }}
                  <i 
                    class="fas" 
                    :class="{ 'fa-chevron-down': !post.expanded, 'fa-chevron-up': post.expanded }"
                  ></i>
                </h3>
                <div class="post-body" v-if="post.expanded">
                  <p>{{ post.content }}</p>
                  <div v-if="post.image" class="post-image">
                    <img :src="post.image" alt="Post image" @click="openImageModal(post.image)">
                  </div>
                </div>
              </div>
              
              <div class="sk-card-footer post-footer">
                <div class="post-stats">
                  <span class="likes sk-btn sk-btn-icon" @click="toggleLike(post)">
                    <i class="fas" :class="{ 'fa-heart liked': post.likes?.includes(currentUser?.uid), 'fa-heart': !post.likes?.includes(currentUser?.uid) }"></i>
                    {{ post.likes?.length || 0 }}
                  </span>
                  <span class="comments sk-btn sk-btn-icon" @click="toggleComments(post.id)">
                    <i class="fas fa-comment"></i>
                    {{ post.comments?.length || 0 }}
                  </span>
                </div>
                
                <div class="post-tags" v-if="post.tags?.length">
                  <span v-for="tag in post.tags" :key="tag" class="sk-badge sk-badge-primary">
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <!-- Comments section -->
              <div class="comments-section" v-if="post.showComments">
                <div class="comment-list">
                  <div v-for="comment in post.comments" :key="comment.id" class="comment">
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-author">{{ comment.authorName }}</span>
                        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                        <button 
                          v-if="comment.authorId === currentUser?.uid || isAdmin" 
                          class="delete-comment sk-btn sk-btn-icon"
                          @click="deleteComment(post.id, comment.id)"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <p>{{ comment.content }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="add-comment">
                  <div class="comment-input">
                    <input 
                      type="text" 
                      class="sk-form-input"
                      placeholder="Write a comment..." 
                      v-model="newComments[post.id]"
                      @keyup.enter="addComment(post.id)"
                    >
                    <button class="sk-btn sk-btn-primary sk-btn-icon" @click="addComment(post.id)">
                      <i class="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Loading skeleton -->
            <div v-if="loadingPosts" class="posts-loading">
              <div v-for="n in 3" :key="n" class="post-skeleton sk-card">
                <div class="skeleton-header">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-author"></div>
                </div>
                <div class="skeleton-title"></div>
                <div class="skeleton-content"></div>
                <div class="skeleton-content shorter"></div>
                <div class="skeleton-footer"></div>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div class="empty-state sk-empty-state" v-if="filteredPosts.length === 0 && !loadingPosts">
            <div class="sk-empty-icon">
              <i class="fas fa-comments"></i>
            </div>
            <h3 class="sk-empty-title">No posts found</h3>
            <p class="sk-empty-description">Try adjusting your search or be the first to create a post!</p>
            <button class="sk-btn sk-btn-primary" @click="showPostModal = true">
              <i class="fas fa-plus"></i> Create First Post
            </button>
          </div>
          
          <!-- Load more button -->
          <div class="load-more" v-if="hasMorePosts && !loadingPosts && filteredPosts.length > 0">
            <button class="sk-btn sk-btn-secondary" @click="loadMorePosts" :disabled="loadingMore">
              <i class="fas" :class="loadingMore ? 'fa-spinner fa-spin' : 'fa-arrow-down'"></i>
              {{ loadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </main>
      </div>
    </div>
    
    <!-- Modern Post Modal - Fixed to prevent scrolling -->
    <transition name="modal">
      <div class="sk-modal-overlay" v-if="showPostModal" @click.self="closePostModal">
        <div class="sk-modal-content">
          <div class="sk-modal-header">
            <h2 class="sk-modal-title">
              <i class="fas" :class="editingPost ? 'fa-edit' : 'fa-plus'"></i>
              {{ editingPost ? 'Edit Post' : 'Create New Post' }}
            </h2>
            <button class="sk-modal-close" @click="closePostModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="sk-modal-body">
            <div class="sk-form-group">
              <label class="sk-form-label">Title</label>
              <input type="text" class="sk-form-input" v-model="newPost.title" placeholder="What's your post about?">
            </div>
            <div class="sk-form-group">
              <label class="sk-form-label">Content</label>
              <textarea class="sk-form-textarea" v-model="newPost.content" rows="5" placeholder="Share your thoughts..."></textarea>
            </div>
            <div class="sk-form-group">
              <label class="sk-form-label">Tags (comma separated)</label>
              <input type="text" class="sk-form-input" v-model="newPost.tags" placeholder="e.g., question, suggestion, announcement">
            </div>
          </div>
          <div class="sk-modal-footer">
            <button class="sk-btn sk-btn-secondary" @click="closePostModal">Cancel</button>
            <button class="sk-btn sk-btn-primary" @click="savePost" :disabled="isSubmitting">
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : (editingPost ? 'fa-save' : 'fa-paper-plane')"></i>
              {{ editingPost ? 'Update Post' : 'Publish Post' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Image Modal -->
    <transition name="modal">
      <div class="sk-modal-overlay" v-if="showImageModal" @click.self="showImageModal = false">
        <div class="sk-modal-content">
          <div class="sk-modal-header">
            <h2 class="sk-modal-title">
              <i class="fas fa-image"></i>
              Image Preview
            </h2>
            <button class="sk-modal-close" @click="showImageModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="sk-modal-body">
            <img :src="selectedImage" alt="Full size" style="max-width: 100%; height: auto;">
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Success Toast -->
    <transition name="toast">
      <div class="toast sk-card" v-if="showToast">
        <i class="fas fa-check-circle"></i>
        {{ editingPost ? 'Post updated successfully!' : 'Post published successfully!' }}
      </div>
    </transition>

    <!-- Floating action button -->
    <button class="fab sk-btn sk-btn-primary" @click="showPostModal = true">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script>
// ... (keep the same script section as your original code)
import { db, auth, storage } from '@/firebase/config';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, getDoc, getDocs,
  setDoc, arrayUnion, arrayRemove, serverTimestamp, 
  limit, startAfter 
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'SKForum',
  data() {
    return {
      searchQuery: '',
      activeTab: 'all',
      tabs: [
        { id: 'all', label: 'All Posts' },
        { id: 'featured', label: 'Featured' },
        { id: 'questions', label: 'Questions' },
        { id: 'announcements', label: 'Announcements' }
      ],
      posts: [],
      newComments: {},
      showPostModal: false,
      newPost: { 
        title: '', 
        content: '', 
        tags: '',
        image: null 
      },
      imagePreview: null,
      imageFile: null,
      editingPost: null,
      currentUser: null,
      isAdmin: false,
      skMembers: [],
      showToast: false,
      isSubmitting: false,
      currentSKMember: null,
      loadingPosts: false,
      loadingMore: false,
      hasMorePosts: true,
      lastVisiblePost: null,
      postsPerPage: 10,
      isRefreshing: false,
      showImageModal: false,
      selectedImage: null
    };
  },
  computed: {
    filteredPosts() {
      let posts = this.posts;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.content.toLowerCase().includes(query) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      switch (this.activeTab) {
        case 'featured':
          posts = posts.filter(post => post.isFeatured);
          break;
        case 'questions':
          posts = posts.filter(post => post.tags?.includes('question'));
          break;
        case 'announcements':
          posts = posts.filter(post => post.tags?.includes('announcement'));
          break;
      }
      return posts.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!b.isFeatured && b.isFeatured) return 1;
        return b.createdAt?.toDate() - a.createdAt?.toDate();
      });
    }
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    },
    togglePostExpansion(postId) {
      this.posts = this.posts.map(post => ({
        ...post,
        expanded: post.id === postId ? !post.expanded : post.expanded
      }));
    },
    toggleComments(postId) {
      this.posts = this.posts.map(post => ({
        ...post,
        showComments: post.id === postId ? !post.showComments : post.showComments,
        expanded: post.id === postId ? true : post.expanded
      }));
      if (this.posts.find(p => p.id === postId).showComments) {
        this.loadComments(postId);
      }
    },
    async loadComments(postId) {
      const commentsQuery = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
      onSnapshot(commentsQuery, async snapshot => {
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          const comments = await Promise.all(snapshot.docs.map(async doc => {
            const commentData = doc.data();
            const member = this.skMembers.find(m => m.userId === commentData.authorId);
            return {
              id: doc.id,
              ...commentData,
              authorName: member?.name || commentData.authorName || 'Anonymous'
            };
          }));
          this.posts[postIndex].comments = comments;
        }
      }, error => {
        console.error('Error loading comments:', error);
        alert('Failed to load comments. Please check your permissions.');
      });
    },
    async addComment(postId) {
      if (!this.currentUser || !this.currentSKMember || this.currentSKMember.status !== 'approved') {
        alert('Only approved SK members can comment.');
        return;
      }
      if (!this.newComments[postId]?.trim()) {
        alert('Please enter a comment.');
        return;
      }
      try {
        const comment = {
          content: this.newComments[postId].trim(),
          authorId: this.currentUser.uid,
          authorName: this.currentSKMember.name || 'Anonymous',
          authorPhoto: this.currentUser.photoURL || 'https://via.placeholder.com/40',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'posts', postId, 'comments'), comment);
        this.newComments[postId] = '';
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Ensure you are an approved SK member.');
      }
    },
    async deleteComment(postId, commentId) {
      if (confirm('Are you sure you want to delete this comment?')) {
        try {
          await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
        } catch (error) {
          console.error('Error deleting comment:', error);
          alert('Failed to delete comment. You may not have permission.');
        }
      }
    },
    async savePost() {
      if (!this.currentUser || !this.currentSKMember || this.currentSKMember.status !== 'approved') {
        alert('Only approved SK members can create posts.');
        return;
      }
      if (!this.newPost.title.trim() || !this.newPost.content.trim()) {
        alert('Please fill in title and content.');
        return;
      }
      try {
        this.isSubmitting = true;
        const tags = this.newPost.tags 
          ? this.newPost.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag)
          : [];
        let imageUrl = null;
        if (this.imageFile) {
          const storageReference = storageRef(storage, `post_images/${Date.now()}_${this.imageFile.name}`);
          await uploadBytes(storageReference, this.imageFile);
          imageUrl = await getDownloadURL(storageReference);
        }
        const postData = {
          title: this.newPost.title.trim(),
          content: this.newPost.content.trim(),
          authorId: this.currentUser.uid,
          authorName: this.currentSKMember.name || 'Anonymous',
          authorPhoto: this.currentUser.photoURL || 'https://via.placeholder.com/40',
          createdAt: serverTimestamp(),
          likes: [],
          tags,
          image: imageUrl,
          isFeatured: this.editingPost?.isFeatured || false
        };
        if (this.editingPost) {
          if (!this.imageFile && this.editingPost.image) {
            postData.image = this.editingPost.image;
          }
          const postRef = doc(db, 'posts', this.editingPost.id);
          await updateDoc(postRef, postData);
        } else {
          const docRef = await addDoc(collection(db, 'posts'), postData);
          await this.notifySKMembers(postData.title, docRef.id);
        }
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
        this.closePostModal();
      } catch (error) {
        console.error('Error saving post:', error);
        alert('Failed to save post. Ensure you are an approved SK member.');
      } finally {
        this.isSubmitting = false;
      }
    },
    async notifySKMembers(postTitle, postId) {
      try {
        const members = this.skMembers.filter(m => m.userId !== this.currentUser.uid && m.status === 'approved');
        const batch = [];
        members.forEach(member => {
          const notification = {
            type: 'new_post',
            message: `New post in community: ${postTitle}`,
            read: false,
            userId: member.userId,
            createdAt: serverTimestamp(),
            link: `/forum/${postId}`
          };
          batch.push(addDoc(collection(db, 'notifications'), notification));
        });
        await Promise.all(batch);
      } catch (error) {
        console.error('Error notifying members:', error);
      }
    },
    async deletePost(postId) {
      if (confirm('Are you sure you want to delete this post? All comments will be lost.')) {
        try {
          const postRef = doc(db, 'posts', postId);
          const post = this.posts.find(p => p.id === postId);
          if (post.image) {
            const imageRef = storageRef(storage, post.image);
            await deleteObject(imageRef).catch(err => console.warn('Error deleting image:', err));
          }
          await deleteDoc(postRef);
        } catch (error) {
          console.error('Error deleting post:', error);
          alert('Failed to delete post. You may not have permission.');
        }
      }
    },
    async toggleLike(post) {
      if (!this.currentUser || !this.currentSKMember || this.currentSKMember.status !== 'approved') {
        alert('Only approved SK members can like posts.');
        return;
      }
      try {
        const postRef = doc(db, 'posts', post.id);
        const isLiked = post.likes?.includes(this.currentUser.uid);
        await updateDoc(postRef, {
          likes: isLiked 
            ? arrayRemove(this.currentUser.uid)
            : arrayUnion(this.currentUser.uid)
        });
      } catch (error) {
        console.error('Error toggling like:', error);
        alert('Failed to like/unlike post.');
      }
    },
    async toggleFeatured(post) {
      if (!this.isAdmin) {
        alert('Only admins can feature posts.');
        return;
      }
      try {
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, { isFeatured: !post.isFeatured });
      } catch (error) {
        console.error('Error toggling featured status:', error);
        alert('Failed to feature/unfeature post.');
      }
    },
    editPost(post) {
      this.editingPost = post;
      this.newPost = { 
        title: post.title, 
        content: post.content,
        tags: post.tags?.join(', ') || '',
        image: post.image
      };
      this.imagePreview = post.image || null;
      this.showPostModal = true;
    },
    closePostModal() {
      this.showPostModal = false;
      this.editingPost = null;
      this.newPost = { title: '', content: '', tags: '', image: null };
      this.imagePreview = null;
      this.imageFile = null;
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      this.imageFile = file;
      this.imagePreview = URL.createObjectURL(file);
    },
    removeImage() {
      this.imagePreview = null;
      this.imageFile = null;
    },
    async loadSKMembers() {
      const q = query(collection(db, 'sk_members'));
      onSnapshot(q, snapshot => {
        this.skMembers = snapshot.docs.map(doc => ({
          id: doc.id,
          userId: doc.id,
          ...doc.data()
        }));
        this.currentSKMember = this.currentUser 
          ? this.skMembers.find(m => m.userId === this.currentUser.uid) || null
          : null;
      }, error => {
        console.error('Error loading SK members:', error);
      });
    },
    async checkAdminStatus() {
      if (!this.currentUser) return false;
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin' && userData.isApproved === true;
      }
      return false;
    },
    async refreshPosts() {
      try {
        this.isRefreshing = true;
        this.posts = [];
        this.hasMorePosts = true;
        this.lastVisiblePost = null;
        await this.loadPosts();
      } finally {
        this.isRefreshing = false;
      }
    },
    async loadPosts() {
      this.loadingPosts = true;
      try {
        let postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(this.postsPerPage)
        );
        
        if (this.lastVisiblePost) {
          postsQuery = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            startAfter(this.lastVisiblePost),
            limit(this.postsPerPage)
          );
        }
        
        const snapshot = await getDocs(postsQuery);
        this.lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];
        this.hasMorePosts = snapshot.docs.length === this.postsPerPage;
        
        const newPosts = await Promise.all(snapshot.docs.map(async doc => {
          const postData = doc.data();
          const member = this.skMembers.find(m => m.userId === postData.authorId);
          return {
            id: doc.id,
            ...postData,
            authorName: member?.name || postData.authorName || 'Anonymous',
            showComments: false,
            expanded: false,
            comments: []
          };
        }));
        
        this.posts = [...this.posts, ...newPosts];
      } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts.');
      } finally {
        this.loadingPosts = false;
      }
    },
    async loadMorePosts() {
      if (!this.hasMorePosts) return;
      
      this.loadingMore = true;
      try {
        await this.loadPosts();
      } finally {
        this.loadingMore = false;
      }
    },
    openImageModal(imageUrl) {
      this.selectedImage = imageUrl;
      this.showImageModal = true;
    }
  },
  async mounted() {
    onAuthStateChanged(auth, async user => {
      this.currentUser = user;
      if (user) {
        await this.loadSKMembers();
        this.isAdmin = await this.checkAdminStatus();
      } else {
        this.isAdmin = false;
        this.skMembers = [];
        this.currentSKMember = null;
      }
    });
    
    await this.loadPosts();
  }
};
</script>

<style scoped>
/* Use your existing SK Portal Design System CSS variables */
:root {
  /* Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  --success-50: #ecfdf5;
  --success-500: #10b981;
  --success-600: #059669;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Typography */
  --font-family: 'Inter', 'Segoe UI', Roboto, -apple-system, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  --shadow-md: 0 8px 30px 0 rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 40px 0 rgba(0, 0, 0, 0.15);
}

.sk-forum {
  font-family: var(--font-family);
  color: var(--gray-800);
  background-color: var(--gray-50);
  min-height: 100vh;
}

.forum-container {
  margin-top: var(--space-8);
}

.forum-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-6);
}

.forum-sidebar {
  height: fit-content;
  position: sticky;
  top: var(--space-8);
}

.sidebar-section {
  margin-bottom: var(--space-6);
}

.sidebar-section h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--gray-800);
}

.filter-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.forum-main {
  min-height: 500px;
}

.search-box {
  position: relative;
  margin-bottom: var(--space-6);
}

.search-box i {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  z-index: 2;
}

.search-box .sk-form-input {
  padding-left: calc(var(--space-4) * 2.5);
}

.posts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.post-card.featured-post {
  border-left: 4px solid var(--warning-500);
  background: linear-gradient(135deg, var(--warning-50), white);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--gray-100);
}

.author-info h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-800);
}

.post-date {
  font-size: var(--text-sm);
  color: var(--gray-500);
  display: block;
  margin-bottom: var(--space-2);
}

.post-actions {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  z-index: 50;
  display: none;
  border: 1px solid var(--gray-200);
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  color: var(--gray-700);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--gray-100);
}

.dropdown-menu a:last-child {
  border-bottom: none;
}

.dropdown-menu a:hover {
  background-color: var(--gray-50);
  color: var(--gray-900);
}

.dropdown-menu i {
  width: 16px;
  margin-right: var(--space-3);
  text-align: center;
}

.post-content {
  padding: var(--space-6);
}

.post-title {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--text-xl);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gray-900);
}

.post-title i {
  font-size: var(--text-sm);
  color: var(--gray-400);
  transition: transform 0.2s ease;
}

.post-body {
  margin-top: var(--space-4);
  line-height: 1.6;
  color: var(--gray-700);
}

.post-image {
  margin-top: var(--space-4);
  border-radius: var(--radius);
  overflow: hidden;
}

.post-image img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius);
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.post-image img:hover {
  transform: scale(1.02);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
}

.post-stats {
  display: flex;
  gap: var(--space-4);
}

.post-stats .sk-btn {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.post-stats .likes.liked {
  color: var(--error-500);
}

.post-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.comments-section {
  border-top: 1px solid var(--gray-100);
  padding: var(--space-4) var(--space-6);
  background-color: var(--gray-50);
}

.comment-list {
  margin-bottom: var(--space-4);
}

.comment {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
}

.comment-content {
  flex-grow: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.comment-author {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--gray-800);
}

.comment-date {
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.delete-comment {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.comment:hover .delete-comment {
  opacity: 1;
}

.add-comment {
  display: flex;
  gap: var(--space-3);
}

.comment-input {
  flex-grow: 1;
  display: flex;
  gap: var(--space-2);
}

.comment-input .sk-form-input {
  flex-grow: 1;
}

.posts-loading {
  display: grid;
  gap: var(--space-4);
}

.post-skeleton {
  padding: var(--space-6);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--gray-200);
  animation: pulse 2s infinite;
}

.skeleton-author {
  height: 16px;
  width: 120px;
  background-color: var(--gray-200);
  border-radius: var(--radius-sm);
  animation: pulse 2s infinite;
}

.skeleton-title {
  height: 20px;
  width: 80%;
  background-color: var(--gray-200);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
  animation: pulse 2s infinite;
}

.skeleton-content {
  height: 14px;
  width: 100%;
  background-color: var(--gray-200);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  animation: pulse 2s infinite;
}

.skeleton-content.shorter {
  width: 90%;
}

.skeleton-footer {
  height: 16px;
  width: 60%;
  background-color: var(--gray-200);
  border-radius: var(--radius-sm);
  margin-top: var(--space-4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

/* Modal fixes to prevent scrolling */
.sk-modal-content {
  max-height: none !important;
  overflow-y: visible !important;
}

.sk-modal-body {
  overflow-y: visible !important;
  max-height: none !important;
}

/* Toast */
.toast {
  position: fixed;
  top: var(--space-8);
  right: var(--space-8);
  background: var(--success-500);
  color: white;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

/* FAB */
.fab {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: var(--text-lg);
  z-index: 100;
}

/* Responsive */
@media (max-width: 1024px) {
  .forum-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .forum-sidebar {
    position: static;
  }
  
  .filter-tabs {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .post-stats {
    width: 100%;
    justify-content: flex-start;
  }
  
  .fab {
    bottom: var(--space-4);
    right: var(--space-4);
    width: 48px;
    height: 48px;
  }
  
  .toast {
    top: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
  }
}
</style>