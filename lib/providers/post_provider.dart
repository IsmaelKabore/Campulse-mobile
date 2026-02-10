import 'package:flutter/foundation.dart';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/services/firestore_service.dart';

class PostProvider with ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();

  List<Post> _events = [];
  List<Post> _freeFood = [];
  List<Post> _opportunities = [];
  bool _isLoading = false;
  String? _error;

  List<Post> get events => _events;
  List<Post> get freeFood => _freeFood;
  List<Post> get opportunities => _opportunities;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void loadPostsByCategory(PostCategory category) {
    _firestoreService.getPostsByCategory(category.value).listen(
      (posts) {
        switch (category) {
          case PostCategory.events:
            _events = posts;
            break;
          case PostCategory.freeFood:
            _freeFood = posts;
            break;
          case PostCategory.opportunities:
            _opportunities = posts;
            break;
        }
        notifyListeners();
      },
      onError: (error) {
        _error = error.toString();
        notifyListeners();
      },
    );
  }

  Future<void> createPost(Post post) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _firestoreService.createPost(post);
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deletePost(String postId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _firestoreService.deletePost(postId);
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

