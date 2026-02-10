class User {
  final String uid;
  final String email;
  final String displayName;
  final DateTime createdAt;
  final List<String> savedPosts;

  User({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.createdAt,
    this.savedPosts = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'displayName': displayName,
      'createdAt': createdAt.toIso8601String(),
      'savedPosts': savedPosts,
    };
  }

  factory User.fromMap(Map<String, dynamic> map, String uid) {
    // Handle both Timestamp and DateTime formats
    DateTime createdAt;
    if (map['createdAt'] is DateTime) {
      createdAt = map['createdAt'] as DateTime;
    } else if (map['createdAt'] != null) {
      try {
        createdAt = (map['createdAt'] as dynamic).toDate();
      } catch (e) {
        createdAt = DateTime.parse(map['createdAt'].toString());
      }
    } else {
      createdAt = DateTime.now();
    }

    return User(
      uid: uid,
      email: map['email'] ?? '',
      displayName: map['displayName'] ?? '',
      createdAt: createdAt,
      savedPosts: List<String>.from(map['savedPosts'] ?? []),
    );
  }
}

