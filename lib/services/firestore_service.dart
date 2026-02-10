import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/models/user.dart' as app_user;
import 'package:campulse_mobile/models/user_profile.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // User operations
  Future<void> createUser({
    required String uid,
    required String email,
    required String displayName,
  }) async {
    await _firestore.collection('users').doc(uid).set({
      'email': email,
      'displayName': displayName,
      'createdAt': FieldValue.serverTimestamp(),
      'savedPosts': [],
    });
  }

  Future<app_user.User?> getUser(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    if (doc.exists) {
      return app_user.User.fromMap(doc.data()!, doc.id);
    }
    return null;
  }

  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    await _firestore.collection('users').doc(uid).update(data);
  }

  // Post operations
  Future<String> createPost(Post post) async {
    final docRef = await _firestore.collection('posts').add(post.toMap());
    return docRef.id;
  }

  Future<void> updatePost(String postId, Map<String, dynamic> data) async {
    await _firestore.collection('posts').doc(postId).update(data);
  }

  Future<void> deletePost(String postId) async {
    await _firestore.collection('posts').doc(postId).delete();
  }

  Future<Post?> getPost(String postId) async {
    final doc = await _firestore.collection('posts').doc(postId).get();
    if (doc.exists) {
      return Post.fromMap(doc.data()!, doc.id);
    }
    return null;
  }

  Stream<List<Post>> getPostsByCategory(String category) {
    // Use EXACT Firestore category value (already correct from PostCategory.value)
    debugPrint('🔍 Querying posts with category: "$category"');
    
    return _firestore
        .collection('posts')
        .where('category', isEqualTo: category)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
          debugPrint('📦 Found ${snapshot.docs.length} posts for category "$category"');
          final posts = snapshot.docs
              .map((doc) => Post.fromMap(doc.data(), doc.id))
              .toList();
          
          // Smart sorting: upcoming first, then recent past, then older (matching web)
          final now = DateTime.now();
          final twoDaysAgo = now.subtract(const Duration(days: 2));
          
          posts.sort((a, b) {
            final aDate = a.eventDate ?? a.createdAt;
            final bDate = b.eventDate ?? b.createdAt;
            
            final aIsUpcoming = aDate.isAfter(now);
            final bIsUpcoming = bDate.isAfter(now);
            final aIsRecent = aDate.isAfter(twoDaysAgo) && aDate.isBefore(now) || aDate.isAtSameMomentAs(now);
            final bIsRecent = bDate.isAfter(twoDaysAgo) && bDate.isBefore(now) || bDate.isAtSameMomentAs(now);
            
            // Upcoming first (ascending by date)
            if (aIsUpcoming && bIsUpcoming) {
              return aDate.compareTo(bDate);
            }
            if (aIsUpcoming) return -1;
            if (bIsUpcoming) return 1;
            
            // Recent past next (descending by date)
            if (aIsRecent && bIsRecent) {
              return bDate.compareTo(aDate);
            }
            if (aIsRecent) return -1;
            if (bIsRecent) return 1;
            
            // Older last (descending by date)
            return bDate.compareTo(aDate);
          });
          
          return posts;
        });
  }

  Stream<List<Post>> getAllPosts() {
    return _firestore
        .collection('posts')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Post.fromMap(doc.data(), doc.id))
            .toList());
  }

  // Saved posts
  Future<void> savePost(String userId, String postId) async {
    final userRef = _firestore.collection('users').doc(userId);
    await userRef.update({
      'savedPosts': FieldValue.arrayUnion([postId]),
    });
  }

  Future<void> unsavePost(String userId, String postId) async {
    final userRef = _firestore.collection('users').doc(userId);
    await userRef.update({
      'savedPosts': FieldValue.arrayRemove([postId]),
    });
  }

  Future<List<Post>> getSavedPosts(String userId) async {
    final userDoc = await _firestore.collection('users').doc(userId).get();
    final savedPostIds = List<String>.from(userDoc.data()?['savedPosts'] ?? []);
    
    if (savedPostIds.isEmpty) return [];
    
    final posts = await Future.wait(
      savedPostIds.map((id) => getPost(id)),
    );
    
    return posts.whereType<Post>().toList();
  }

  // ============================================
  // PROFILE HELPER FUNCTIONS
  // ============================================

  /// Fetches a user profile by UID
  Future<UserProfile?> getUserProfile(String uid) async {
    try {
      final docRef = _firestore.collection('users').doc(uid);
      final docSnap = await docRef.get();
      if (!docSnap.exists) {
        debugPrint('⚠️ User profile document does not exist: $uid');
        return null;
      }
      
      final data = docSnap.data()!;
      
      // Validate that data is a Map, not a List
      if (data is! Map<String, dynamic>) {
        debugPrint('❌ User profile data is not a Map. Type: ${data.runtimeType}, Value: $data');
        return null;
      }
      
      // Ensure clubs is always an array
      List<String> clubsArray = [];
      if (data['clubs'] != null) {
        if (data['clubs'] is List) {
          clubsArray = (data['clubs'] as List)
              .map((c) => c.toString().trim())
              .where((c) => c.isNotEmpty)
              .take(3)
              .toList();
        } else {
          debugPrint('⚠️ User profile clubs field is not a List: ${data['clubs']}');
        }
      }
      
      return UserProfile.fromMap(data, docSnap.id);
    } catch (e, stackTrace) {
      debugPrint('❌ Error getting user profile for $uid: $e');
      debugPrint('Stack trace: $stackTrace');
      return null;
    }
  }

  /// Updates a user profile
  Future<void> updateUserProfile(
    String uid,
    Map<String, dynamic> updates,
  ) async {
    final docRef = _firestore.collection('users').doc(uid);
    final cleanUpdates = <String, dynamic>{...updates};
    
    // Ensure clubs is always an array
    if (cleanUpdates.containsKey('clubs')) {
      if (cleanUpdates['clubs'] is List) {
        cleanUpdates['clubs'] = (cleanUpdates['clubs'] as List)
            .map((c) => c.toString().trim())
            .where((c) => c.isNotEmpty)
            .take(3)
            .toList();
      } else {
        cleanUpdates['clubs'] = [];
      }
    }
    
    await docRef.update({
      ...cleanUpdates,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Gets all posts created by a user
  Future<List<Post>> getUserPosts(String uid, {int maxPosts = 100}) async {
    try {
      final q = _firestore
          .collection('posts')
          .where('authorId', isEqualTo: uid)
          .orderBy('createdAt', descending: true)
          .limit(maxPosts);
      
      final snap = await q.get();
      return snap.docs.map((d) => Post.fromMap(d.data(), d.id)).toList();
    } catch (e) {
      // Fallback if index doesn't exist
      if (e.toString().contains('failed-precondition') || 
          e.toString().contains('index')) {
        debugPrint('⚠️ Index missing, using fallback query');
        final q = _firestore
            .collection('posts')
            .where('authorId', isEqualTo: uid)
            .limit(maxPosts);
        
        final snap = await q.get();
        final posts = snap.docs.map((d) => Post.fromMap(d.data(), d.id)).toList();
        // Sort client-side
        posts.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return posts;
      }
      debugPrint('❌ Error getting user posts: $e');
      return [];
    }
  }

  /// Updates user's posts count
  Future<void> updatePostsCount(String uid, int delta) async {
    final userRef = _firestore.collection('users').doc(uid);
    final userSnap = await userRef.get();
    if (!userSnap.exists) return;

    final current = (userSnap.data()?['postsCount'] as num?)?.toInt() ?? 0;
    await userRef.update({
      'postsCount': (current + delta).clamp(0, double.infinity).toInt(),
    });
  }

  // ============================================
  // FOLLOW SYSTEM FUNCTIONS
  // ============================================

  /// Gets the follow relationship status between two users
  Future<FollowStatus> getFollowStatus(String viewerUid, String targetUid) async {
    if (viewerUid == targetUid) return FollowStatus.own;

    // Check if following
    final followingRef = _firestore
        .collection('follows')
        .doc(viewerUid)
        .collection('following')
        .doc(targetUid);
    final followingSnap = await followingRef.get();
    if (followingSnap.exists) return FollowStatus.following;

    // Check if request exists
    final requestRef = _firestore
        .collection('follows')
        .doc(targetUid)
        .collection('requests')
        .doc(viewerUid);
    final requestSnap = await requestRef.get();
    if (requestSnap.exists && requestSnap.data()?['status'] == 'pending') {
      return FollowStatus.requested;
    }

    return FollowStatus.none;
  }

  /// Sends a follow request
  Future<void> sendFollowRequest(String targetUid, String requesterUid) async {
    final requestRef = _firestore
        .collection('follows')
        .doc(targetUid)
        .collection('requests')
        .doc(requesterUid);
    
    await requestRef.set({
      'requesterUid': requesterUid,
      'targetUid': targetUid,
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  /// Cancels a pending follow request
  Future<void> cancelFollowRequest(String targetUid, String requesterUid) async {
    final requestRef = _firestore
        .collection('follows')
        .doc(targetUid)
        .collection('requests')
        .doc(requesterUid);
    await requestRef.delete();
  }

  /// Accepts a follow request and creates the follow relationship
  Future<void> acceptFollowRequest(String targetUid, String requesterUid) async {
    await _firestore.runTransaction((transaction) async {
      // Update request status
      final requestRef = _firestore
          .collection('follows')
          .doc(targetUid)
          .collection('requests')
          .doc(requesterUid);
      transaction.update(requestRef, {'status': 'accepted'});

      // Create following relationship (requester follows target)
      final followingRef = _firestore
          .collection('follows')
          .doc(requesterUid)
          .collection('following')
          .doc(targetUid);
      transaction.set(followingRef, {
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Create follower relationship (target has requester as follower)
      final followerRef = _firestore
          .collection('follows')
          .doc(targetUid)
          .collection('followers')
          .doc(requesterUid);
      transaction.set(followerRef, {
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Update counts
      final requesterUserRef = _firestore.collection('users').doc(requesterUid);
      final targetUserRef = _firestore.collection('users').doc(targetUid);

      final requesterSnap = await transaction.get(requesterUserRef);
      final targetSnap = await transaction.get(targetUserRef);

      final requesterFollowing = (requesterSnap.data()?['followingCount'] as num?)?.toInt() ?? 0;
      final targetFollowers = (targetSnap.data()?['followersCount'] as num?)?.toInt() ?? 0;

      transaction.update(requesterUserRef, {
        'followingCount': requesterFollowing + 1,
      });
      transaction.update(targetUserRef, {
        'followersCount': targetFollowers + 1,
      });
    });
  }

  /// Rejects a follow request (deletes it)
  Future<void> rejectFollowRequest(String targetUid, String requesterUid) async {
    final requestRef = _firestore
        .collection('follows')
        .doc(targetUid)
        .collection('requests')
        .doc(requesterUid);
    await requestRef.delete();
  }

  /// Unfollows a user and updates counts
  Future<void> unfollow(String targetUid, String followerUid) async {
    await _firestore.runTransaction((transaction) async {
      // Delete following relationship
      final followingRef = _firestore
          .collection('follows')
          .doc(followerUid)
          .collection('following')
          .doc(targetUid);
      transaction.delete(followingRef);

      // Delete follower relationship
      final followerRef = _firestore
          .collection('follows')
          .doc(targetUid)
          .collection('followers')
          .doc(followerUid);
      transaction.delete(followerRef);

      // Update counts
      final followerUserRef = _firestore.collection('users').doc(followerUid);
      final targetUserRef = _firestore.collection('users').doc(targetUid);

      final followerSnap = await transaction.get(followerUserRef);
      final targetSnap = await transaction.get(targetUserRef);

      final followerFollowing = (followerSnap.data()?['followingCount'] as num?)?.toInt() ?? 0;
      final targetFollowers = (targetSnap.data()?['followersCount'] as num?)?.toInt() ?? 0;

      transaction.update(followerUserRef, {
        'followingCount': (followerFollowing - 1).clamp(0, double.infinity).toInt(),
      });
      transaction.update(targetUserRef, {
        'followersCount': (targetFollowers - 1).clamp(0, double.infinity).toInt(),
      });
    });
  }

  /// Gets all pending follow requests for a user
  Future<List<Map<String, dynamic>>> getPendingFollowRequests(String targetUid) async {
    final requestsRef = _firestore
        .collection('follows')
        .doc(targetUid)
        .collection('requests');
    final q = requestsRef.where('status', isEqualTo: 'pending');
    final snap = await q.get();
    return snap.docs.map((d) => {
      'requesterUid': d.id,
      ...d.data(),
    }).toList();
  }

  /// Gets list of followers for a user
  Future<List<UserProfile>> getFollowers(String uid) async {
    final followersRef = _firestore
        .collection('follows')
        .doc(uid)
        .collection('followers');
    final snap = await followersRef.get();
    final followerUids = snap.docs.map((d) => d.id).toList();
    if (followerUids.isEmpty) return [];

    final profiles = <UserProfile>[];
    for (final followerUid in followerUids) {
      final profile = await getUserProfile(followerUid);
      if (profile != null) profiles.add(profile);
    }
    return profiles;
  }

  /// Gets list of users a user is following
  Future<List<UserProfile>> getFollowing(String uid) async {
    final followingRef = _firestore
        .collection('follows')
        .doc(uid)
        .collection('following');
    final snap = await followingRef.get();
    final followingUids = snap.docs.map((d) => d.id).toList();
    if (followingUids.isEmpty) return [];

    final profiles = <UserProfile>[];
    for (final followingUid in followingUids) {
      final profile = await getUserProfile(followingUid);
      if (profile != null) profiles.add(profile);
    }
    return profiles;
  }
}

