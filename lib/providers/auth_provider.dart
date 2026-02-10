import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:campulse_mobile/services/auth_service.dart';
import 'package:campulse_mobile/services/firestore_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final FirestoreService _firestoreService = FirestoreService();

  User? _user;
  bool _isLoading = true;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  AuthProvider() {
    _init();
  }

  void _init() {
    try {
      // Set initial user state immediately
      _user = _authService.currentUser;
      _isLoading = false;
      notifyListeners();
      
      // Listen to auth state changes
      _authService.authStateChanges.listen(
        (user) {
          _user = user;
          _isLoading = false;
          notifyListeners();
        },
        onError: (error) {
          // Handle errors in auth state stream
          _error = error.toString();
          _isLoading = false;
          notifyListeners();
        },
      );
    } catch (e) {
      // Handle initialization errors
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signIn(String email, String password) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      await _authService.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signUp(String email, String password, String displayName) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      final credential = await _authService.signUpWithEmailAndPassword(
        email: email,
        password: password,
        displayName: displayName,
      );

      if (credential?.user != null) {
        await _firestoreService.createUser(
          uid: credential!.user!.uid,
          email: email,
          displayName: displayName,
        );
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    try {
      _error = null;
      await _authService.signOut();
      // Note: No need to update _user here - authStateChanges listener will handle it
      // This ensures the AuthWrapper gets the update immediately
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      debugPrint('❌ Error signing out: $e');
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      _error = null;
      await _authService.resetPassword(email);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

