import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:campulse_mobile/firebase_options.dart';
import 'package:campulse_mobile/providers/auth_provider.dart' as app_auth;
import 'package:campulse_mobile/providers/post_provider.dart';
import 'package:campulse_mobile/screens/auth/landing_screen.dart';
import 'package:campulse_mobile/screens/main/main_screen.dart';
import 'package:campulse_mobile/screens/post/post_detail_screen.dart';
import 'package:campulse_mobile/screens/create/create_post_screen.dart';
import 'package:campulse_mobile/screens/profile/profile_screen.dart';
import 'package:campulse_mobile/models/post.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables from .env file
  try {
    await dotenv.load(fileName: '.env');
    debugPrint('Environment variables loaded successfully');
  } catch (e) {
    debugPrint('⚠️ Warning: Could not load .env file: $e');
    debugPrint('Make sure .env file exists in the project root');
    // In production, this should fail fast
    if (!kDebugMode) {
      throw Exception('Failed to load environment variables: $e');
    }
  }
  
  // Initialize Firebase only if not already initialized
  // This prevents duplicate initialization during hot reload/restart
  // Use robust checking: check apps list AND handle duplicate-app errors gracefully
  try {
    if (Firebase.apps.isEmpty) {
      debugPrint('Initializing Firebase...');
      
      // Check if firebase_options has placeholder values
      final options = DefaultFirebaseOptions.currentPlatform;
      if (options.apiKey.contains('YOUR_') || 
          options.appId.contains('YOUR_') ||
          options.projectId.contains('YOUR_')) {
        debugPrint('WARNING: Firebase options contain placeholder values!');
        debugPrint('Please run: flutterfire configure');
        // Continue anyway - native google-services.json might be used
      }
      
      await Firebase.initializeApp(
        options: options,
      );
      debugPrint('Firebase initialized successfully');
    } else {
      debugPrint('Firebase already initialized (${Firebase.apps.length} app(s))');
    }
    
    // Verify Firebase is accessible
    final app = Firebase.app();
    debugPrint('Firebase app verified: ${app.name}');
  } catch (e) {
    // Handle duplicate-app error: Firebase was already initialized
    // This can happen due to race conditions or native auto-initialization
    final errorString = e.toString();
    if (errorString.contains('duplicate-app') || 
        errorString.contains('already exists')) {
      // Firebase is already initialized, verify it's accessible
      try {
        final app = Firebase.app(); // Verify default app exists and is accessible
        debugPrint('Firebase duplicate-app error handled, app verified: ${app.name}');
        // If we get here, Firebase is properly initialized - continue normally
      } catch (verifyError) {
        // Firebase is not accessible despite duplicate error - this is unexpected
        // Log and rethrow to surface the real issue
        debugPrint('Firebase duplicate-app error but app not accessible: $verifyError');
        rethrow;
      }
    } else {
      // Different error occurred - log and rethrow to surface it
      debugPrint('Firebase initialization error: $e');
      rethrow;
    }
  }
  
  // Initialize Firebase App Check (after Firebase is ready)
  // Use debug provider in debug mode, Play Integrity in release
  try {
    if (kDebugMode) {
      // Development: Use debug provider (requires debug token registration in Firebase Console)
      await FirebaseAppCheck.instance.activate(
        androidProvider: AndroidProvider.debug,
        appleProvider: AppleProvider.debug,
      );
      debugPrint('Firebase App Check activated (DEBUG mode)');
    } else {
      // Production: Use Play Integrity (Android) and DeviceCheck/AppAttest (iOS)
      await FirebaseAppCheck.instance.activate(
        androidProvider: AndroidProvider.playIntegrity,
        appleProvider: AppleProvider.deviceCheck,
      );
      debugPrint('Firebase App Check activated (PRODUCTION mode)');
    }
  } catch (e) {
    debugPrint('Firebase App Check activation error: $e');
    // In production, this is critical - rethrow to fail fast
    if (!kDebugMode) {
      rethrow;
    }
    // In debug, continue anyway
  }
  
  runApp(const CampulseApp());
}

class CampulseApp extends StatelessWidget {
  const CampulseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => app_auth.AuthProvider()),
        ChangeNotifierProvider(create: (_) => PostProvider()),
      ],
      child: MaterialApp(
        title: 'Campulse',
        debugShowCheckedModeBanner: false,
        // Force dark mode only - premium futuristic design
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          // Use system font with modern weights (SF Pro on iOS, Roboto on Android)
          colorScheme: ColorScheme.dark(
            primary: Colors.white,
            onPrimary: Colors.black,
            secondary: Colors.white70,
            surface: const Color(0xFF1A1A1A), // Deep charcoal (not pure black)
            onSurface: Colors.white,
            surfaceContainerHighest: const Color(0xFF2A2A2A),
            onSurfaceVariant: Colors.white70,
            outline: Colors.white24,
            background: const Color(0xFF121212), // Dark gray (not pure black)
          ),
          scaffoldBackgroundColor: const Color(0xFF121212),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.transparent,
            elevation: 0,
            iconTheme: IconThemeData(color: Colors.white),
          ),
          textTheme: const TextTheme(
            headlineLarge: TextStyle(fontWeight: FontWeight.w600),
            headlineMedium: TextStyle(fontWeight: FontWeight.w600),
            headlineSmall: TextStyle(fontWeight: FontWeight.w600),
            titleLarge: TextStyle(fontWeight: FontWeight.w500),
            titleMedium: TextStyle(fontWeight: FontWeight.w500),
            bodyLarge: TextStyle(fontWeight: FontWeight.w400),
            bodyMedium: TextStyle(fontWeight: FontWeight.w400),
          ),
        ),
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          // Use system font with modern weights (SF Pro on iOS, Roboto on Android)
          colorScheme: ColorScheme.dark(
            primary: Colors.white,
            onPrimary: Colors.black,
            secondary: Colors.white70,
            surface: const Color(0xFF1A1A1A), // Deep charcoal (not pure black)
            onSurface: Colors.white,
            surfaceContainerHighest: const Color(0xFF2A2A2A),
            onSurfaceVariant: Colors.white70,
            outline: Colors.white24,
            background: const Color(0xFF121212), // Dark gray (not pure black)
          ),
          scaffoldBackgroundColor: const Color(0xFF121212),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.transparent,
            elevation: 0,
            iconTheme: IconThemeData(color: Colors.white),
          ),
          textTheme: const TextTheme(
            headlineLarge: TextStyle(fontWeight: FontWeight.w600),
            headlineMedium: TextStyle(fontWeight: FontWeight.w600),
            headlineSmall: TextStyle(fontWeight: FontWeight.w600),
            titleLarge: TextStyle(fontWeight: FontWeight.w500),
            titleMedium: TextStyle(fontWeight: FontWeight.w500),
            bodyLarge: TextStyle(fontWeight: FontWeight.w400),
            bodyMedium: TextStyle(fontWeight: FontWeight.w400),
          ),
        ),
        themeMode: ThemeMode.dark, // Force dark mode
        home: const AuthWrapper(),
        routes: {
          '/create': (context) => const CreatePostScreen(),
        },
        onGenerateRoute: (settings) {
          // Post detail route
          if (settings.name?.startsWith('/post/') ?? false) {
            final postId = settings.name!.split('/post/')[1];
            final post = settings.arguments as Post?;
            if (post != null) {
              return MaterialPageRoute(
                builder: (context) => PostDetailScreen(post: post),
              );
            }
          }
          // Profile route
          if (settings.name?.startsWith('/profile/') ?? false) {
            final userId = settings.name!.split('/profile/')[1];
            return MaterialPageRoute(
              builder: (context) => ProfileScreen(userId: userId.isEmpty ? null : userId),
            );
          }
          return null;
        },
      ),
    );
  }
}

/// AuthGate: Root widget that controls navigation based on Firebase Auth state.
/// 
/// This widget listens directly to Firebase Auth's authStateChanges stream
/// to ensure immediate UI updates when login/logout occurs. Navigation is
/// fully driven by auth state - no manual navigation needed.
/// 
/// Why this works:
/// - Listens directly to Firebase Auth (not provider) for instant updates
/// - Rebuilds immediately when auth state changes (login/logout)
/// - No manual navigation required - UI updates automatically
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    // Listen directly to Firebase Auth stream for immediate updates
    // This ensures UI rebuilds instantly on login/logout without waiting for provider
    return StreamBuilder(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        // Show loading while checking initial auth state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF121212),
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = snapshot.data;

        // User is not authenticated - show landing/login screen
        if (user == null) {
          return const LandingScreen();
        }

        // User is authenticated - show main app
        return const MainScreen();
      },
    );
  }
}

