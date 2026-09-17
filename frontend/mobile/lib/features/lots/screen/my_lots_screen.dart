import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../farmers/services/farmer_api.dart';
import '../models/lot_model.dart';
import '../services/lot_api.dart';
import 'lot_details_screen.dart';
import 'sell_millet_screen.dart';

class MyLotsScreen extends StatefulWidget {
  const MyLotsScreen({super.key});

  @override
  State<MyLotsScreen> createState() => _MyLotsScreenState();
}

class _MyLotsScreenState extends State<MyLotsScreen> {
  final LotApi _lotApi = LotApi();
  final FarmerApi _farmerApi = FarmerApi();

  bool _isLoading = true;
  String? _errorMessage;
  List<LotModel> _lots = [];

  @override
  void initState() {
    super.initState();
    _loadLots();
  }

  Future<void> _loadLots() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final farmer = await _farmerApi.getMe();
      final lots = await _lotApi.getMyLots(farmer.id);
      setState(() {
        _lots = lots;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
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
        return 'Agreement Awaiting Approval';
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
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

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

      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadLots,
          color: ShreeAnnaTheme.primaryGreen,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 25),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.myLots,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),

                    SizedBox(
                      height: 40,
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const SellMilletScreen(),
                            ),
                          );
                          _loadLots();
                        },
                        icon: const Icon(Icons.add, size: 17),
                        label: Text(
                          l10n.submitNewLot,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 5),

                Text(
                  l10n.manageAndTrackLots,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF687068)),
                ),

                const SizedBox(height: 18),

                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: CircularProgressIndicator(
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),
                  )
                else if (_errorMessage != null)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 30),
                      child: Column(
                        children: [
                          const Icon(Icons.error_outline, size: 40, color: Colors.red),
                          const SizedBox(height: 8),
                          Text(
                            _errorMessage!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.red, fontSize: 13),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: _loadLots,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ShreeAnnaTheme.primaryGreen,
                            ),
                            child: const Text('Retry', style: TextStyle(color: Colors.white)),
                          )
                        ],
                      ),
                    ),
                  )
                else if (_lots.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(Icons.inventory_2_outlined, size: 48, color: Color(0xFF7A817A)),
                          const SizedBox(height: 12),
                          const Text(
                            'No lots submitted yet.',
                            style: TextStyle(fontSize: 14, color: Color(0xFF687068)),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            onPressed: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const SellMilletScreen(),
                                ),
                              );
                              _loadLots();
                            },
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Submit Your First Lot'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ShreeAnnaTheme.primaryGreen,
                              foregroundColor: Colors.white,
                            ),
                          )
                        ],
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _lots.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final lot = _lots[index];
                      return _buildLotCard(
                        context: context,
                        lot: lot,
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLotCard({
    required BuildContext context,
    required LotModel lot,
  }) {
    final statusText = _formatStatusText(lot.status);
    final statusColor = _getStatusColor(lot.status);
    final statusBg = _getStatusBg(lot.status);
    final formattedQty = '${lot.estimatedQuantityKg.toStringAsFixed(0)} kg';
    final formattedDate = lot.harvestDate.contains('T')
        ? lot.harvestDate.split('T').first
        : lot.harvestDate;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  'LOT #${lot.lotNumber}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF687068),
                  ),
                ),
              ),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  statusText,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 7),

          Text(
            lot.milletType,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF202420),
            ),
          ),

          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: _buildDetail(
                  label: AppLocalizations.of(context)!.estimatedQuantity,
                  value: formattedQty,
                ),
              ),

              Expanded(
                child: _buildDetail(
                  label: AppLocalizations.of(context)!.submissionDate,
                  value: formattedDate,
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
                      lotId: lot.id,
                      lotNumber: lot.lotNumber,
                      milletName: lot.milletType,
                      quantity: formattedQty,
                      submissionDate: formattedDate,
                      status: statusText,
                      farmName: lot.farmName,
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
                AppLocalizations.of(context)!.viewDetails,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetail({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 9, color: Color(0xFF7A817A)),
        ),

        const SizedBox(height: 3),

        Text(
          value,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Color(0xFF303530),
          ),
        ),
      ],
    );
  }
}
