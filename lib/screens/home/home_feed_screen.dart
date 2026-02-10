import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:campulse_mobile/providers/post_provider.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/widgets/event_card.dart';
import 'package:campulse_mobile/constants/spacing.dart';
import 'package:campulse_mobile/screens/feed/events_feed.dart';
import 'package:campulse_mobile/screens/feed/free_food_feed.dart';
import 'package:campulse_mobile/screens/feed/opportunities_feed.dart';
import 'package:campulse_mobile/screens/saved/saved_posts_screen.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';

class HomeFeedScreen extends StatefulWidget {
  const HomeFeedScreen({super.key});

  @override
  State<HomeFeedScreen> createState() => _HomeFeedScreenState();
}

class _HomeFeedScreenState extends State<HomeFeedScreen> {
  @override
  void initState() {
    super.initState();
    // Load all categories on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final postProvider = context.read<PostProvider>();
      postProvider.loadPostsByCategory(PostCategory.events);
      postProvider.loadPostsByCategory(PostCategory.freeFood);
      postProvider.loadPostsByCategory(PostCategory.opportunities);
    });
  }

  void _navigateToCategory(PostCategory category) {
    Widget? screen;
    switch (category) {
      case PostCategory.events:
        screen = const EventsFeed();
        break;
      case PostCategory.freeFood:
        screen = const FreeFoodFeed();
        break;
      case PostCategory.opportunities:
        screen = const OpportunitiesFeed();
        break;
    }
    if (screen != null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => screen!),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentUser = FirebaseAuth.instance.currentUser;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Top navigation bar
          SliverAppBar(
            floating: true,
            pinned: false,
            elevation: 0,
            backgroundColor: theme.colorScheme.surface,
            flexibleSpace: Container(
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(
                  bottom: BorderSide(
                    color: theme.colorScheme.outline.withOpacity(0.2),
                    width: 1,
                  ),
                ),
              ),
              padding: AppSpacing.screenPadding,
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SavedPostsScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.bookmark_border, size: 18),
                      label: const Text('Saved'),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                      ),
                    ),
                    AppSpacing.gapSM,
                    FilledButton.icon(
                      onPressed: () {
                        Navigator.pushNamed(context, '/create');
                      },
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Create'),
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                      ),
                    ),
                    AppSpacing.gapSM,
                    TextButton.icon(
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
                      icon: const Icon(Icons.person_outline, size: 18),
                      label: Text(currentUser != null ? 'Profile' : 'Sign in'),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Content
          SliverPadding(
            padding: AppSpacing.screenPadding,
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Events section
                _buildCategorySection(
                  context: context,
                  title: 'Events',
                  icon: Icons.event,
                  posts: context.watch<PostProvider>().events.take(3).toList(),
                  category: PostCategory.events,
                  onSeeAll: () => _navigateToCategory(PostCategory.events),
                ),

                AppSpacing.gapXL,

                // Free Food section
                _buildCategorySection(
                  context: context,
                  title: 'Free Food',
                  icon: Icons.restaurant,
                  posts: context.watch<PostProvider>().freeFood.take(3).toList(),
                  category: PostCategory.freeFood,
                  onSeeAll: () => _navigateToCategory(PostCategory.freeFood),
                ),

                AppSpacing.gapXL,

                // Opportunities section
                _buildCategorySection(
                  context: context,
                  title: 'Opportunities',
                  icon: Icons.work,
                  posts: context.watch<PostProvider>().opportunities.take(3).toList(),
                  category: PostCategory.opportunities,
                  onSeeAll: () => _navigateToCategory(PostCategory.opportunities),
                ),

                // Bottom padding for mobile nav
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySection({
    required BuildContext context,
    required String title,
    required IconData icon,
    required List<Post> posts,
    required PostCategory category,
    required VoidCallback onSeeAll,
  }) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, size: 24, color: theme.colorScheme.primary),
                AppSpacing.gapSM,
                Text(
                  title,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: onSeeAll,
              child: const Text('See all'),
            ),
          ],
        ),

        AppSpacing.gapLG,

        // Posts list (mobile: single column, matches web)
        if (posts.isEmpty)
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Center(
              child: Text(
                'No $title yet',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            ),
          )
        else
          SizedBox(
            height: 400, // Fixed height for card
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: posts.length,
              separatorBuilder: (context, index) => const SizedBox(width: AppSpacing.md),
              itemBuilder: (context, index) {
                final post = posts[index];
                return SizedBox(
                  width: MediaQuery.of(context).size.width * 0.85,
                  child: EventCard(
                    post: post,
                    onTap: () {
                      Navigator.pushNamed(
                        context,
                        '/post/${post.id}',
                        arguments: post,
                      );
                    },
                    onSave: () {
                      // TODO: Implement save functionality
                    },
                    onLike: () {
                      // TODO: Implement like functionality
                    },
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

