import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/models/user_profile.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';

class FollowRequestsScreen extends StatefulWidget {
  const FollowRequestsScreen({super.key});

  @override
  State<FollowRequestsScreen> createState() => _FollowRequestsScreenState();
}

class _FollowRequestsScreenState extends State<FollowRequestsScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  List<Map<String, dynamic>> _requests = [];
  Map<String, UserProfile> _profiles = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      setState(() => _isLoading = false);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final requests = await _firestoreService.getPendingFollowRequests(
        currentUser.uid,
      );

      // Load profiles for each requester
      final profiles = <String, UserProfile>{};
      for (final request in requests) {
        final requesterUid = request['requesterUid'] as String;
        final profile = await _firestoreService.getUserProfile(requesterUid);
        if (profile != null) {
          profiles[requesterUid] = profile;
        }
      }

      setState(() {
        _requests = requests;
        _profiles = profiles;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading follow requests: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleAccept(String requesterUid) async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) return;

    try {
      await _firestoreService.acceptFollowRequest(currentUser.uid, requesterUid);
      await _loadRequests(); // Reload
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Follow request accepted')),
        );
      }
    } catch (e) {
      debugPrint('❌ Error accepting request: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _handleReject(String requesterUid) async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) return;

    try {
      await _firestoreService.rejectFollowRequest(currentUser.uid, requesterUid);
      await _loadRequests(); // Reload
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Follow request rejected')),
        );
      }
    } catch (e) {
      debugPrint('❌ Error rejecting request: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
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
        title: const Text('Follow Requests'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _requests.isEmpty
              ? Center(
                  child: Text(
                    'No pending requests',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.white60,
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _requests.length,
                  itemBuilder: (context, index) {
                    final request = _requests[index];
                    final requesterUid = request['requesterUid'] as String;
                    final profile = _profiles[requesterUid];

                    if (profile == null) {
                      return const SizedBox.shrink();
                    }

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
                        subtitle: profile.major != null
                            ? Text(
                                profile.major!,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.white60,
                                ),
                              )
                            : null,
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            OutlinedButton(
                              onPressed: () => _handleReject(requesterUid),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white70,
                                side: BorderSide(
                                  color: Colors.white.withOpacity(0.2),
                                ),
                              ),
                              child: const Text('Decline'),
                            ),
                            const SizedBox(width: 8),
                            FilledButton(
                              onPressed: () => _handleAccept(requesterUid),
                              style: FilledButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: Colors.black,
                              ),
                              child: const Text('Accept'),
                            ),
                          ],
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProfileScreen(userId: requesterUid),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
    );
  }
}


