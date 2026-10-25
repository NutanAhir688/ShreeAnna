import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/network/api_config.dart';
import '../../../core/storage/token_storage.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../models/lot_model.dart';
import '../services/lot_api.dart';
import 'payment_status_screen.dart';
import 'pickup_delivery_screen.dart';
import 'procurement_agreement_screen.dart';
import 'quality_certificate_screen.dart';
import 'quality_results_screen.dart';
import 'warehouse_receipt_screen.dart';
import 'inspector_chat_screen.dart';
import 'driver_chat_screen.dart';

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
    this.warehouseReceiptStatus,
  });

  final String? lotId;
  final String lotNumber;
  final String milletName;
  final String quantity;
  final String submissionDate;
  final String status;
  final String? farmName;
  final String? warehouseReceiptStatus;

  @override
  State<LotDetailsScreen> createState() => _LotDetailsScreenState();
}

class _LotDetailsScreenState extends State<LotDetailsScreen> {
  final LotApi _lotApi = LotApi();
  bool _isLoadingTimeline = false;
  LotTimelineModel? _timeline;
  LotModel? _lot;
  String? _currentStatus;
  Map<String, dynamic>? _dispatchDetails;
  String? _accessToken;

  bool _hasInspectionAssignment() {
    final assignedInspector = _lot?.assignedInspectorName?.trim();
    final trackingStatus = _lot?.inspectionTrackingStatus?.trim();

    return (assignedInspector != null && assignedInspector.isNotEmpty) ||
        (trackingStatus != null && trackingStatus.isNotEmpty);
  }

  bool _hasInspectionStarted() {
    final trackingStatus = _lot?.inspectionTrackingStatus?.toUpperCase();

    return trackingStatus == 'IN_TRANSIT' ||
        trackingStatus == 'ARRIVED_AT_FARM' ||
        trackingStatus == 'SAMPLE_COLLECTED' ||
        trackingStatus == 'COMPLETED';
  }

  bool _hasInspectionCompleted() {
    return _lot?.inspectionTrackingStatus?.toUpperCase() == 'COMPLETED';
  }

  String? _formatInspectionSchedule(String? scheduledInspectionDate) {
    if (scheduledInspectionDate == null || scheduledInspectionDate.isEmpty) {
      return null;
    }

    final parsedDate = DateTime.tryParse(scheduledInspectionDate);
    if (parsedDate == null) {
      return scheduledInspectionDate;
    }

    final localDate = parsedDate.toLocal();
    final hour = localDate.hour % 12 == 0 ? 12 : localDate.hour % 12;
    final minute = localDate.minute.toString().padLeft(2, '0');
    final meridiem = localDate.hour >= 12 ? 'PM' : 'AM';

    return '${localDate.day.toString().padLeft(2, '0')}/${localDate.month.toString().padLeft(2, '0')}/${localDate.year} · $hour:$minute $meridiem';
  }

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
      _accessToken = await TokenStorage().getAccessToken();
      final timeline = await _lotApi.getLotTimeline(widget.lotId!);
      LotModel? lotDetails;
      Map<String, dynamic>? dispatchDetails;

      try {
        lotDetails = await _lotApi.getLotById(widget.lotId!);
      } catch (_) {}

      try {
        dispatchDetails = await _lotApi.getDispatchByLotId(widget.lotId!);
        debugPrint('Dispatch details: $dispatchDetails');
        debugPrint(
          'Receipt status: ${dispatchDetails?['warehouseReceiptStatus']}',
        );
      } catch (e) {
        debugPrint('Failed to load dispatch receipt status: $e');
        debugPrint('Lot ID: ${widget.lotId}');
      }

      setState(() {
        _timeline = timeline;
        _lot = lotDetails;
        _dispatchDetails = dispatchDetails;

        if (lotDetails != null) {
          _currentStatus = _formatStatusText(lotDetails.status, lotDetails.negotiationRemarks);
        }
        _isLoadingTimeline = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingTimeline = false;
      });
      debugPrint('Error loading lot timeline: $e');
      debugPrint('Lot ID: ${widget.lotId}');
    }
  }

  bool _shouldShowAgreementBanner(String status) {
    final value = status.trim().toUpperCase();
    return {
      'AGREEMENT_PENDING',
      'AGREEMENT_PENDING_FARMER',
      'AGREEMENT_PENDING_FPO',
      'AGREEMENT_FORMULATED',
      'PROCUREMENT_AGREEMENT_PENDING',
      'AGREEMENT_ACCEPTED',
      'AGREEMENT_REJECTED',
      'AGREEMENT_REJECTED_BY_FPO',
      'AGREEMENT_REJECTED_BY_FARMER',
      'PICKUP_SCHEDULED',
      'PICKUP_COMPLETED',
      'DELIVERED',
      'DELIVERY_COMPLETED',
      'WAREHOUSE_RECEIVED',
      'WAREHOUSE_RECEIPT',
      'STORED',
      'PAYMENT_PENDING',
      'PAYMENT_COMPLETED',
      'PAYMENT_PAID',
      'PAID',
      'SETTLED',
    }.contains(value) || value.contains('AGREEMENT');
  }

  String _formatStatusText(String status, [String? remarks]) {
    final effectiveRemarks = remarks ?? _lot?.negotiationRemarks ?? '';
    final hasFarmer = effectiveRemarks.contains('FARMER_ACCEPTED');
    final hasFpo = effectiveRemarks.contains('FPO_ACCEPTED');

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
        if (hasFarmer && hasFpo) return 'Agreement Accepted';
        if (hasFarmer) return 'Awaiting FPO Signature';
        if (hasFpo) return 'Awaiting Farmer Signature';
        return 'Agreement Awaiting Approval';
      case 'AGREEMENT_PENDING_FPO':
        if (hasFarmer && hasFpo) return 'Agreement Accepted';
        return 'Awaiting FPO Signature';
      case 'AGREEMENT_PENDING_FARMER':
        if (hasFarmer && hasFpo) return 'Agreement Accepted';
        if (hasFarmer) return 'Awaiting FPO Signature';
        return 'Awaiting Farmer Signature';
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
      case 'DELIVERED':
      case 'DELIVERY_COMPLETED':
        return 'Delivered';
      case 'STORED':
      case 'WAREHOUSE_RECEIVED':
      case 'WAREHOUSE_RECEIPT':
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'Received & Stored in Warehouse';
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
        child: RefreshIndicator(
          color: ShreeAnnaTheme.primaryGreen,
          backgroundColor: Colors.white,
          onRefresh: _loadTimeline,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
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
                        Expanded(
                          child: _buildInfo(l10n.quantity, widget.quantity),
                        ),
                        Expanded(
                          child: _buildInfo(
                            l10n.submitted,
                            widget.submissionDate,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    Builder(
                      builder: (context) {
                        final rawStatus = _lot?.status ?? _currentStatus ?? widget.status;
                        final displayStatus = _formatStatusText(
                          rawStatus,
                          _lot?.negotiationRemarks,
                        );
                        final isAwaitingFpo = displayStatus == 'Awaiting FPO Signature';
                        final isAwaitingFarmer = displayStatus == 'Awaiting Farmer Signature';
                        final isAccepted = displayStatus == 'Agreement Accepted';
                        final isRejected = displayStatus == 'Agreement Rejected';

                        Color bgColor = const Color(0xFFDCEBFA);
                        Color textColor = const Color(0xFF1265C0);

                        if (isAwaitingFpo || isAwaitingFarmer) {
                          bgColor = const Color(0xFFFEF3C7);
                          textColor = const Color(0xFFB45309);
                        } else if (isAccepted) {
                          bgColor = const Color(0xFFDCFCE7);
                          textColor = const Color(0xFF15803D);
                        } else if (isRejected) {
                          bgColor = const Color(0xFFFEE2E2);
                          textColor = const Color(0xFFB91C1C);
                        }

                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: bgColor,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            displayStatus,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // if (_lot != null &&
              //     (_lot!.status == 'AGREEMENT_PENDING' ||
              //         _lot!.status == 'AGREEMENT_ACCEPTED' ||
              //         _lot!.status == 'AGREEMENT_REJECTED' ||
              //         _lot!.status == 'PROCUREMENT_AGREEMENT' ||
              //         _lot!.status.toUpperCase().contains('AGREEMENT'))) ...[
              //   const SizedBox(height: 16),
              //   _buildAgreementNotificationBanner(_lot!, context),
              //   const SizedBox(height: 16),
              //   _buildProcurementOfficerCard(_lot!, context),
              // ],
              if (_lot != null &&
                  _shouldShowAgreementBanner(_lot!.status)) ...[
                const SizedBox(height: 16),
                _buildAgreementNotificationBanner(_lot!, context),
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
                    final statusUpper =
                        (_lot?.status ?? _currentStatus ?? widget.status)
                            .toUpperCase();

                    final hasDriver =
                        (_lot?.driverName != null &&
                            _lot!.driverName!.trim().isNotEmpty) ||
                        (_dispatchDetails?['driverName'] != null &&
                            _dispatchDetails!['driverName']
                                .toString()
                                .trim()
                                .isNotEmpty);

                    final hasInspectorAssignment = _hasInspectionAssignment();
                    final inspectionStarted = _hasInspectionStarted();
                    final inspectionCompleted = _hasInspectionCompleted();
                    final receiptStatus =
                        (_lot?.warehouseReceiptStatus ??
                                _dispatchDetails?['warehouseReceiptStatus'] ??
                                _dispatchDetails?['warehouse_receipt_status'] ??
                                widget.warehouseReceiptStatus ??
                                '')
                            .toString()
                            .trim()
                            .toUpperCase();

                    final isPaymentCompleted = {
                      'PAYMENT_COMPLETED',
                      'PAYMENT_PAID',
                      'PAID',
                      'SETTLED',
                      'COMPLETED',
                    }.contains(statusUpper);

                    // Receipt completion must come from the receipt status or completed payment
                    final isStored = {
                      'CONFIRMED',
                      'RECEIVED',
                      'STORED',
                      'COMPLETED',
                    }.contains(receiptStatus) ||
                    statusUpper == 'STORED' ||
                    isPaymentCompleted;

                    final isDelivered =
                        statusUpper.contains('DELIVERED') ||
                        statusUpper.contains('DELIVERY_COMPLETED') ||
                        statusUpper.contains('PICKUP_COMPLETED') ||
                        isStored;

                    final isDispatched =
                        hasDriver ||
                        isDelivered ||
                        statusUpper.contains('DISPATCH') ||
                        statusUpper.contains('TRANSIT') ||
                        statusUpper.contains('VEHICLE') ||
                        statusUpper.contains('SCHEDULED');

                    final remarks = _lot?.negotiationRemarks ?? '';
                    final hasDualAcceptance = remarks.contains('FARMER_ACCEPTED') && remarks.contains('FPO_ACCEPTED');

                    final isAgrAccepted =
                        isDispatched ||
                        isDelivered ||
                        isStored ||
                        isPaymentCompleted ||
                        statusUpper.contains('AGREEMENT_ACCEPTED') ||
                        statusUpper == 'ACCEPTED' ||
                        statusUpper == 'PROCUREMENT_AGREEMENT' ||
                        hasDualAcceptance;

                    final isAgreementPhase =
                        statusUpper.contains('AGREEMENT') ||
                        _lot?.agreementVersion != null ||
                        isAgrAccepted ||
                        isDispatched ||
                        isDelivered ||
                        isStored ||
                        isPaymentCompleted;

                    // If the lot has progressed to agreement or beyond,
                    // inspection & certification must have been completed
                    final isCertified =
                        inspectionCompleted ||
                        isAgreementPhase ||
                        statusUpper.contains('CERTIFICATE') ||
                        statusUpper.contains('CERTIFIED') ||
                        statusUpper.contains('PASSED') ||
                        statusUpper.contains('APPROVED');

                    bool isCompleted = step.status == 'COMPLETED';
                    bool isCurrent = step.status == 'IN_PROGRESS';

                    if (step.step == 'SUBMITTED') {
                      isCompleted = true;
                      isCurrent = false;
                    } else if (step.step == 'QUALITY_INSPECTION') {
                      isCompleted =
                          isCompleted ||
                          inspectionCompleted ||
                          isCertified ||
                          isPaymentCompleted;
                      isCurrent =
                          !isCompleted &&
                          !isAgreementPhase &&
                          (isCurrent ||
                              hasInspectorAssignment ||
                              inspectionStarted ||
                              statusUpper.contains('INSPECTION') ||
                              statusUpper.contains('QUALITY') ||
                              statusUpper.contains('INSPECTOR'));
                    } else if (step.step == 'QUALITY_CERTIFICATE') {
                      isCompleted = isCompleted || isCertified || isPaymentCompleted;
                      isCurrent =
                          !isCompleted && !isAgreementPhase && (isCurrent || inspectionCompleted);
                    } else if (step.step == 'PROCUREMENT_AGREEMENT') {
                      isCompleted =
                          isCompleted ||
                          isAgrAccepted ||
                          isStored ||
                          isPaymentCompleted;

                      isCurrent =
                          !isCompleted &&
                          (statusUpper.contains('AGREEMENT') ||
                              statusUpper == 'AGREEMENT_FORMULATED' ||
                              _lot?.agreementVersion != null);
                    } else if (step.step == 'PICKUP') {
                      isCompleted = isCompleted || isDelivered || isStored || isPaymentCompleted;
                      isCurrent =
                          !isCompleted &&
                          (isCurrent || isDispatched || isAgrAccepted);
                    } else if (step.step == 'WAREHOUSE_RECEIPT' ||
                        step.step == 'WAREHOUSE_RECEIVED' ||
                        step.step == 'STORED') {
                      isCompleted = isCompleted || isStored || isPaymentCompleted;
                      isCurrent = !isCompleted && !isPaymentCompleted && (isCurrent || isDelivered);
                    } else if (step.step == 'PAYMENT') {
                      isCompleted = isPaymentCompleted;
                      isCurrent = isStored && !isPaymentCompleted;
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
                    final statusUpper =
                        (_lot?.status ?? _currentStatus ?? widget.status)
                            .toUpperCase();
                    debugPrint('Lot status: ${_lot?.status}');
                    debugPrint('Agreement version: ${_lot?.agreementVersion}');
                    final hasDriver =
                        (_lot?.driverName != null &&
                            _lot!.driverName!.trim().isNotEmpty) ||
                        (_dispatchDetails?['driverName'] != null &&
                            _dispatchDetails!['driverName']
                                .toString()
                                .trim()
                                .isNotEmpty);
                    final hasInspectorAssignment = _hasInspectionAssignment();
                    final inspectionStarted = _hasInspectionStarted();
                    final inspectionCompleted = _hasInspectionCompleted();
                    final receiptStatus =
                        (_lot?.warehouseReceiptStatus ??
                                _dispatchDetails?['warehouseReceiptStatus'] ??
                                _dispatchDetails?['warehouse_receipt_status'] ??
                                widget.warehouseReceiptStatus ??
                                '')
                            .toString()
                            .trim()
                            .toUpperCase();

                    final isPaymentCompleted = {
                      'PAYMENT_COMPLETED',
                      'PAYMENT_PAID',
                      'PAID',
                      'SETTLED',
                      'COMPLETED',
                    }.contains(statusUpper);

                    final isStored = {
                      'CONFIRMED',
                      'RECEIVED',
                      'STORED',
                      'COMPLETED',
                    }.contains(receiptStatus) ||
                    statusUpper == 'STORED' ||
                    statusUpper == 'SETTLED' ||
                    statusUpper == 'PAID' ||
                    statusUpper == 'PAYMENT_COMPLETED' ||
                    isPaymentCompleted;

                    final isDelivered =
                        statusUpper.contains('DELIVERED') ||
                        statusUpper.contains('DELIVERY_COMPLETED') ||
                        statusUpper.contains('PICKUP_COMPLETED') ||
                        isStored;
                    final isDispatched =
                        hasDriver ||
                        isDelivered ||
                        statusUpper.contains('DISPATCH') ||
                        statusUpper.contains('TRANSIT') ||
                        statusUpper.contains('VEHICLE') ||
                        statusUpper.contains('SCHEDULED');
                    final isAgrAccepted =
                        statusUpper == 'AGREEMENT_ACCEPTED' ||
                        statusUpper == 'ACCEPTED' ||
                        statusUpper == 'PICKUP_COMPLETED' ||
                        statusUpper == 'DELIVERED' ||
                        statusUpper == 'DELIVERY_COMPLETED' ||
                        statusUpper == 'WAREHOUSE_RECEIVED' ||
                        statusUpper == 'STORED' ||
                        statusUpper == 'SETTLED' ||
                        statusUpper == 'PAID' ||
                        statusUpper == 'PAYMENT_COMPLETED' ||
                        isStored ||
                        isPaymentCompleted ||
                        isDelivered;
                    // Agreement metadata can exist before the agreement stage is active.
                    // Do not show agreement/officer cards merely because version, price,
                    // or quantity fields have already been populated.
                    final isAgrPending =
                        !isAgrAccepted &&
                        (statusUpper == 'AGREEMENT_PENDING' ||
                            statusUpper == 'AGREEMENT_FORMULATED' ||
                            statusUpper == 'PROCUREMENT_AGREEMENT_PENDING');
                    final isCertified =
                        inspectionCompleted ||
                        isAgrAccepted ||
                        isDelivered ||
                        isStored ||
                        isPaymentCompleted ||
                        statusUpper.contains('CERTIFICATE') ||
                        statusUpper.contains('CERTIFIED') ||
                        statusUpper.contains('PASSED') ||
                        statusUpper.contains('APPROVED');

                    final driverName = _lot?.driverName;
                    final driverPhone = _lot?.driverPhone;
                    final vehicleNo = _lot?.vehicleNumber;
                    final pickupCode = _lot?.verificationCode;
                    final agreedQuantityKg = _lot?.agreedQuantityKg;
                    final estimatedQuantityKg = _lot?.estimatedQuantityKg;

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
                          subtitle:
                              (inspectionCompleted || isCertified || isPaymentCompleted)
                              ? 'Quality inspection completed & verified.'
                              : l10n.qualityInspectionSubtitle,
                          isCompleted: isCertified || inspectionCompleted || isPaymentCompleted,
                          isCurrent:
                              !(isCertified || inspectionCompleted || isPaymentCompleted) &&
                              (hasInspectorAssignment ||
                                  inspectionStarted ||
                                  statusUpper.contains('INSPECTION') ||
                                  statusUpper.contains('QUALITY') ||
                                  statusUpper.contains('INSPECTOR')),
                          isLast: false,
                          onTap: (isCertified || inspectionCompleted || isPaymentCompleted)
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => QualityResultsScreen(
                                        lotId: widget.lotId,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: (isCertified || inspectionCompleted || isPaymentCompleted)
                              ? l10n.viewResults
                              : null,
                          extraContent: (!(isCertified || inspectionCompleted || isPaymentCompleted) &&
                                  (hasInspectorAssignment || inspectionStarted))
                              ? _buildInspectorCard(_lot, context)
                              : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.qualityCertificate,
                          subtitle: (isCertified || isPaymentCompleted)
                              ? 'Quality certificate issued & verified.'
                              : l10n.qualityCertificateSubtitle,
                          isCompleted: isCertified || isPaymentCompleted,
                          isCurrent: !(isCertified || isPaymentCompleted) && inspectionCompleted,
                          isLast: false,
                          onTap: (isCertified || isPaymentCompleted)
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => QualityCertificateScreen(
                                        lotId: widget.lotId,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: (isCertified || isPaymentCompleted)
                              ? l10n.viewCertificate
                              : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.procurementAgreement,
                          subtitle:
                              (isAgrAccepted || isPaymentCompleted)
                              ? 'Procurement agreement signed & approved.'
                              : (isAgrPending
                                    ? 'Agreement formulated & awaiting acceptance.'
                                    : l10n.procurementAgreementSubtitle),
                          isCompleted:
                              isAgrAccepted || isPaymentCompleted,
                          isCurrent:
                              !(isAgrAccepted || isPaymentCompleted) &&
                              isAgrPending,
                          isLast: false,
                          onTap:
                              (isAgrPending ||
                                  isAgrAccepted ||
                                  isPaymentCompleted)
                              ? () async {
                                  final refreshed = await Navigator.push<bool>(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) =>
                                          ProcurementAgreementScreen(
                                            lotId: widget.lotId ?? '',
                                          ),
                                    ),
                                  );
                                  if (refreshed == true) {
                                    _loadTimeline();
                                  }
                                }
                              : null,
                          actionLabel:
                              (isAgrPending ||
                                  isAgrAccepted ||
                                  isPaymentCompleted)
                              ? l10n.viewAgreement
                              : null,
                          extraContent:
                              (isAgrPending ||
                                  (isAgrAccepted && !isStored && !isPaymentCompleted))
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildCompactAgreementCard(context),
                                    const SizedBox(height: 10),
                                    _buildProcurementOfficerCard(_lot, context),
                                  ],
                                )
                              : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.pickupDelivery,
                          subtitle: (isDelivered || isStored || isPaymentCompleted)
                              ? 'Pickup completed & delivered to warehouse.'
                              : (hasDriver
                                    ? 'Driver Assigned & Vehicle En Route (Verification Code: ${pickupCode ?? ""})'
                                    : (isAgrAccepted
                                          ? 'Pickup scheduled. Driver assignment in progress.'
                                          : l10n.pickupDeliverySubtitle)),
                          isCompleted: isDelivered || isStored || isPaymentCompleted,
                          isCurrent:
                              !(isDelivered || isStored || isPaymentCompleted) &&
                              (hasDriver || isDispatched || isAgrAccepted),
                          isLast: false,
                          onTap:
                              (isAgrAccepted ||
                                  isDispatched ||
                                  isDelivered ||
                                  isStored ||
                                  isPaymentCompleted)
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
                                        milletName:
                                            _lot?.milletType ??
                                            widget.milletName,
                                        quantity: agreedQuantityKg != null
                                            ? '${agreedQuantityKg.toStringAsFixed(0)} kg'
                                            : (estimatedQuantityKg != null
                                                  ? '${estimatedQuantityKg.toStringAsFixed(0)} kg'
                                                  : widget.quantity),
                                        farmName:
                                            _lot?.farmName ?? 'Registered Farm',
                                        pickupLocation: _lot?.farmName ?? '',
                                        scheduledDate:
                                            _lot?.scheduledInspectionDate !=
                                                null
                                            ? _lot!.scheduledInspectionDate!
                                                  .split('T')[0]
                                             : 'Upcoming',
                                        status: _lot?.status ?? 'Scheduled',
                                        transportType: 'FPO Pickup',
                                        apiBaseUrl: ApiConfig.baseUrl,
                                        accessToken: _accessToken,
                                        pickupLatitude: _lot?.farmLatitude,
                                        pickupLongitude: _lot?.farmLongitude,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel:
                              (isAgrAccepted ||
                                  isDispatched ||
                                  isDelivered ||
                                  isStored ||
                                  isPaymentCompleted)
                              ? l10n.trackDetails
                              : null,
                          extraContent:
                              (hasDriver && !isStored && !isPaymentCompleted)
                              ? _buildCompactDriverCard(context)
                              : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.warehouseReceipt,
                          subtitle: (isStored || isPaymentCompleted)
                              ? 'Millet received & verified at warehouse.'
                              : isDelivered
                              ? 'Delivery confirmed. Awaiting warehouse verification.'
                              : l10n.warehouseReceiptSubtitle,
                          isCompleted: isStored || isPaymentCompleted,
                          isCurrent: !(isStored || isPaymentCompleted) && isDelivered,
                          isLast: false,
                          onTap: (isStored || isDelivered || isPaymentCompleted)
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => WarehouseReceiptScreen(
                                        lotId: widget.lotId ?? widget.lotNumber,
                                        lotNumber: widget.lotNumber,
                                        milletName:
                                            _lot?.milletType ??
                                            widget.milletName,
                                        farmerName:
                                            _lot?.farmerName ?? 'Ramesh Patel',
                                        actualQty: _lot?.actualQuantityKg,
                                        unitPrice: _lot?.offeredPricePerKg,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: (isStored || isDelivered || isPaymentCompleted)
                              ? l10n.viewReceipt
                              : null,
                          extraContent: (isStored && !isPaymentCompleted)
                              ? _buildCompactWarehouseReceiptCard(context)
                              : null,
                        ),
                        _buildTimelineItem(
                          title: l10n.payment,
                          subtitle: isPaymentCompleted
                              ? 'Payment settled & disbursed via DBT.'
                              : (isStored
                                    ? 'Warehouse verified. Payout in progress.'
                                    : l10n.paymentSubtitle),
                          isCompleted: isPaymentCompleted,
                          isCurrent: isStored && !isPaymentCompleted,
                          isLast: true,
                          onTap: (isStored || isDelivered || isPaymentCompleted)
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => PaymentStatusScreen(
                                        lot: _lot,
                                        lotId: widget.lotId,
                                        lotNumber: widget.lotNumber,
                                        milletName:
                                            _lot?.milletType ??
                                            widget.milletName,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          actionLabel: (isStored || isDelivered || isPaymentCompleted)
                              ? l10n.viewPayment
                              : null,
                          extraContent: isPaymentCompleted
                              ? _buildCompactPaymentCard(context)
                              : null,
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

              Builder(
                builder: (context) {
                  final milletTypeVal =
                      (_lot?.milletType != null &&
                          _lot!.milletType.trim().isNotEmpty)
                      ? _lot!.milletType
                      : (widget.milletName.trim().isNotEmpty
                            ? widget.milletName
                            : '');

                  final estimatedQtyVal =
                      (_lot?.estimatedQuantityKg != null &&
                          _lot!.estimatedQuantityKg > 0)
                      ? '${_lot!.estimatedQuantityKg.toStringAsFixed(0)} kg'
                      : widget.quantity;

                  final rawDate =
                      (_lot?.harvestDate != null &&
                          _lot!.harvestDate.trim().isNotEmpty)
                      ? _lot!.harvestDate
                      : (_lot?.submissionDate != null &&
                            _lot!.submissionDate.trim().isNotEmpty)
                      ? _lot!.submissionDate
                      : widget.submissionDate;
                  final dateVal = rawDate.contains('T')
                      ? rawDate.split('T').first
                      : rawDate;

                  final farmVal =
                      (_lot?.farmName != null &&
                          _lot!.farmName.trim().isNotEmpty)
                      ? _lot!.farmName
                      : (widget.farmName ?? '');

                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: const Color(0xFFD5DFD0)),
                    ),
                    child: Column(
                      children: [
                        _buildDetailRow(l10n.milletType, milletTypeVal),
                        _buildDivider(),
                        _buildDetailRow(
                          l10n.estimatedQuantity,
                          estimatedQtyVal,
                        ),
                        _buildDivider(),
                        _buildDetailRow(l10n.harvestDate, dateVal),
                        _buildDivider(),
                        _buildDetailRow(l10n.farmLabel, farmVal),
                        // _buildDivider(),
                        // _buildDetailRow(l10n.fpo, fpoVal),
                      ],
                    ),
                  );
                },
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
    final statusUpper = (_lot?.status ?? _currentStatus ?? widget.status)
        .toUpperCase();

    final dispatchStatus = (_dispatchDetails?['status'] ?? '')
        .toString()
        .toUpperCase();

    final receiptStatus =
        (_lot?.warehouseReceiptStatus ??
                _dispatchDetails?['warehouseReceiptStatus'] ??
                _dispatchDetails?['warehouse_receipt_status'] ??
                widget.warehouseReceiptStatus ??
                '')
            .toString()
            .trim()
            .toUpperCase();

    final isPaymentCompleted = {
      'PAYMENT_COMPLETED',
      'PAYMENT_PAID',
      'PAID',
      'SETTLED',
      'COMPLETED',
    }.contains(statusUpper);

    // A confirmed receipt is the source of truth for this step, or payment settled
    final isStored = {
      'CONFIRMED',
      'RECEIVED',
      'STORED',
      'COMPLETED',
    }.contains(receiptStatus) ||
    statusUpper == 'STORED' ||
    statusUpper == 'SETTLED' ||
    statusUpper == 'PAID' ||
    statusUpper == 'PAYMENT_COMPLETED' ||
    isPaymentCompleted;

    final isDelivered =
        dispatchStatus == 'DELIVERED' ||
        dispatchStatus == 'COMPLETED' ||
        statusUpper.contains('DELIVERED') ||
        statusUpper.contains('DELIVERY_COMPLETED') ||
        statusUpper.contains('PICKUP_COMPLETED') ||
        isStored;

    final hasDriver =
        (_lot?.driverName != null && _lot!.driverName!.trim().isNotEmpty) ||
        (_dispatchDetails?['driverName'] != null &&
            _dispatchDetails!['driverName'].toString().trim().isNotEmpty);
    final remarks = _lot?.negotiationRemarks ?? '';
    final hasFpoAccepted = isDelivered || isStored || remarks.contains('FPO_ACCEPTED') || statusUpper == 'AGREEMENT_PENDING_FARMER' || statusUpper == 'AGREEMENT_ACCEPTED';
    final hasFarmerAccepted = isDelivered || isStored || remarks.contains('FARMER_ACCEPTED') || statusUpper == 'AGREEMENT_PENDING_FPO' || statusUpper == 'AGREEMENT_ACCEPTED';
    final isBothAgreed = hasFpoAccepted && hasFarmerAccepted;

    final isAgrAccepted =
        isDelivered ||
        isStored ||
        isPaymentCompleted ||
        isBothAgreed ||
        statusUpper == 'AGREEMENT_ACCEPTED';

    final isAgrPending =
        !isAgrAccepted &&
        (statusUpper.contains('AGREEMENT') ||
            statusUpper == 'PROCUREMENT_AGREEMENT_PENDING' ||
            _lot?.agreementVersion != null);

    final isCertified =
        statusUpper.contains('CERTIFIED') ||
        statusUpper.contains('CERTIFICATE') ||
        statusUpper.contains('QUALITY_PASSED') ||
        statusUpper.contains('PASSED') ||
        isAgrAccepted ||
        isStored ||
        isPaymentCompleted;

    String title = step.step;
    String subtitle = '';
    VoidCallback? onTap;
    String? actionLabel;

    switch (step.step) {
      case 'SUBMITTED':
        title = l10n.lotSubmitted;
        subtitle = l10n.lotSubmittedSubtitle;
        break;
      case 'QUALITY_INSPECTION':
        title = l10n.qualityInspection;
        subtitle = (isCertified || isCompleted || isPaymentCompleted)
            ? 'Quality inspection completed & verified.'
            : l10n.qualityInspectionSubtitle;
        actionLabel = (isCertified || isCompleted || isPaymentCompleted) ? l10n.viewResults : null;
        onTap = (isCertified || isCompleted || isPaymentCompleted)
            ? () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => QualityResultsScreen(lotId: widget.lotId),
                ),
              )
            : null;
        break;
      case 'QUALITY_CERTIFICATE':
        title = l10n.qualityCertificate;
        subtitle = (isCertified || isCompleted || isPaymentCompleted)
            ? 'Quality certificate issued & verified.'
            : l10n.qualityCertificateSubtitle;
        actionLabel = (isCertified || isCompleted || isPaymentCompleted) ? l10n.viewCertificate : null;
        onTap = (isCertified || isCompleted || isPaymentCompleted)
            ? () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => QualityCertificateScreen(lotId: widget.lotId),
                ),
              )
            : null;
        break;
      case 'PROCUREMENT_AGREEMENT':
        title = l10n.procurementAgreement;
        subtitle = (isAgrAccepted || isCompleted || isPaymentCompleted)
            ? 'Procurement agreement signed & approved.'
            : (hasFarmerAccepted && !hasFpoAccepted)
                ? 'Agreement consented by farmer — Awaiting FPO signature.'
                : (hasFpoAccepted && !hasFarmerAccepted)
                    ? 'Agreement formulated & awaiting your signature.'
                    : (isAgrPending
                        ? 'Agreement formulated & awaiting acceptance.'
                        : l10n.procurementAgreementSubtitle);
        actionLabel = (isAgrAccepted || isCompleted || isPaymentCompleted || isAgrPending)
            ? (!hasFarmerAccepted && isAgrPending ? 'Review & Sign' : l10n.viewAgreement)
            : null;
        onTap = (isAgrAccepted || isCompleted || isPaymentCompleted || isAgrPending)
            ? () async {
                final refreshed = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        ProcurementAgreementScreen(lotId: widget.lotId ?? ''),
                  ),
                );
                if (refreshed == true) {
                  _loadTimeline();
                }
              }
            : null;
        break;
      case 'PICKUP':
        title = l10n.pickupDelivery;
        final hasDriverStep =
            (_lot?.driverName != null && _lot!.driverName!.trim().isNotEmpty) ||
            (_dispatchDetails?['driverName'] != null &&
                _dispatchDetails!['driverName'].toString().trim().isNotEmpty);
        final driverName = _lot?.driverName ?? _dispatchDetails?['driverName']?.toString();
        final driverPhone = _lot?.driverPhone ?? _dispatchDetails?['driverPhone']?.toString();
        final vehicleNo = _lot?.vehicleNumber ?? _dispatchDetails?['vehicleNumber']?.toString();
        final pickupCode = _lot?.verificationCode ?? _dispatchDetails?['verificationCode']?.toString();
        final agreedQuantityKg = _lot?.agreedQuantityKg;
        final estimatedQuantityKg = _lot?.estimatedQuantityKg;

        if (isCompleted ||
            isStored ||
            isPaymentCompleted ||
            statusUpper.contains('DELIVER') ||
            statusUpper.contains('COMPLETED') ||
            statusUpper == 'SETTLED' ||
            statusUpper == 'PAID') {
          subtitle = 'Pickup completed & delivered to warehouse.';
        } else if (hasDriverStep) {
          subtitle =
              'Driver Assigned & Vehicle En Route${pickupCode != null && pickupCode.isNotEmpty ? ' (Verification Code: $pickupCode)' : ''}';
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
              quantity: agreedQuantityKg != null
                  ? '${agreedQuantityKg.toStringAsFixed(0)} kg'
                  : (estimatedQuantityKg != null
                        ? '${estimatedQuantityKg.toStringAsFixed(0)} kg'
                        : widget.quantity),
              farmName: _lot?.farmName ?? 'Registered Farm',
              pickupLocation: _lot?.farmName != null
                  ? '${_lot!.farmName}, Dahod'
                  : 'Bordi Farm, Dahod Sector 2',
              scheduledDate: _lot?.scheduledInspectionDate != null
                  ? _lot!.scheduledInspectionDate!.split('T')[0]
                  : 'Upcoming',
              status: _lot?.status ?? 'Scheduled',
              transportType: 'FPO Pickup',
              apiBaseUrl: ApiConfig.baseUrl,
              accessToken: _accessToken,
              pickupLatitude: _lot?.farmLatitude,
              pickupLongitude: _lot?.farmLongitude,
            ),
          ),
        );
        break;
      case 'WAREHOUSE_RECEIPT':
      case 'WAREHOUSE_RECEIVED':
      case 'STORED':
        title = l10n.warehouseReceipt;
        subtitle = (isStored || isCompleted || isPaymentCompleted)
            ? 'Millet received & verified at warehouse.'
            : isDelivered
            ? 'Delivery confirmed. Awaiting warehouse verification.'
            : l10n.warehouseReceiptSubtitle;

        actionLabel = (isStored || isCompleted || isPaymentCompleted) ? l10n.viewReceipt : null;
        onTap = (isStored || isCompleted || isPaymentCompleted)
            ? () => Navigator.push(
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
              )
            : null;
        break;
      case 'PAYMENT':
        title = l10n.payment;
        subtitle = (isPaymentCompleted || isCompleted)
            ? 'Payment settled & disbursed via DBT.'
            : isStored
            ? 'Warehouse verified. Payout in progress.'
            : l10n.paymentSubtitle;
        actionLabel = l10n.viewPayment;
        onTap = () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PaymentStatusScreen(
              lot: _lot,
              lotId: widget.lotId,
              lotNumber: widget.lotNumber,
              milletName: _lot?.milletType ?? widget.milletName,
            ),
          ),
        );
        break;
    }

    Widget? extraContent;
    if (step.step == 'QUALITY_INSPECTION' &&
        isCurrent &&
        !isCertified &&
        !isAgrAccepted &&
        !isStored &&
        !isPaymentCompleted &&
        (_hasInspectionAssignment() || _hasInspectionStarted())) {
      extraContent = _buildInspectorCard(_lot, context);
    } else if (step.step == 'PROCUREMENT_AGREEMENT' &&
        (isCurrent || isAgrPending) &&
        !isStored &&
        !isPaymentCompleted) {
      extraContent = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCompactAgreementCard(context),
          const SizedBox(height: 10),
          _buildProcurementOfficerCard(_lot, context),
        ],
      );
    } else if (step.step == 'PICKUP' &&
        hasDriver &&
        !isStored &&
        !isPaymentCompleted) {
      extraContent = _buildCompactDriverCard(context);
    } else if (step.step == 'WAREHOUSE_RECEIPT' ||
        step.step == 'WAREHOUSE_RECEIVED' ||
        step.step == 'STORED') {
      if (isCurrent && !isPaymentCompleted) {
        extraContent = _buildCompactWarehouseReceiptCard(context);
      }
    } else if (step.step == 'PAYMENT') {
      isCompleted = isPaymentCompleted;
      isCurrent = isStored && !isPaymentCompleted;
      if (isPaymentCompleted) {
        extraContent = _buildCompactPaymentCard(context);
      }
    }

    final bool canInteract = isCompleted || isCurrent;

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
                    child: Container(width: 2, color: const Color(0xFFD5DDD5)),
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
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                            ),
                            child: Text(
                              actionLabel,
                              style: const TextStyle(fontSize: 12),
                            ),
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
        color: isActive
            ? activeColor.withValues(alpha: 0.12)
            : const Color(0xFFEFEFEF),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: isActive
              ? activeColor.withValues(alpha: 0.5)
              : const Color(0xFFD5D5D5),
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

  // ignore: unused_element
  Widget _buildInspectorCard(LotModel? lot, BuildContext context) {
    final statusUpper = (_lot?.status ?? widget.status).toUpperCase();
    final rawTracking = lot?.inspectionTrackingStatus?.trim().toUpperCase();

    final String trackingStatus;
    if (rawTracking != null && rawTracking.isNotEmpty) {
      trackingStatus = rawTracking;
    } else {
      if (statusUpper.contains('CERTIF') ||
          statusUpper.contains('PASSED') ||
          statusUpper.contains('AGREEMENT') ||
          statusUpper.contains('DISPATCH') ||
          statusUpper.contains('DELIVER') ||
          statusUpper.contains('STORE') ||
          statusUpper.contains('RECEIPT')) {
        trackingStatus = 'COMPLETED';
      } else if (statusUpper.contains('ARRIVED')) {
        trackingStatus = 'ARRIVED_AT_FARM';
      } else if (statusUpper.contains('SAMPLE')) {
        trackingStatus = 'SAMPLE_COLLECTED';
      } else {
        trackingStatus = 'IN_TRANSIT';
      }
    }

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (trackingStatus) {
      case 'IN_TRANSIT':
        statusColor = const Color(0xFFE97900);
        statusLabel = 'Inspector In Transit';
        statusIcon = Icons.directions_car;
        break;
      case 'ARRIVED_AT_FARM':
        statusColor = const Color(0xFF2E7D32);
        statusLabel = 'Arrived at Farm';
        statusIcon = Icons.location_on;
        break;
      case 'SAMPLE_COLLECTED':
        statusColor = Colors.purple.shade700;
        statusLabel = 'Sample Collected';
        statusIcon = Icons.eco;
        break;
      case 'COMPLETED':
        statusColor = ShreeAnnaTheme.primaryGreen;
        statusLabel = 'Inspection Complete';
        statusIcon = Icons.verified;
        break;
      default:
        statusColor = const Color(0xFF1265C0);
        statusLabel = 'Inspector Assigned';
        statusIcon = Icons.assignment_ind;
        break;
    }

    final bool isAssignedStep = true;
    final bool isInTransitStep =
        trackingStatus == 'IN_TRANSIT' ||
        trackingStatus == 'ARRIVED_AT_FARM' ||
        trackingStatus == 'SAMPLE_COLLECTED' ||
        trackingStatus == 'COMPLETED';
    final bool isArrivedStep =
        trackingStatus == 'ARRIVED_AT_FARM' ||
        trackingStatus == 'SAMPLE_COLLECTED' ||
        trackingStatus == 'COMPLETED';
    final bool isSampleCollectedStep =
        trackingStatus == 'SAMPLE_COLLECTED' || trackingStatus == 'COMPLETED';

    final inspectorName =
        (lot?.assignedInspectorName != null &&
            lot!.assignedInspectorName!.trim().isNotEmpty)
        ? lot.assignedInspectorName!
        : 'Dr. Ramesh Patel (Senior Quality Inspector)';
    final inspectorPhone =
        (lot?.assignedInspectorPhone != null &&
            lot!.assignedInspectorPhone!.trim().isNotEmpty)
        ? lot.assignedInspectorPhone!
        : '+91 98765 43210';
    final firstLetter = inspectorName.substring(0, 1).toUpperCase();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: statusColor.withValues(alpha: 0.4),
          width: 1.5,
        ),
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
                icon: const Icon(
                  Icons.refresh,
                  size: 20,
                  color: Color(0xFF687068),
                ),
                tooltip: 'Refresh Status',
              ),
            ],
          ),

          const SizedBox(height: 12),
          if (lot?.scheduledInspectionDate != null &&
              lot!.scheduledInspectionDate!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F0FA),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFBBD3F2)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.calendar_month,
                    size: 16,
                    color: Color(0xFF1265C0),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Scheduled: ${_formatInspectionSchedule(lot.scheduledInspectionDate) ?? lot.scheduledInspectionDate ?? ""}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF174A8B),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
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
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF505850),
                  ),
                ),
                const SizedBox(height: 8),

                Row(
                  children: [
                    Expanded(
                      child: _buildStepBadge(
                        '1. Assigned',
                        isAssignedStep,
                        const Color(0xFF1265C0),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _buildStepBadge(
                        '2. In Transit ',
                        isInTransitStep,
                        const Color(0xFFE97900),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _buildStepBadge(
                        '3. Arrived ',
                        isArrivedStep,
                        const Color(0xFF2E7D32),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _buildStepBadge(
                        '4. Sample',
                        isSampleCollectedStep,
                        Colors.purple.shade700,
                      ),
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
                  firstLetter,
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
                      inspectorName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Mobile: $inspectorPhone',
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
                      inspectorName,
                      inspectorPhone,
                    );
                  },
                  icon: const Icon(Icons.phone, size: 16),
                  label: const Text(
                    'Call Inspector',
                    style: TextStyle(fontSize: 12),
                  ),
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
                    final lotId = widget.lotId ?? _lot?.id ?? '2632-f';
                    final lotNum = (_lot != null && _lot!.lotNumber.isNotEmpty)
                        ? _lot!.lotNumber
                        : widget.lotNumber;
                    final millet = (_lot != null && _lot!.milletType.isNotEmpty)
                        ? _lot!.milletType
                        : widget.milletName;
                    final qty = _lot?.estimatedQuantityKg ??
                        (double.tryParse(widget.quantity) ?? 789.0);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => InspectorChatScreen(
                          lotId: lotId,
                          lotNumber: lotNum,
                          milletType: millet,
                          quantityKg: qty,
                          inspectorName: inspectorName,
                          inspectorPhone: inspectorPhone,
                          farmerName: _lot?.farmerName ?? 'Farmer Member',
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat, size: 16),
                  label: const Text(
                    'Chat Support',
                    style: TextStyle(fontSize: 12),
                  ),
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

  Widget _buildProcurementOfficerCard(LotModel? lot, BuildContext context) {
    final officerName =
        (lot?.procurementOfficerName != null &&
            lot!.procurementOfficerName.trim().isNotEmpty)
        ? lot.procurementOfficerName
        : 'Rajesh Sharma (Procurement Officer)';
    final officerPhone =
        (lot?.procurementOfficerPhone != null &&
            lot!.procurementOfficerPhone.trim().isNotEmpty)
        ? lot.procurementOfficerPhone
        : '+91 98765 43210';

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
                      officerName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Phone: $officerPhone',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF707870),
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
                      officerName,
                      officerPhone,
                    );
                  },
                  icon: const Icon(Icons.phone, size: 16),
                  label: const Text(
                    'Call Officer',
                    style: TextStyle(fontSize: 12),
                  ),
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
                      officerName,
                      officerPhone,
                    );
                  },
                  icon: const Icon(Icons.chat, size: 16),
                  label: const Text(
                    'Chat Officer',
                    style: TextStyle(fontSize: 12),
                  ),
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
    final actualQty =
        _lot?.actualQuantityKg ??
        _lot?.agreedQuantityKg ??
        _lot?.estimatedQuantityKg;
    final rateNum = _lot?.offeredPricePerKg;

    final qtyStr = actualQty != null
        ? '${actualQty.toStringAsFixed(0)} kg'
        : widget.quantity;
    final rateStr = rateNum != null
        ? '₹${rateNum.toStringAsFixed(0)} / kg'
        : null;
    final billStr = (actualQty != null && rateNum != null)
        ? '₹${(actualQty * rateNum).toStringAsFixed(0)}'
        : null;

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
                  Icon(
                    Icons.warehouse,
                    size: 16,
                    color: ShreeAnnaTheme.primaryGreen,
                  ),
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
              if (billStr != null)
                Text(
                  'Bill: $billStr',
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
            [
              'Verified Net Weight: $qtyStr',
              if (rateStr != null) 'Rate: $rateStr',
            ].join(' · '),
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF404840),
              fontWeight: FontWeight.w500,
            ),
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
                      farmerName: _lot?.farmerName,
                      actualQty: _lot?.actualQuantityKg,
                      unitPrice: _lot?.offeredPricePerKg,
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.receipt_long, size: 14),
              label: const Text(
                'View Official Receipt & PDF',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
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
    final statusUpper = lot.status.toUpperCase();
    final remarks = lot.negotiationRemarks ?? '';
    final isRejected = statusUpper.contains('REJECTED');

    final isDispatched = statusUpper.contains('PICKUP_COMPLETED') ||
        statusUpper.contains('DELIVER') ||
        statusUpper.contains('STORED') ||
        statusUpper.contains('DISPATCH') ||
        statusUpper.contains('TRANSIT');

    final hasFpoAccepted = isDispatched ||
        remarks.contains('FPO_ACCEPTED') ||
        statusUpper == 'AGREEMENT_PENDING_FARMER' ||
        statusUpper == 'AGREEMENT_ACCEPTED';

    final hasFarmerAccepted = isDispatched ||
        remarks.contains('FARMER_ACCEPTED') ||
        statusUpper == 'AGREEMENT_PENDING_FPO' ||
        statusUpper == 'AGREEMENT_ACCEPTED';

    final isAccepted = isDispatched || (hasFpoAccepted && hasFarmerAccepted) || statusUpper == 'AGREEMENT_ACCEPTED';
    final isAwaitingFpo = hasFarmerAccepted && !hasFpoAccepted && !isRejected;
    final isAwaitingFarmer = !hasFarmerAccepted && !isRejected;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isRejected
            ? const Color(0xFFFDE8E8)
            : isAccepted
            ? const Color(0xFFE8F5E9)
            : isAwaitingFpo
            ? const Color(0xFFFEF3C7)
            : const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isRejected
              ? Colors.red.shade300
              : isAccepted
              ? ShreeAnnaTheme.primaryGreen
              : isAwaitingFpo
              ? const Color(0xFFFDE047)
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
                    : isAwaitingFpo
                    ? Icons.hourglass_top
                    : Icons.notifications_active,
                color: isRejected
                    ? Colors.red
                    : isAccepted
                    ? ShreeAnnaTheme.primaryGreen
                    : isAwaitingFpo
                    ? const Color(0xFFB45309)
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
                      : isAwaitingFpo
                      ? 'Agreement Consented ($ver) — Awaiting FPO Signature'
                      : 'New Procurement Agreement Formulated ($ver)',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isRejected
                        ? Colors.red.shade900
                        : isAccepted
                        ? ShreeAnnaTheme.primaryGreen
                        : isAwaitingFpo
                        ? const Color(0xFF92400E)
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
                : isAwaitingFpo
                ? 'You have consented to version $ver. Awaiting final counter-signature from ShreeAnna FPO Procurement Officer.'
                : 'FPO Procurement Officer formulated your commercial purchase contract terms ($ver). Review pricing & details.',
            style: TextStyle(
              fontSize: 11,
              color: isRejected
                  ? const Color(0xFF7A1C1C)
                  : isAccepted
                  ? const Color(0xFF1B4D2E)
                  : isAwaitingFpo
                  ? const Color(0xFF78350F)
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
                    builder: (_) =>
                        ProcurementAgreementScreen(lotId: widget.lotId ?? ''),
                  ),
                );
                if (refreshed == true) {
                  _loadTimeline();
                }
              },
              icon: const Icon(Icons.description, size: 16),
              label: Text(
                isAwaitingFpo
                    ? 'Review Agreement (Awaiting FPO Signature)'
                    : (isAccepted
                        ? 'View Signed Agreement ($ver)'
                        : (isAwaitingFarmer
                            ? 'Review & Sign Agreement ($ver)'
                            : 'Review Agreement ($ver)')),
                style: const TextStyle(fontSize: 12),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: isRejected
                    ? Colors.red
                    : isAccepted
                    ? ShreeAnnaTheme.primaryGreen
                    : isAwaitingFpo
                    ? const Color(0xFFD97706)
                    : ShreeAnnaTheme.primaryGreen,
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

  Widget? _buildCompactDriverCard(BuildContext context) {
    final driverName = (_lot?.driverName != null && _lot!.driverName!.trim().isNotEmpty)
        ? _lot!.driverName!.trim()
        : (_dispatchDetails?['driverName']?.toString().trim().isNotEmpty == true
            ? _dispatchDetails!['driverName'].toString().trim()
            : null);

    if (driverName == null || driverName.isEmpty) {
      return null;
    }

    final driverPhone = (_lot?.driverPhone != null && _lot!.driverPhone!.trim().isNotEmpty)
        ? _lot!.driverPhone!.trim()
        : (_dispatchDetails?['driverPhone']?.toString().trim().isNotEmpty == true
            ? _dispatchDetails!['driverPhone'].toString().trim()
            : null);

    final vehicleNo = (_lot?.vehicleNumber != null && _lot!.vehicleNumber!.trim().isNotEmpty)
        ? _lot!.vehicleNumber!.trim()
        : (_dispatchDetails?['vehicleNumber']?.toString().trim().isNotEmpty == true
            ? _dispatchDetails!['vehicleNumber'].toString().trim()
            : null);

    final pickupCode = (_lot?.verificationCode != null && _lot!.verificationCode!.trim().isNotEmpty)
        ? _lot!.verificationCode!.trim()
        : (_dispatchDetails?['verificationCode']?.toString().trim().isNotEmpty == true
            ? _dispatchDetails!['verificationCode'].toString().trim()
            : null);

    final hasPhone = driverPhone != null && driverPhone.isNotEmpty;
    final hasVehicle = vehicleNo != null && vehicleNo.isNotEmpty;
    final hasOtp = pickupCode != null && pickupCode.isNotEmpty;

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
              Expanded(
                child: Row(
                  children: [
                    const Icon(
                      Icons.person,
                      color: ShreeAnnaTheme.primaryGreen,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        driverName,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF202420),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF81C784)),
                ),
                child: const Text(
                  'Assigned Driver',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ),
            ],
          ),
          if (hasVehicle || hasPhone) ...[
            const SizedBox(height: 4),
            Text(
              [
                if (hasVehicle) 'Vehicle: $vehicleNo',
                if (hasPhone) driverPhone,
              ].join(' | '),
              style: const TextStyle(fontSize: 11, color: Color(0xFF687068)),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              if (hasPhone) ...[
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showContactInspectorModal(
                      context,
                      driverName,
                      driverPhone,
                    ),
                    icon: const Icon(
                      Icons.phone,
                      size: 14,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                    label: const Text(
                      'Call',
                      style: TextStyle(
                        fontSize: 11,
                        color: ShreeAnnaTheme.primaryGreen,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    final sessionKey = widget.lotId ?? _lot?.lotNumber ?? driverName.replaceAll(' ', '_');
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DriverChatScreen(
                          sessionId: 'trip_$sessionKey',
                          lotId: widget.lotId ?? '',
                          lotNumber: _lot?.lotNumber ?? '',
                          milletType: _lot?.milletType ?? 'Millet',
                          quantityKg: _lot?.estimatedQuantityKg != null
                              ? '${_lot!.estimatedQuantityKg.toStringAsFixed(0)} kg'
                              : '',
                          otherPartyName: driverName,
                          otherPartyPhone: driverPhone ?? '',
                          vehicleNumber: vehicleNo ?? '',
                          pickupCode: pickupCode ?? '',
                          pickupLocation: _lot?.farmName ?? '',
                          farmerName: _lot?.farmerName ?? 'Farmer Member',
                          isDriver: false,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat, size: 14, color: Colors.white),
                  label: const Text(
                    'Live Chat',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
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
          if (hasOtp) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Pickup Code (OTP):',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF556055),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: ShreeAnnaTheme.primaryGreen,
                      width: 1.5,
                    ),
                  ),
                  child: Text(
                    pickupCode,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }


  Widget _buildCompactAgreementCard(BuildContext context) {
    final version = _lot?.agreementVersion ?? 'v2.0';
    final lotNum = (_lot != null && _lot!.lotNumber.isNotEmpty)
        ? _lot!.lotNumber
        : widget.lotNumber;
    final agrCode = 'AGR-$version-$lotNum';
    final rate = (_lot?.offeredPricePerKg != null)
        ? 'Rate: ₹${_lot!.offeredPricePerKg!.toStringAsFixed(2)} / kg'
        : 'Rate: ₹28.50 / kg';
    final agreedQuantityKg = _lot?.agreedQuantityKg;
    final qty = agreedQuantityKg != null
        ? 'Qty: ${agreedQuantityKg.toStringAsFixed(0)} kg'
        : (_lot?.estimatedQuantityKg != null
              ? 'Qty: ${_lot!.estimatedQuantityKg.toStringAsFixed(0)} kg'
              : 'Qty: ${widget.quantity}');
    final millet =
        (_lot?.milletType != null && _lot!.milletType.trim().isNotEmpty)
        ? _lot!.milletType
        : widget.milletName;
    final lotStatus = (_lot?.status ?? _currentStatus ?? widget.status)
        .trim()
        .toUpperCase();
    final remarks = _lot?.negotiationRemarks ?? '';
    final hasFpoAccepted = lotStatus.contains('DISPATCH') ||
        lotStatus.contains('DELIVER') ||
        lotStatus.contains('STORED') ||
        lotStatus.contains('PAYMENT_COMPLETED') ||
        remarks.contains('FPO_ACCEPTED') ||
        lotStatus == 'AGREEMENT_PENDING_FARMER' ||
        lotStatus == 'AGREEMENT_ACCEPTED';
    final hasFarmerAccepted = lotStatus.contains('DISPATCH') ||
        lotStatus.contains('DELIVER') ||
        lotStatus.contains('STORED') ||
        lotStatus.contains('PAYMENT_COMPLETED') ||
        remarks.contains('FARMER_ACCEPTED') ||
        lotStatus == 'AGREEMENT_ACCEPTED' ||
        lotStatus == 'AGREEMENT_PENDING_FPO';
    final isBothAccepted = (hasFpoAccepted && hasFarmerAccepted) || lotStatus == 'AGREEMENT_ACCEPTED';

    final status = lotStatus.contains('REJECTED')
        ? 'Rejected'
        : isBothAccepted
        ? 'Accepted'
        : (hasFarmerAccepted && !hasFpoAccepted)
        ? 'Awaiting FPO Signature'
        : (hasFpoAccepted && !hasFarmerAccepted)
        ? 'Awaiting Farmer Signature'
        : 'Pending';

    final detailsList = [
      rate,
      qty,
      if (millet.isNotEmpty) millet,
    ].join(' | ');

    return InkWell(
      onTap: () async {
        final refreshed = await Navigator.push<bool>(
          context,
          MaterialPageRoute(
            builder: (_) =>
                ProcurementAgreementScreen(lotId: widget.lotId ?? ''),
          ),
        );
        if (refreshed == true) {
          _loadTimeline();
        }
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
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
                Expanded(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.assignment_turned_in,
                        color: ShreeAnnaTheme.primaryGreen,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          agrCode,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF202420),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: status == 'Accepted'
                            ? const Color(0xFFE8F5E9)
                            : const Color(0xFFFFF3E0),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: status == 'Accepted'
                              ? const Color(0xFF81C784)
                              : const Color(0xFFFFB74D),
                        ),
                      ),
                      child: Text(
                        status,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: status == 'Accepted'
                              ? Colors.green
                              : Colors.orange.shade800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.chevron_right, size: 16, color: Color(0xFF687068)),
                  ],
                ),
              ],
            ),
            if (detailsList.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                detailsList,
                style: const TextStyle(fontSize: 11, color: Color(0xFF687068)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCompactPaymentCard(BuildContext context) {
    final lotNum = (_lot != null && _lot!.lotNumber.isNotEmpty)
        ? _lot!.lotNumber
        : widget.lotNumber;
    final qty = _lot?.actualQuantityKg ??
        _lot?.agreedQuantityKg ??
        _lot?.estimatedQuantityKg ??
        0.0;
    final price = _lot?.offeredPricePerKg ?? 0.0;
    final gross = qty * price;
    final fee = gross * 0.05;
    final transport = _lot?.logisticsCost ??
        ((_lot?.status.toUpperCase() == 'SETTLED' || widget.status.toUpperCase() == 'SETTLED')
            ? 1000.0
            : 0.0);
    final adjustments = _lot?.otherAdjustments ?? 0.0;
    final payout = gross > 0 ? (gross - fee - transport - adjustments) : 0.0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8F1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFC8E6C9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.check_circle, color: Color(0xFF2E7D32), size: 16),
                  SizedBox(width: 6),
                  Text(
                    'Settlement Payout Settled',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1B5E20),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF2E7D32),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'PAID',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
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
                'Direct Bank Transfer (DBT):',
                style: TextStyle(fontSize: 11, color: Color(0xFF555555)),
              ),
              Text(
                payout > 0
                    ? '₹${payout.toStringAsFixed(0)}'
                    : '₹11,750',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1B5E20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lot #$lotNum',
                style: const TextStyle(fontSize: 11, color: Color(0xFF666666)),
              ),
              const Text(
                'Razorpay MockGateway / Bank DBT',
                style: TextStyle(fontSize: 11, color: Color(0xFF666666)),
              ),
            ],
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
                    const Icon(
                      Icons.contact_phone,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Contact: $name',
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
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF687068),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            phone,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.phone_forwarded,
                          color: ShreeAnnaTheme.primaryGreen,
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Calling $name...')),
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
                      foregroundColor: Colors.white,
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

}
