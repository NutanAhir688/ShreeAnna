import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../model/farm.dart';
// import 'farm_overview_screen.dart';
import 'manage_farm_screen.dart';
import 'add_farm_screen.dart';
import '../data/farm_api.dart';
import '../../farmers/services/farmer_api.dart';
import 'farm_screen.dart';
import '../../../core/network/api_config.dart';
import '../../../core/network/api_client.dart';

class FarmManagementScreen extends StatefulWidget {
  const FarmManagementScreen({super.key});

  @override
  State<FarmManagementScreen> createState() => _FarmManagementScreenState();
}

class _FarmManagementScreenState extends State<FarmManagementScreen> {
  final FarmerApi _farmerApi = FarmerApi();
  final FarmApi _farmApi = FarmApi();
  final ApiClient _apiClient = ApiClient();

  late Future<List<Farm>> _farmsFuture;

  Future<List<Farm>> _fetchFarms() async {
    try {
      final farmer = await _farmerApi.getMe();

      debugPrint('Farmer ID: ${farmer.id}');
      debugPrint('Farmer: $farmer');

      final farms = await _farmApi.getMyFarms(farmer.id);

      debugPrint('Farms: $farms');

      return farms;
    } catch (e) {
      debugPrint('Failed to load farms: $e');
      rethrow;
    }
  }

  @override
  void initState() {
    super.initState();
    _farmsFuture = _fetchFarms();
  }

  Future<void> _refreshFarms() async {
    setState(() {
      _farmsFuture = _fetchFarms();
    });

    await _farmsFuture;
  }

  Future<void> deleteFarm(String farmId) async {
    final response = await _apiClient.delete('$ApiConfig/$farmId');

    if (response.statusCode != 204 && response.statusCode != 200) {
      throw Exception(
        'Failed to delete farm: ${response.statusCode} ${response.body}',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,

        automaticallyImplyLeading: false,

        title: Text(
          l10n.appName,
          style: const TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshFarms,
        child: FutureBuilder<List<Farm>>(
          future: _farmsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return _ErrorView(
                message: snapshot.error.toString(),
                onRetry: _refreshFarms,
              );
            }

            final farms = snapshot.data ?? [];

            if (farms.isEmpty) {
              return _EmptyFarmView(
                onAddFarm: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AddFarmScreen()),
                  ).then((_) => _refreshFarms());
                },
              );
            }

            return ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: farms.length,
              itemBuilder: (context, index) {
                return _FarmCard(
                  farm: farms[index],
                  onFarmChanged: _refreshFarms,
                );
              },
            );
          },
        ),
      ),

      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AddFarmScreen()),
          ).then((_) => _refreshFarms());
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

// ============================================================
// FARM CARD
// ============================================================

class _FarmCard extends StatelessWidget {
  final Farm farm;
  final Future<void> Function() onFarmChanged;

  const _FarmCard({required this.farm, required this.onFarmChanged});


  void _openOverview(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FarmScreen(farm: farm, milletType: farm.milletType),
      ),
    );
  }

  void _showFarmSettings(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
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
                  Text(
                    l10n.farmSettings,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
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
                title: l10n.viewLotsFor(farm.farmName),
                subtitle: l10n.viewAllLots,
                onTap: () {
                  Navigator.pop(context);

                  // TODO: Open lots screen
                },
              ),

              _buildFarmAction(
                icon: Icons.assignment_outlined,
                title: l10n.requestInspection,
                subtitle: l10n.scheduleAgronomist,
                onTap: () {
                  Navigator.pop(context);

                  // TODO: Open inspection screen
                },
              ),

              const Divider(),

              _buildFarmAction(
                icon: Icons.archive_outlined,
                title: l10n.deleteFarm,
                subtitle: l10n.removeFromDashboard,
                destructive: true,
                onTap: () {
                  Navigator.pop(context);

                  _showDeleteConfirmation(context);
                },
              ),

              // _buildFarmAction(
              //   icon: Icons.archive_outlined,
              //   title: l10n.archiveFarm,
              //   subtitle: l10n.archiveFarmSubtitle,
              //   destructive: true,
              //   onTap: () {
              //     Navigator.pop(context);

              //     _showArchiveConfirmation(context);
              //   },
              // ),
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
    final FarmApi _farmApi = FarmApi();
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

  void _showArchiveConfirmation(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(l10n.archiveFarmTitle),

          content: Text(l10n.archiveFarmConfirm(farm.farmName)),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text(l10n.cancel),
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
              child: Text(l10n.archive),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(l10n.archiveFarmTitle),

          content: Text(l10n.archiveFarmConfirm(farm.farmName)),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text(l10n.cancel),
            ),

            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                var _farmApi = FarmApi();
                  

                try {
                  await _farmApi.deleteFarm(farm.id);

                  await onFarmChanged();

                  if (!context.mounted) return;

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${farm.farmName} deleted successfully'),
                    ),
                  );
                } catch (e) {
                  if (!context.mounted) return;

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to delete farm: $e')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: Text(l10n.deleteFarm),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      height: 250,

      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),

      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),

        child: Stack(
          children: [
            // ==================================================
            // BACKGROUND IMAGE
            // ==================================================

            Positioned.fill(
              child: farm.imageUrl.isNotEmpty
                  ? Image.network(
                      ApiConfig.resolveImageUrl(farm.imageUrl),
                      fit: BoxFit.cover,

                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: ShreeAnnaTheme.primaryGreen,
                          child: const Icon(
                            Icons.agriculture,
                            color: Colors.white24,
                            size: 100,
                          ),
                        );
                      },
                    )
                  : Container(
                      color: ShreeAnnaTheme.primaryGreen,
                      child: const Icon(
                        Icons.agriculture,
                        color: Colors.white24,
                        size: 100,
                      ),
                    ),
            ),

            // ==================================================
            // DARK OVERLAY
            // ==================================================
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.25),
                      Colors.black.withValues(alpha: 0.65),
                    ],
                  ),
                ),
              ),
            ),

            // ==================================================
            // CONTENT
            // ==================================================
            Padding(
              padding: const EdgeInsets.all(14),

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Farm name + status
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          farm.farmName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),

                      const SizedBox(width: 8),

                      // Status
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 5,
                        ),

                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.90),
                          borderRadius: BorderRadius.circular(12),
                        ),

                        child: Text(
                          farm.status.toUpperCase(),
                          style: TextStyle(
                            color: farm.status.toLowerCase() == 'verified'
                                ? ShreeAnnaTheme.primaryGreen
                                : Colors.orange.shade800,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 4),

                  Text(
                    farm.farmCode,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  const Spacer(),

                  // ==================================================
                  // FARM INFORMATION
                  // ==================================================
                  Container(
                    padding: const EdgeInsets.all(12),

                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(6),
                    ),

                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _InfoItem(
                                label: l10n.area,
                                value: l10n.areaAcres(
                                  farm.areaInAcres.toStringAsFixed(1),
                                ),
                                light: true,
                              ),
                            ),

                            Expanded(
                              child: _InfoItem(
                                label: l10n.soilType,
                                value: farm.soilType,
                                light: true,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),

                        Row(
                          children: [
                            Expanded(
                              child: _InfoItem(
                                label: l10n.district.toUpperCase(),
                                value: farm.district,
                                light: true,
                              ),
                            ),

                            Expanded(
                              child: _InfoItem(
                                label: l10n.village.toUpperCase(),
                                value: farm.village,
                                light: true,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 10),

                  // ==================================================
                  // BUTTONS
                  // ==================================================
                  Row(
                    children: [
                      OutlinedButton(
                        onPressed: () => _openOverview(context),

                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          backgroundColor: ShreeAnnaTheme.primaryGreen
                              .withValues(alpha: 0.85),
                          side: const BorderSide(color: Colors.white),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),

                        child: Text(
                          l10n.viewFarm,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      const SizedBox(width: 8),

                      OutlinedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ManageFarmScreen(
                                farm: farm,
                                farmName: farm.farmName,
                              ),
                            ),
                          );
                        },

                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          backgroundColor: Colors.black.withValues(alpha: 0.35),
                          side: const BorderSide(color: Colors.white70),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),

                        child: Text(
                          l10n.manage,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      const Spacer(),

                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.35),
                          shape: BoxShape.circle,
                        ),

                        child: IconButton(
                          onPressed: () {
                            _showFarmSettings(context);
                          },
                          icon: const Icon(
                            Icons.more_vert,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// ============================================================
// INFO ITEM
// ============================================================

class _InfoItem extends StatelessWidget {
  final String label;
  final String value;
  final bool light;

  const _InfoItem({
    required this.label,
    required this.value,
    this.light = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 8,
            color: light ? Colors.white70 : Colors.grey,
            letterSpacing: 0.5,
          ),
        ),

        const SizedBox(height: 4),

        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: light ? Colors.white : const Color(0xFF303530),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// EMPTY FARM VIEW
// ============================================================

class _EmptyFarmView extends StatelessWidget {
  final VoidCallback onAddFarm;

  const _EmptyFarmView({required this.onAddFarm});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.65,
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.agriculture_outlined,
                  size: 64,
                  color: Colors.grey.shade400,
                ),

                const SizedBox(height: 16),

                Text(
                  l10n.noFarmsFound,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  l10n.addFirstFarm,
                  style: const TextStyle(color: Colors.grey),
                ),

                const SizedBox(height: 20),

                ElevatedButton(onPressed: onAddFarm, child: Text(l10n.addFarm)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// ERROR VIEW
// ============================================================

class _ErrorView extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.65,
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 56, color: Colors.red),

                  const SizedBox(height: 16),

                  Text(
                    l10n.failedToLoadFarms,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.grey),
                  ),

                  const SizedBox(height: 20),

                  ElevatedButton(onPressed: onRetry, child: Text(l10n.retry)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
