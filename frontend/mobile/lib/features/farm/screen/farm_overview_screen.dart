import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../model/farm.dart';

class _FarmHeaderCard extends StatelessWidget {
  final Farm farm;

  const _FarmHeaderCard({required this.farm});

  @override
  Widget build(BuildContext context) {
    return Container(
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
            child: const Icon(Icons.agriculture, color: Colors.white, size: 28),
          ),

          const SizedBox(width: 14),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  farm.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 4),

                const Text(
                  'Registered Farm',
                  style: TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              farm.status.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TotalGrainCard extends StatelessWidget {
  final int totalGrain;

  const _TotalGrainCard({required this.totalGrain});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.inventory_2_outlined,
              color: ShreeAnnaTheme.primaryGreen,
            ),
          ),

          const SizedBox(width: 14),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Total Grain',
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),

              const SizedBox(height: 4),

              Text(
                '$totalGrain kg',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _OverviewCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _OverviewCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 92,
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: ShreeAnnaTheme.primaryGreen),

          const Spacer(),

          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),

          const SizedBox(height: 3),

          Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _LocationCard extends StatelessWidget {
  final Farm farm;

  const _LocationCard({required this.farm});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        children: [
          _LocationRow(
            icon: Icons.location_on_outlined,
            label: 'Address',
            value: farm.address,
          ),

          _LocationRow(
            icon: Icons.location_city_outlined,
            label: 'Village',
            value: farm.village,
          ),

          _LocationRow(
            icon: Icons.map_outlined,
            label: 'District',
            value: farm.district,
          ),

          _LocationRow(icon: Icons.public, label: 'State', value: farm.state),
        ],
      ),
    );
  }
}

class _LocationRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _LocationRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade300)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 19, color: ShreeAnnaTheme.primaryGreen),

          const SizedBox(width: 12),

          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ),

          Text(
            value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class FarmOverviewScreen extends StatelessWidget {
  final Farm farm;

  const FarmOverviewScreen({super.key, required this.farm});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        leading: const BackButton(),
        title: const Text(
          'ShreeAnna',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'My Farm',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 6),

              const Text(
                'View and manage your registered farm information.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),

              const SizedBox(height: 20),

              _FarmHeaderCard(farm: farm),

              const SizedBox(height: 24),

              const Text(
                'Farm Overview',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 12),

              _TotalGrainCard(totalGrain: farm.totalGrain),

              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: _OverviewCard(
                      icon: Icons.straighten,
                      label: 'Total Area',
                      value: '${farm.acres} Acres',
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _OverviewCard(
                      icon: Icons.grass,
                      label: 'Cultivated',
                      value: '${farm.cultivatedArea} Acres',
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 2),

              Row(
                children: [
                  Expanded(
                    child: _OverviewCard(
                      icon: Icons.eco_outlined,
                      label: 'Main Crop',
                      value: farm.mainCrop,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _OverviewCard(
                      icon: Icons.calendar_month,
                      label: 'Farm Since',
                      value: '${farm.farmSince}',
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              const Text(
                'Farm Location',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 12),

              _LocationCard(farm: farm),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
