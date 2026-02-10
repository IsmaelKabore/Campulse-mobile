import 'package:flutter/material.dart';
import 'package:campulse_mobile/services/firestore_service.dart';
import 'package:campulse_mobile/models/user_profile.dart';

class EditProfileScreen extends StatefulWidget {
  final UserProfile profile;

  const EditProfileScreen({super.key, required this.profile});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _bioController;
  late TextEditingController _majorController;
  late List<TextEditingController> _clubControllers;
  late TextEditingController _instagramController;
  late TextEditingController _linkedinController;
  late TextEditingController _websiteController;
  late TextEditingController _tiktokController;
  
  GradYearLabel? _selectedGradYear;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController(text: widget.profile.firstName);
    _lastNameController = TextEditingController(text: widget.profile.lastName);
    _bioController = TextEditingController(text: widget.profile.bio ?? '');
    _majorController = TextEditingController(text: widget.profile.major ?? '');
    _clubControllers = List.generate(
      3,
      (i) => TextEditingController(
        text: i < widget.profile.clubs.length ? widget.profile.clubs[i] : '',
      ),
    );
    _instagramController = TextEditingController(
      text: widget.profile.links.instagram ?? '',
    );
    _linkedinController = TextEditingController(
      text: widget.profile.links.linkedin ?? '',
    );
    _websiteController = TextEditingController(
      text: widget.profile.links.website ?? '',
    );
    _tiktokController = TextEditingController(
      text: widget.profile.links.tiktok ?? '',
    );
    _selectedGradYear = widget.profile.gradYearLabel;
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _bioController.dispose();
    _majorController.dispose();
    for (final controller in _clubControllers) {
      controller.dispose();
    }
    _instagramController.dispose();
    _linkedinController.dispose();
    _websiteController.dispose();
    _tiktokController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      // Collect clubs (max 3, filter empty)
      final clubs = _clubControllers
          .map((c) => c.text.trim())
          .where((c) => c.isNotEmpty)
          .take(3)
          .toList();

      // Collect links
      final links = {
        if (_instagramController.text.trim().isNotEmpty)
          'instagram': _instagramController.text.trim(),
        if (_linkedinController.text.trim().isNotEmpty)
          'linkedin': _linkedinController.text.trim(),
        if (_websiteController.text.trim().isNotEmpty)
          'website': _websiteController.text.trim(),
        if (_tiktokController.text.trim().isNotEmpty)
          'tiktok': _tiktokController.text.trim(),
      };

      await _firestoreService.updateUserProfile(
        widget.profile.uid,
        {
          'firstName': _firstNameController.text.trim(),
          'lastName': _lastNameController.text.trim(),
          'bio': _bioController.text.trim().isEmpty
              ? null
              : _bioController.text.trim(),
          'major': _majorController.text.trim().isEmpty
              ? null
              : _majorController.text.trim(),
          'clubs': clubs,
          'gradYearLabel': _selectedGradYear?.value,
          'links': links,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      debugPrint('❌ Error updating profile: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Edit Profile'),
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            TextButton(
              onPressed: _saveProfile,
              child: const Text('Save'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // First Name
            TextFormField(
              controller: _firstNameController,
              decoration: const InputDecoration(
                labelText: 'First Name',
                border: OutlineInputBorder(),
              ),
              style: const TextStyle(color: Colors.white),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'First name is required';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Last Name
            TextFormField(
              controller: _lastNameController,
              decoration: const InputDecoration(
                labelText: 'Last Name',
                border: OutlineInputBorder(),
              ),
              style: const TextStyle(color: Colors.white),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Last name is required';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Grad Year
            DropdownButtonFormField<GradYearLabel>(
              value: _selectedGradYear,
              decoration: const InputDecoration(
                labelText: 'Grad Year',
                border: OutlineInputBorder(),
              ),
              items: GradYearLabel.values.map((year) {
                return DropdownMenuItem(
                  value: year,
                  child: Text(year.value),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedGradYear = value);
              },
            ),
            const SizedBox(height: 16),

            // Major
            TextFormField(
              controller: _majorController,
              decoration: const InputDecoration(
                labelText: 'Major',
                border: OutlineInputBorder(),
              ),
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 16),

            // Clubs (max 3)
            ...List.generate(3, (index) {
              return Padding(
                padding: EdgeInsets.only(bottom: index < 2 ? 16 : 0),
                child: TextFormField(
                  controller: _clubControllers[index],
                  decoration: InputDecoration(
                    labelText: 'Club ${index + 1}',
                    border: const OutlineInputBorder(),
                  ),
                  style: const TextStyle(color: Colors.white),
                ),
              );
            }),

            const SizedBox(height: 16),

            // Bio
            TextFormField(
              controller: _bioController,
              decoration: const InputDecoration(
                labelText: 'Bio (max 160 characters)',
                border: OutlineInputBorder(),
                helperText: 'Tell us about yourself',
              ),
              style: const TextStyle(color: Colors.white),
              maxLength: 160,
              maxLines: 3,
            ),
            const SizedBox(height: 24),

            // Social Links Section
            Text(
              'Social Links',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),

            // Instagram
            TextFormField(
              controller: _instagramController,
              decoration: const InputDecoration(
                labelText: 'Instagram URL',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.camera_alt_outlined),
              ),
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 16),

            // LinkedIn
            TextFormField(
              controller: _linkedinController,
              decoration: const InputDecoration(
                labelText: 'LinkedIn URL',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.business_center_outlined),
              ),
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 16),

            // Website
            TextFormField(
              controller: _websiteController,
              decoration: const InputDecoration(
                labelText: 'Website URL',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.language_outlined),
              ),
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 16),

            // TikTok
            TextFormField(
              controller: _tiktokController,
              decoration: const InputDecoration(
                labelText: 'TikTok URL',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.music_note_outlined),
              ),
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.url,
            ),
          ],
        ),
      ),
    );
  }
}


