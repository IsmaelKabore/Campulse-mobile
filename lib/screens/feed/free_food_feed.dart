import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:campulse_mobile/providers/post_provider.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/widgets/event_card.dart';
import 'package:campulse_mobile/widgets/app_states.dart';
import 'package:campulse_mobile/constants/spacing.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/screens/post/post_detail_screen.dart';
import 'package:campulse_mobile/screens/saved/saved_posts_screen.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';
import 'package:flutter/services.dart';
import 'dart:ui';

class FreeFoodFeed extends StatefulWidget {
  const FreeFoodFeed({super.key});

  @override
  State<FreeFoodFeed> createState() => _FreeFoodFeedState();
}

class _FreeFoodFeedState extends State<FreeFoodFeed> {
  final ScrollController _scrollController = ScrollController();
  final FirestoreService _firestoreService = FirestoreService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PostProvider>().loadPostsByCategory(PostCategory.freeFood);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _handleLike(String postId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    HapticFeedback.lightImpact();
  }

  Future<void> _handleSave(String postId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    HapticFeedback.lightImpact();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentUser = FirebaseAuth.instance.currentUser;
    
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // Header with Profile + Saved icons
          SliverAppBar(
            floating: true,
            snap: true,
            pinned: false,
            backgroundColor: const Color(0xFF1A1A1A).withOpacity(0.8),
            elevation: 0,
            automaticallyImplyLeading: false,
            flexibleSpace: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  color: Colors.transparent,
                ),
              ),
            ),
            actions: [
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SavedPostsScreen(),
                    ),
                  );
                },
                icon: const Icon(Icons.bookmark_border),
                color: Colors.white,
                tooltip: 'Saved',
              ),
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ProfileScreen(
                        userId: currentUser?.uid,
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.person_outline),
                color: Colors.white,
                tooltip: currentUser != null ? 'Profile' : 'Sign in',
              ),
              const SizedBox(width: 8),
            ],
          ),
          
          // Title
          SliverPadding(
            padding: AppSpacing.screenPadding,
            sliver: SliverToBoxAdapter(
              child: Text(
                'Free Food',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          
          // Content
          SliverPadding(
            padding: AppSpacing.screenPadding,
            sliver: Consumer<PostProvider>(
              builder: (context, postProvider, _) {
                if (postProvider.isLoading && postProvider.freeFood.isEmpty) {
                  return const SliverFillRemaining(
                    child: AppLoadingState(),
                  );
                }

                if (postProvider.error != null && postProvider.freeFood.isEmpty) {
                  return SliverFillRemaining(
                    child: AppErrorState(
                      error: postProvider.error!,
                      onRetry: () {
                        postProvider.clearError();
                        postProvider.loadPostsByCategory(PostCategory.freeFood);
                      },
                    ),
                  );
                }

                if (postProvider.freeFood.isEmpty) {
                  return const SliverFillRemaining(
                    child: AppEmptyState(
                      message: 'No posts yet.',
                    ),
                  );
                }

                // Grid layout matching web
                return SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 1,
                    childAspectRatio: 0.8,
                    crossAxisSpacing: AppSpacing.lg,
                    mainAxisSpacing: AppSpacing.lg,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final post = postProvider.freeFood[index];
                      return EventCard(
                        post: post,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PostDetailScreen(post: post),
                            ),
                          );
                        },
                        onLike: () => _handleLike(post.id),
                        onSave: () => _handleSave(post.id),
                        isLiked: false,
                        isSaved: false,
                        likeCount: 0,
                      );
                    },
                    childCount: postProvider.freeFood.length,
                  ),
                );
              },
            ),
          ),
          
          // Bottom padding for navigation bar + FAB
          const SliverPadding(
            padding: EdgeInsets.only(bottom: 100),
          ),
        ],
      ),
    );
  }
}

