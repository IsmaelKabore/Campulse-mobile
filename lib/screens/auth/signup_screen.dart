import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'package:campulse_mobile/providers/auth_provider.dart' as app_auth;
import 'package:campulse_mobile/screens/auth/login_screen.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _agreeToTerms = false;
  String? _policyModal; // 'terms' or 'privacy'

  @override
  void initState() {
    super.initState();
    // Listen to auth state changes - when user signs up, pop this screen
    // This ensures navigation is driven by auth state, not manual navigation
    FirebaseAuth.instance.authStateChanges().listen((user) {
      if (user != null && mounted) {
        // User signed up - pop this screen so AuthWrapper can show MainScreen
        Navigator.of(context).pop();
      }
    });
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _isBerkeleyEmail(String email) {
    final domain = email.trim().toLowerCase().split('@').last;
    return domain == 'berkeley.edu';
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_isBerkeleyEmail(_emailController.text.trim())) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please sign up with a berkeley.edu email address.'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    if (!_agreeToTerms) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'You must agree to the Terms and Privacy Policy to create an account.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    final authProvider = context.read<app_auth.AuthProvider>();
    final displayName =
        '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}';
    final success = await authProvider.signUp(
      _emailController.text.trim(),
      _passwordController.text,
      displayName,
    );

    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Failed to sign up'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Stack(
      children: [
        Scaffold(
          backgroundColor: const Color(0xFF121212),
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                // Title
                Text(
                  'Create account',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 24),

                // Form Card
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A1A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Name Fields (Side by Side)
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _firstNameController,
                                style: const TextStyle(color: Colors.white),
                                decoration: InputDecoration(
                                  labelText: 'First name',
                                  labelStyle: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                  ),
                                  hintText: 'Alex',
                                  hintStyle: TextStyle(
                                    color: Colors.white.withOpacity(0.4),
                                  ),
                                  filled: true,
                                  fillColor: const Color(0xFF2A2A2A),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.white.withOpacity(0.2),
                                    ),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.white.withOpacity(0.2),
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(
                                      color: Colors.white,
                                      width: 2,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 16,
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Required';
                                  }
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _lastNameController,
                                style: const TextStyle(color: Colors.white),
                                decoration: InputDecoration(
                                  labelText: 'Last name',
                                  labelStyle: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                  ),
                                  hintText: 'Chen',
                                  hintStyle: TextStyle(
                                    color: Colors.white.withOpacity(0.4),
                                  ),
                                  filled: true,
                                  fillColor: const Color(0xFF2A2A2A),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.white.withOpacity(0.2),
                                    ),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.white.withOpacity(0.2),
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(
                                      color: Colors.white,
                                      width: 2,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 16,
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Required';
                                  }
                                  return null;
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Email Field
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: 'Berkeley Email',
                            labelStyle: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                            ),
                            hintText: 'you@berkeley.edu',
                            hintStyle: TextStyle(
                              color: Colors.white.withOpacity(0.4),
                            ),
                            filled: true,
                            fillColor: const Color(0xFF2A2A2A),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Colors.white,
                                width: 2,
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 16,
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your email';
                            }
                            if (!_isBerkeleyEmail(value)) {
                              return 'Please use a berkeley.edu email';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Password Field
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            labelStyle: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                            ),
                            hintText: 'At least 6 characters',
                            hintStyle: TextStyle(
                              color: Colors.white.withOpacity(0.4),
                            ),
                            filled: true,
                            fillColor: const Color(0xFF2A2A2A),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Colors.white,
                                width: 2,
                              ),
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: Colors.white.withOpacity(0.7),
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 16,
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your password';
                            }
                            if (value.length < 6) {
                              return 'Password must be at least 6 characters';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Terms Checkbox
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Checkbox(
                              value: _agreeToTerms,
                              onChanged: (value) {
                                setState(() {
                                  _agreeToTerms = value ?? false;
                                });
                              },
                              activeColor: Colors.white,
                              checkColor: Colors.black,
                            ),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: RichText(
                                  text: TextSpan(
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: Colors.white.withOpacity(0.6),
                                    ),
                                    children: [
                                      const TextSpan(text: 'I agree to the '),
                                      WidgetSpan(
                                        child: GestureDetector(
                                          onTap: () {
                                            setState(() {
                                              _policyModal = 'terms';
                                            });
                                          },
                                          child: Text(
                                            'Terms of Service',
                                            style: TextStyle(
                                              color: Colors.blue.shade300,
                                              decoration:
                                                  TextDecoration.underline,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const TextSpan(text: ' and '),
                                      WidgetSpan(
                                        child: GestureDetector(
                                          onTap: () {
                                            setState(() {
                                              _policyModal = 'privacy';
                                            });
                                          },
                                          child: Text(
                                            'Privacy Policy',
                                            style: TextStyle(
                                              color: Colors.blue.shade300,
                                              decoration:
                                                  TextDecoration.underline,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const TextSpan(text: '.'),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Submit Button
                        Consumer<app_auth.AuthProvider>(
                          builder: (context, authProvider, _) {
                            return FilledButton(
                              onPressed: authProvider.isLoading
                                  ? null
                                  : _handleSignup,
                              style: FilledButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                disabledBackgroundColor:
                                    Colors.white.withOpacity(0.6),
                              ),
                              child: authProvider.isLoading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.black,
                                        ),
                                      ),
                                    )
                                  : const Text(
                                      'Create account',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Sign In Link
                Text(
                  'Already have an account?',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.6),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const LoginScreen(),
                      ),
                    );
                  },
                  child: const Text(
                    'Sign in',
                    style: TextStyle(
                      decoration: TextDecoration.underline,
                      decorationColor: Colors.white70,
                    ),
                  ),
                ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Policy Modals
        if (_policyModal != null)
          _PolicyModal(
            type: _policyModal!,
            onClose: () {
              setState(() {
                _policyModal = null;
              });
            },
          ),
      ],
    );
  }
}

// Policy Modal Widget
class _PolicyModal extends StatelessWidget {
  final String type;
  final VoidCallback onClose;

  const _PolicyModal({
    required this.type,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isTerms = type == 'terms';

    final content = isTerms
        ? {
            'title': 'Terms of Service',
            'sections': [
              {
                'title': '1. Acceptance of Terms',
                'content':
                    'By accessing or using Berkeley Events (the "Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.'
              },
              {
                'title': '2. Eligibility',
                'content':
                    'The Service is intended for UC Berkeley students and collaborators. You must create an account with a berkeley.edu email address and be legally able to enter into these Terms.'
              },
              {
                'title': '3. Accounts',
                'content':
                    'You are responsible for your account activity and for maintaining the confidentiality of your login credentials. Notify us promptly of any unauthorized use.'
              },
              {
                'title': '4. User Content',
                'content':
                    'You may post events, opportunities, and related materials ("Content"). You retain ownership of your Content, but grant us a non-exclusive, worldwide, royalty-free license to host, display, and distribute your Content solely to operate and improve the Service.'
              },
              {
                'title': '5. Prohibited Conduct',
                'content':
                    '• Posting unlawful, infringing, or misleading content.\n• Harassing others or violating privacy rights.\n• Attempting to access accounts, data, or systems without authorization.\n• Uploading malware or interfering with the Service\'s operation.'
              },
            ],
          }
        : {
            'title': 'Privacy Policy',
            'sections': [
              {
                'title': '1. Overview',
                'content':
                    'This Privacy Policy explains how Berkeley Events ("we", "our", "us") collects, uses, and shares information when you use the Service. By using the Service, you agree to this Policy.'
              },
              {
                'title': '2. Information We Collect',
                'content':
                    '• Account Info: name, berkeley.edu email, profile photo (optional).\n• Content: posts you create (title, description, images, time/location).\n• Usage: interactions like likes/saves, basic device and log information.\n• Cookies/Local Storage: used to keep you signed in and remember preferences.'
              },
              {
                'title': '3. How We Use Information',
                'content':
                    '• Provide, maintain, and improve the Service.\n• Recommend and surface relevant posts to you.\n• Prevent abuse and ensure safety and integrity.\n• Communicate with you about updates or support.'
              },
              {
                'title': '4. How We Share Information',
                'content':
                    '• Service Providers: we use third parties (e.g., hosting, analytics, storage) to operate the Service.\n• Legal: we may disclose information if required by law or to protect rights, safety, and the integrity of the Service.\n• Public Content: posts you publish may be visible to other users.'
              },
              {
                'title': '5. Your Choices',
                'content':
                    '• Access, edit, or delete your profile and posts.\n• Control theme and certain preferences in settings.\n• Contact us for questions about your data.'
              },
            ],
          };

    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(16),
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 600),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A1A),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      content['title'] as String,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: onClose,
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFF2A2A2A)),
              // Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Last updated: November 11, 2025',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                      const SizedBox(height: 20),
                      ...((content['sections'] as List).map((section) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                section['title'] as String,
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                section['content'] as String,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.white.withOpacity(0.7),
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        );
                      })),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1, color: Color(0xFF2A2A2A)),
              // Footer
              Padding(
                padding: const EdgeInsets.all(20),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: onClose,
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Close',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
