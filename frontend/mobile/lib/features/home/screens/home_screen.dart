import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';

import '../../farm/screen/farm_management_screen.dart';
import '../../farmers/models/farmer.dart';
import '../../farmers/services/farmer_api.dart';
import '../../lots/models/lot_model.dart';
import '../../lots/screen/lot_details_screen.dart';
import '../../lots/screen/my_lots_screen.dart';
import '../../lots/screen/sell_millet_screen.dart';
import '../../lots/services/lot_api.dart';
import '../../profile/screen/profile_screen.dart';
import '../../support/screen/support_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final FarmerApi _farmerApi = FarmerApi();
  final LotApi _lotApi = LotApi();

  Farmer? _farmer;
  List<LotModel> _lots = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final farmer = await _farmerApi.getMe();
      List<LotModel> lots = [];
      try {
        lots = await _lotApi.getMyLots(farmer.id);
      } catch (e) {
        debugPrint('Could not load lots for home dashboard: $e');
      }

      if (mounted) {
        setState(() {
          _farmer = farmer;
          _lots = lots;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load dashboard farmer profile: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onNavigationItemSelected(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return const Color(0xFFE97900);
      case 'QUALITY_INSPECTION':
      case 'INSPECTION IN PROGRESS':
      case 'PICKUP_SCHEDULED':
        return const Color(0xFF1265C0);
      case 'QUALITY_CERTIFIED':
      case 'CERTIFIED':
      case 'PAYMENT_COMPLETED':
      case 'DELIVERY_COMPLETED':
        return const Color(0xFF087F23);
      case 'AGREEMENT_REJECTED':
      case 'CANCELLED':
        return Colors.red;
      default:
        return const Color(0xFFE97900);
    }
  }

  Color _getStatusBg(String status) {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return const Color(0xFFFFE9D0);
      case 'QUALITY_INSPECTION':
      case 'INSPECTION IN PROGRESS':
      case 'PICKUP_SCHEDULED':
        return const Color(0xFFDCEBFA);
      case 'QUALITY_CERTIFIED':
      case 'CERTIFIED':
      case 'PAYMENT_COMPLETED':
      case 'DELIVERY_COMPLETED':
        return const Color(0xFFDFF3E2);
      case 'AGREEMENT_REJECTED':
      case 'CANCELLED':
        return const Color(0xFFFFEBEE);
      default:
        return const Color(0xFFFFE9D0);
    }
  }

  String _formatStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return 'Submitted';
      case 'QUALITY_INSPECTION':
        return 'Inspection in Progress';
      case 'QUALITY_CERTIFIED':
        return 'Certified';
      case 'AGREEMENT_PENDING':
        return 'Agreement Pending';
      case 'AGREEMENT_ACCEPTED':
        return 'Agreement Accepted';
      case 'AGREEMENT_REJECTED':
        return 'Agreement Rejected';
      case 'PICKUP_SCHEDULED':
        return 'Pickup Scheduled';
      case 'PICKUP_COMPLETED':
        return 'Pickup Completed';
      case 'PAYMENT_COMPLETED':
        return 'Payment Completed';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      body: _getBody(),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _getBody() {
    switch (_selectedIndex) {
      case 0:
        return SafeArea(child: _buildHomeContent());
      case 1:
        return const MyLotsScreen();
      case 2:
        return const FarmManagementScreen();
      case 3:
        return const ProfileScreen();
      default:
        return SafeArea(child: _buildHomeContent());
    }
  }

  Widget _buildHomeContent() {
    final l10n = AppLocalizations.of(context)!;
    final farmerName = _farmer?.fullName ?? 'Farmer';
    final locationText = (_farmer?.village.isNotEmpty == true && _farmer?.district.isNotEmpty == true)
        ? '${_farmer!.village}, ${_farmer!.district}'
        : 'Green Valley Cooperative';

    final recentLotsList = _lots.take(3).toList();

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      color: ShreeAnnaTheme.primaryGreen,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(18, 20, 18, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ------------------------------------------------------
            // HEADER
            // ------------------------------------------------------
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.helloFarmer(farmerName),
                      style: const TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),

                    const SizedBox(height: 5),

                    Text(
                      l10n.currentFpo(locationText),
                      style: const TextStyle(fontSize: 11, color: Color(0xFF596159)),
                    ),
                  ],
                ),

                Row(
                  children: [
                    IconButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const SupportScreen()),
                        );
                      },
                      icon: const Icon(Icons.help_outline, color: ShreeAnnaTheme.primaryGreen),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(
                        Icons.notifications_none,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 18),

            // ------------------------------------------------------
            // SELL MILLET BUTTON
            // ------------------------------------------------------
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SellMilletScreen()),
                  );
                  _loadDashboardData();
                },
                icon: const Icon(Icons.agriculture, size: 19),
                label: Text(
                  l10n.sellMillet,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ShreeAnnaTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  elevation: 1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // ------------------------------------------------------
            // MANAGE FARMS BUTTON & HELP SUPPORT
            // ------------------------------------------------------
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const FarmManagementScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.agriculture_outlined, size: 18),
                      label: Text(
                        l10n.manageFarms,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: ShreeAnnaTheme.primaryGreen,
                        side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SupportScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.help_outline, size: 18),
                      label: Text(
                        l10n.helpSupport,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: ShreeAnnaTheme.primaryGreen,
                        side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // ------------------------------------------------------
            // ACTIVE LOTS SUMMARY
            // ------------------------------------------------------
            _buildActiveLotsCard(),

            const SizedBox(height: 22),

            // ------------------------------------------------------
            // RECENT LOT STATUS
            // ------------------------------------------------------
            Text(
              l10n.recentLotStatus,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Color(0xFF202420),
              ),
            ),

            const SizedBox(height: 10),

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
                ),
              )
            else if (recentLotsList.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: const Center(
                  child: Text(
                    'No recent lot submissions.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF687068)),
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: recentLotsList.length,
                separatorBuilder: (context, index) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final lot = recentLotsList[index];
                  final formattedDate = lot.harvestDate.contains('T')
                      ? lot.harvestDate.split('T').first
                      : lot.harvestDate;
                  final formattedQty = '${lot.estimatedQuantityKg.toStringAsFixed(0)} kg';

                  return _buildLotCard(
                    lotId: lot.id,
                    lotNumber: lot.lotNumber,
                    millet: lot.milletType,
                    status: _formatStatusText(lot.status),
                    statusColor: _getStatusColor(lot.status),
                    statusBackground: _getStatusBg(lot.status),
                    submittedDate: formattedDate,
                    quantity: formattedQty,
                    farmName: lot.farmName,
                    action: _formatStatusText(lot.status),
                  );
                },
              ),

            const SizedBox(height: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveLotsCard() {
    final l10n = AppLocalizations.of(context)!;
    final activeCount = _lots.where((l) => l.status.toUpperCase() != 'CANCELLED').length;
    final pendingCount = _lots.where((l) =>
      l.status.toUpperCase() == 'SUBMITTED' ||
      l.status.toUpperCase() == 'QUALITY_INSPECTION' ||
      l.status.toUpperCase() == 'AGREEMENT_PENDING'
    ).length;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F7ED),
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.activeLots,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
                ),

                const SizedBox(height: 6),

                Text(
                  l10n.lotsCount(activeCount),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF202420),
                  ),
                ),

                const SizedBox(height: 5),

                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen,
                        shape: BoxShape.circle,
                      ),
                    ),

                    const SizedBox(width: 6),

                    Text(
                      l10n.pendingAction(pendingCount),
                      style: const TextStyle(
                        fontSize: 11,
                        color: ShreeAnnaTheme.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: ShreeAnnaTheme.primaryGreen,
              borderRadius: BorderRadius.circular(5),
            ),
            child: const Icon(
              Icons.inventory_2_outlined,
              color: Colors.white,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLotCard({
    required String lotId,
    required String lotNumber,
    required String millet,
    required String status,
    required Color statusColor,
    required Color statusBackground,
    required String submittedDate,
    required String quantity,
    required String farmName,
    required String action,
  }) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lot #$lotNumber',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF596159),
                ),
              ),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBackground,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          Text(
            millet,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF202420),
            ),
          ),

          const SizedBox(height: 6),

          Text(
            'Submitted: $submittedDate',
            style: const TextStyle(fontSize: 10, color: Color(0xFF707870)),
          ),

          const SizedBox(height: 8),

          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
              ),

              const SizedBox(width: 6),

              Expanded(
                child: Text(
                  action,
                  style: TextStyle(
                    fontSize: 10,
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          SizedBox(
            width: double.infinity,
            height: 34,
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => LotDetailsScreen(
                      lotId: lotId,
                      lotNumber: lotNumber,
                      milletName: millet,
                      quantity: quantity,
                      submissionDate: submittedDate,
                      status: status,
                      farmName: farmName,
                    ),
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
              child: Text(
                l10n.viewDetails,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigationBar() {
    final l10n = AppLocalizations.of(context)!;
    return NavigationBar(
      selectedIndex: _selectedIndex,
      onDestinationSelected: _onNavigationItemSelected,

      backgroundColor: Colors.white,

      indicatorColor: const Color(0xFFDDEED9),

      height: 65,

      destinations: [
        NavigationDestination(
          icon: const Icon(Icons.home_outlined),
          selectedIcon: const Icon(Icons.home),
          label: l10n.home,
        ),

        NavigationDestination(
          icon: const Icon(Icons.inventory_2_outlined),
          selectedIcon: const Icon(Icons.inventory_2),
          label: l10n.myLots,
        ),

        NavigationDestination(
          icon: const Icon(Icons.agriculture_outlined),
          selectedIcon: const Icon(Icons.agriculture),
          label: l10n.farm,
        ),

        NavigationDestination(
          icon: const Icon(Icons.person_outline),
          selectedIcon: const Icon(Icons.person),
          label: l10n.profile,
        ),
      ],
    );
  }
}
