import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/widgets/post_card.dart';
import 'package:campulse_mobile/widgets/app_states.dart';

class SavedPostsScreen extends StatefulWidget {
  const SavedPostsScreen({super.key});

  @override
  State<SavedPostsScreen> createState() => _SavedPostsScreenState();
}

class _SavedPostsScreenState extends State<SavedPostsScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  List<Post> _savedPosts = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSavedPosts();
  }

  Future<void> _loadSavedPosts() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final posts = await _firestoreService.getSavedPosts(user.uid);
      setState(() {
        _savedPosts = posts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Posts'),
        elevation: 0,
      ),
      body: _isLoading
          ? const AppLoadingState()
          : _error != null
              ? AppErrorState(
                  error: _error!,
                  onRetry: _loadSavedPosts,
                )
              : _savedPosts.isEmpty
                  ? const AppEmptyState(
                      message: 'No saved posts yet. Save posts to view them here!',
                      icon: Icons.bookmark_border,
                    )
                  : RefreshIndicator(
                      onRefresh: _loadSavedPosts,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _savedPosts.length,
                        itemBuilder: (context, index) {
                          final post = _savedPosts[index];
                          return PostCard(
                            post: post,
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                '/post/${post.id}',
                                arguments: post,
                              );
                            },
                          );
                        },
                      ),
                    ),
    );
  }
}

