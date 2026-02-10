import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:campulse_mobile/screens/auth/login_screen.dart';
import 'package:campulse_mobile/screens/auth/signup_screen.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  int _currentTaglineIndex = 0;
  final List<Map<String, String>> _taglines = [
    {
      'before': 'Find the best',
      'highlight': 'Events',
      'after': 'around campus.',
    },
    {
      'before': 'Spot',
      'highlight': 'Free Food',
      'after': 'fast.',
    },
    {
      'before': 'Discover on-campus',
      'highlight': 'Opportunities',
      'after': '',
    },
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOut,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOut,
      ),
    );

    _animationController.forward();

    // Cycle through taglines
    _startTaglineCycle();
  }

  void _startTaglineCycle() {
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() {
          _currentTaglineIndex = (_currentTaglineIndex + 1) % _taglines.length;
        });
        _animationController.reset();
        _animationController.forward();
        _startTaglineCycle();
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tagline = _taglines[_currentTaglineIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 80),

                // Campulse Logo
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Image.asset(
                      'assets/images/logo.png',
                      width: 120,
                      height: 120,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        debugPrint('❌ Logo failed to load: $error');
                        // Fallback to text if logo not found
                        return Text(
                          'Campulse',
                          style: theme.textTheme.displayMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: -1,
                          ),
                        );
                      },
                    ),
                  ),
                ),

                const SizedBox(height: 48),

                // Animated Tagline
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(text: '${tagline['before']} '),
                          TextSpan(
                            text: tagline['highlight'],
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                          if (tagline['after']!.isNotEmpty)
                            TextSpan(text: ' ${tagline['after']}'),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 80),

                // CTAs
                Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: () {
                          HapticFeedback.mediumImpact();
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const SignupScreen(),
                            ),
                          );
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: const Text(
                          'Try it out',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LoginScreen(),
                          ),
                        );
                      },
                      child: Text(
                        'Already have an account? Sign in →',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white70,
                          decoration: TextDecoration.underline,
                          decorationColor: Colors.white70,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 60),

                // Footer
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton(
                      onPressed: () {
                        // TODO: Navigate to terms
                      },
                      child: Text(
                        'Terms',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                    ),
                    Text(
                      ' · ',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.white.withOpacity(0.5),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        // TODO: Navigate to privacy
                      },
                      child: Text(
                        'Privacy',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                    ),
                    Text(
                      ' · ',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.white.withOpacity(0.5),
                      ),
                    ),
                    Text(
                      '© 2025',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.white.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
