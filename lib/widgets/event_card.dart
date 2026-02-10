import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'dart:ui';
import 'package:campulse_mobile/models/post.dart';
import 'package:campulse_mobile/constants/spacing.dart';

/// EventCard matching web app design - dark card with image overlay
class EventCard extends StatelessWidget {
  final Post post;
  final VoidCallback onTap;
  final VoidCallback? onSave;
  final VoidCallback? onLike;
  final bool isSaved;
  final bool isLiked;
  final int likeCount;

  const EventCard({
    super.key,
    required this.post,
    required this.onTap,
    this.onSave,
    this.onLike,
    this.isSaved = false,
    this.isLiked = false,
    this.likeCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Use primaryImageUrl helper which handles both imageUrl and imageUrls
    final imageUrl = post.primaryImageUrl;
    final hasImage = imageUrl != null;
    final eventDate = post.eventDate;

    // Format date
    String monthShort = '';
    String dayOfMonth = '';
    if (eventDate != null) {
      monthShort = DateFormat('MMM').format(eventDate);
      dayOfMonth = DateFormat('d').format(eventDate);
    }

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: AppRadius.card,
          color: const Color(0xFF1A1A1A),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: AppRadius.card,
          child: Stack(
            children: [
              // Background image or gradient
              Positioned.fill(
                child: hasImage && imageUrl != null && imageUrl!.isNotEmpty
                    ? Image.network(
                        imageUrl!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                        errorBuilder: (context, error, stackTrace) {
                          debugPrint(
                            '❌ Image failed to load\n'
                            'PostId: ${post.id}\n'
                            'URL: $imageUrl\n'
                            'Error: $error'
                          );
                          return Container(
                            height: double.infinity,
                            color: theme.colorScheme.surfaceContainerHighest,
                            alignment: Alignment.center,
                            child: const Icon(
                              Icons.broken_image,
                              size: 40,
                              color: Colors.grey,
                            ),
                          );
                        },
                      )
                    : Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              theme.colorScheme.surfaceContainerHighest,
                              theme.colorScheme.surfaceContainerHigh,
                            ],
                          ),
                        ),
                      ),
              ),

              // Gradient overlays for text readability
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: const [0.0, 0.3, 0.7, 1.0],
                      colors: [
                        Colors.black.withOpacity(0.6),
                        Colors.black.withOpacity(0.2),
                        Colors.transparent,
                        Colors.black.withOpacity(0.9),
                      ],
                    ),
                  ),
                ),
              ),

              // Date badge (top left) - glassmorphic
              if (eventDate != null)
                Positioned(
                  left: AppSpacing.md,
                  top: AppSpacing.md,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              monthShort.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              dayOfMonth,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

              // Action buttons (top right)
              Positioned(
                right: AppSpacing.md,
                top: AppSpacing.md,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (onLike != null)
                      _ActionButton(
                        icon: isLiked ? Icons.favorite : Icons.favorite_border,
                        color: isLiked ? Colors.red : Colors.white,
                        onPressed: onLike!,
                      ),
                    if (onLike != null && onSave != null)
                      const SizedBox(width: AppSpacing.sm),
                    if (onSave != null)
                      _ActionButton(
                        icon: isSaved ? Icons.bookmark : Icons.bookmark_border,
                        color: isSaved ? Colors.yellow : Colors.white,
                        onPressed: onSave!,
                      ),
                  ],
                ),
              ),

              // Content section (bottom)
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Title
                      Text(
                        post.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          height: 1.2,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      const SizedBox(height: AppSpacing.sm),

                      // Metadata row
                      Wrap(
                        spacing: AppSpacing.md,
                        runSpacing: AppSpacing.sm,
                        children: [
                          if (post.location != null)
                            _MetadataChip(
                              icon: Icons.location_on,
                              text: post.location!,
                            ),
                          if (likeCount > 0)
                            _MetadataChip(
                              icon: Icons.favorite,
                              text: likeCount.toString(),
                            ),
                        ],
                      ),

                      // Description
                      if (post.description.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          post.description,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.85),
                            height: 1.4,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
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

class _ActionButton extends StatefulWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onPressed;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.onPressed,
  });

  @override
  State<_ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<_ActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.9).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        HapticFeedback.lightImpact();
        _controller.forward();
      },
      onTapUp: (_) {
        _controller.reverse();
        widget.onPressed();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.4),
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Icon(
            widget.icon,
            size: 18,
            color: widget.color,
          ),
        ),
      ),
    );
  }
}

class _MetadataChip extends StatelessWidget {
  final IconData icon;
  final String text;

  const _MetadataChip({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 12,
          color: Colors.white.withOpacity(0.9),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Colors.white.withOpacity(0.9),
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

