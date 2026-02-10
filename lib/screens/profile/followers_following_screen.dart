import 'package:flutter/material.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/models/user_profile.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';

class FollowersFollowingScreen extends StatefulWidget {
  final String userId;
  final int initialTab; // 0 = Followers, 1 = Following

  const FollowersFollowingScreen({
    super.key,
    required this.userId,
    this.initialTab = 0,
  });

  @override
  State<FollowersFollowingScreen> createState() =>
      _FollowersFollowingScreenState();
}

class _FollowersFollowingScreenState
    extends State<FollowersFollowingScreen> with SingleTickerProviderStateMixin {
  final FirestoreService _firestoreService = FirestoreService();
  late TabController _tabController;
  List<UserProfile> _followers = [];
  List<UserProfile> _following = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      initialIndex: widget.initialTab,
      vsync: this,
    );
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final results = await Future.wait<List<UserProfile>>([
        _firestoreService.getFollowers(widget.userId),
        _firestoreService.getFollowing(widget.userId),
      ]);

      setState(() {
        _followers = results[0];
        _following = results[1];
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading followers/following: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Followers & Following'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Followers'),
            Tab(text: 'Following'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildList(_followers, theme),
                _buildList(_following, theme),
              ],
            ),
    );
  }

  Widget _buildList(List<UserProfile> profiles, ThemeData theme) {
    if (profiles.isEmpty) {
      return Center(
        child: Text(
          'No users yet',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: Colors.white60,
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: profiles.length,
      itemBuilder: (context, index) {
        final profile = profiles[index];

        return Card(
          color: const Color(0xFF1A1A1A),
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            leading: CircleAvatar(
              radius: 28,
              backgroundColor: const Color(0xFF2A2A2A),
              backgroundImage: profile.effectiveAvatarUrl != null
                  ? NetworkImage(profile.effectiveAvatarUrl!)
                  : null,
              child: profile.effectiveAvatarUrl == null
                  ? Text(
                      profile.displayName.isNotEmpty
                          ? profile.displayName[0].toUpperCase()
                          : '?',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                      ),
                    )
                  : null,
            ),
            title: Text(
              profile.displayName,
              style: theme.textTheme.titleMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (profile.major != null)
                  Text(
                    profile.major!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.white60,
                    ),
                  ),
                if (profile.gradYearLabel != null)
                  Text(
                    profile.gradYearLabel!.value,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.white38,
                    ),
                  ),
              ],
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ProfileScreen(userId: profile.uid),
                ),
              );
            },
          ),
        );
      },
    );
  }
}


