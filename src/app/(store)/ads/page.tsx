'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoginPromptModal from '../../components/LoginPromptModal';
import ShareModal from '../../components/ShareModal';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  seller?: {
    name: string;
    profile_image: string | null;
  } | null;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  isFollowing?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
    image_url: string | null;
  } | null;
}

export default function AdsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [userFollows, setUserFollows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Supabase environment variables are not configured');
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // First, get current user
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;
        setCurrentUser(userId);
        
        // Then fetch posts with user data
        await fetchPosts(userId, supabase);
        
        // Force a re-render to ensure likes are properly displayed
        setTimeout(() => {
          console.log('Forcing re-render after data initialization');
          // Force a state update to trigger re-render
          setPosts(prev => [...prev]);
        }, 100);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  const fetchPosts = async (userId: string | null, supabase: any) => {
      try {
        setLikesLoading(true);
        // First, fetch all posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('id', { ascending: false });

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          return;
        }

        // Then, fetch seller information for each post
        if (postsData && postsData.length > 0) {
          const userIds = [...new Set(postsData.map(post => post.user_id))];
          
          const { data: sellersData, error: sellersError } = await supabase
            .from('sellers')
            .select('user_id, name, profile_image')
            .in('user_id', userIds);

          if (sellersError) {
            console.error('Error fetching sellers:', sellersError);
            // Continue with posts even if sellers fetch fails
            setPosts(postsData);
            return;
          }

          // Create a map of user_id to seller data
          const sellersMap = new Map();
          if (sellersData) {
            sellersData.forEach(seller => {
              sellersMap.set(seller.user_id, seller);
            });
          }

                     // Fetch like information for current user
           let userLikes: string[] = [];
           let userFollowsData: string[] = [];
           if (userId) {
             const { data: likesData } = await supabase
               .from('likes')
               .select('post_id')
               .eq('user_id', userId);
             
             if (likesData) {
               userLikes = likesData.map(like => like.post_id);
               console.log('Loaded user likes:', userLikes);
               console.log('User likes data types:', userLikes.map(id => typeof id));
             }

            // Fetch follow information for current user
            const { data: followsData } = await supabase
              .from('follows')
              .select('seller_id')
              .eq('user_id', userId);
            
            if (followsData) {
              userFollowsData = followsData.map(follow => follow.seller_id);
            }
          }

          // Fetch like counts for all posts using a more robust approach
          const likeCountsMap = new Map();
          const commentCountsMap = new Map();

          // Get counts for each post individually to ensure accuracy
          for (const post of postsData) {
            // Get like count for this post
            const { count: likeCount, error: likeError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (likeError) {
              console.error(`Error fetching likes for post ${post.id}:`, likeError);
              likeCountsMap.set(post.id, 0);
            } else {
              likeCountsMap.set(post.id, likeCount || 0);
            }

            // Get comment count for this post
            const { count: commentCount, error: commentError } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (commentError) {
              console.error(`Error fetching comments for post ${post.id}:`, commentError);
              commentCountsMap.set(post.id, 0);
            } else {
              commentCountsMap.set(post.id, commentCount || 0);
            }
          }

          console.log('Like counts map:', Object.fromEntries(likeCountsMap));
          console.log('Comment counts map:', Object.fromEntries(commentCountsMap));

                     // Combine posts with seller information, like data, and comment counts
           const postsWithSellers = postsData.map(post => {
             console.log(`Post ${post.id} type: ${typeof post.id}, userLikes: [${userLikes}], userLikes types: [${userLikes.map(id => typeof id)}]`);
             const isLiked = userLikes.includes(post.id.toString());
             console.log(`Rendering post ${post.id} - isLiked: ${isLiked}, userLikes: [${userLikes}]`);
             if (isLiked) {
               console.log(`✅ Post ${post.id} is marked as LIKED - should show RED heart`);
             } else {
               console.log(`❌ Post ${post.id} is NOT liked - should show gray heart`);
             }
             return {
               ...post,
               seller: sellersMap.get(post.user_id) || null,
               isLiked: isLiked,
               likeCount: likeCountsMap.get(post.id) || 0,
               commentCount: commentCountsMap.get(post.id) || 0,
               isFollowing: userFollowsData.includes(post.user_id)
             };
           });

          console.log('Final posts with counts:', postsWithSellers.map(p => ({
            id: p.id,
            likeCount: p.likeCount,
            commentCount: p.commentCount
          })));

                     setPosts(postsWithSellers);
         } else {
           setPosts([]);
         }
       } catch (error) {
         console.error('Error fetching posts:', error);
       } finally {
         setLoading(false);
         setLikesLoading(false);
       }
    };

  const handleLike = async (postId: string) => {
    console.log('handleLike called with postId:', postId);
    console.log('currentUser:', currentUser);
    
    if (!currentUser) {
      console.log('User not logged in, showing modal');
      setLoginPromptOpen(true);
      return;
    }

    console.log('User is logged in, proceeding with like logic');

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

             // First, check the actual database state
       const { data: existingLike, error: checkError } = await supabase
         .from('likes')
         .select('*')
         .eq('user_id', currentUser)
         .eq('post_id', postId)
         .maybeSingle();

             const isActuallyLiked = !checkError && existingLike !== null;

      if (isActuallyLiked) {
        // Unlike: Remove from likes table
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser)
          .eq('post_id', postId);

        if (error) {
          console.error('Error unliking post:', error);
          return;
        }

        // Update local state to show unliked
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: false,
              likeCount: Math.max((p.likeCount || 1) - 1, 0)
            };
          }
          return p;
        }));
      } else {
        // Like: Add to likes table
        const { error } = await supabase
          .from('likes')
          .insert([{
            user_id: currentUser,
            post_id: postId
          }]);

        if (error) {
          console.error('Error liking post:', error);
          return;
        }

        // Update local state to show liked
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: true,
              likeCount: (p.likeCount || 0) + 1
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const openCommentModal = async (post: Post) => {
    if (!currentUser) {
      setLoginPromptOpen(true);
      return;
    }
    setSelectedPost(post);
    setCommentModalOpen(true);
    setNewComment('');
    
    // Fetch comments for this post
    try {
      // First, fetch comments
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
        return;
      }

             // Then, fetch user information for comments from buyers table
       if (commentsData && commentsData.length > 0) {
         const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
         
         const { data: usersData, error: usersError } = await supabase
           .from('buyers')
           .select('user_id, name, image_url')
           .in('user_id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          // Continue with comments even if users fetch fails
          setComments(commentsData);
          return;
        }

        // Create a map of user_id to user data
        const usersMap = new Map();
        if (usersData) {
          usersData.forEach((user: any) => {
            usersMap.set(user.user_id, user);
          });
        }

        // Combine comments with user information
        const commentsWithUsers = commentsData.map(comment => ({
          ...comment,
          user: usersMap.get(comment.user_id) || null
        }));

        setComments(commentsWithUsers);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleSendComment = async () => {
    if (!currentUser || !selectedPost || !newComment.trim()) return;

    setCommentLoading(true);
    try {
      // Insert the comment
      const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert([{
          post_id: selectedPost.id,
          user_id: currentUser,
          content: newComment.trim()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        return;
      }

             // Fetch user information for the new comment from buyers table
       const { data: userData, error: userError } = await supabase
         .from('buyers')
         .select('user_id, name, image_url')
         .eq('user_id', currentUser)
         .single();
       
       console.log('Current user ID:', currentUser);
       console.log('User data for current user:', userData);
       console.log('User error for current user:', userError);

      // Create the complete comment object with user information
      const completeComment = {
        ...newCommentData,
        user: userError ? null : userData
      };

             // Add new comment to the list
       setComments(prev => [...prev, completeComment]);
       setNewComment('');
       
       // Update the comment count for the selected post
       setPosts(prev => prev.map(p => {
         if (p.id === selectedPost.id) {
           return {
             ...p,
             commentCount: (p.commentCount || 0) + 1
           };
         }
         return p;
       }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedPost(null);
    setComments([]);
    setNewComment('');
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/products/${postId}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  const handleFollow = async (sellerId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUser) {
      setLoginPromptOpen(true);
      return;
    }

    try {
      if (isCurrentlyFollowing) {
        // Unfollow: Delete from follows table
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', currentUser)
          .eq('seller_id', sellerId);

        if (error) {
          console.error('Error unfollowing seller:', error);
          return;
        }

        console.log('Successfully unfollowed seller:', sellerId);
        
        // Update posts state
        setPosts(prev => prev.map(post => 
          post.user_id === sellerId 
            ? { ...post, isFollowing: false }
            : post
        ));
      } else {
        // Follow: Insert into follows table
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: currentUser,
            seller_id: sellerId
          });

        if (error) {
          console.error('Error following seller:', error);
          return;
        }

        console.log('Successfully followed seller:', sellerId);
        
        // Update posts state
        setPosts(prev => prev.map(post => 
          post.user_id === sellerId 
            ? { ...post, isFollowing: true }
            : post
        ));
      }
    } catch (error) {
      console.error('Error handling follow/unfollow:', error);
    }
  };

  if (loading || likesLoading) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="text-center text-gray-500">
          <p>هنوز پستی ایجاد نشده است.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-xl mx-auto py-8 space-y-8">
                 {posts.map(post => (
           <div key={`${post.id}-${post.isLiked}-${likesLoading}`} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center px-4 pt-4 pb-2 gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {post.seller?.profile_image ? (
                  <img 
                    src={post.seller.profile_image} 
                    alt="profile" 
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/vipana.png';
                    }}
                  />
                ) : (
                  <img src="/vipana.png" alt="profile" className="w-10 h-10 rounded-full object-cover" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-0.5">
                <div className="font-bold text-gray-900">
                  {post.seller?.name || `user_${post.user_id.substring(0, 8)}`}
                </div>
                <div className="text-xs text-gray-400">recently</div>
              </div>
              <button 
                className={`ml-2 px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  post.isFollowing 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                onClick={() => handleFollow(post.user_id, post.isFollowing || false)}
              >
                {post.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
            
            {/* Media */}
            {post.media_url && (
              <div className="w-full aspect-square bg-gray-100 relative">
                {post.media_url.split(',').map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
                  return (
                    <div key={index} className="w-full h-full">
                      {isVideo ? (
                        <video 
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        >
                          <source src={url} type="video/mp4" />
                          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                        </video>
                      ) : (
                        <img 
                          src={url} 
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-2 px-4 pb-1">
              {/* Like Icon */}
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => {
                  console.log('Like button clicked for post:', post.id);
                  handleLike(post.id);
                }}
              >
                                 <svg 
                   aria-label="Like" 
                   fill={post.isLiked ? "currentColor" : "none"} 
                   height="24" 
                   viewBox="0 0 24 24" 
                   width="24" 
                   stroke="currentColor" 
                   strokeWidth="2"
                   className={post.isLiked ? "text-red-600" : "text-gray-700"}
                 >
                  <path d="M16.792 3.904c-1.614 0-3.09.81-4.042 2.09-.952-1.28-2.428-2.09-4.042-2.09C5.01 3.904 3 5.914 3 8.354c0 4.09 7.75 9.742 8.08 9.98.13.094.31.094.44 0 .33-.238 8.08-5.89 8.08-9.98 0-2.44-2.01-4.45-4.808-4.45z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Comment Icon */}
              <button 
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => openCommentModal(post)}
              >
                <svg aria-label="Comment" fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 12.07c0 4.2-4.29 7.61-9.5 7.61-1.13 0-2.22-.15-3.24-.44-.36-.1-.74-.02-1.01.22l-2.2 1.93c-.38.33-.96.05-.96-.44v-2.13c0-.28-.16-.54-.41-.67C2.36 16.1 1.5 14.15 1.5 12.07c0-4.2 4.29-7.61 9.5-7.61s9.5 3.41 9.5 7.61z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Share Icon */}
              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => handleShare(post.id)}
                aria-label="اشتراک گذاری"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="24" width="24" className="text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v16" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="px-4 py-3">
              <div className="text-gray-700 text-sm mb-2">{post.content}</div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="mr-2">{post.likeCount || 0} likes</span>
                <span className="mr-2">•</span>
                <span>{post.commentCount || 0} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>

             {/* Comment Modal */}
       {commentModalOpen && selectedPost && (
         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white/90 backdrop-blur-md rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-2xl border border-white/20">
                         {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
               <h3 className="text-lg font-semibold text-gray-800">نظرات</h3>
              <button 
                onClick={closeCommentModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

                         {/* Comments List */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>هنوز نظری ثبت نشده است.</p>
                  <p className="text-sm mt-1">اولین نظر را شما ثبت کنید!</p>
                </div>
              ) : (
                                 comments.map(comment => (
                   <div key={comment.id} className="flex space-x-6 space-x-reverse">
                     <div className="flex-shrink-0 -mr-2 ml-2">
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                         {comment.user?.image_url ? (
                           <img 
                             src={comment.user.image_url} 
                             alt="profile" 
                             className="w-8 h-8 rounded-full object-cover"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = '/vipana.png';
                             }}
                           />
                         ) : (
                           <img src="/vipana.png" alt="profile" className="w-8 h-8 rounded-full object-cover" />
                         )}
                       </div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="bg-gray-100 rounded-lg px-3 py-2">
                         <div className="font-semibold text-sm text-gray-900">
                           {comment.user?.name || `user_${comment.user_id.substring(0, 8)}`}
                         </div>
                         <div className="text-sm text-gray-700 mt-1">{comment.content}</div>
                       </div>
                       <div className="text-xs text-gray-500 mt-1">
                         {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                       </div>
                     </div>
                   </div>
                 ))
              )}
            </div>

                         {/* Comment Input */}
             <div className="border-t border-gray-200/50 p-4 bg-gray-50/30">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="نظر خود را بنویسید..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !commentLoading) {
                      handleSendComment();
                    }
                  }}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || commentLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ShareModal open={shareModalOpen} url={shareUrl} onClose={() => setShareModalOpen(false)} />
      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </>
  );
} 