import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/utils/document_downloader.dart';
import '../../../core/utils/pdf_generator.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../models/lot_model.dart';
import '../services/lot_api.dart';
import 'quality_certificate_screen.dart';
import 'reject_agreement_dialog.dart';

class ProcurementAgreementScreen extends StatefulWidget {
  final String lotId;

  const ProcurementAgreementScreen({
    super.key,
    required this.lotId,
  });

  @override
  State<ProcurementAgreementScreen> createState() => _ProcurementAgreementScreenState();
}

class _ProcurementAgreementScreenState extends State<ProcurementAgreementScreen> {
  final LotApi _lotApi = LotApi();

  bool _isLoading = true;
  bool _isProcessing = false;
  String? _error;

  LotModel? _lot;
  Map<String, dynamic>? _cert;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final lot = await _lotApi.getLotById(widget.lotId);
      final cert = await _lotApi.getQualityCertificate(widget.lotId);

      setState(() {
        _lot = lot;
        _cert = cert;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _acceptAgreement() async {
    setState(() {
      _isProcessing = true;
    });

    try {
      await _lotApi.acceptAgreement(widget.lotId);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✓ Agreement accepted successfully!'),
          backgroundColor: ShreeAnnaTheme.primaryGreen,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to accept agreement: ${e.toString().replaceFirst('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _handleRejectClick() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => RejectAgreementDialog(lotId: widget.lotId),
    );

    if (result == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Agreement rejected successfully.'),
          backgroundColor: Colors.orange,
        ),
      );
      Navigator.pop(context, true);
    }
  }

  void _showContactOfficerModal(BuildContext context) {
    const officerName = "Rajesh Sharma (Procurement Officer)";
    const officerPhone = "+91 98765 43210";

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.support_agent, color: ShreeAnnaTheme.primaryGreen, size: 28),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Contact Procurement Support',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4F7F4),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFD5DFD0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Officer Name',
                        style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                      ),
                      Text(
                        officerName,
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Phone Number',
                        style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                      ),
                      Text(
                        officerPhone,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF202420),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Calling Procurement Officer at $officerPhone...')),
                          );
                        },
                        icon: const Icon(Icons.phone, size: 18),
                        label: const Text('Call'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Opening Chat with Procurement Officer...')),
                          );
                        },
                        icon: const Icon(Icons.chat, size: 18),
                        label: const Text('Chat'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: ShreeAnnaTheme.primaryGreen,
                          side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _triggerDownloadAgreement() async {
    final agrCode = _lot?.lotNumber != null ? 'AGR-${_lot!.lotNumber}' : 'AGR-${widget.lotId.substring(0, 6).toUpperCase()}';
    final version = _lot?.agreementVersion ?? 'v1.0';
    final qty = _lot?.agreedQuantityKg ?? _lot?.actualQuantityKg ?? _lot?.estimatedQuantityKg ?? 450.0;
    final unitPrice = _lot?.offeredPricePerKg ?? (_cert != null && _cert!['offeredPricePerKg'] != null ? (_cert!['offeredPricePerKg'] as num).toDouble() : 45.0);
    final subtotal = qty * unitPrice;
    final logisticsCost = _lot?.logisticsCost ?? 500.0;
    final adjustments = _lot?.otherAdjustments ?? 100.0;
    final netPayable = subtotal + logisticsCost + adjustments;
    final farmerName = _lot?.farmerName ?? 'Registered Farmer';
    final farmName = _lot?.farmName ?? 'Member Farm';
    final milletType = _lot?.milletType ?? 'Finger Millet (Ragi)';
    final remarks = _lot?.negotiationRemarks ?? '';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: Row(
          children: const [
            Icon(Icons.picture_as_pdf, color: Colors.red, size: 28),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Download Agreement PDF',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Generating official high-resolution PDF for Procurement Contract $agrCode ($version)...',
              style: const TextStyle(fontSize: 13, color: Color(0xFF505850)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.verified_user, color: ShreeAnnaTheme.primaryGreen, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Includes Digital Signatures & FPO Governance Stamp',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF166534)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: ShreeAnnaTheme.primaryGreen,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final pdfBytes = await PdfGenerator.generateProcurementAgreementPdf(
                agrCode: agrCode,
                version: version,
                farmerName: farmerName,
                farmName: farmName,
                milletType: milletType,
                qty: qty,
                unitPrice: unitPrice,
                logisticsCost: logisticsCost,
                adjustments: adjustments,
                remarks: remarks,
              );

              final savedFile = await DocumentDownloader.downloadBytes(
                filename: 'Procurement_Agreement_${agrCode.replaceAll('-', '_')}.pdf',
                bytes: pdfBytes,
              );

              if (!mounted) return;
              final path = savedFile?.path ?? 'Downloads folder';

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF1B5E20),
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 5),
                  content: Row(
                    children: [
                      const Icon(Icons.picture_as_pdf, color: Colors.white),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Saved official PDF contract to: $path',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
            icon: const Icon(Icons.download, size: 18),
            label: const Text('Save PDF Now'),
          ),
        ],
      ),
    );
  }

  void _showDocumentPreviewModal() {
    final agrCode = _lot?.lotNumber != null ? 'AGR-${_lot!.lotNumber}' : 'AGR-${widget.lotId.substring(0, 6).toUpperCase()}';
    final version = _lot?.agreementVersion ?? 'v1.0';
    final qty = _lot?.agreedQuantityKg ?? _lot?.actualQuantityKg ?? _lot?.estimatedQuantityKg ?? 450.0;
    final unitPrice = _lot?.offeredPricePerKg ?? (_cert != null && _cert!['offeredPricePerKg'] != null ? (_cert!['offeredPricePerKg'] as num).toDouble() : 45.0);
    final subtotal = qty * unitPrice;
    final logisticsCost = _lot?.logisticsCost ?? 500.0;
    final adjustments = _lot?.otherAdjustments ?? 100.0;
    final netPayable = subtotal + logisticsCost + adjustments;
    final farmerName = _lot?.farmerName ?? 'Registered Farmer';
    final farmName = _lot?.farmName ?? 'Member Farm';
    final milletType = _lot?.milletType ?? 'Finger Millet (Ragi)';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.88,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Modal Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.shield_outlined, color: ShreeAnnaTheme.primaryGreen, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Procurement Agreement Contract',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          Text(
                            'Official legal contract under FPO Framework 2026',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.grey),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),

              // Modal Body Content (Scrollable Document)
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Contract Code & Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('CONTRACT CODE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                                Text(
                                  agrCode,
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: ShreeAnnaTheme.primaryGreen, fontFamily: 'monospace'),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: Colors.green.shade300),
                              ),
                              child: Text(
                                'VERSION $version',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ShreeAnnaTheme.primaryGreen),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),
                        const Divider(height: 1),
                        const SizedBox(height: 14),

                        // Parties Card
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: const [
                                    Text('PURCHASER (FPO)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                                    SizedBox(height: 2),
                                    Text('ShreeAnna Farmers Producer Co. Ltd.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                    Text('Regd: Millet Hub Center', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('VENDOR (FARMER)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                                    const SizedBox(height: 2),
                                    Text(farmerName, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                    Text('Farm: $farmName', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 14),

                        // Produce & Pricing Schedule Table
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                color: const Color(0xFFF1F5F9),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: const [
                                    Text('PRODUCE DESCRIPTION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                    Text('GROSS VALUE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(milletType, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                        const SizedBox(height: 2),
                                        Text('$qty kg @ ₹${unitPrice.toStringAsFixed(2)}/kg', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                      ],
                                    ),
                                    Text('₹${subtotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: ShreeAnnaTheme.primaryGreen)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 14),

                        // Financial Schedule Card
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('FINANCIAL BREAKDOWN & LOGISTICS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                              const SizedBox(height: 8),
                              _docBreakdownRow('Gross Produce Value', '₹${subtotal.toStringAsFixed(2)}'),
                              _docBreakdownRow('Transport / Logistics Allowance', '+ ₹${logisticsCost.toStringAsFixed(2)}'),
                              _docBreakdownRow('Bagging & Cleaning Incentive', '+ ₹${adjustments.toStringAsFixed(2)}'),
                              const Divider(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Net Farmer Payable:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                  Text('₹${netPayable.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: ShreeAnnaTheme.primaryGreen)),
                                ],
                              ),
                            ],
                          ),
                        ),

                        if (_lot?.negotiationRemarks != null && _lot!.negotiationRemarks!.trim().isNotEmpty) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF8E1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.amber.shade300),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('NEGOTIATION REMARKS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                                const SizedBox(height: 2),
                                Text('"${_lot!.negotiationRemarks}"', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF78350F))),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 14),

                        // Terms & Governance
                        const Text('TERMS & CONDITIONS:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                        const SizedBox(height: 4),
                        Text(
                          '• Seller agrees to supply clean, quality-tested millets meeting moisture standards.\n'
                          '• Direct bank transfer credited within 48h of warehouse receipt.\n'
                          '• Legally binding under FPO Procurement Governance Framework 2026.',
                          style: TextStyle(fontSize: 10.5, height: 1.4, color: Colors.grey.shade700),
                        ),

                        const SizedBox(height: 18),

                        // Signatures
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Column(
                                  children: const [
                                    Text('ShreeAnna Officer', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                    SizedBox(height: 2),
                                    Text('✓ Digitally Sealed', style: TextStyle(fontSize: 9, color: ShreeAnnaTheme.primaryGreen, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Column(
                                  children: [
                                    Text(farmerName, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                    const SizedBox(height: 2),
                                    const Text('✓ OTP Consent Signed', style: TextStyle(fontSize: 9, color: ShreeAnnaTheme.primaryGreen, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Modal Footer Actions
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _triggerDownloadAgreement();
                        },
                        icon: const Icon(Icons.download, size: 18),
                        label: const Text('Download Agreement PDF', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _docBreakdownRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final status = _lot == null ? 'AGREEMENT_PENDING' : _lot!.status.toUpperCase();
    final isDispatched = status.contains('DISPATCH') || status.contains('TRANSIT') || status.contains('VEHICLE') || status.contains('PICKUP');
    final isDelivered = status.contains('DELIVER') || status.contains('COMPLETED') || status.contains('RECEIVED');
    final isRejected = status.contains('REJECTED');
    final isAccepted = isDispatched || isDelivered || status.contains('ACCEPTED') || status.contains('APPROVED') || status.contains('CERTIFIED');
    final isPending = !isRejected && !isAccepted;

    final version = _lot?.agreementVersion ?? (isRejected ? 'v1.0' : 'v2.0');

    final qty = _lot?.agreedQuantityKg ?? _lot?.actualQuantityKg ?? _lot?.estimatedQuantityKg ?? 450.0;
    final unitPrice = _lot?.offeredPricePerKg ?? (_cert != null && _cert!['offeredPricePerKg'] != null ? (_cert!['offeredPricePerKg'] as num).toDouble() : 45.0);
    final subtotal = qty * unitPrice;
    final logisticsCost = _lot?.logisticsCost ?? 500.0;
    final adjustments = _lot?.otherAdjustments ?? 100.0;
    final netPayable = subtotal + logisticsCost + adjustments;

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.procurementAgreement,
              style: const TextStyle(
                color: ShreeAnnaTheme.primaryGreen,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Contract Document $version',
              style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: _triggerDownloadAgreement,
            icon: const Icon(Icons.download, color: ShreeAnnaTheme.primaryGreen),
            tooltip: 'Download Agreement PDF',
          ),
          IconButton(
            onPressed: _showDocumentPreviewModal,
            icon: const Icon(Icons.article_outlined, color: ShreeAnnaTheme.primaryGreen),
            tooltip: 'View Document Contract',
          ),
          IconButton(
            onPressed: () => _showContactOfficerModal(context),
            icon: const Icon(Icons.chat_bubble_outline, color: ShreeAnnaTheme.primaryGreen),
            tooltip: 'Chat Support',
          ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
              )
            : _error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 48),
                          const SizedBox(height: 12),
                          Text(_error!, style: const TextStyle(color: Colors.red)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadData,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Download Agreement & View Document Quick Action Buttons
                        Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _triggerDownloadAgreement,
                                  icon: const Icon(Icons.download, size: 18),
                                  label: const Text('Download PDF', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    elevation: 1,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: _showDocumentPreviewModal,
                                  icon: const Icon(Icons.article_outlined, size: 18),
                                  label: const Text('View Document', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: ShreeAnnaTheme.primaryGreen,
                                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen, width: 1.5),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Notification Alert Banner
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isRejected
                                ? const Color(0xFFFDE8E8)
                                : isAccepted
                                    ? const Color(0xFFE8F5E9)
                                    : const Color(0xFFFFF8E1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isRejected
                                  ? Colors.red.shade300
                                  : isAccepted
                                      ? ShreeAnnaTheme.primaryGreen
                                      : Colors.amber.shade400,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isRejected
                                    ? Icons.cancel
                                    : isAccepted
                                        ? Icons.check_circle
                                        : Icons.notifications_active,
                                color: isRejected
                                    ? Colors.red
                                    : isAccepted
                                        ? ShreeAnnaTheme.primaryGreen
                                        : Colors.amber.shade900,
                                size: 26,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      isRejected
                                          ? 'Agreement Rejected ($version)'
                                          : isAccepted
                                              ? 'Agreement Executed & Signed ($version)'
                                              : '🔔 Contract Formulated by FPO Officer ($version)',
                                      style: TextStyle(
                                        color: isRejected
                                            ? Colors.red.shade900
                                            : isAccepted
                                                ? ShreeAnnaTheme.primaryGreen
                                                : Colors.amber.shade900,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      isRejected
                                          ? 'You rejected version $version contract. Review contract history below and contact FPO officer to re-negotiate.'
                                          : isAccepted
                                              ? 'Contract version $version has been accepted and digitally signed.'
                                              : 'FPO Procurement Officer generated purchase agreement $version. Review details and provide consent.',
                                      style: TextStyle(
                                        color: isRejected
                                            ? const Color(0xFF7A1C1C)
                                            : isAccepted
                                                ? const Color(0xFF1B4D2E)
                                                : const Color(0xFF5D4037),
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Farmer & Lot Overview Header Card
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
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Lot #${_lot?.lotNumber ?? widget.lotId.substring(0, 6)}',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ShreeAnnaTheme.primaryGreen),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isRejected
                                          ? Colors.red.shade50
                                          : isAccepted
                                              ? Colors.green.shade50
                                              : Colors.amber.shade50,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: isRejected
                                            ? Colors.red
                                            : isAccepted
                                                ? ShreeAnnaTheme.primaryGreen
                                                : Colors.amber,
                                      ),
                                    ),
                                    child: Text(
                                      'VERSION $version - ${isRejected ? "REJECTED" : isAccepted ? "ACCEPTED" : "PENDING CONSENT"}',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: isRejected
                                            ? Colors.red
                                            : isAccepted
                                                ? ShreeAnnaTheme.primaryGreen
                                                : Colors.amber.shade800,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                l10n.procurementAgreement,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 10),
                              _termRow('Farmer Name', _lot?.farmerName ?? 'Registered Farmer'),
                              _termRow('Farm Name', _lot?.farmName ?? 'Member Farm'),
                              _termRow('Millet Produce', _lot?.milletType ?? 'Finger Millet (Ragi)'),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Quality Inspection & Certificate Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFD5DFD0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Quality & Inspection Metrics',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                  ),
                                  InkWell(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => QualityCertificateScreen(lotId: widget.lotId),
                                        ),
                                      );
                                    },
                                    child: Row(
                                      children: const [
                                        Text(
                                          'View Certificate',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: ShreeAnnaTheme.primaryGreen,
                                          ),
                                        ),
                                        SizedBox(width: 4),
                                        Icon(Icons.arrow_forward_ios, size: 11, color: ShreeAnnaTheme.primaryGreen),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              _termRow('Certified Quality Grade', _cert?['grade']?.toString() ?? 'Grade A'),
                              const Divider(),
                              _termRow('Moisture Percentage', '${_cert?['moisturePercentage'] ?? 11}%'),
                              const Divider(),
                              _termRow('Purity / Cleanliness', '${_cert?['purityPercentage'] ?? 99}%'),
                              const Divider(),
                              _termRow('Government MSP Benchmark', '₹38.50 / kg'),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Detailed Commercial Terms Breakdown Card
                        Container(
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
                                'Commercial Financial Breakdown',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              _termRow('Contracted Weight', '$qty kg'),
                              const Divider(),
                              _termRow('Offered Unit Rate', '₹${unitPrice.toStringAsFixed(2)} / kg'),
                              const Divider(),
                              _termRow('Gross Produce Value', '₹${subtotal.toStringAsFixed(2)}'),
                              const Divider(),
                              _termRow('FPO Transport & Logistics Allowance', '+ ₹${logisticsCost.toStringAsFixed(2)}'),
                              const Divider(),
                              _termRow('Cleaning & Bagging Incentive', '+ ₹${adjustments.toStringAsFixed(2)}'),
                              const Divider(thickness: 1.5, color: ShreeAnnaTheme.primaryGreen),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Net Farmer Payable',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF202420),
                                    ),
                                  ),
                                  Text(
                                    '₹${netPayable.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w900,
                                      color: ShreeAnnaTheme.primaryGreen,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        if (_lot?.negotiationRemarks != null && _lot!.negotiationRemarks!.trim().isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF8E1),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.amber.shade300),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(Icons.rate_review, size: 18, color: Colors.amber.shade900),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Negotiation & Commercial Remarks',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.amber.shade900,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  '"${_lot!.negotiationRemarks}"',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontStyle: FontStyle.italic,
                                    color: Colors.brown.shade800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 16),

                        // Contract Version History Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFD5DFD0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: const [
                                  Icon(Icons.history, color: ShreeAnnaTheme.primaryGreen, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Contract Version History',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              ..._buildVersionHistoryList(version, isRejected, isAccepted),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Procurement Contract Lifecycle Journey
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFD5DFD0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: const [
                                  Icon(Icons.timeline, color: ShreeAnnaTheme.primaryGreen, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Procurement Contract Lifecycle',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _lifecycleStep(
                                stepNumber: '1',
                                title: 'Quality Inspection & Grading',
                                subtitle: 'Grade A rating verified by lab inspector.',
                                isCompleted: true,
                              ),
                              _lifecycleStep(
                                stepNumber: '2',
                                title: 'Commercial Terms Formulation ($version)',
                                subtitle: 'Formulated binding terms for Lot #${_lot?.lotNumber ?? widget.lotId.substring(0, 6)}.',
                                isCompleted: true,
                              ),
                              _lifecycleStep(
                                stepNumber: '3',
                                title: 'Farmer Digital Consent & Signature',
                                subtitle: isAccepted
                                    ? 'Accepted & digitally signed by farmer ($version).'
                                    : isRejected
                                        ? 'Agreement Rejected ($version). Re-negotiation requested.'
                                        : 'Awaiting farmer signature & consent ($version).',
                                isCompleted: isAccepted,
                                isRejectedStep: isRejected,
                                isCurrent: isPending,
                              ),
                              _lifecycleStep(
                                stepNumber: '4',
                                title: 'Scheduled Pickup & Logistics',
                                subtitle: isDelivered
                                    ? 'Farmgate pickup & delivery completed.'
                                    : isDispatched
                                        ? 'Logistics vehicle assigned & en route for farmgate pickup (Code: 4829).'
                                        : isAccepted
                                            ? 'Logistics team assigned for farmgate pickup.'
                                            : 'Awaiting agreement execution.',
                                isCompleted: isDelivered,
                                isCurrent: isDispatched || (isAccepted && !isDelivered),
                              ),
                              _lifecycleStep(
                                stepNumber: '5',
                                title: 'Direct Payment Disbursement',
                                subtitle: isDelivered
                                    ? 'Payment processing - funds credited within 48h.'
                                    : 'Funds credited directly to farmer bank account within 48h after pickup.',
                                isCompleted: false,
                                isCurrent: isDelivered,
                                isLast: true,
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Procurement Officer Support Card
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF4F7F4),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFD5DFD0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Procurement Officer Support',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Rajesh Sharma (Procurement Officer) • Phone: +91 98765 43210',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () => _showContactOfficerModal(context),
                                      icon: const Icon(Icons.phone, size: 16),
                                      label: const Text('Call Officer', style: TextStyle(fontSize: 12)),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: ShreeAnnaTheme.primaryGreen,
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => _showContactOfficerModal(context),
                                      icon: const Icon(Icons.chat, size: 16),
                                      label: const Text('Chat Officer', style: TextStyle(fontSize: 12)),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(0xFF202420),
                                        side: const BorderSide(color: Color(0xFFD5DFD0)),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Action Buttons (Only shown if pending)
                        if (isPending)
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _isProcessing ? null : _handleRejectClick,
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.red,
                                    side: const BorderSide(color: Colors.red),
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    child: Text(l10n.rejectAgreement),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: _isProcessing ? null : _acceptAgreement,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                                    foregroundColor: Colors.white,
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    child: _isProcessing
                                        ? const SizedBox(
                                            width: 18,
                                            height: 18,
                                            child: CircularProgressIndicator(
                                              color: Colors.white,
                                              strokeWidth: 2,
                                            ),
                                          )
                                        : Text(l10n.acceptAgreement),
                                  ),
                                ),
                              ),
                            ],
                          ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _termRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF707870), fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  List<Widget> _buildVersionHistoryList(String currentVer, bool isRejected, bool isAccepted) {
    int currentNum = 2;
    try {
      final clean = currentVer.toLowerCase().replaceAll('v', '');
      currentNum = int.parse(clean.split('.')[0]);
    } catch (_) {}

    List<Widget> items = [];
    for (int i = 1; i <= currentNum; i++) {
      final verStr = 'v$i.0';
      final isCurrent = (i == currentNum);
      final isPastRejected = (i < currentNum);
      final itemRejected = isPastRejected || (isCurrent && isRejected);

      String statusText = 'Rejected by Farmer';
      if (isCurrent) {
        statusText = isRejected ? 'Rejected by Farmer' : (isAccepted ? 'Accepted & Signed' : 'Current Active Formulation');
      }

      String desc = isPastRejected
          ? 'Contract version $verStr was rejected during negotiation.'
          : (isCurrent && isRejected)
              ? 'Farmer rejected version $verStr contract.'
              : 'Re-negotiated commercial terms updated with FPO transport allowance and offered rate.';

      if (items.isNotEmpty) {
        items.add(const Divider(height: 20));
      }

      items.add(
        _versionItem(
          ver: verStr,
          statusText: statusText,
          isCurrent: isCurrent,
          isRejected: itemRejected,
          description: desc,
        ),
      );
    }
    return items;
  }

  Widget _versionItem({
    required String ver,
    required String statusText,
    required bool isCurrent,
    required bool isRejected,
    required String description,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: isRejected && isCurrent
                ? Colors.red.shade100
                : isCurrent
                    ? ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.15)
                    : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            ver,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isRejected && isCurrent
                  ? Colors.red
                  : isCurrent
                      ? ShreeAnnaTheme.primaryGreen
                      : Colors.grey.shade700,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    statusText,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isRejected && isCurrent
                          ? Colors.red
                          : isCurrent
                              ? ShreeAnnaTheme.primaryGreen
                              : Colors.grey.shade700,
                    ),
                  ),
                  if (isCurrent)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Active',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _lifecycleStep({
    required String stepNumber,
    required String title,
    required String subtitle,
    bool isCompleted = false,
    bool isRejectedStep = false,
    bool isCurrent = false,
    bool isLast = false,
  }) {
    Color stepColor = Colors.grey.shade400;
    IconData icon = Icons.circle_outlined;

    if (isCompleted) {
      stepColor = ShreeAnnaTheme.primaryGreen;
      icon = Icons.check_circle;
    } else if (isRejectedStep) {
      stepColor = Colors.red;
      icon = Icons.cancel;
    } else if (isCurrent) {
      stepColor = Colors.amber.shade800;
      icon = Icons.play_circle_fill;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Icon(icon, size: 20, color: stepColor),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: isCompleted ? ShreeAnnaTheme.primaryGreen : Colors.grey.shade300,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isRejectedStep
                          ? Colors.red
                          : isCurrent
                              ? Colors.amber.shade900
                              : isCompleted
                                  ? const Color(0xFF202420)
                                  : Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
