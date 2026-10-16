import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../farmers/models/farmer.dart';
import '../../farmers/services/farmer_api.dart';

class EditProfileScreen extends StatefulWidget {
  final Farmer farmer;

  const EditProfileScreen({
    super.key,
    required this.farmer,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final FarmerApi _farmerApi = FarmerApi();

  late TextEditingController _fullNameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _addressController;
  late TextEditingController _districtController;
  late TextEditingController _talukaController;
  late TextEditingController _villageController;

  bool _isSaving = false;
  String _status = 'Active';

  @override
  void reassemble() {
    super.reassemble();
    _status = (widget.farmer.status.trim().toLowerCase() == 'inactive') ? 'Inactive' : 'Active';
  }

  @override
  void initState() {
    super.initState();
    _status = (widget.farmer.status.trim().toLowerCase() == 'inactive') ? 'Inactive' : 'Active';
    _fullNameController = TextEditingController(text: widget.farmer.fullName);
    _phoneController = TextEditingController(text: widget.farmer.phone);
    _emailController = TextEditingController(text: widget.farmer.email);
    _addressController = TextEditingController(text: widget.farmer.address);
    _districtController = TextEditingController(text: widget.farmer.district);
    _talukaController = TextEditingController(text: widget.farmer.taluka);
    _villageController = TextEditingController(text: widget.farmer.village);
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _districtController.dispose();
    _talukaController.dispose();
    _villageController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
    });

    try {
      final updatedFarmer = await _farmerApi.updateProfile(
        fullName: _fullNameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        address: _addressController.text.trim(),
        district: _districtController.text.trim(),
        taluka: _talukaController.text.trim(),
        village: _villageController.text.trim(),
        dateOfBirth: widget.farmer.dateOfBirth,
        status: _status,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: ShreeAnnaTheme.primaryGreen,
          duration: Duration(seconds: 2),
        ),
      );

      Navigator.pop(context, updatedFarmer);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: $e'),
          backgroundColor: const Color(0xFFC62828),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF202420)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Edit Profile',
          style: TextStyle(
            color: Color(0xFF202420),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.10),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person,
                        size: 28,
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                widget.farmer.farmerCode,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: ShreeAnnaTheme.primaryGreen,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _status == 'Active'
                                      ? const Color(0xFFE8F5E9)
                                      : const Color(0xFFFEE2E2),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _status == 'Active'
                                        ? const Color(0xFFA5D6A7)
                                        : const Color(0xFFFCA5A5),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: _status == 'Active'
                                            ? ShreeAnnaTheme.primaryGreen
                                            : const Color(0xFFDC2626),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      _status,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: _status == 'Active'
                                            ? ShreeAnnaTheme.primaryGreen
                                            : const Color(0xFFDC2626),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Edit your personal information and contact details',
                            style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Section: Account Status
              const Text(
                'Account Status',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Choose whether your farmer account is active or inactive',
                      style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatusButton(
                            title: 'Active',
                            subtitle: 'Available & active',
                            icon: Icons.check_circle_rounded,
                            isSelected: _status == 'Active',
                            selectedColor: ShreeAnnaTheme.primaryGreen,
                            selectedBgColor: const Color(0xFFE8F5E9),
                            onTap: () {
                              setState(() {
                                _status = 'Active';
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatusButton(
                            title: 'Inactive',
                            subtitle: 'Paused / inactive',
                            icon: Icons.pause_circle_filled_rounded,
                            isSelected: _status == 'Inactive',
                            selectedColor: const Color(0xFFDC2626),
                            selectedBgColor: const Color(0xFFFEE2E2),
                            onTap: () {
                              setState(() {
                                _status = 'Inactive';
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Section: Personal Information
              const Text(
                'Personal Information',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    _buildTextField(
                      controller: _fullNameController,
                      label: 'Full Name',
                      icon: Icons.person_outline,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Full name is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    _buildTextField(
                      controller: _phoneController,
                      label: 'Mobile Number',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Mobile number is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    _buildTextField(
                      controller: _emailController,
                      label: 'Email',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 14),
                    _buildTextField(
                      controller: _addressController,
                      label: 'Address',
                      icon: Icons.location_on_outlined,
                      maxLines: 2,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Address is required';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Section: Location Information
              const Text(
                'Location Details',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    _buildTextField(
                      controller: _districtController,
                      label: 'District',
                      icon: Icons.location_city_outlined,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'District is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    _buildTextField(
                      controller: _talukaController,
                      label: 'Taluka',
                      icon: Icons.map_outlined,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Taluka is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    _buildTextField(
                      controller: _villageController,
                      label: 'Village',
                      icon: Icons.home_work_outlined,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Village is required';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Save Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _handleSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Save Changes',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 12),

              // Cancel Button
              SizedBox(
                width: double.infinity,
                height: 44,
                child: OutlinedButton(
                  onPressed: _isSaving ? null : () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF687068),
                    side: const BorderSide(color: Color(0xFFD5DFD0)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Cancel'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      style: const TextStyle(fontSize: 13, color: Color(0xFF202420)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 12, color: Color(0xFF687068)),
        prefixIcon: Icon(icon, size: 18, color: const Color(0xFF687068)),
        filled: true,
        fillColor: const Color(0xFFF9FAF7),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: Color(0xFFD5DFD0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: Color(0xFFD5DFD0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: ShreeAnnaTheme.primaryGreen, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildStatusButton({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required Color selectedColor,
    required Color selectedBgColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? selectedBgColor : const Color(0xFFF9FAF7),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? selectedColor : const Color(0xFFD5DFD0),
              width: isSelected ? 1.8 : 1.0,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? icon : Icons.radio_button_unchecked,
                size: 20,
                color: isSelected ? selectedColor : const Color(0xFF8C968C),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? selectedColor : const Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 10,
                        color: isSelected
                            ? selectedColor.withValues(alpha: 0.85)
                            : const Color(0xFF7A817A),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
