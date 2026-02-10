import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/services/auth_service.dart';

class PostDetailScreen extends StatefulWidget {
  final Post post;

  const PostDetailScreen({
    super.key,
    required this.post,
  });

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final AuthService _authService = AuthService();
  bool _isSaved = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkIfSaved();
  }

  Future<void> _checkIfSaved() async {
    final user = _authService.currentUser;
    if (user == null) return;

    final userData = await _firestoreService.getUser(user.uid);
    if (userData != null) {
      setState(() {
        _isSaved = userData.savedPosts.contains(widget.post.id);
      });
    }
  }

  void _showImageFullScreen(String imageUrl) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _ImageFullScreenView(imageUrl: imageUrl),
      ),
    );
  }

  Future<void> _toggleSave() async {
    final user = _authService.currentUser;
    if (user == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      if (_isSaved) {
        await _firestoreService.unsavePost(user.uid, widget.post.id);
      } else {
        await _firestoreService.savePost(user.uid, widget.post.id);
      }
      setState(() {
        _isSaved = !_isSaved;
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isSaved ? 'Post saved' : 'Post unsaved'),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('MMM d, y • h:mm a');

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Full flyer image
            if (widget.post.primaryImageUrl != null && widget.post.primaryImageUrl!.isNotEmpty)
              GestureDetector(
                onTap: () => _showImageFullScreen(widget.post.primaryImageUrl!),
                child: Image.network(
                  widget.post.primaryImageUrl!,
                  fit: BoxFit.contain,
                  width: double.infinity,
                  errorBuilder: (context, error, stackTrace) {
                    debugPrint(
                      '❌ Image failed to load\n'
                      'PostId: ${widget.post.id}\n'
                      'URL: ${widget.post.primaryImageUrl}\n'
                      'Error: $error'
                    );
                    return Container(
                      height: 400,
                      color: const Color(0xFF1A1A1A),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.broken_image,
                        size: 40,
                        color: Colors.grey,
                      ),
                    );
                  },
                ),
              ),
            // Content section
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1A1A1A),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Save button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IconButton(
                          icon: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : Icon(_isSaved ? Icons.bookmark : Icons.bookmark_border),
                          onPressed: _toggleSave,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          widget.post.category.value.toUpperCase(),
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onPrimaryContainer,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        dateFormat.format(widget.post.createdAt),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.post.title,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (widget.post.eventDate != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primaryContainer.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 18,
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            dateFormat.format(widget.post.eventDate!),
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onPrimaryContainer,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (widget.post.location != null) ...[
                    const SizedBox(height: 8),
                    Chip(
                      avatar: const Icon(Icons.location_on, size: 18),
                      label: Text(widget.post.location!),
                    ),
                  ],
                  const SizedBox(height: 16),
                  Text(
                    widget.post.description,
                    style: theme.textTheme.bodyLarge,
                  ),
                  if (widget.post.imageUrls.length > 1) ...[
                    const SizedBox(height: 24),
                    Text(
                      'More Images',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 200,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: widget.post.imageUrls.length - 1,
                        itemBuilder: (context, index) {
                          return GestureDetector(
                            onTap: () => _showImageFullScreen(widget.post.imageUrls[index + 1]),
                            child: Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  widget.post.imageUrls[index + 1],
                                  width: 200,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    debugPrint(
                                      '❌ Image failed to load\n'
                                      'PostId: ${widget.post.id}\n'
                                      'URL: ${widget.post.imageUrls[index + 1]}\n'
                                      'Error: $error'
                                    );
                                    return Container(
                                      width: 200,
                                      height: 200,
                                      color: theme.colorScheme.surfaceVariant,
                                      alignment: Alignment.center,
                                      child: const Icon(
                                        Icons.broken_image,
                                        size: 40,
                                        color: Colors.grey,
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  Card(
                    child: InkWell(
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          '/profile/${widget.post.authorId}',
                        );
                      },
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: theme.colorScheme.primaryContainer,
                          child: Text(
                            widget.post.authorName.isNotEmpty
                                ? widget.post.authorName[0].toUpperCase()
                                : '?',
                            style: TextStyle(
                              color: theme.colorScheme.onPrimaryContainer,
                            ),
                          ),
                        ),
                        title: Text(widget.post.authorName),
                        subtitle: const Text('Tap to view profile'),
                        trailing: const Icon(Icons.chevron_right),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            ),
          ],
        ),
      ),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
    );
  }
}

class _ImageFullScreenView extends StatelessWidget {
  final String imageUrl;

  const _ImageFullScreenView({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: InteractiveViewer(
          minScale: 0.5,
          maxScale: 4.0,
          child: Image.network(
            imageUrl,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              debugPrint(
                '❌ Image failed to load (fullscreen)\n'
                'URL: $imageUrl\n'
                'Error: $error'
              );
              return const Center(
                child: Icon(Icons.broken_image, color: Colors.white, size: 64),
              );
            },
          ),
        ),
      ),
    );
  }
}

