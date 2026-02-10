import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'package:campulse_mobile/providers/auth_provider.dart' as app_auth;

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();
    // Listen to auth state changes - when user signs out, pop all the way to root
    // This ensures navigation is driven by auth state, not manual navigation
    FirebaseAuth.instance.authStateChanges().listen((user) {
      if (user == null && mounted) {
        // User signed out - pop all screens until we reach the root
        // This allows AuthWrapper to show LandingScreen
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentUser = FirebaseAuth.instance.currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Account Section
          Text(
            'Account',
            style: theme.textTheme.labelLarge?.copyWith(
              color: Colors.white.withOpacity(0.6),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Card(
            color: const Color(0xFF1A1A1A),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.person_outline, color: Colors.white70),
                  title: const Text(
                    'Email',
                    style: TextStyle(color: Colors.white),
                  ),
                  subtitle: Text(
                    currentUser?.email ?? 'Not signed in',
                    style: const TextStyle(color: Colors.white60),
                  ),
                ),
                const Divider(height: 1, color: Color(0xFF2A2A2A)),
                ListTile(
                  leading: const Icon(Icons.edit_outlined, color: Colors.white70),
                  title: const Text(
                    'Edit Profile',
                    style: TextStyle(color: Colors.white),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white38),
                  onTap: () {
                    Navigator.pop(context);
                    // Navigate to edit profile - will be handled by parent
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // App Section
          Text(
            'App',
            style: theme.textTheme.labelLarge?.copyWith(
              color: Colors.white.withOpacity(0.6),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Card(
            color: const Color(0xFF1A1A1A),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline, color: Colors.white70),
                  title: const Text(
                    'About',
                    style: TextStyle(color: Colors.white),
                  ),
                  subtitle: const Text(
                    'Campulse v1.0.0',
                    style: TextStyle(color: Colors.white60),
                  ),
                ),
                const Divider(height: 1, color: Color(0xFF2A2A2A)),
                ListTile(
                  leading: const Icon(Icons.description_outlined, color: Colors.white70),
                  title: const Text(
                    'Terms of Service',
                    style: TextStyle(color: Colors.white),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white38),
                  onTap: () {
                    // TODO: Show terms
                  },
                ),
                const Divider(height: 1, color: Color(0xFF2A2A2A)),
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined, color: Colors.white70),
                  title: const Text(
                    'Privacy Policy',
                    style: TextStyle(color: Colors.white),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white38),
                  onTap: () {
                    // TODO: Show privacy policy
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Sign Out
          Card(
            color: const Color(0xFF1A1A1A),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Sign Out',
                style: TextStyle(color: Colors.red),
              ),
              onTap: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: const Color(0xFF1A1A1A),
                    title: const Text(
                      'Sign Out',
                      style: TextStyle(color: Colors.white),
                    ),
                    content: const Text(
                      'Are you sure you want to sign out?',
                      style: TextStyle(color: Colors.white70),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.pop(context, true),
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: const Text('Sign Out'),
                      ),
                    ],
                  ),
                );

                if (confirm == true && context.mounted) {
                  // Sign out - AuthWrapper will automatically navigate to LandingScreen
                  // No manual navigation needed - auth state change drives navigation
                  try {
                    await context.read<app_auth.AuthProvider>().signOut();
                    // Settings screen will pop itself via auth state listener when user becomes null
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Error signing out: ${e.toString()}'),
                          backgroundColor: Colors.red,
                        ),
                      );
                    }
                  }
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

