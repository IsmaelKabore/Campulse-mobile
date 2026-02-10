import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:campulse_mobile/screens/feed/events_feed.dart';
import 'package:campulse_mobile/screens/feed/free_food_feed.dart';
import 'package:campulse_mobile/screens/feed/opportunities_feed.dart';
import 'package:firebase_auth/firebase_auth.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const EventsFeed(),
    const FreeFoodFeed(),
    const OpportunitiesFeed(),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      // Floating Action Button - transparent, circular, glassmorphic
      floatingActionButton: GestureDetector(
        onTapDown: (_) => HapticFeedback.lightImpact(),
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: FloatingActionButton(
            onPressed: () {
              HapticFeedback.mediumImpact();
              Navigator.pushNamed(context, '/create');
            },
            backgroundColor: Colors.white.withOpacity(0.12),
            elevation: 0,
            shape: const CircleBorder(),
            child: const Icon(
              Icons.add,
              color: Colors.white,
            ),
            tooltip: 'Create Post',
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      
      // Bottom navigation - dark, premium design
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          border: Border(
            top: BorderSide(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context: context,
                icon: Icons.event,
                label: 'Events',
                index: 0,
                isActive: _currentIndex == 0,
              ),
              _buildNavItem(
                context: context,
                icon: Icons.restaurant,
                label: 'Free Food',
                index: 1,
                isActive: _currentIndex == 1,
              ),
              _buildNavItem(
                context: context,
                icon: Icons.work,
                label: 'Opportunities',
                index: 2,
                isActive: _currentIndex == 2,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required int index,
    required bool isActive,
  }) {
    final theme = Theme.of(context);
    
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _currentIndex = index;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 24,
                color: isActive
                    ? Colors.white
                    : Colors.white.withOpacity(0.5),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                  color: isActive
                      ? Colors.white
                      : Colors.white.withOpacity(0.5),
                ),
              ),
              if (isActive)
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  height: 2,
                  width: 24,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

