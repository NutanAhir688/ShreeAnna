import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/utils/document_downloader.dart';
import '../../../core/utils/pdf_generator.dart';
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
    this.transportCost,
    this.otherAdjustments,
    this.fpoMargin,
  });

  final String? lotId;
  final String? lotNumber;
  final String? milletName;
  final String? farmerName;
  final double? actualQty;
  final double? unitPrice;
  final double? payableAmount;
  final String? warehouseName;
  final double? transportCost;
  final double? otherAdjustments;
  final double? fpoMargin;

  @override
  State<WarehouseReceiptScreen> createState() => _WarehouseReceiptScreenState();
}

class _WarehouseReceiptScreenState extends State<WarehouseReceiptScreen> {
  final LotApi _lotApi = LotApi();
  bool _isLoading = true;
  Map<String, dynamic>? _receiptData;
  Map<String, dynamic>? _settlementData;
  LotModel? _lotDetails;

  @override
  void initState() {
    super.initState();
    _loadReceipt();
  }

  Future<void> _loadReceipt() async {
    final queryId = (widget.lotId != null && widget.lotId!.isNotEmpty)
        ? widget.lotId!
        : (widget.lotNumber != null && widget.lotNumber!.isNotEmpty)
            ? widget.lotNumber!
            : '';

    if (queryId.isEmpty) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      var receipt = await _lotApi.getWarehouseReceipt(queryId);
      if (receipt == null && widget.lotNumber != null && widget.lotNumber!.isNotEmpty && widget.lotNumber != queryId) {
        receipt = await _lotApi.getWarehouseReceipt(widget.lotNumber!);
      }

      LotModel? lot;
      try {
        lot = await _lotApi.getLotById(queryId);
      } catch (_) {
        if (widget.lotId != null && widget.lotId!.isNotEmpty && widget.lotId != queryId) {
          try {
            lot = await _lotApi.getLotById(widget.lotId!);
          } catch (_) {}
        }
      }

      Map<String, dynamic>? settlement;
      try {
        settlement = await _lotApi.getSettlementByLot(queryId);
      } catch (_) {
        if (widget.lotNumber != null && widget.lotNumber!.isNotEmpty && widget.lotNumber != queryId) {
          try {
            settlement = await _lotApi.getSettlementByLot(widget.lotNumber!);
          } catch (_) {}
        }
      }

      setState(() {
        _receiptData = receipt;
        _settlementData = settlement;
        _lotDetails = lot;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _downloadReceipt({
    required String receiptId,
    required String lotNo,
    required String millet,
    required String farmer,
    required String warehouse,
    required double expQty,
    required double actQty,
    required double rate,
    required double totalPayable,
    String? dateReceived,
    double transportCost = 0.0,
    double otherAdjustments = 0.0,
    double fpoMargin = 0.0,
  }) async {
    try {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Generating Warehouse Receipt PDF...'),
          backgroundColor: ShreeAnnaTheme.primaryGreen,
          duration: Duration(seconds: 1),
        ),
      );

      final pdfBytes = await PdfGenerator.generateWarehouseReceiptPdf(
        receiptNum: receiptId,
        lotNum: lotNo,
        milletType: millet,
        farmerName: farmer,
        warehouseName: warehouse,
        expQty: expQty,
        actQty: actQty,
        unitPrice: rate,
        totalPayable: totalPayable,
        dateReceived: dateReceived ?? DateTime.now().toString().split(' ').first,
        transportCost: transportCost,
        otherAdjustments: otherAdjustments,
        fpoMargin: fpoMargin,
      );

      final cleanReceiptId = receiptId.replaceAll('/', '_').replaceAll('\\', '_');
      final filename = '${cleanReceiptId}_Receipt.pdf';
      final savedFile = await DocumentDownloader.downloadBytes(
        filename: filename,
        bytes: pdfBytes,
      );

      if (!mounted) return;

      if (savedFile != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Receipt downloaded: ${savedFile.path}'),
            backgroundColor: ShreeAnnaTheme.primaryGreen,
            duration: const Duration(seconds: 4),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to save receipt PDF to Downloads.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Download failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
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
    final receivedDate = _receiptData?['receivedAt'] != null
        ? _receiptData!['receivedAt'].toString().split('T').first
        : DateTime.now().toString().split(' ').first;

    final expQty = (_receiptData?['expectedQuantityKg'] as num?)?.toDouble() ?? _lotDetails?.estimatedQuantityKg ?? widget.actualQty ?? 580.0;
    final actQty = (_receiptData?['actualReceivedQuantityKg'] as num?)?.toDouble() ?? _lotDetails?.actualQuantityKg ?? widget.actualQty ?? expQty;
    final rate = (_receiptData?['unitPrice'] as num?)?.toDouble() ?? _lotDetails?.offeredPricePerKg ?? widget.unitPrice ?? 35.0;
    final grossAmount = (_settlementData?['grossAmount'] as num?)?.toDouble() ?? (actQty * rate);

    final transportCost = (_receiptData?['logisticsCost'] as num?)?.toDouble() ??
        (_settlementData?['transportCost'] as num?)?.toDouble() ??
        _lotDetails?.logisticsCost ??
        widget.transportCost ??
        0.0;

    final otherAdjustments = (_receiptData?['otherAdjustments'] as num?)?.toDouble() ??
        (_settlementData?['otherCharges'] as num?)?.toDouble() ??
        _lotDetails?.otherAdjustments ??
        widget.otherAdjustments ??
        0.0;

    final fpoMargin = (_receiptData?['fpoMargin'] as num?)?.toDouble() ??
        (_settlementData?['fpoMargin'] as num?)?.toDouble() ??
        widget.fpoMargin ??
        0.0;

    double finalSettlement = (_receiptData?['netPayableAmount'] as num?)?.toDouble() ??
        (_settlementData?['finalAmount'] as num?)?.toDouble() ??
        widget.payableAmount ??
        (grossAmount - transportCost - otherAdjustments);

    if (finalSettlement <= 0 && grossAmount > 0 && transportCost == 0 && otherAdjustments == 0) {
      finalSettlement = grossAmount;
    }

    final isConfirmed = _receiptData != null ||
        _lotDetails?.status == 'STORED' ||
        _lotDetails?.status == 'SETTLED' ||
        _lotDetails?.status == 'PAID' ||
        _lotDetails?.warehouseReceiptStatus == 'CONFIRMED';

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
              )
            : !isConfirmed
            ? SingleChildScrollView(
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
                    const SizedBox(height: 48),
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE0E8DA)),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                color: Color(0xFFFFF8E1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.hourglass_top,
                                size: 40,
                                color: Color(0xFFF57C00),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Receipt Not Generated Yet',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'The produce has arrived at the warehouse, but the warehouse officer has not completed intake weighing and generated the official receipt yet.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: textSecondary,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
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
                          _detailRow('Date Received', receivedDate),
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
                          const Divider(height: 18, color: borderColor),
                          _moneyRow('Procurement Gross Amount', _formatInr(grossAmount)),
                          if (fpoMargin > 0)
                            _moneyRow('FPO Facilitation Fee / Margin', _formatInr(fpoMargin)),
                          if (transportCost > 0 || _settlementData != null)
                            _moneyRow('Transport & Logistics Cost', _formatInr(transportCost)),
                          if (otherAdjustments > 0 || _settlementData != null)
                            _moneyRow('Other Adjustments', _formatInr(otherAdjustments)),
                          const Divider(height: 22, color: borderColor),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Final Settlement Payout',
                                style: TextStyle(color: textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                _formatInr(finalSettlement),
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
                        onPressed: () => _downloadReceipt(
                          receiptId: receiptId,
                          lotNo: lotNo,
                          millet: millet,
                          farmer: farmer,
                          warehouse: warehouse,
                          expQty: expQty,
                          actQty: actQty,
                          rate: rate,
                          totalPayable: finalSettlement,
                          dateReceived: receivedDate,
                          transportCost: transportCost,
                          otherAdjustments: otherAdjustments,
                          fpoMargin: fpoMargin,
                        ),
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

  static String _formatInr(num amount) {
    final intVal = amount.round().toString();
    final formatted = intVal.replaceAllMapped(
      RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'),
      (Match m) => '${m[1]},',
    );
    return '₹$formatted';
  }
}
