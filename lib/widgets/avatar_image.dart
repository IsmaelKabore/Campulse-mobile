import 'package:flutter/material.dart';

/// A widget that displays an avatar image with fallback support
class AvatarImage extends StatelessWidget {
  final String? imageUrl;
  final String? fallbackText;
  final double radius;
  final Color? backgroundColor;

  const AvatarImage({
    super.key,
    this.imageUrl,
    this.fallbackText,
    this.radius = 28,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bgColor = backgroundColor ?? const Color(0xFF2A2A2A);
    final text = fallbackText?.isNotEmpty == true
        ? fallbackText![0].toUpperCase()
        : '?';

    if (imageUrl == null || imageUrl!.isEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: Text(
          text,
          style: theme.textTheme.titleMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
        ),
      );
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: bgColor,
      backgroundImage: NetworkImage(imageUrl!),
      onBackgroundImageError: (exception, stackTrace) {
        debugPrint('❌ Avatar image failed to load: $imageUrl');
      },
      child: imageUrl == null
          ? Text(
              text,
              style: theme.textTheme.titleMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            )
          : null,
    );
  }
}


