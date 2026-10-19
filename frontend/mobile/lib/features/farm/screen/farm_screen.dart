import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/network/api_config.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../model/farm.dart';

class FarmScreen extends StatelessWidget {
  final Farm farm;
  final String milletType;

  const FarmScreen({super.key, required this.farm, required this.milletType});
  // ============================================================
  // FARM IMAGE
  // ============================================================

  Widget _buildFarmImage(BuildContext context) {
    debugPrint('Farm image URL: ${farm.imageUrl}');
    if (farm.imageUrl.isEmpty) {
      return Container(
        width: double.infinity,
        height: 200,
        decoration: BoxDecoration(
          color: const Color(0xFFF2F5F0),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFFD5DFD0)),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.image_not_supported_outlined,
              size: 42,
              color: Color(0xFF8A938A),
            ),
            SizedBox(height: 8),
            Text(
              'No farm image available',
              style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
            ),
          ],
        ),
      );
    }

    return GestureDetector(
      onTap: () {
        _showFullScreenImage(context);
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: Stack(
          children: [
            SizedBox(
              width: double.infinity,
              height: 210,
              child: Image.network(
                ApiConfig.resolveImageUrl(farm.imageUrl),
                fit: BoxFit.cover,

                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) {
                    return child;
                  }

                  return const Center(child: CircularProgressIndicator());
                },

                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: const Color(0xFFF2F5F0),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.broken_image_outlined,
                            size: 42,
                            color: Color(0xFF8A938A),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Unable to load farm image',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF687068),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // Preview indicator
            Positioned(
              right: 10,
              bottom: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.fullscreen, color: Colors.white, size: 16),
                    SizedBox(width: 5),
                    Text(
                      'View',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFullScreenImage(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.black,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: EdgeInsets.zero,
          child: Stack(
            children: [
              InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Center(
                  child: Image.network(
                    ApiConfig.resolveImageUrl(farm.imageUrl),
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Center(
                        child: Icon(
                          Icons.broken_image_outlined,
                          color: Colors.white,
                          size: 50,
                        ),
                      );
                    },
                  ),
                ),
              ),

              Positioned(
                top: 40,
                right: 20,
                child: IconButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.close, color: Colors.white, size: 28),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,

        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),

        title: Text(
          l10n.appName,
          style: const TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 30),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ==================================================
              // TITLE
              // ==================================================

              Text(
                l10n.farmInformation,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 5),

              const Text(
                'View your registered farm information.',
                style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
              ),

              const SizedBox(height: 20),

              // ==================================================
              // FARM HEADER
              // ==================================================
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),

                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(6),
                ),

                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,

                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),

                      child: const Icon(
                        Icons.agriculture,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),

                    const SizedBox(width: 14),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            farm.farmName,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),

                          const SizedBox(height: 5),

                          Text(
                            farm.farmCode,
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 5,
                      ),

                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),

                      child: Text(
                        farm.status.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ==================================================
              // FARM IMAGE
              // ==================================================
              _buildFarmImage(context),

              const SizedBox(height: 20),

              // ==================================================
              // FARM OVERVIEW
              // ==================================================
              const Text(
                'Farm Overview',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.square_foot,
                      label: 'TOTAL AREA',
                      value: '${farm.areaInAcres.toStringAsFixed(1)} Acres',
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.layers_outlined,
                      label: 'SOIL TYPE',
                      value: farm.soilType,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),


              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.pin_drop_outlined,
                      label: 'SURVEY NO.',
                      value: farm.surveyNumber,
                    ),
                  ),

                  const SizedBox(width: 5),

                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.calendar_month_outlined,
                      label: 'REGISTERED',
                      value: _formatDate(farm.createdAt),
                    ),
                  ),

                  const SizedBox(width: 5),
                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.grass_outlined,
                      label: 'MILLET TYPE',
                      value: farm.milletType,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 22),

              // ==================================================
              // FARM LOCATION
              // ==================================================
              const Text(
                'Farm Location',
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
                    _buildDetailRow(
                      icon: Icons.home_work_outlined,
                      label: 'Village',
                      value: farm.village,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.map_outlined,
                      label: 'Taluka',
                      value: farm.taluka,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.location_city_outlined,
                      label: 'District',
                      value: farm.district,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.location_on_outlined,
                      label: 'Latitude',
                      value: farm.latitude.toString(),
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.location_on_outlined,
                      label: 'Longitude',
                      value: farm.longitude.toString(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // FARM DETAILS
              // ==================================================
              const Text(
                'Farm Details',
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
                    _buildDetailRow(
                      icon: Icons.qr_code_2_outlined,
                      label: 'Farm Code',
                      value: farm.farmCode,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.landscape_outlined,
                      label: 'Soil Type',
                      value: farm.soilType,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.square_foot,
                      label: 'Area',
                      value: '${farm.areaInAcres.toStringAsFixed(1)} Acres',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.assignment_outlined,
                      label: 'Survey Number',
                      value: farm.surveyNumber,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.calendar_today_outlined,
                      label: 'Created',
                      value: _formatDate(farm.createdAt),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // VERIFICATION
              // ==================================================
              const Text(
                'Verification',
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
                    _buildDetailRow(
                      icon: Icons.verified_outlined,
                      label: 'Status',
                      value: farm.status,
                    ),

                    if (farm.verifiedAt != null) ...[
                      _buildDivider(),

                      _buildDetailRow(
                        icon: Icons.event_available_outlined,
                        label: 'Verified At',
                        value: _formatDate(farm.verifiedAt!),
                      ),
                    ],

                    if (farm.verifiedBy != null &&
                        farm.verifiedBy!.isNotEmpty) ...[
                      _buildDivider(),

                      _buildDetailRow(
                        icon: Icons.person_outline,
                        label: 'Verified By',
                        value: farm.verifiedBy!,
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // IDs
              // ==================================================
              const Text(
                'Identifiers',
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
                  color: const Color(0xFFF2F7ED),
                  borderRadius: BorderRadius.circular(5),
                ),

                child: Column(
                  children: [
                    _buildDetailRow(
                      icon: Icons.fingerprint,
                      label: 'Farm ID',
                      value: farm.id,
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.person_outline,
                      label: 'Farmer ID',
                      value: farm.farmerId,
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

  // ============================================================
  // OVERVIEW CARD
  // ============================================================

  Widget _buildOverviewCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(13),

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),

      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: ShreeAnnaTheme.primaryGreen),

          const SizedBox(height: 9),

          Text(
            label,
            style: const TextStyle(fontSize: 9, color: Color(0xFF7A817A)),
          ),

          const SizedBox(height: 3),

          Text(
            value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Color(0xFF303530),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // DETAIL ROW
  // ============================================================

  Widget _buildDetailRow({
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

  // =====================================================y=======
  // DIVIDER
  // ============================================================

  Widget _buildDivider() {
    return const Divider(height: 1, color: Color(0xFFE3E7E3));
  }
}
