import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

import '../../../app/theme.dart';
import '../../../core/network/api_config.dart';
import '../../../core/utils/document_downloader.dart';
import '../../../core/utils/pdf_generator.dart';
import '../models/lot_model.dart';

class PaymentStatusScreen extends StatefulWidget {
  final LotModel? lot;
  final String? lotId;
  final String? lotNumber;
  final String? milletName;

  const PaymentStatusScreen({
    super.key,
    this.lot,
    this.lotId,
    this.lotNumber,
    this.milletName,
  });

  @override
  State<PaymentStatusScreen> createState() => _PaymentStatusScreenState();
}

class _PaymentStatusScreenState extends State<PaymentStatusScreen> {
  Map<String, dynamic>? _settlement;
  bool _isLoading = true;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _fetchSettlement();
  }

  Future<void> _fetchSettlement() async {
    try {
      final res = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/settlements'));
      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        final targetLotNum = (widget.lot?.lotNumber ?? widget.lotNumber ?? '').trim().toUpperCase();
        final targetLotId = (widget.lot?.id ?? widget.lotId ?? '').trim().toLowerCase();

        Map<String, dynamic>? match;
        for (final item in data) {
          final sLotId = (item['lotId'] ?? '').toString().trim().toLowerCase();
          final sLotNum = (item['lotId'] ?? '').toString().trim().toUpperCase();
          final sCode = (item['settlementCode'] ?? '').toString().trim().toUpperCase();
          final sOrder = (item['orderId'] ?? '').toString().trim().toUpperCase();

          if ((targetLotId.isNotEmpty && (sLotId == targetLotId || sLotId.contains(targetLotId))) ||
              (targetLotNum.isNotEmpty &&
                  (sLotNum == targetLotNum ||
                      sCode.contains(targetLotNum) ||
                      sOrder.contains(targetLotNum)))) {
            match = item as Map<String, dynamic>;
            break;
          }
        }

        if (match != null) {
          setState(() {
            _settlement = match;
            _isLoading = false;
          });
          return;
        }
      }
    } catch (e) {
      debugPrint('Error fetching settlement: $e');
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadBill({
    required String settlementCode,
    required String orderId,
    required String lotNumber,
    required String milletType,
    required String farmerName,
    required String buyerOrg,
    required double quantity,
    required double pricePerKg,
    required double grossAmount,
    required double fpoMargin,
    required double transportCost,
    required double otherCharges,
    required double finalPayout,
    required String status,
    required String paymentMethod,
    required String transactionId,
    required String paymentDate,
  }) async {
    final statusUpper = status.toString().trim().toUpperCase();
    final isPaid = statusUpper == 'PAID' ||
        statusUpper == 'SETTLED' ||
        statusUpper == 'COMPLETED' ||
        statusUpper == 'SUCCESS' ||
        statusUpper == 'DISBURSED';
    if (!isPaid) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cannot download bill while settlement payment is pending.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    setState(() => _isDownloading = true);
    try {
      final pdfBytes = await PdfGenerator.generateSettlementBillPdf(
        settlementCode: settlementCode,
        orderId: orderId,
        lotNumber: lotNumber,
        milletType: milletType,
        farmerName: farmerName,
        buyerOrg: buyerOrg,
        quantity: quantity,
        pricePerKg: pricePerKg,
        grossAmount: grossAmount,
        fpoMargin: fpoMargin,
        transportCost: transportCost,
        otherCharges: otherCharges,
        finalPayout: finalPayout,
        status: status,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paymentDate: paymentDate,
      );

      final cleanCode = settlementCode.replaceAll(RegExp(r'[^a-zA-Z0-9_\-]'), '_');
      final fileName = 'Bill_$cleanCode.pdf';
      final file = await DocumentDownloader.downloadBytes(
        filename: fileName,
        bytes: pdfBytes,
      );

      if (mounted) {
        if (file != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text('Settlement Bill saved to Downloads (${file.path.split('/').last})'),
                  ),
                ],
              ),
              backgroundColor: const Color(0xFF2E7D32),
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 4),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to save settlement bill PDF.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error generating bill: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isDownloading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final lot = widget.lot;
    final lotNum = lot?.lotNumber ?? widget.lotNumber ?? '8268-E';
    final millet = _settlement?['millet'] ?? lot?.milletType ?? widget.milletName ?? 'Millet';
    final farmerName = _settlement?['farmerName'] ?? lot?.farmerName ?? 'Registered Farmer';
    final orderId = _settlement?['orderId'] ?? 'ORD-$lotNum';
    final settlementCode = _settlement?['settlementCode'] ?? 'SET-$lotNum';
    final buyerOrg = _settlement?['buyer'] ?? 'Anand Agri Producers FPO';

    final quantity = (_settlement?['quantity'] as num?)?.toDouble() ??
        lot?.actualQuantityKg ??
        lot?.agreedQuantityKg ??
        lot?.estimatedQuantityKg ??
        0.0;
    final rate = (_settlement?['pricePerKg'] as num?)?.toDouble() ??
        lot?.offeredPricePerKg ??
        0.0;
    final gross = (_settlement?['grossAmount'] as num?)?.toDouble() ?? (quantity * rate);
    final fpoMargin = (_settlement?['fpoMargin'] as num?)?.toDouble() ?? (gross * 0.05);
    final transport = (_settlement?['transportCost'] as num?)?.toDouble() ??
        lot?.logisticsCost ??
        1000.0;
    final otherCharges = (_settlement?['otherCharges'] as num?)?.toDouble() ??
        lot?.otherAdjustments ??
        0.0;
    final finalAmount = (_settlement?['finalAmount'] as num?)?.toDouble() ??
        (gross > 0 ? (gross - fpoMargin - transport - otherCharges) : 0.0);

    final rawStatus = (_settlement?['status'] ??
            (lot?.status.toUpperCase() == 'SETTLED' ? 'Paid' : 'Pending Settlement'))
        .toString()
        .trim();
    final status = rawStatus;
    final statusUpper = status.toUpperCase();
    final isPaid = statusUpper == 'PAID' ||
        statusUpper == 'SETTLED' ||
        statusUpper == 'COMPLETED' ||
        statusUpper == 'SUCCESS' ||
        statusUpper == 'DISBURSED';

    final paymentMethod = _settlement?['paymentMethod']?.toString() ??
        (isPaid ? 'Direct Bank Transfer (DBT)' : 'Direct Bank Transfer (Pending)');
    final txnId = _settlement?['transactionId']?.toString() ??
        _settlement?['razorpayPaymentLinkId']?.toString() ??
        (isPaid ? 'TXN-$lotNum' : 'Pending Settlement');
    final paymentDate = _settlement?['paymentDate']?.toString() ??
        (isPaid ? DateTime.now().toString().substring(0, 16) : 'Pending Disbursement');
    final shortUrl = _settlement?['razorpayShortUrl'] as String?;

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),
        title: const Text(
          'Settlement Payout Details',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (isPaid)
            IconButton(
              tooltip: 'Download Bill',
              icon: _isDownloading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen, strokeWidth: 2),
                    )
                  : const Icon(Icons.download, color: ShreeAnnaTheme.primaryGreen),
              onPressed: _isDownloading
                  ? null
                  : () => _downloadBill(
                        settlementCode: settlementCode,
                        orderId: orderId,
                        lotNumber: lotNum,
                        milletType: millet,
                        farmerName: farmerName,
                        buyerOrg: buyerOrg,
                        quantity: quantity,
                        pricePerKg: rate,
                        grossAmount: gross,
                        fpoMargin: fpoMargin,
                        transportCost: transport,
                        otherCharges: otherCharges,
                        finalPayout: finalAmount,
                        status: status,
                        paymentMethod: paymentMethod,
                        transactionId: txnId,
                        paymentDate: paymentDate,
                      ),
            ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Status Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isPaid ? const Color(0xFFE8F5E9) : const Color(0xFFFFF8E1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isPaid ? const Color(0xFFA5D6A7) : const Color(0xFFFFE082)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isPaid ? Icons.check_circle : Icons.hourglass_top,
                            color: isPaid ? const Color(0xFF2E7D32) : const Color(0xFFF57C00),
                            size: 36,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  settlementCode,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: isPaid ? const Color(0xFF1B5E20) : const Color(0xFF795548),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  isPaid
                                      ? 'Status: $status • Disbursed via Direct Bank Transfer'
                                      : 'Status: $status • Awaiting Bank Disbursement',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isPaid ? const Color(0xFF388E3C) : const Color(0xFFB78103),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isPaid ? const Color(0xFF2E7D32) : const Color(0xFFE65100),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              status.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Beneficiary & Lot Details Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFD5DFD0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Procurement & Beneficiary',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2E7D32),
                            ),
                          ),
                          const Divider(height: 20),
                          _buildRow('Farmer Beneficiary', farmerName),
                          _buildRow('Order Reference', orderId),
                          _buildRow('Procurement Lot', 'Lot #$lotNum ($millet)'),
                          _buildRow('Buyer Organization', _settlement?['buyerName'] ?? 'Anand Agri Producers FPO'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Financial Calculation Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFD5DFD0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Settlement Calculation',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2E7D32),
                            ),
                          ),
                          const Divider(height: 20),
                          _buildRow(
                            'Procured Quantity',
                            '${quantity.toStringAsFixed(0)} kg @ ₹${rate.toStringAsFixed(2)}/kg',
                          ),
                          _buildRow('Procurement Gross', '₹${gross.toStringAsFixed(2)}'),
                          _buildRow('FPO Facilitation Fee (5%)', '- ₹${fpoMargin.toStringAsFixed(2)}'),
                          _buildRow('Transport & Logistics', '- ₹${transport.toStringAsFixed(2)}'),
                          if (otherCharges > 0)
                            _buildRow('Other Adjustments', '- ₹${otherCharges.toStringAsFixed(2)}'),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Final Settlement Payout',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B5E20),
                                ),
                              ),
                              Text(
                                '₹${finalAmount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B5E20),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Payment Gateway Info Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFD5DFD0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Payment & Transaction Info',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2E7D32),
                            ),
                          ),
                          const Divider(height: 20),
                          _buildRow('Payment Gateway / Mode', paymentMethod),
                          _buildRow('Transaction / Payment ID', txnId),
                          _buildRow('Payment Date', paymentDate),
                          if (isPaid && shortUrl != null && shortUrl.isNotEmpty) ...[
                            const SizedBox(height: 10),
                            OutlinedButton.icon(
                              onPressed: () async {
                                final uri = Uri.parse(shortUrl);
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                                }
                              },
                              icon: const Icon(Icons.open_in_new, size: 16),
                              label: const Text('View Payment Receipt'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: ShreeAnnaTheme.primaryGreen,
                                side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    if (isPaid) ...[
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton.icon(
                          onPressed: _isDownloading
                              ? null
                              : () => _downloadBill(
                                    settlementCode: settlementCode,
                                    orderId: orderId,
                                    lotNumber: lotNum,
                                    milletType: millet,
                                    farmerName: farmerName,
                                    buyerOrg: buyerOrg,
                                    quantity: quantity,
                                    pricePerKg: rate,
                                    grossAmount: gross,
                                    fpoMargin: fpoMargin,
                                    transportCost: transport,
                                    otherCharges: otherCharges,
                                    finalPayout: finalAmount,
                                    status: status,
                                    paymentMethod: paymentMethod,
                                    transactionId: txnId,
                                    paymentDate: paymentDate,
                                  ),
                          style: ElevatedButton.styleFrom(
                            foregroundColor: Colors.white,
                            backgroundColor: ShreeAnnaTheme.primaryGreen,
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          icon: _isDownloading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.download, size: 20),
                          label: Text(
                            _isDownloading ? 'Generating Bill...' : 'Download Bill',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ] else ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF8E1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFFFE082)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.info_outline, color: Color(0xFFB78103), size: 20),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Settlement bill and payment receipt will be available for download once payment is settled by the FPO.',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF5D4037),
                                  fontWeight: FontWeight.w500,
                                  height: 1.35,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 12),

                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: ShreeAnnaTheme.primaryGreen,
                          side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'Back to Lot Journey',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF666666)),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF222222),
            ),
          ),
        ],
      ),
    );
  }
}
