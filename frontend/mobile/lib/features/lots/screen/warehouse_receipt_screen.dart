import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../models/lot_model.dart';
import '../services/lot_api.dart';

class WarehouseReceiptScreen extends StatefulWidget {
  const WarehouseReceiptScreen({
    super.key,
    this.lotId,
    this.lotNumber,
    this.milletName,
    this.farmerName,
    this.actualQty,
    this.unitPrice,
    this.payableAmount,
    this.warehouseName,
  });

  final String? lotId;
  final String? lotNumber;
  final String? milletName;
  final String? farmerName;
  final double? actualQty;
  final double? unitPrice;
  final double? payableAmount;
  final String? warehouseName;

  @override
  State<WarehouseReceiptScreen> createState() => _WarehouseReceiptScreenState();
}

class _WarehouseReceiptScreenState extends State<WarehouseReceiptScreen> {
  final LotApi _lotApi = LotApi();
  bool _isLoading = true;
  Map<String, dynamic>? _receiptData;
  LotModel? _lotDetails;

  @override
  void initState() {
    super.initState();
    _loadReceipt();
  }

  Future<void> _loadReceipt() async {
    if (widget.lotId == null || widget.lotId!.isEmpty) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final receipt = await _lotApi.getWarehouseReceipt(widget.lotId!);
      LotModel? lot;
      try {
        lot = await _lotApi.getLotById(widget.lotId!);
      } catch (_) {}

      setState(() {
        _receiptData = receipt;
        _lotDetails = lot;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const textPrimary = Color(0xFF1B261B);
    const textSecondary = Color(0xFF4B564B);
    const borderColor = Color(0xFFE0E8DA);

    final lotNo = _receiptData?['lotId']?.toString() ?? _lotDetails?.lotNumber ?? widget.lotNumber ?? 'LOT-2026-001';
    final receiptId = _receiptData?['receiptNumber']?.toString() ?? 'WR-2026-001';
    final millet = _receiptData?['milletType']?.toString() ?? _lotDetails?.milletType ?? widget.milletName ?? 'Finger Millet';
    final farmer = _receiptData?['farmerName']?.toString() ?? _lotDetails?.farmerName ?? widget.farmerName ?? 'Ramesh Patel';
    final warehouse = _receiptData?['warehouseName']?.toString() ?? widget.warehouseName ?? 'Dahod Central Warehouse';

    final expQty = (_receiptData?['expectedQuantityKg'] as num?)?.toDouble() ?? _lotDetails?.estimatedQuantityKg ?? widget.actualQty ?? 580.0;
    final actQty = (_receiptData?['actualReceivedQuantityKg'] as num?)?.toDouble() ?? _lotDetails?.actualQuantityKg ?? widget.actualQty ?? expQty;
    final rate = (_receiptData?['unitPrice'] as num?)?.toDouble() ?? _lotDetails?.offeredPricePerKg ?? widget.unitPrice ?? 35.0;
    final totalPayable = (_receiptData?['totalPayableAmount'] as num?)?.toDouble() ?? (actQty * rate);

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    InkWell(
                      onTap: () => Navigator.pop(context),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.arrow_back,
                            size: 18,
                            color: ShreeAnnaTheme.primaryGreen,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Back to Lot Details',
                            style: TextStyle(
                              color: ShreeAnnaTheme.primaryGreen,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Procurement Receipt',
                      style: TextStyle(
                        color: textPrimary,
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.6,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Official confirmation of millet receiving into warehouse storage.',
                      style: TextStyle(
                        color: textSecondary,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE9F6EA),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFB3D8B8)),
                      ),
                      child: const Row(
                        children: [
                          CircleAvatar(
                            radius: 10,
                            backgroundColor: ShreeAnnaTheme.primaryGreen,
                            child: Icon(Icons.check, size: 12, color: Colors.white),
                          ),
                          SizedBox(width: 10),
                          Text(
                            'CONFIRMED & STORED',
                            style: TextStyle(
                              color: ShreeAnnaTheme.primaryGreen,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'RECEIPT ID: $receiptId',
                      style: const TextStyle(
                        color: textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 18),

                    _sectionTitle('Delivery Summary'),
                    const SizedBox(height: 12),
                    _panel(
                      child: Column(
                        children: [
                          _detailRow('Lot #', lotNo),
                          _detailRow('Millet Type', millet),
                          _detailRow('Farmer', farmer),
                          _detailRow('Warehouse', warehouse),
                          _detailRow('Date Received', '2026-10-04'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),
                    _sectionTitle('Quantity & Rate Verification'),
                    const SizedBox(height: 12),
                    _panel(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Expected Quantity',
                                style: TextStyle(color: textSecondary, fontSize: 13, fontWeight: FontWeight.w500),
                              ),
                              Text(
                                '${expQty.toStringAsFixed(0)} kg',
                                style: const TextStyle(color: textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const Divider(height: 18, color: borderColor),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Actual Received',
                                style: TextStyle(color: ShreeAnnaTheme.primaryGreen, fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '${actQty.toStringAsFixed(0)} kg',
                                style: const TextStyle(color: ShreeAnnaTheme.primaryGreen, fontSize: 22, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Agreed Rate / kg',
                                style: TextStyle(color: textSecondary, fontSize: 13, fontWeight: FontWeight.w500),
                              ),
                              Text(
                                '₹${rate.toStringAsFixed(0)} / kg',
                                style: const TextStyle(color: textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),
                    _sectionTitle('Final Bill & Payment Summary'),
                    const SizedBox(height: 12),
                    _panel(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _moneyRow('Received Weight', '${actQty.toStringAsFixed(0)} kg'),
                          _moneyRow('Rate / kg', '₹${rate.toStringAsFixed(0)} / kg'),
                          const Divider(height: 22, color: borderColor),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Final Payable Bill',
                                style: TextStyle(color: textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '₹${totalPayable.toStringAsFixed(0)}',
                                style: const TextStyle(color: ShreeAnnaTheme.primaryGreen, fontSize: 24, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Downloading Warehouse Receipt PDF...'),
                              backgroundColor: ShreeAnnaTheme.primaryGreen,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        icon: const Icon(Icons.download_rounded),
                        label: const Text('DOWNLOAD RECEIPT'),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  static Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFF1B261B),
        fontSize: 18,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.4,
      ),
    );
  }

  static Widget _panel({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE0E8DA)),
      ),
      child: child,
    );
  }

  static Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF526052), fontSize: 13, fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: const TextStyle(color: Color(0xFF1B261B), fontSize: 13, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  static Widget _moneyRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF4C544C), fontSize: 14, fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: const TextStyle(color: Color(0xFF1B261B), fontSize: 15, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
