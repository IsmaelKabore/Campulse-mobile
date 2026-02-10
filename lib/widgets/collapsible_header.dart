import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/screens/saved/saved_posts_screen.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';
import 'dart:ui';

/// Collapsible header that reappears on scroll-up (Instagram-style)
class CollapsibleHeader extends StatefulWidget {
  final ScrollController scrollController;
  
  const CollapsibleHeader({
    super.key,
    required this.scrollController,
  });

  @override
  State<CollapsibleHeader> createState() => _CollapsibleHeaderState();
}

class _CollapsibleHeaderState extends State<CollapsibleHeader> {
  bool _isVisible = true;
  double _lastScrollOffset = 0;

  @override
  void initState() {
    super.initState();
    widget.scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    widget.scrollController.removeListener(_onScroll);
    super.dispose();
  }

  void _onScroll() {
    final currentOffset = widget.scrollController.offset;
    
    // Show header when scrolling up, hide when scrolling down
    if (currentOffset > _lastScrollOffset && currentOffset > 50) {
      // Scrolling down - hide
      if (_isVisible) {
        setState(() => _isVisible = false);
      }
    } else if (currentOffset < _lastScrollOffset) {
      // Scrolling up - show immediately
      if (!_isVisible) {
        setState(() => _isVisible = true);
      }
    }
    
    _lastScrollOffset = currentOffset;
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = FirebaseAuth.instance.currentUser;
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeInOut,
      height: _isVisible ? 56 : 0,
      child: _isVisible
          ? ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    border: Border(
                      bottom: BorderSide(
                        color: Colors.white.withOpacity(0.1),
                        width: 1,
                      ),
                    ),
                  ),
                  child: SafeArea(
                    bottom: false,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Saved icon
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
                        // Profile icon
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
                  ),
                ),
              ),
            )
          : const SizedBox.shrink(),
    );
  }
}



