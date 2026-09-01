import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,

        title: const Text(
          'ShreeAnna',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ==================================================
              // TITLE
              // ==================================================

              const Text(
                'My Profile',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 5),

              const Text(
                'Manage your personal information and account.',
                style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
              ),

              const SizedBox(height: 20),

              // ==================================================
              // PROFILE HEADER
              // ==================================================
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen.withValues(
                          alpha: 0.10,
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person,
                        size: 30,
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),

                    const SizedBox(width: 14),

                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Yogesh Parmar',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF202420),
                            ),
                          ),

                          SizedBox(height: 4),

                          Text(
                            'Farmer ID: SHF-10242',
                            style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFF687068),
                            ),
                          ),

                          SizedBox(height: 3),

                          Text(
                            'Green Valley Cooperative',
                            style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFF687068),
                            ),
                          ),
                        ],
                      ),
                    ),

                    IconButton(
                      onPressed: () {
                        debugPrint('Edit profile pressed');
                      },
                      icon: const Icon(
                        Icons.edit_outlined,
                        size: 19,
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // PERSONAL INFORMATION
              // ==================================================
              const Text(
                'Personal Information',
                style: TextStyle(
                  fontSize: 16,
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
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    _buildInfoRow(
                      icon: Icons.person_outline,
                      label: 'Full Name',
                      value: 'Ramesh Patel',
                    ),

                    _buildDivider(),

                    _buildInfoRow(
                      icon: Icons.phone_outlined,
                      label: 'Mobile Number',
                      value: '+91 98765 43210',
                    ),

                    _buildDivider(),

                    _buildInfoRow(
                      icon: Icons.email_outlined,
                      label: 'Email',
                      value: 'ramesh@example.com',
                    ),

                    _buildDivider(),

                    _buildInfoRow(
                      icon: Icons.location_on_outlined,
                      label: 'Address',
                      value: 'Oakridge, Gujarat',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // ACCOUNT
              // ==================================================
              const Text(
                'Account',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 10),

              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    _buildActionTile(
                      icon: Icons.lock_outline,
                      title: 'Change Password',
                      onTap: () {
                        debugPrint('Change password pressed');
                      },
                    ),

                    _buildDivider(),

                    _buildActionTile(
                      icon: Icons.notifications_none,
                      title: 'Notifications',
                      onTap: () {
                        debugPrint('Notifications pressed');
                      },
                    ),

                    _buildDivider(),

                    _buildActionTile(
                      icon: Icons.language_outlined,
                      title: 'Language',
                      trailingText: 'English',
                      onTap: () {
                        debugPrint('Language pressed');
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // SUPPORT
              // ==================================================
              const Text(
                'Support',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 10),

              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    _buildActionTile(
                      icon: Icons.help_outline,
                      title: 'Help & Support',
                      onTap: () {
                        debugPrint('Help pressed');
                      },
                    ),

                    _buildDivider(),

                    _buildActionTile(
                      icon: Icons.description_outlined,
                      title: 'Terms & Conditions',
                      onTap: () {
                        debugPrint('Terms pressed');
                      },
                    ),

                    _buildDivider(),

                    _buildActionTile(
                      icon: Icons.privacy_tip_outlined,
                      title: 'Privacy Policy',
                      onTap: () {
                        debugPrint('Privacy policy pressed');
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // LOGOUT
              // ==================================================
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton.icon(
                  onPressed: () {
                    _showLogoutDialog(context);
                  },
                  icon: const Icon(Icons.logout, size: 17),
                  label: const Text(
                    'Logout',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFC62828),
                    side: const BorderSide(color: Color(0xFFC62828)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // INFO ROW
  // ============================================================

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 9),
      child: Row(
        children: [
          Icon(icon, size: 18, color: ShreeAnnaTheme.primaryGreen),

          const SizedBox(width: 10),

          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 10, color: Color(0xFF7A817A)),
            ),
          ),

          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFF303530),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // ACTION TILE
  // ============================================================

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    String? trailingText,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        child: Row(
          children: [
            Icon(icon, size: 19, color: ShreeAnnaTheme.primaryGreen),

            const SizedBox(width: 12),

            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF303530),
                ),
              ),
            ),

            if (trailingText != null)
              Text(
                trailingText,
                style: const TextStyle(fontSize: 10, color: Color(0xFF7A817A)),
              ),

            const SizedBox(width: 5),

            const Icon(Icons.chevron_right, size: 18, color: Color(0xFF9AA09A)),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // DIVIDER
  // ============================================================

  Widget _buildDivider() {
    return const Divider(height: 1, color: Color(0xFFE3E7E3));
  }

  // ============================================================
  // LOGOUT DIALOG
  // ============================================================

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text(
            'Logout',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),

          content: const Text('Are you sure you want to logout?'),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(dialogContext);

                debugPrint('Logout confirmed');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: ShreeAnnaTheme.primaryGreen,
                foregroundColor: Colors.white,
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }
}
