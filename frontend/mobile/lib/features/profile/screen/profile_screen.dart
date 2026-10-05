import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/storage/token_storage.dart';
import '../../farmers/models/farmer.dart';
import '../../farmers/services/farmer_api.dart';
import '../../../core/localization/app_language.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../auth/screen/welcome_screen.dart';
import '../../support/screen/support_screen.dart';
import '../../driver/screens/driver_journey_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final FarmerApi _farmerApi = FarmerApi();

  late Future<Farmer> _farmerFuture;

  @override
  void initState() {
    super.initState();
    _farmerFuture = _loadFarmer();
  }

  Future<Farmer> _loadFarmer() async {
    try {
      final farmer = await _farmerApi.getMe();

      debugPrint('Profile loaded');
      debugPrint('Farmer ID: ${farmer.id}');
      debugPrint('Farmer name: ${farmer.fullName}');

      return farmer;
    } catch (e) {
      debugPrint('Failed to load profile: $e');
      rethrow;
    }
  }

  Future<void> _refreshProfile() async {
    setState(() {
      _farmerFuture = _loadFarmer();
    });

    await _farmerFuture;
  }

  String _languageName(BuildContext context) {
    final locale = Localizations.localeOf(context);
    final l10n = AppLocalizations.of(context)!;

    switch (locale.languageCode) {
      case 'gu':
        return l10n.gujarati;

      case 'hi':
        return l10n.hindi;

      default:
        return l10n.english;
    }
  }

  Widget _buildLanguageOption({
    required BuildContext sheetContext,
    required String languageCode,
    required String title,
    required Locale currentLocale,
  }) {
    final isSelected = currentLocale.languageCode == languageCode;

    return InkWell(
      onTap: () async {
        await AppLanguage.instance.changeLanguage(languageCode);

        if (sheetContext.mounted) {
          Navigator.pop(sheetContext);
        }
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected
              ? ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.08)
              : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? ShreeAnnaTheme.primaryGreen
                : const Color(0xFFD5DFD0),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: const Color(0xFF303530),
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: ShreeAnnaTheme.primaryGreen,
              ),
          ],
        ),
      ),
    );
  }

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        final l10n = AppLocalizations.of(context)!;
        final currentLocale = Localizations.localeOf(context);

        return Container(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
          decoration: const BoxDecoration(
            color: Color(0xFFF7FAF1),
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 45,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                l10n.selectLanguage,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 14),
              _buildLanguageOption(
                sheetContext: sheetContext,
                languageCode: 'en',
                title: l10n.english,
                currentLocale: currentLocale,
              ),
              _buildLanguageOption(
                sheetContext: sheetContext,
                languageCode: 'gu',
                title: l10n.gujarati,
                currentLocale: currentLocale,
              ),
              _buildLanguageOption(
                sheetContext: sheetContext,
                languageCode: 'hi',
                title: l10n.hindi,
                currentLocale: currentLocale,
              ),
            ],
          ),
        );
      },
    );
  }

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

      body: FutureBuilder<Farmer>(
        future: _farmerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                color: ShreeAnnaTheme.primaryGreen,
              ),
            );
          }

          if (snapshot.hasError) {
            return _buildErrorView(snapshot.error.toString());
          }

          if (!snapshot.hasData) {
            return _buildErrorView('Farmer profile not found.');
          }

          final farmer = snapshot.data!;

          return RefreshIndicator(
            color: ShreeAnnaTheme.primaryGreen,
            onRefresh: _refreshProfile,
            child: _buildProfileContent(farmer),
          );
        },
      ),
    );
  }

  // ============================================================
  // PROFILE CONTENT
  // ============================================================

  Widget _buildProfileContent(Farmer farmer) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),

      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ==================================================
          // TITLE
          // ==================================================

          Text(
            AppLocalizations.of(context)!.myProfile,
            style: const TextStyle(
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
                    color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.10),
                    shape: BoxShape.circle,
                  ),

                  child: const Icon(
                    Icons.person,
                    size: 30,
                    color: ShreeAnnaTheme.primaryGreen,
                  ),
                ),

                const SizedBox(width: 14),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        farmer.fullName,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF202420),
                        ),
                      ),

                      const SizedBox(height: 4),

                      Text(
                        'Farmer ID: ${farmer.farmerCode}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Color(0xFF687068),
                        ),
                      ),

                      const SizedBox(height: 3),

                      Text(
                        farmer.village,
                        style: const TextStyle(
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

                    // TODO:
                    // Open edit profile screen.
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
                  value: farmer.fullName,
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.phone_outlined,
                  label: 'Mobile Number',
                  value: farmer.phone,
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  value: farmer.email.isEmpty ? 'Not provided' : farmer.email,
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.location_on_outlined,
                  label: 'Address',
                  value: farmer.address,
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // ==================================================
          // LOCATION
          // ==================================================
          const Text(
            'Location',
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
                  icon: Icons.location_city_outlined,
                  label: 'District',
                  value: farmer.district,
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.map_outlined,
                  label: 'Taluka',
                  value: farmer.taluka,
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.home_work_outlined,
                  label: 'Village',
                  value: farmer.village,
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // ==================================================
          // FARM INFORMATION
          // ==================================================
          const Text(
            'Farm Information',
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
                  icon: Icons.agriculture_outlined,
                  label: 'Registered Farms',
                  value: farmer.farmCount.toString(),
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.verified_outlined,
                  label: 'Account Status',
                  value: farmer.status,
                ),

                _buildDivider(),

                _buildInfoRow(
                  icon: Icons.calendar_today_outlined,
                  label: 'Member Since',
                  value: _formatDate(farmer.createdAt),
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
                  title: l10n.language,
                  trailingText: _languageName(context),
                  onTap: () {
                    _showLanguageSelector(context);
                  },
                ),

                _buildDivider(),

                _buildActionTile(
                  icon: Icons.local_shipping_outlined,
                  title: 'Driver Mode (Assigned Journeys)',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DriverJourneyScreen()),
                    );
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
                  title: l10n.helpSupport,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SupportScreen()),
                    );
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
    );
  }

  // ============================================================
  // ERROR VIEW
  // ============================================================

  Widget _buildErrorView(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),

        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 55, color: Colors.red),

            const SizedBox(height: 16),

            const Text(
              'Unable to load profile',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 8),

            Text(
              error,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: _refreshProfile,
              child: const Text('RETRY'),
            ),
          ],
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
  // DATE
  // ============================================================

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }

  // ============================================================
  // LOGOUT
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
              onPressed: () async {
                Navigator.pop(dialogContext);

                final tokenStorage = TokenStorage();
                await tokenStorage.clearAccessToken();

                if (!context.mounted) return;

                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                  (route) => false,
                );
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
