import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../model/farm.dart';
import 'farm_overview_screen.dart';
import 'manage_farm_screen.dart';
import 'add_farm_screen.dart';

class FarmManagementScreen extends StatelessWidget {
  const FarmManagementScreen({super.key});

  static const List<Farm> farms = [
    Farm(
      name: 'Green Hill Farm',
      acres: 12,
      status: 'Active',
      soilType: 'Black Soil',
      village: 'Anand',
      district: 'Anand',
      state: 'Gujarat',
      totalGrain: 250,
      cultivatedArea: 4.2,
      mainCrop: 'Millet',
      farmSince: 2021,
      address: '123 Farm Lane',
    ),
    Farm(
      name: 'North Farm',
      acres: 85,
      status: 'Pending Verification',
      soilType: 'Red Soil',
      village: 'XYZ',
      district: 'Anand',
      state: 'Gujarat',
      totalGrain: 0,
      cultivatedArea: 0,
      mainCrop: 'Millet',
      farmSince: 2024,
      address: 'North Farm Road',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'ShreeAnna',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              // Header
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Expanded(
                    child: Text(
                      'Farm\nManagement',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const AddFarmScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text(
                      'ADD NEW\nFARM',
                      textAlign: TextAlign.center,
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), 
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Farm list
              Expanded(
                child: ListView.builder(
                  itemCount: farms.length,
                  itemBuilder: (context, index) {
                    final farm = farms[index];

                    return _FarmCard(farm: farm);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FarmCard extends StatelessWidget {
  final Farm farm;

  const _FarmCard({required this.farm});

  void _openOverview(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => FarmOverviewScreen(farm: farm)),
    );
  }

  void _showFarmSettings(BuildContext context, Farm farm) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          decoration: const BoxDecoration(
            color: Color(0xFFF7FAF1),
            borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag handle
              Container(
                width: 45,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),

              const SizedBox(height: 16),

              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Farm Settings',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),

                  IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),

              _buildFarmAction(
                icon: Icons.analytics_outlined,
                title: 'View Lots for ${farm.name} ',
                subtitle: 'View all lots and their details',
                onTap: () {
                  Navigator.pop(context);

                  // TODO: Open lots screen
                },
              ),

              _buildFarmAction(
                icon: Icons.assignment_outlined,
                title: 'Request Inspection',
                subtitle: 'Schedule an agronomist visit',
                onTap: () {
                  Navigator.pop(context);

                  // TODO: Open inspection screen
                },
              ),

              const Divider(),

              _buildFarmAction(
                icon: Icons.archive_outlined,
                title: 'Delete Farm',
                subtitle: 'Remove from dashboard permanently',
                destructive: true,
                onTap: () {
                  Navigator.pop(context);

                  _showArchiveConfirmation(context, farm);
                },
              ),

              _buildFarmAction(
                icon: Icons.archive_outlined,
                title: 'Archive Farm',
                subtitle: 'Remove from active dashboard',
                destructive: true,
                onTap: () {
                  Navigator.pop(context);

                  _showArchiveConfirmation(context, farm);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFarmAction({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool destructive = false,
  }) {
    final color = destructive ? Colors.red : ShreeAnnaTheme.primaryGreen;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 3),

      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.10),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, color: color),
      ),

      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: destructive ? Colors.red : const Color(0xFF303530),
        ),
      ),

      subtitle: Text(
        subtitle,
        style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
      ),

      trailing: destructive ? null : const Icon(Icons.chevron_right),

      onTap: onTap,
    );
  }

  void _showArchiveConfirmation(BuildContext context, Farm farm) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Archive Farm?'),

          content: Text('Are you sure you want to archive ${farm.name}?'),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);

                // TODO: Archive farm using API
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Archive'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(2),
        side: BorderSide(color: Colors.grey.shade300),
      ),

      child: Padding(
        padding: const EdgeInsets.all(14),

        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Farm name
            Row(
              children: [
                Expanded(
                  child: Text(
                    farm.name,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const Icon(
                  Icons.agriculture,
                  color: ShreeAnnaTheme.primaryGreen,
                ),
              ],
            ),

            const SizedBox(height: 4),

            Text(
              '${farm.acres.toStringAsFixed(0)} Acres • ${farm.status}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),

            const SizedBox(height: 14),

            const Divider(),

            const SizedBox(height: 8),

            // Soil + Village
            Row(
              children: [
                Expanded(
                  child: _InfoItem(label: 'SOIL TYPE', value: farm.soilType),
                ),
                Expanded(
                  child: _InfoItem(label: 'VILLAGE', value: farm.village),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // District + State
            Row(
              children: [
                Expanded(
                  child: _InfoItem(label: 'DISTRICT', value: farm.district),
                ),
                Expanded(
                  child: _InfoItem(label: 'STATE', value: farm.state),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Buttons
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => _openOverview(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ShreeAnnaTheme.primaryGreen,
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  child: const Text(
                    'VIEW FARM',
                    style: TextStyle(fontSize: 11),
                  ),
                ),

                const SizedBox(width: 8),

                OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            ManageFarmScreen(farmName: farm.name),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ShreeAnnaTheme.primaryGreen,
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  child: const Text('MANAGE', style: TextStyle(fontSize: 11)),
                ),

                const Spacer(),

                IconButton(
                  onPressed: () {
                    _showFarmSettings(context, farm);
                  },
                  icon: const Icon(Icons.more_vert),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final String label;
  final String value;

  const _InfoItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            color: Colors.grey,
            letterSpacing: 0.5,
          ),
        ),

        const SizedBox(height: 4),

        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
