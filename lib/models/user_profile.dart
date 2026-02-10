import 'package:cloud_firestore/cloud_firestore.dart';

enum GradYearLabel {
  freshman,
  sophomore,
  junior,
  senior,
  grad,
  alumni,
  employee,
  staff,
}

extension GradYearLabelExtension on GradYearLabel {
  String get value {
    switch (this) {
      case GradYearLabel.freshman:
        return 'Freshman';
      case GradYearLabel.sophomore:
        return 'Sophomore';
      case GradYearLabel.junior:
        return 'Junior';
      case GradYearLabel.senior:
        return 'Senior';
      case GradYearLabel.grad:
        return 'Grad';
      case GradYearLabel.alumni:
        return 'Alumni';
      case GradYearLabel.employee:
        return 'Employee';
      case GradYearLabel.staff:
        return 'Staff';
    }
  }

  static GradYearLabel? fromString(String? value) {
    switch (value) {
      case 'Freshman':
        return GradYearLabel.freshman;
      case 'Sophomore':
        return GradYearLabel.sophomore;
      case 'Junior':
        return GradYearLabel.junior;
      case 'Senior':
        return GradYearLabel.senior;
      case 'Grad':
        return GradYearLabel.grad;
      case 'Alumni':
        return GradYearLabel.alumni;
      case 'Employee':
        return GradYearLabel.employee;
      case 'Staff':
        return GradYearLabel.staff;
      default:
        return null;
    }
  }
}

class UserProfileLinks {
  final String? instagram;
  final String? linkedin;
  final String? website;
  final String? tiktok;

  UserProfileLinks({
    this.instagram,
    this.linkedin,
    this.website,
    this.tiktok,
  });

  Map<String, dynamic> toMap() {
    return {
      if (instagram != null) 'instagram': instagram,
      if (linkedin != null) 'linkedin': linkedin,
      if (website != null) 'website': website,
      if (tiktok != null) 'tiktok': tiktok,
    };
  }

  factory UserProfileLinks.fromMap(Map<String, dynamic>? map) {
    if (map == null) return UserProfileLinks();
    return UserProfileLinks(
      instagram: map['instagram'] as String?,
      linkedin: map['linkedin'] as String?,
      website: map['website'] as String?,
      tiktok: map['tiktok'] as String?,
    );
  }
}

class UserProfilePrivacy {
  final bool showFollowers;
  final bool showFollowing;

  UserProfilePrivacy({
    this.showFollowers = true,
    this.showFollowing = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'showFollowers': showFollowers,
      'showFollowing': showFollowing,
    };
  }

  factory UserProfilePrivacy.fromMap(Map<String, dynamic>? map) {
    if (map == null) return UserProfilePrivacy();
    return UserProfilePrivacy(
      showFollowers: map['showFollowers'] ?? true,
      showFollowing: map['showFollowing'] ?? true,
    );
  }
}

class UserProfile {
  final String uid;
  final String firstName;
  final String lastName;
  final String? email;
  final GradYearLabel? gradYearLabel;
  final String? major;
  final String? bio;
  final String? avatarUrl;
  final List<String> clubs; // max 3
  final UserProfileLinks links;
  final int followersCount;
  final int followingCount;
  final int postsCount;
  final UserProfilePrivacy privacy;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  // Legacy fields
  final String? photoURL;
  final String? orgName;

  UserProfile({
    required this.uid,
    required this.firstName,
    required this.lastName,
    this.email,
    this.gradYearLabel,
    this.major,
    this.bio,
    this.avatarUrl,
    this.clubs = const [],
    UserProfileLinks? links,
    this.followersCount = 0,
    this.followingCount = 0,
    this.postsCount = 0,
    UserProfilePrivacy? privacy,
    this.createdAt,
    this.updatedAt,
    this.photoURL,
    this.orgName,
  }) : links = links ?? UserProfileLinks(),
       privacy = privacy ?? UserProfilePrivacy();

  String get fullName => '$firstName $lastName'.trim();

  String get displayName => fullName.isNotEmpty ? fullName : 'User';

  String? get effectiveAvatarUrl => avatarUrl ?? photoURL;

  Map<String, dynamic> toMap() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      if (email != null) 'email': email,
      if (gradYearLabel != null) 'gradYearLabel': gradYearLabel!.value,
      if (major != null) 'major': major,
      if (bio != null) 'bio': bio,
      if (avatarUrl != null) 'avatarUrl': avatarUrl,
      'clubs': clubs,
      'links': links.toMap(),
      'followersCount': followersCount,
      'followingCount': followingCount,
      'postsCount': postsCount,
      'privacy': privacy.toMap(),
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
      if (photoURL != null) 'photoURL': photoURL,
      if (orgName != null) 'orgName': orgName,
    };
  }

  factory UserProfile.fromMap(Map<String, dynamic> map, String uid) {
    // Handle clubs array - ensure it's always an array, max 3
    List<String> clubsList = [];
    if (map['clubs'] != null) {
      if (map['clubs'] is List) {
        clubsList = (map['clubs'] as List)
            .map((c) => c.toString().trim())
            .where((c) => c.isNotEmpty)
            .take(3)
            .toList();
      }
    }

    // Handle timestamps
    DateTime? createdAt;
    if (map['createdAt'] != null) {
      if (map['createdAt'] is Timestamp) {
        createdAt = (map['createdAt'] as Timestamp).toDate();
      } else if (map['createdAt'] is DateTime) {
        createdAt = map['createdAt'] as DateTime;
      }
    }

    DateTime? updatedAt;
    if (map['updatedAt'] != null) {
      if (map['updatedAt'] is Timestamp) {
        updatedAt = (map['updatedAt'] as Timestamp).toDate();
      } else if (map['updatedAt'] is DateTime) {
        updatedAt = map['updatedAt'] as DateTime;
      }
    }

    // Safely handle links - check if it's a Map, not a List
    Map<String, dynamic>? linksMap;
    if (map['links'] != null) {
      if (map['links'] is Map) {
        linksMap = map['links'] as Map<String, dynamic>?;
      } else {
        // If links is not a Map (e.g., it's a List or other type), use null
        linksMap = null;
      }
    }

    // Safely handle privacy - check if it's a Map, not a List
    Map<String, dynamic>? privacyMap;
    if (map['privacy'] != null) {
      if (map['privacy'] is Map) {
        privacyMap = map['privacy'] as Map<String, dynamic>?;
      } else {
        // If privacy is not a Map (e.g., it's a List or other type), use null
        privacyMap = null;
      }
    }

    return UserProfile(
      uid: uid,
      firstName: map['firstName']?.toString() ?? '',
      lastName: map['lastName']?.toString() ?? '',
      email: map['email']?.toString(),
      gradYearLabel: GradYearLabelExtension.fromString(map['gradYearLabel']?.toString()),
      major: map['major']?.toString(),
      bio: map['bio']?.toString(),
      avatarUrl: map['avatarUrl']?.toString(),
      clubs: clubsList,
      links: UserProfileLinks.fromMap(linksMap),
      followersCount: (map['followersCount'] as num?)?.toInt() ?? 0,
      followingCount: (map['followingCount'] as num?)?.toInt() ?? 0,
      postsCount: (map['postsCount'] as num?)?.toInt() ?? 0,
      privacy: UserProfilePrivacy.fromMap(privacyMap),
      createdAt: createdAt,
      updatedAt: updatedAt,
      photoURL: map['photoURL']?.toString(),
      orgName: map['orgName']?.toString(),
    );
  }

  UserProfile copyWith({
    String? uid,
    String? firstName,
    String? lastName,
    String? email,
    GradYearLabel? gradYearLabel,
    String? major,
    String? bio,
    String? avatarUrl,
    List<String>? clubs,
    UserProfileLinks? links,
    int? followersCount,
    int? followingCount,
    int? postsCount,
    UserProfilePrivacy? privacy,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? photoURL,
    String? orgName,
  }) {
    return UserProfile(
      uid: uid ?? this.uid,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      gradYearLabel: gradYearLabel ?? this.gradYearLabel,
      major: major ?? this.major,
      bio: bio ?? this.bio,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      clubs: clubs ?? this.clubs,
      links: links ?? this.links,
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount ?? this.followingCount,
      postsCount: postsCount ?? this.postsCount,
      privacy: privacy ?? this.privacy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      photoURL: photoURL ?? this.photoURL,
      orgName: orgName ?? this.orgName,
    );
  }
}

enum FollowStatus {
  own,
  none,
  requested,
  following,
}


