import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../widgets/overview_card.dart';

class FarmScreen extends StatelessWidget {
  const FarmScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ==================================================
              // TITLE
              // ==================================================

              const Text(
                'My Farm',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 5),

              const Text(
                'View and manage your registered farm information.',
                style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
              ),

              const SizedBox(height: 20),

              // ==================================================
              // FARM HEADER CARD
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

                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Green Hill Farm',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),

                          SizedBox(height: 5),

                          Text(
                            'Registered Farm',
                            style: TextStyle(
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
                      child: const Text(
                        'ACTIVE',
                        style: TextStyle(
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

              OverviewCard(
                title: 'Total Grain',
                value: '250 kg',
                icon: Icons.inventory_2_outlined,
              ),
              const SizedBox(height: 10),


              Row(
                children: [
                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.square_foot,
                      label: 'Total Area',
                      value: '5.5 Acres',
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.grass,
                      label: 'Cultivated',
                      value: '4.2 Acres',
                    ),
                  ),
                ],
              ),

              Row(
                children: [
                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.eco_outlined,
                      label: 'Main Crop',
                      value: 'Millet',
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: _buildOverviewCard(
                      icon: Icons.calendar_month_outlined,
                      label: 'Farm Since',
                      value: '2021',
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 22),

              // ==================================================
              // LOCATION
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
                      icon: Icons.location_on_outlined,
                      label: 'Address',
                      value: '123 Farm Lane',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.home_work_outlined,
                      label: 'Village',
                      value: 'Oakridge',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.map_outlined,
                      label: 'District',
                      value: 'Central County',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.public,
                      label: 'State',
                      value: 'Gujarat',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // FARM CHARACTERISTICS
              // ==================================================
              const Text(
                'Farm Characteristics',
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
                      icon: Icons.layers_outlined,
                      label: 'Soil Type',
                      value: 'Black Soil',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.water_drop_outlined,
                      label: 'Irrigation',
                      value: 'Rainfed',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.grass,
                      label: 'Primary Crop',
                      value: 'Pearl Millet',
                    ),

                    _buildDivider(),

                    _buildDetailRow(
                      icon: Icons.eco_outlined,
                      label: 'Farming Type',
                      value: 'Natural Farming',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // ==================================================
              // UPDATE BUTTON
              // ==================================================
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton.icon(
                  onPressed: () {
                    debugPrint('Update farm pressed');
                  },
                  icon: const Icon(Icons.edit_outlined, size: 17),
                  label: const Text(
                    'Update Farm Information',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ShreeAnnaTheme.primaryGreen,
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 10),

              // ==================================================
              // FPO
              // ==================================================
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F7ED),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.groups_outlined,
                      color: ShreeAnnaTheme.primaryGreen,
                      size: 20,
                    ),

                    SizedBox(width: 10),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Associated FPO',
                            style: TextStyle(
                              fontSize: 9,
                              color: Color(0xFF707870),
                            ),
                          ),

                          SizedBox(height: 3),

                          Text(
                            'Green Valley Cooperative',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF303530),
                            ),
                          ),
                        ],
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

  // ============================================================
  // DIVIDER
  // ============================================================

  Widget _buildDivider() {
    return const Divider(height: 1, color: Color(0xFFE3E7E3));
  }
}
