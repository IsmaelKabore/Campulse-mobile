import 'package:cloud_firestore/cloud_firestore.dart';

enum PostCategory {
  events,
  freeFood,
  opportunities,
}

extension PostCategoryExtension on PostCategory {
  /// Returns the EXACT Firestore category value
  String get value {
    switch (this) {
      case PostCategory.events:
        return 'events';
      case PostCategory.freeFood:
        return 'free-food'; // EXACT Firestore value (with hyphen)
      case PostCategory.opportunities:
        return 'opportunities';
    }
  }

  static PostCategory fromString(String value) {
    switch (value) {
      case 'events':
        return PostCategory.events;
      case 'freeFood':
      case 'free-food': // Handle both formats
        return PostCategory.freeFood;
      case 'opportunities':
        return PostCategory.opportunities;
      default:
        return PostCategory.events;
    }
  }
}

class Post {
  final String id;
  final String title;
  final String description;
  final String authorId;
  final String authorName;
  final PostCategory category;
  final String? imageUrl; // Web app uses singular imageUrl
  final List<String> imageUrls; // Keep for backward compatibility
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? location;
  final DateTime? eventDate;

  Post({
    required this.id,
    required this.title,
    required this.description,
    required this.authorId,
    required this.authorName,
    required this.category,
    this.imageUrl,
    this.imageUrls = const [],
    required this.createdAt,
    this.updatedAt,
    this.location,
    this.eventDate,
  });

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'authorId': authorId,
      'authorName': authorName,
      'category': category.value,
      'imageUrl': imageUrl ?? (imageUrls.isNotEmpty ? imageUrls.first : null),
      'imageUrls': imageUrls,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
      'location': location,
      'eventDate': eventDate != null ? Timestamp.fromDate(eventDate!) : null,
    };
  }

  factory Post.fromMap(Map<String, dynamic> map, String id) {
    // Handle both imageUrl (web) and imageUrls (legacy)
    final imageUrlValue = map['imageUrl'] as String?;
    final imageUrlsList = List<String>.from(map['imageUrls'] ?? []);
    
    return Post(
      id: id,
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      authorId: map['authorId'] ?? '',
      authorName: map['authorName'] ?? '',
      category: PostCategoryExtension.fromString(map['category'] ?? 'events'),
      imageUrl: imageUrlValue,
      imageUrls: imageUrlsList,
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
      location: map['location'],
      eventDate: (map['eventDate'] as Timestamp?)?.toDate(),
    );
  }

  Post copyWith({
    String? id,
    String? title,
    String? description,
    String? authorId,
    String? authorName,
    PostCategory? category,
    String? imageUrl,
    List<String>? imageUrls,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? location,
    DateTime? eventDate,
  }) {
    return Post(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      category: category ?? this.category,
      imageUrl: imageUrl ?? this.imageUrl,
      imageUrls: imageUrls ?? this.imageUrls,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      location: location ?? this.location,
      eventDate: eventDate ?? this.eventDate,
    );
  }
  
  // Helper to get the primary image URL (prefer imageUrl, fallback to first in imageUrls)
  String? get primaryImageUrl => imageUrl ?? (imageUrls.isNotEmpty ? imageUrls.first : null);
}

