import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/screens/saved/saved_posts_screen.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';
import 'package:campulse_mobile/constants/spacing.dart';

/// Top navigation bar matching web app design
class TopNavigationBar extends StatelessWidget {
  const TopNavigationBar({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentUser = FirebaseAuth.instance.currentUser;

    return Container(
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
        bottom: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            // Saved icon (icon only)
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
              tooltip: 'Saved',
            ),
            // Profile icon (icon only)
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
              tooltip: currentUser != null ? 'Profile' : 'Sign in',
            ),
          ],
        ),
      ),
    );
  }
}


