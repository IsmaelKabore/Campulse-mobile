import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/models/user_profile.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/screens/post/post_detail_screen.dart';
import 'package:campulse_mobile/screens/profile/edit_profile_screen.dart';
import 'package:campulse_mobile/screens/profile/followers_following_screen.dart';
import 'package:campulse_mobile/screens/profile/follow_requests_screen.dart';
import 'package:campulse_mobile/screens/settings/settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  final String? userId;

  const ProfileScreen({super.key, this.userId});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  UserProfile? _profile;
  List<Post> _posts = [];
  FollowStatus _followStatus = FollowStatus.none;
  bool _isLoading = true;
  bool _isFollowing = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    
    final currentUser = FirebaseAuth.instance.currentUser;
    final targetUserId = widget.userId ?? currentUser?.uid;
    
    if (targetUserId == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      // Load profile and posts in parallel - use separate awaits to avoid type casting issues
      final profileFuture = _firestoreService.getUserProfile(targetUserId);
      final postsFuture = _firestoreService.getUserPosts(targetUserId);
      
      final profile = await profileFuture;
      final posts = await postsFuture;

      // Get follow status if viewing another user's profile
      FollowStatus followStatus = FollowStatus.own;
      if (currentUser != null && targetUserId != currentUser.uid) {
        followStatus = await _firestoreService.getFollowStatus(
          currentUser.uid,
          targetUserId,
        );
      }

      setState(() {
        _profile = profile;
        _posts = posts;
        _followStatus = followStatus;
        _isFollowing = followStatus == FollowStatus.following;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading profile: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleFollow() async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null || _profile == null) return;

    try {
      if (_followStatus == FollowStatus.none) {
        await _firestoreService.sendFollowRequest(_profile!.uid, currentUser.uid);
        setState(() {
          _followStatus = FollowStatus.requested;
        });
      } else if (_followStatus == FollowStatus.requested) {
        await _firestoreService.cancelFollowRequest(_profile!.uid, currentUser.uid);
        setState(() {
          _followStatus = FollowStatus.none;
        });
      } else if (_followStatus == FollowStatus.following) {
        await _firestoreService.unfollow(_profile!.uid, currentUser.uid);
        // Reload profile to update counts
        await _loadProfile();
      }
    } catch (e) {
      debugPrint('❌ Error handling follow: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  bool get _isOwnProfile {
    final currentUser = FirebaseAuth.instance.currentUser;
    return widget.userId == null || widget.userId == currentUser?.uid;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isTablet = MediaQuery.of(context).size.width > 600;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFF121212),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_profile == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF121212),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: const Center(
          child: Text(
            'User not found',
            style: TextStyle(color: Colors.white),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: _isOwnProfile
            ? [
                IconButton(
                  icon: const Icon(Icons.settings_outlined),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const SettingsScreen(),
                      ),
                    );
                  },
                  tooltip: 'Settings',
                ),
              ]
            : null,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: isTablet ? _buildTabletHeader(theme) : _buildMobileHeader(theme),
            ),

            // Bio Section (plain text, no card)
            if (_profile!.bio != null && _profile!.bio!.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                  _profile!.bio!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.87),
                    height: 1.4,
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],

            // Metadata Line is already in the header, so we don't need it here

            // Affiliations Section (Clubs)
            if (_profile!.clubs.isNotEmpty) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildAffiliationsSection(theme),
              ),
            ],

            const SizedBox(height: 8),

            // Social Links
            if (_profile!.links.instagram != null ||
                _profile!.links.linkedin != null ||
                _profile!.links.website != null ||
                _profile!.links.tiktok != null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_profile!.links.instagram != null)
                        _buildSocialIcon(
                          Icons.camera_alt_outlined,
                          _profile!.links.instagram!,
                          theme,
                        ),
                      if (_profile!.links.linkedin != null) ...[
                        const SizedBox(width: 16),
                        _buildSocialIcon(
                          Icons.business_center_outlined,
                          _profile!.links.linkedin!,
                          theme,
                        ),
                      ],
                      if (_profile!.links.website != null) ...[
                        const SizedBox(width: 16),
                        _buildSocialIcon(
                          Icons.language_outlined,
                          _profile!.links.website!,
                          theme,
                        ),
                      ],
                      if (_profile!.links.tiktok != null) ...[
                        const SizedBox(width: 16),
                        _buildSocialIcon(
                          Icons.music_note_outlined,
                          _profile!.links.tiktok!,
                          theme,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Counts Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCountItem(
                    '${_profile!.postsCount}',
                    'Posts',
                    theme,
                  ),
                  Container(
                    width: 1,
                    height: 30,
                    color: Colors.white.withOpacity(0.15),
                  ),
                  GestureDetector(
                    onTap: _isOwnProfile || _profile!.privacy.showFollowers
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => FollowersFollowingScreen(
                                  userId: _profile!.uid,
                                  initialTab: 0, // Followers
                                ),
                              ),
                            );
                          }
                        : null,
                    child: _buildCountItem(
                      '${_profile!.followersCount}',
                      'Followers',
                      theme,
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 30,
                    color: Colors.white.withOpacity(0.15),
                  ),
                  GestureDetector(
                    onTap: _isOwnProfile || _profile!.privacy.showFollowing
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => FollowersFollowingScreen(
                                  userId: _profile!.uid,
                                  initialTab: 1, // Following
                                ),
                              ),
                            );
                          }
                        : null,
                    child: _buildCountItem(
                      '${_profile!.followingCount}',
                      'Following',
                      theme,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Action Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildActionButton(theme),
            ),

            // Follow Requests Button (own profile only)
            if (_isOwnProfile) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const FollowRequestsScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.person_add_outlined),
                  label: const Text('Follow Requests'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white70,
                    side: BorderSide(color: Colors.white.withOpacity(0.2)),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Posts Grid
            if (_posts.isNotEmpty) ...[
              const Divider(height: 1, color: Color(0xFF2A2A2A)),
              _buildPostsGrid(theme),
            ] else ...[
              const SizedBox(height: 48),
              Center(
                child: Text(
                  'No posts yet',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white38,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMobileHeader(ThemeData theme) {
    return Column(
      children: [
        // Avatar with futuristic border
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [
                Colors.white.withOpacity(0.3),
                Colors.white.withOpacity(0.1),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.white.withOpacity(0.2),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          padding: const EdgeInsets.all(2),
          child: CircleAvatar(
            radius: 45,
            backgroundColor: const Color(0xFF2A2A2A),
            backgroundImage: _profile!.effectiveAvatarUrl != null
                ? NetworkImage(_profile!.effectiveAvatarUrl!)
                : null,
            child: _profile!.effectiveAvatarUrl == null
                ? Text(
                    _profile!.displayName.isNotEmpty
                        ? _profile!.displayName[0].toUpperCase()
                        : '?',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  )
                : null,
          ),
        ),
        const SizedBox(height: 8),

        // Name
        Text(
          _profile!.displayName,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),

        const SizedBox(height: 4),

        // Metadata Line
        _buildMetadataLine(theme),
      ],
    );
  }

  Widget _buildTabletHeader(ThemeData theme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Avatar with futuristic border
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [
                Colors.white.withOpacity(0.3),
                Colors.white.withOpacity(0.1),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.white.withOpacity(0.2),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          padding: const EdgeInsets.all(3),
          child: CircleAvatar(
            radius: 60,
            backgroundColor: const Color(0xFF2A2A2A),
            backgroundImage: _profile!.effectiveAvatarUrl != null
                ? NetworkImage(_profile!.effectiveAvatarUrl!)
                : null,
            child: _profile!.effectiveAvatarUrl == null
                ? Text(
                    _profile!.displayName.isNotEmpty
                        ? _profile!.displayName[0].toUpperCase()
                        : '?',
                    style: theme.textTheme.headlineLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  )
                : null,
          ),
        ),
        const SizedBox(width: 24),

        // Info
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _profile!.displayName,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              _buildMetadataLine(theme),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetadataLine(ThemeData theme) {
    final parts = <String>[];

    if (_profile!.gradYearLabel != null) {
      parts.add(_profile!.gradYearLabel!.value);
    }

    if (_profile!.major != null && _profile!.major!.isNotEmpty) {
      parts.add(_profile!.major!);
    }

    if (parts.isEmpty) return const SizedBox.shrink();

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (int i = 0; i < parts.length; i++) ...[
          if (i > 0)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: Text(
                '•',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.white.withOpacity(0.4),
                ),
              ),
            ),
          Text(
            parts[i],
            style: theme.textTheme.bodySmall?.copyWith(
              color: Colors.white.withOpacity(0.60),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildAffiliationsSection(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.group_outlined,
              size: 16,
              color: Colors.white.withOpacity(0.7),
            ),
            const SizedBox(width: 6),
            Text(
              'Affiliations',
              style: theme.textTheme.labelMedium?.copyWith(
                color: Colors.white.withOpacity(0.7),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: _profile!.clubs.map((club) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Colors.white.withOpacity(0.15),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.workspace_premium_outlined,
                    size: 14,
                    color: Colors.white.withOpacity(0.7),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    club,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.white.withOpacity(0.80),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildSocialIcon(IconData icon, String url, ThemeData theme) {
    return GestureDetector(
      onTap: () {
        // TODO: Open URL in browser
        debugPrint('Opening: $url');
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.white.withOpacity(0.12),
              Colors.white.withOpacity(0.06),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, size: 22, color: Colors.white.withOpacity(0.80)),
      ),
    );
  }

  Widget _buildCountItem(String count, String label, ThemeData theme) {
    return Column(
      children: [
        Text(
          count,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: Colors.white60,
            fontWeight: FontWeight.w400,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(ThemeData theme) {
    if (_isOwnProfile) {
      return SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => EditProfileScreen(profile: _profile!),
              ),
            ).then((_) => _loadProfile()); // Reload after edit
          },
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.white,
            side: BorderSide(color: Colors.white.withOpacity(0.3)),
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
          child: const Text('Edit Profile'),
        ),
      );
    }

    // Follow button states
    String buttonText;
    VoidCallback? onPressed;

    switch (_followStatus) {
      case FollowStatus.none:
        buttonText = 'Follow';
        onPressed = _handleFollow;
        break;
      case FollowStatus.requested:
        buttonText = 'Requested';
        onPressed = _handleFollow;
        break;
      case FollowStatus.following:
        buttonText = 'Following';
        onPressed = _handleFollow;
        break;
      case FollowStatus.own:
        buttonText = 'Edit Profile';
        onPressed = null;
        break;
    }

    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: _followStatus == FollowStatus.following
              ? Colors.white.withOpacity(0.1)
              : Colors.white,
          foregroundColor: _followStatus == FollowStatus.following
              ? Colors.white
              : Colors.black,
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
        child: Text(buttonText),
      ),
    );
  }

  Widget _buildPostsGrid(ThemeData theme) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(1),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 1,
        crossAxisSpacing: 1,
      ),
      itemCount: _posts.length,
      itemBuilder: (context, index) {
        final post = _posts[index];
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => PostDetailScreen(post: post),
              ),
            );
          },
          child: Container(
            color: const Color(0xFF1A1A1A),
            child: post.primaryImageUrl != null
                ? Image.network(
                    post.primaryImageUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      debugPrint('❌ Image failed to load: ${post.primaryImageUrl}');
                      return const Center(
                        child: Icon(Icons.broken_image, color: Colors.grey),
                      );
                    },
                  )
                : Container(
                    color: const Color(0xFF2A2A2A),
                    child: const Center(
                      child: Icon(Icons.image_outlined, color: Colors.grey),
                    ),
                  ),
          ),
        );
      },
    );
  }
}



