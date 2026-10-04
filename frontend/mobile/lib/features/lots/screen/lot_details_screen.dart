import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../models/lot_model.dart';
import '../services/lot_api.dart';
import 'payment_status_screen.dart';
import 'pickup_delivery_screen.dart';
import 'procurement_agreement_screen.dart';
import 'quality_certificate_screen.dart';
import 'quality_results_screen.dart';
import 'warehouse_receipt_screen.dart';

class LotDetailsScreen extends StatefulWidget {
  const LotDetailsScreen({
    super.key,
    this.lotId,
    required this.lotNumber,
    required this.milletName,
    required this.quantity,
    required this.submissionDate,
    required this.status,
    this.farmName,
  });

  final String? lotId;
  final String lotNumber;
  final String milletName;
  final String quantity;
  final String submissionDate;
  final String status;
  final String? farmName;

  @override
  State<LotDetailsScreen> createState() => _LotDetailsScreenState();
}

class _LotDetailsScreenState extends State<LotDetailsScreen> {
  final LotApi _lotApi = LotApi();
  bool _isLoadingTimeline = false;
  LotTimelineModel? _timeline;
  LotModel? _lot;
  String? _currentStatus;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.status;
    if (widget.lotId != null && widget.lotId!.isNotEmpty) {
      _loadTimeline();
    }
  }

  Future<void> _loadTimeline() async {
    setState(() {
      _isLoadingTimeline = true;
    });

    try {
      final timeline = await _lotApi.getLotTimeline(widget.lotId!);
      LotModel? lotDetails;
      try {
        lotDetails = await _lotApi.getLotById(widget.lotId!);
      } catch (_) {}

      setState(() {
        _timeline = timeline;
        _lot = lotDetails;
        if (lotDetails != null) {
          _currentStatus = _formatStatusText(lotDetails.status);
        }
        _isLoadingTimeline = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingTimeline = false;
      });
      debugPrint('Error loading lot timeline: $e');
    }
  }

  String _formatStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return 'Submitted';
      case 'QUALITY_INSPECTION':
        return 'Inspection in Progress';
      case 'QUALITY_CERTIFIED':
      case 'QUALITY_PASSED':
      case 'CERTIFIED':
        return 'Certified';
      case 'AGREEMENT_PENDING':
        return 'Agreement Awaiting Approval';
      case 'AGREEMENT_ACCEPTED':
      case 'PROCUREMENT_AGREEMENT':
        return 'Agreement Accepted';
      case 'AGREEMENT_REJECTED':
        return 'Agreement Rejected';
      case 'PICKUP_SCHEDULED':
      case 'PICKUP':
        return 'Pickup Scheduled';
      case 'PICKUP_COMPLETED':
        return 'Pickup Completed';
      case 'PAYMENT_COMPLETED':
      case 'PAYMENT':
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

        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),

        title: Text(
          l10n.lotDetails,
          style: const TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ==================================================
              // LOT HEADER
              // ==================================================
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'LOT #${widget.lotNumber}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF687068),
                      ),
                    ),

                    const SizedBox(height: 7),

                    Text(
                      widget.milletName,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),

                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(child: _buildInfo(l10n.quantity, widget.quantity)),
                        Expanded(
                          child: _buildInfo(l10n.submitted, widget.submissionDate),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCEBFA),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _currentStatus ?? widget.status,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1265C0),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              if (_lot != null &&
                  (_lot!.status == 'AGREEMENT_PENDING' ||
                   _lot!.status == 'AGREEMENT_ACCEPTED' ||
                   _lot!.status == 'AGREEMENT_REJECTED' ||
                   _lot!.status == 'PROCUREMENT_AGREEMENT' ||
                   _lot!.status.toUpperCase().contains('AGREEMENT'))) ...[
                const SizedBox(height: 16),
                _buildAgreementNotificationBanner(_lot!, context),
                const SizedBox(height: 16),
                _buildProcurementOfficerCard(_lot!, context),
              ],

              if (_lot != null &&
                  _lot!.assignedInspectorName != null &&
                  _lot!.assignedInspectorName!.isNotEmpty) ...[
                const SizedBox(height: 18),
                _buildInspectorCard(_lot!, context),
              ],

              const SizedBox(height: 22),

              // ==================================================
              // PROCUREMENT JOURNEY
              // ==================================================
              Text(
                l10n.procurementJourney,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 14),

              if (_isLoadingTimeline)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: CircularProgressIndicator(
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                  ),
                )
              else if (_timeline != null)
                Column(
                  children: _timeline!.steps.asMap().entries.map((entry) {
                    final index = entry.key;
                    final step = entry.value;
                    final statusUpper = (_lot?.status ?? _currentStatus ?? widget.status).toUpperCase();
                    final isDelivered = statusUpper.contains('DELIVER') || statusUpper.contains('COMPLETED') || statusUpper.contains('RECEIVED');
                    final isDispatched = statusUpper.contains('DISPATCH') || statusUpper.contains('TRANSIT') || statusUpper.contains('VEHICLE') || statusUpper.contains('SCHEDULED');
                    final isAgrAccepted = isDispatched || isDelivered || statusUpper.contains('AGREEMENT_ACCEPTED') || statusUpper.contains('ACCEPTED');
                    final isAgrPending = !isAgrAccepted && (statusUpper.contains('AGREEMENT') || statusUpper.contains('FORMULATED'));
                    final isCertified = isAgrAccepted || isAgrPending || statusUpper.contains('CERTIFIED') || statusUpper.contains('PASSED');
                    final isInspected = isCertified || statusUpper.contains('INSPECTION') || statusUpper.contains('INSPECTED');

                    bool isCompleted = false;
                    bool isCurrent = false;

                    if (step.step == 'SUBMITTED') {
                      isCompleted = true;
                      isCurrent = false;
                    } else if (step.step == 'QUALITY_INSPECTION') {
                      isCompleted = isCertified;
                      isCurrent = !isCertified;
                    } else if (step.step == 'QUALITY_CERTIFICATE') {
                      isCompleted = isCertified;
                      isCurrent = false;
                    } else if (step.step == 'PROCUREMENT_AGREEMENT') {
                      isCompleted = isAgrAccepted;
                      isCurrent = !isAgrAccepted && isCertified;
                    } else if (step.step == 'PICKUP') {
                      isCompleted = isDelivered;
                      isCurrent = !isDelivered && isAgrAccepted;
                    } else if (step.step == 'PAYMENT') {
                      isCompleted = isDelivered && (statusUpper.contains('PAYMENT') || statusUpper.contains('COMPLETED'));
                      isCurrent = isDelivered && !isCompleted;
                    } else {
                      isCompleted = step.status == 'COMPLETED';
                      isCurrent = step.status == 'IN_PROGRESS';
                    }

                    final isLast = index == _timeline!.steps.length - 1;

                    return _buildTimelineItemFromModel(
                      step: step,
                      isCompleted: isCompleted,
                      isCurrent: isCurrent,
                      isLast: isLast,
                      context: context,
                      l10n: l10n,
                    );
                  }).toList(),
                )
              else
                Builder(
                  builder: (context) {
                    final statusUpper = (_lot?.status ?? _currentStatus ?? widget.status).toUpperCase();
                    final isDelivered = statusUpper.contains('DELIVER') || statusUpper.contains('COMPLETED') || statusUpper.contains('RECEIVED');
                    final isDispatched = statusUpper.contains('DISPATCH') || statusUpper.contains('TRANSIT') || statusUpper.contains('VEHICLE') || statusUpper.contains('SCHEDULED');
                    final isAgrAccepted = isDispatched || isDelivered || statusUpper.contains('AGREEMENT_ACCEPTED') || statusUpper.contains('ACCEPTED');
                    final isAgrPending = !isAgrAccepted && (statusUpper.contains('AGREEMENT') || statusUpper.contains('FORMULATED'));
                    final isCertified = isAgrAccepted || isAgrPending || statusUpper.contains('CERTIFIED') || statusUpper.contains('PASSED');
                    final isInspected = isCertified || statusUpper.contains('INSPECTION') || statusUpper.contains('INSPECTED');

                    final hasDriver = _lot?.driverName != null && _lot!.driverName!.trim().isNotEmpty;
                    final driverName = _lot?.driverName;
                    final driverPhone = _lot?.driverPhone;
                    final vehicleNo = _lot?.vehicleNumber;
                    final pickupCode = _lot?.verificationCode;

                    return Column(
                      children: [
                        _buildTimelineItem(
                          title: l10n.lotSubmitted,
                          subtitle: l10n.lotSubmittedSubtitle,
                          isCompleted: true,
                          isCurrent: false,
                          isLast: false,
                        ),
                        _buildTimelineItem(
                          title: l10n.qualityInspection,
                          subtitle: isCertified
                              ? 'Quality inspection completed & verified.'
                              : l10n.qualityInspectionSubtitle,
                          isCompleted: isCertified,
                          isCurrent: !isCertified,
                          isLast: false,
                          onTap: (isInspected || isCertified)
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => QualityResultsScreen(lotId: widget.lotId),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: (isInspected || isCertified) ? l10n.viewResults : null,
                          extraContent: (isInspected || isCertified) ? _buildCompactInspectorCard(context) : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.qualityCertificate,
                          subtitle: isCertified ? 'Certificate issued.' : l10n.qualityCertificateSubtitle,
                          isCompleted: isCertified,
                          isCurrent: false,
                          isLast: false,
                          onTap: isCertified
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => QualityCertificateScreen(lotId: widget.lotId),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: isCertified ? l10n.viewCertificate : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.procurementAgreement,
                          subtitle: isAgrAccepted
                              ? 'Agreement accepted & signed.'
                              : (isAgrPending
                                  ? 'Agreement formulated & awaiting acceptance.'
                                  : l10n.procurementAgreementSubtitle),
                          isCompleted: isAgrAccepted,
                          isCurrent: !isAgrAccepted && isCertified,
                          isLast: false,
                          onTap: (isAgrPending || isAgrAccepted)
                              ? () async {
                                  final refreshed = await Navigator.push<bool>(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ProcurementAgreementScreen(lotId: widget.lotId ?? ''),
                                    ),
                                  );
                                  if (refreshed == true) {
                                    _loadTimeline();
                                  }
                                }
                              : null,
                          actionLabel: (isAgrPending || isAgrAccepted) ? l10n.viewAgreement : null,
                          extraContent: (isAgrPending || isAgrAccepted) ? _buildCompactAgreementCard(context) : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.pickupDelivery,
                          subtitle: isDelivered
                              ? 'Pickup Completed & Verified'
                              : (hasDriver
                                  ? 'Driver Assigned & Vehicle En Route (Verification Code: ${pickupCode ?? ""})'
                                  : (isAgrAccepted
                                      ? 'Pickup scheduled. Driver assignment in progress.'
                                      : l10n.pickupDeliverySubtitle)),
                          isCompleted: isDelivered,
                          isCurrent: !isDelivered && isAgrAccepted,
                          isLast: false,
                          onTap: isAgrAccepted
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => PickupDeliveryScreen(
                                        lotId: widget.lotId,
                                        driverName: driverName,
                                        driverPhone: driverPhone,
                                        vehicleNumber: vehicleNo,
                                        verificationCode: pickupCode,
                                        milletName: _lot?.milletType ?? widget.milletName,
                                        quantity: _lot?.agreedQuantityKg != null
                                            ? '${_lot!.agreedQuantityKg!.toStringAsFixed(0)} kg'
                                            : (_lot?.estimatedQuantityKg != null
                                                ? '${_lot!.estimatedQuantityKg!.toStringAsFixed(0)} kg'
                                                : widget.quantity),
                                        farmName: _lot?.farmName ?? 'Registered Farm',
                                        pickupLocation: _lot?.farmName != null ? '${_lot!.farmName}, Dahod' : 'Bordi Farm, Dahod Sector 2',
                                        scheduledDate: _lot?.scheduledInspectionDate != null
                                            ? _lot!.scheduledInspectionDate!.split('T')[0]
                                            : 'Upcoming',
                                        status: _lot?.status ?? 'Scheduled',
                                        transportType: 'FPO Pickup',
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: isAgrAccepted ? l10n.trackDetails : null,
                          extraContent: (isAgrAccepted && hasDriver) ? _buildCompactDriverCard(context) : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.warehouseReceipt,
                          subtitle: isDelivered ? 'Warehouse receipt issued.' : l10n.warehouseReceiptSubtitle,
                          isCompleted: isDelivered,
                          isCurrent: false,
                          isLast: false,
                          onTap: isDelivered
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => WarehouseReceiptScreen(
                                        lotId: widget.lotId ?? widget.lotNumber,
                                        lotNumber: widget.lotNumber,
                                        milletName: _lot?.milletType ?? widget.milletName,
                                        farmerName: _lot?.farmerName ?? 'Ramesh Patel',
                                        actualQty: _lot?.actualQuantityKg,
                                        unitPrice: _lot?.offeredPricePerKg,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: isDelivered ? l10n.viewReceipt : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.payment,
                          subtitle: l10n.paymentSubtitle,
                          isCompleted: statusUpper.contains('PAYMENT') || statusUpper.contains('COMPLETED'),
                          isCurrent: isDelivered && !(statusUpper.contains('PAYMENT') || statusUpper.contains('COMPLETED')),
                          isLast: true,
                          onTap: isDelivered
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => const PaymentStatusScreen(),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: isDelivered ? l10n.viewPayment : null,
                        ),
                      ],
                    );
                  },
                ),

              // ==================================================
              // HARVEST DETAILS
              // ==================================================
              Text(
                l10n.harvestDetails,
                style: const TextStyle(
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
                    _buildDetailRow(l10n.milletType, widget.milletName),
                    _buildDivider(),
                    _buildDetailRow(l10n.estimatedQuantity, widget.quantity),
                    _buildDivider(),
                    _buildDetailRow(l10n.harvestDate, widget.submissionDate),
                    _buildDivider(),
                    _buildDetailRow(l10n.farmLabel, widget.farmName ?? 'Green Hill Farm'),
                    _buildDivider(),
                    _buildDetailRow(l10n.fpo, 'Green Valley Cooperative'),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ==================================================
              // HELP
              // ==================================================
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F7ED),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: ShreeAnnaTheme.primaryGreen,
                      size: 20,
                    ),

                    const SizedBox(width: 10),

                    Expanded(
                      child: Text(
                        l10n.fpoUpdateNote,
                        style: const TextStyle(
                          fontSize: 11,
                          height: 1.4,
                          color: Color(0xFF465046),
                        ),
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

  Widget _buildTimelineItemFromModel({
    required LotTimelineStepModel step,
    required bool isCompleted,
    required bool isCurrent,
    required bool isLast,
    required BuildContext context,
    required AppLocalizations l10n,
  }) {
    final statusUpper = (_lot?.status ?? _currentStatus ?? widget.status).toUpperCase();
    final isStored = statusUpper.contains('STORE') || statusUpper.contains('DELIVER') || statusUpper.contains('COMPLETED') || statusUpper.contains('RECEIVED');
    final isDelivered = isStored || statusUpper.contains('DISPATCH') || statusUpper.contains('TRANSIT') || statusUpper.contains('VEHICLE') || statusUpper.contains('SCHEDULED');
    final isAgrAccepted = isDelivered || statusUpper.contains('AGREEMENT_ACCEPTED') || statusUpper.contains('ACCEPTED');
    final isAgrPending = !isAgrAccepted && (statusUpper.contains('AGREEMENT') || statusUpper.contains('FORMULATED'));
    final isCertified = isAgrAccepted || isAgrPending || statusUpper.contains('CERTIFIED') || statusUpper.contains('PASSED');
    final isInspected = isCertified || statusUpper.contains('INSPECTION') || statusUpper.contains('INSPECTED');

    String title = step.step;
    String subtitle = '';
    VoidCallback? onTap;
    String? actionLabel;

    final bool canInteract = isCompleted || isCurrent;

    switch (step.step) {
      case 'SUBMITTED':
        title = l10n.lotSubmitted;
        subtitle = l10n.lotSubmittedSubtitle;
        break;
      case 'QUALITY_INSPECTION':
        title = l10n.qualityInspection;
        subtitle = l10n.qualityInspectionSubtitle;
        actionLabel = l10n.viewResults;
        onTap = () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QualityResultsScreen(lotId: widget.lotId)),
            );
        break;
      case 'QUALITY_CERTIFICATE':
        title = l10n.qualityCertificate;
        subtitle = l10n.qualityCertificateSubtitle;
        actionLabel = l10n.viewCertificate;
        onTap = () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QualityCertificateScreen(lotId: widget.lotId)),
            );
        break;
      case 'PROCUREMENT_AGREEMENT':
        title = l10n.procurementAgreement;
        subtitle = l10n.procurementAgreementSubtitle;
        actionLabel = l10n.viewAgreement;
        onTap = () async {
          final refreshed = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => ProcurementAgreementScreen(lotId: widget.lotId ?? '')),
          );
          if (refreshed == true) {
            _loadTimeline();
          }
        };
        break;
      case 'PICKUP':
        title = l10n.pickupDelivery;
        final hasDriverStep = _lot?.driverName != null && _lot!.driverName!.trim().isNotEmpty;
        final driverName = _lot?.driverName;
        final driverPhone = _lot?.driverPhone;
        final vehicleNo = _lot?.vehicleNumber;
        final pickupCode = _lot?.verificationCode;

        if (statusUpper.contains('DELIVER') || statusUpper.contains('COMPLETED')) {
          subtitle = 'Pickup Completed & Verified';
        } else if (hasDriverStep) {
          subtitle = 'Driver Assigned & Vehicle En Route (Verification Code: ${pickupCode ?? ""})';
        } else {
          subtitle = 'Pickup scheduled. Driver assignment in progress.';
        }
        actionLabel = l10n.trackDetails;
        onTap = () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => PickupDeliveryScreen(
                  lotId: widget.lotId,
                  driverName: driverName,
                  driverPhone: driverPhone,
                  vehicleNumber: vehicleNo,
                  verificationCode: pickupCode,
                  milletName: _lot?.milletType ?? widget.milletName,
                  quantity: _lot?.agreedQuantityKg != null
                      ? '${_lot!.agreedQuantityKg!.toStringAsFixed(0)} kg'
                      : (_lot?.estimatedQuantityKg != null
                          ? '${_lot!.estimatedQuantityKg!.toStringAsFixed(0)} kg'
                          : widget.quantity),
                  farmName: _lot?.farmName ?? 'Registered Farm',
                  pickupLocation: _lot?.farmName != null ? '${_lot!.farmName}, Dahod' : 'Bordi Farm, Dahod Sector 2',
                  scheduledDate: _lot?.scheduledInspectionDate != null
                      ? _lot!.scheduledInspectionDate!.split('T')[0]
                      : 'Upcoming',
                  status: _lot?.status ?? 'Scheduled',
                  transportType: 'FPO Pickup',
                ),
              ),
            );
        break;
      case 'PAYMENT':
        title = l10n.payment;
        subtitle = l10n.paymentSubtitle;
        actionLabel = l10n.viewPayment;
        onTap = () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PaymentStatusScreen()),
            );
        break;
      case 'WAREHOUSE_RECEIPT':
      case 'WAREHOUSE_RECEIVED':
      case 'STORED':
        title = l10n.warehouseReceipt;
        subtitle = isStored ? 'Millet received & verified at FPO warehouse.' : l10n.warehouseReceiptSubtitle;
        actionLabel = l10n.viewReceipt;
        onTap = () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => WarehouseReceiptScreen(
                  lotId: widget.lotId ?? widget.lotNumber,
                  lotNumber: widget.lotNumber,
                  milletName: _lot?.milletType ?? widget.milletName,
                  farmerName: _lot?.farmerName ?? 'Ramesh Patel',
                  actualQty: _lot?.actualQuantityKg,
                  unitPrice: _lot?.offeredPricePerKg,
                ),
              ),
            );
        break;
    }

    Widget? extraContent;
    final hasDriverCard = _lot?.driverName != null && _lot!.driverName!.trim().isNotEmpty;
    if (step.step == 'QUALITY_INSPECTION' && (isInspected || isCertified)) {
      extraContent = _buildCompactInspectorCard(context);
    } else if (step.step == 'PROCUREMENT_AGREEMENT' && (isAgrPending || isAgrAccepted)) {
      extraContent = _buildCompactAgreementCard(context);
    } else if (step.step == 'PICKUP' && isAgrAccepted && hasDriverCard) {
      extraContent = _buildCompactDriverCard(context);
    } else if ((step.step == 'WAREHOUSE_RECEIPT' || step.step == 'WAREHOUSE_RECEIVED' || step.step == 'STORED') && isStored) {
      extraContent = _buildCompactWarehouseReceiptCard(context);
    }

    return _buildTimelineItem(
      title: title,
      subtitle: subtitle,
      isCompleted: isCompleted,
      isCurrent: isCurrent,
      isLast: isLast,
      onTap: canInteract ? onTap : null,
      actionLabel: canInteract ? actionLabel : null,
      extraContent: extraContent,
    );
  }

  Widget _buildInfo(String label, String value) {
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
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF303530),
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineItem({
    required String title,
    required String subtitle,
    required bool isCompleted,
    required bool isCurrent,
    required bool isLast,
    VoidCallback? onTap,
    String? actionLabel,
    VoidCallback? actionOnTap,
    Widget? extraContent,
  }) {
    final Color circleColor;

    if (isCompleted) {
      circleColor = ShreeAnnaTheme.primaryGreen;
    } else if (isCurrent) {
      circleColor = const Color(0xFFE97900);
    } else {
      circleColor = const Color(0xFFC7CEC7);
    }

    final content = IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 28,
            child: Column(
              children: [
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: circleColor,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isCompleted
                        ? Icons.check
                        : isCurrent
                        ? Icons.circle
                        : Icons.circle_outlined,
                    color: Colors.white,
                    size: isCurrent ? 8 : 13,
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      color: const Color(0xFFD5DDD5),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: isCurrent
                                    ? const Color(0xFFE97900)
                                    : const Color(0xFF303530),
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              subtitle,
                              style: const TextStyle(
                                fontSize: 10,
                                height: 1.35,
                                color: Color(0xFF707870),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (actionLabel != null)
                        Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: ElevatedButton(
                            onPressed: actionOnTap ?? onTap,
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(0, 34),
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                            ),
                            child: Text(actionLabel, style: const TextStyle(fontSize: 12)),
                          ),
                        ),
                    ],
                  ),
                  if (extraContent != null) ...[
                    const SizedBox(height: 12),
                    extraContent,
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );

    if (onTap != null) {
      return InkWell(onTap: onTap, child: content);
    }

    return content;
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 10, color: Color(0xFF7A817A)),
            ),
          ),

          Expanded(
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

  Widget _buildDivider() {
    return const Divider(height: 1, color: Color(0xFFE3E7E3));
  }

  Widget _buildStepBadge(String label, bool isActive, Color activeColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      decoration: BoxDecoration(
        color: isActive ? activeColor.withValues(alpha: 0.12) : const Color(0xFFEFEFEF),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: isActive ? activeColor.withValues(alpha: 0.5) : const Color(0xFFD5D5D5),
          width: isActive ? 1.2 : 0.8,
        ),
      ),
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 9,
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          color: isActive ? activeColor : const Color(0xFF707070),
        ),
      ),
    );
  }


  Widget _buildInspectorCard(LotModel lot, BuildContext context) {
    final trackingStatus = (lot.inspectionTrackingStatus ?? 'ASSIGNED').toUpperCase();

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (trackingStatus) {
      case 'IN_TRANSIT':
        statusColor = const Color(0xFFE97900);
        statusLabel = 'Inspector In Transit 🚗';
        statusIcon = Icons.directions_car;
        break;
      case 'ARRIVED_AT_FARM':
        statusColor = const Color(0xFF2E7D32);
        statusLabel = 'Arrived at Farm 📍';
        statusIcon = Icons.location_on;
        break;
      case 'SAMPLE_COLLECTED':
        statusColor = Colors.purple.shade700;
        statusLabel = 'Sample Collected 🌾';
        statusIcon = Icons.eco;
        break;
      case 'COMPLETED':
        statusColor = ShreeAnnaTheme.primaryGreen;
        statusLabel = 'Inspection Complete ✓';
        statusIcon = Icons.verified;
        break;
      default:
        statusColor = const Color(0xFF1265C0);
        statusLabel = 'Inspector Assigned 📋';
        statusIcon = Icons.assignment_ind;
        break;
    }

    final bool isAssignedStep = true;
    final bool isInTransitStep = trackingStatus == 'IN_TRANSIT' || trackingStatus == 'ARRIVED_AT_FARM' || trackingStatus == 'SAMPLE_COLLECTED' || trackingStatus == 'COMPLETED';
    final bool isArrivedStep = trackingStatus == 'ARRIVED_AT_FARM' || trackingStatus == 'SAMPLE_COLLECTED' || trackingStatus == 'COMPLETED';
    final bool isSampleCollectedStep = trackingStatus == 'SAMPLE_COLLECTED' || trackingStatus == 'COMPLETED';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: statusColor.withValues(alpha: 0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: statusColor.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(statusIcon, color: statusColor, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Quality Inspector Visit Progress',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF687068),
                      ),
                    ),
                    Text(
                      statusLabel,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: _loadTimeline,
                icon: const Icon(Icons.refresh, size: 20, color: Color(0xFF687068)),
                tooltip: 'Refresh Status',
              ),
            ],
          ),

          const SizedBox(height: 12),

          // 4-Step Field Visit Progress Steps
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF6F8F6),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8E2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Inspector Visit Journey:',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF505850)),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildStepBadge('1. Assigned', isAssignedStep, const Color(0xFF1265C0)),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _buildStepBadge('2. In Transit 🚗', isInTransitStep, const Color(0xFFE97900)),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _buildStepBadge('3. Arrived 📍', isArrivedStep, const Color(0xFF2E7D32)),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _buildStepBadge('4. Sample 🌾', isSampleCollectedStep, Colors.purple.shade700),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(height: 24, color: Color(0xFFE8EFE8)),
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: ShreeAnnaTheme.primaryGreen.withOpacity(0.15),
                child: Text(
                  lot.assignedInspectorName!.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: ShreeAnnaTheme.primaryGreen,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lot.assignedInspectorName!,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Mobile: ${lot.assignedInspectorPhone ?? "+91 9876543210"}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF505850),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    _showContactInspectorModal(
                      context,
                      lot.assignedInspectorName!,
                      lot.assignedInspectorPhone ?? "+91 9876543210",
                    );
                  },
                  icon: const Icon(Icons.phone, size: 16),
                  label: const Text('Call Inspector', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    _showContactInspectorModal(
                      context,
                      lot.assignedInspectorName!,
                      lot.assignedInspectorPhone ?? "+91 9876543210",
                    );
                  },
                  icon: const Icon(Icons.chat, size: 16),
                  label: const Text('Chat Support', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF202420),
                    side: const BorderSide(color: Color(0xFFD5DFD0)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProcurementOfficerCard(LotModel lot, BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7F4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.business_center,
                  color: ShreeAnnaTheme.primaryGreen,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Procurement Officer Contact',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      lot.procurementOfficerName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Phone: ${lot.procurementOfficerPhone}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    _showContactInspectorModal(
                      context,
                      lot.procurementOfficerName,
                      lot.procurementOfficerPhone,
                    );
                  },
                  icon: const Icon(Icons.phone, size: 16),
                  label: const Text('Call Officer', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    _showContactInspectorModal(
                      context,
                      lot.procurementOfficerName,
                      lot.procurementOfficerPhone,
                    );
                  },
                  icon: const Icon(Icons.chat, size: 16),
                  label: const Text('Chat Officer', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF202420),
                    side: const BorderSide(color: Color(0xFFD5DFD0)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompactWarehouseReceiptCard(BuildContext context) {
    final qty = _lot?.actualQuantityKg != null
        ? '${_lot!.actualQuantityKg!.toStringAsFixed(0)} kg'
        : widget.quantity;
    final rate = _lot?.offeredPricePerKg != null
        ? '₹${_lot!.offeredPricePerKg!.toStringAsFixed(0)} / kg'
        : '₹35 / kg';
    final totalPayable = _lot?.actualQuantityKg != null && _lot?.offeredPricePerKg != null
        ? '₹${(_lot!.actualQuantityKg! * _lot!.offeredPricePerKg!).toStringAsFixed(0)}'
        : '₹20,300';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8EE),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFB8DCB9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.warehouse, size: 16, color: ShreeAnnaTheme.primaryGreen),
                  SizedBox(width: 6),
                  Text(
                    'RECEIVED & STORED',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                  ),
                ],
              ),
              Text(
                'Bill: $totalPayable',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: ShreeAnnaTheme.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Verified Net Weight: $qty · Rate: $rate',
            style: const TextStyle(fontSize: 11, color: Color(0xFF404840), fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => WarehouseReceiptScreen(
                      lotId: widget.lotId ?? widget.lotNumber,
                      lotNumber: widget.lotNumber,
                      milletName: _lot?.milletType ?? widget.milletName,
                      farmerName: _lot?.farmerName ?? 'Ramesh Patel',
                      actualQty: _lot?.actualQuantityKg,
                      unitPrice: _lot?.offeredPricePerKg,
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.receipt_long, size: 14),
              label: const Text('View Official Receipt & PDF', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: ShreeAnnaTheme.primaryGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 8),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAgreementNotificationBanner(LotModel lot, BuildContext context) {
    final ver = lot.agreementVersion;
    final isRejected = lot.status.contains('REJECTED');
    final isAccepted = lot.status.contains('ACCEPTED') || lot.status.contains('CERTIFIED');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isRejected
            ? const Color(0xFFFDE8E8)
            : isAccepted
                ? const Color(0xFFE8F5E9)
                : const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isRejected
              ? Colors.red.shade300
              : isAccepted
                  ? ShreeAnnaTheme.primaryGreen
                  : Colors.amber.shade400,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
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
                size: 22,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isRejected
                      ? 'Procurement Agreement Rejected ($ver)'
                      : isAccepted
                          ? 'Agreement Executed & Signed ($ver)'
                          : 'New Procurement Agreement Formulated ($ver)',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isRejected
                        ? Colors.red.shade900
                        : isAccepted
                            ? ShreeAnnaTheme.primaryGreen
                            : Colors.amber.shade900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            isRejected
                ? 'You rejected version $ver. You can view the full commercial terms & re-negotiate with the Procurement Officer.'
                : isAccepted
                    ? 'Version $ver contract has been accepted and digitally signed.'
                    : 'FPO Procurement Officer formulated your commercial purchase contract terms ($ver). Review pricing & details.',
            style: TextStyle(
              fontSize: 11,
              color: isRejected
                  ? const Color(0xFF7A1C1C)
                  : isAccepted
                      ? const Color(0xFF1B4D2E)
                      : const Color(0xFF5D4037),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () async {
                final refreshed = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ProcurementAgreementScreen(lotId: widget.lotId ?? ''),
                  ),
                );
                if (refreshed == true) {
                  _loadTimeline();
                }
              },
              icon: const Icon(Icons.description, size: 16),
              label: Text('Review Agreement ($ver)', style: const TextStyle(fontSize: 12)),
              style: ElevatedButton.styleFrom(
                backgroundColor: isRejected
                    ? Colors.red
                    : isAccepted
                        ? ShreeAnnaTheme.primaryGreen
                        : Colors.amber.shade800,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showContactInspectorModal(
    BuildContext context,
    String name,
    String phone,
  ) {
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
                  children: [
                    const Icon(Icons.contact_phone, color: ShreeAnnaTheme.primaryGreen),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Contact Inspector: $name',
                        style: const TextStyle(
                          fontSize: 16,
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
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Phone Number',
                            style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            phone,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF202420),
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.phone_forwarded, color: ShreeAnnaTheme.primaryGreen),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Calling $name at $phone...'),
                              duration: const Duration(seconds: 3),
                            ),
                          );
                          Navigator.pop(ctx);
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                    ),
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCompactDriverCard(BuildContext context) {
    final driverName = _lot?.driverName;
    final driverPhone = _lot?.driverPhone ?? '';
    final vehicleNo = _lot?.vehicleNumber ?? '';
    final pickupCode = _lot?.verificationCode ?? '';

    if (driverName == null || driverName.trim().isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF7),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD0E0CE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.person, color: ShreeAnnaTheme.primaryGreen, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    driverName,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF81C784)),
                ),
                child: const Text(
                  'En Route',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Vehicle: $vehicleNo | $driverPhone',
            style: const TextStyle(fontSize: 11, color: Color(0xFF687068)),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _showContactInspectorModal(context, driverName, driverPhone),
                  icon: const Icon(Icons.phone, size: 14, color: ShreeAnnaTheme.primaryGreen),
                  label: const Text('Call', style: TextStyle(fontSize: 11, color: ShreeAnnaTheme.primaryGreen, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showChatDialog(context, driverName),
                  icon: const Icon(Icons.chat, size: 14, color: Colors.white),
                  label: const Text('Live Chat', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Pickup Code (OTP):',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF556055)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: ShreeAnnaTheme.primaryGreen, width: 1.5),
                ),
                child: Text(
                  pickupCode,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 2, color: ShreeAnnaTheme.primaryGreen),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompactInspectorCard(BuildContext context) {
    const inspectorName = 'Ananya Roy (Quality Inspector)';
    const inspectorPhone = '+91 9876543210';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF7),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD0E0CE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.verified_user, color: ShreeAnnaTheme.primaryGreen, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'Ananya Roy',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF81C784)),
                ),
                child: const Text(
                  'Verified',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Mobile: +91 9876543210 | Grade A Certified',
            style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _showContactInspectorModal(context, 'Ananya Roy', inspectorPhone),
                  icon: const Icon(Icons.phone, size: 14, color: ShreeAnnaTheme.primaryGreen),
                  label: const Text('Call Inspector', style: TextStyle(fontSize: 11, color: ShreeAnnaTheme.primaryGreen, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showChatDialog(context, 'Ananya Roy'),
                  icon: const Icon(Icons.chat, size: 14, color: Colors.white),
                  label: const Text('Chat Support', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompactAgreementCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF7),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD0E0CE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.assignment_turned_in, color: ShreeAnnaTheme.primaryGreen, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'AGR-2026-001',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF81C784)),
                ),
                child: const Text(
                  'Accepted',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Rate: ₹28.50 / kg | Qty: 3,500 kg | Finger Millet',
            style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
          ),
        ],
      ),
    );
  }


  void _showChatDialog(BuildContext context, String driverName) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: Row(
            children: [
              const Icon(Icons.chat, color: ShreeAnnaTheme.primaryGreen),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Chat with $driverName',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F7F4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const CircleAvatar(
                      radius: 14,
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      child: Text('R', style: TextStyle(color: Colors.white, fontSize: 12)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Ravi (Driver)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('Hello! I am on my way to your farm location for pickup.', style: TextStyle(fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  hintText: 'Type your message to driver...',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: ShreeAnnaTheme.primaryGreen),
              onPressed: () {
                if (controller.text.trim().isNotEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Message sent to driver successfully!')),
                  );
                }
                Navigator.pop(ctx);
              },
              child: const Text('Send'),
            ),
          ],
        );
      },
    );
  }
}


