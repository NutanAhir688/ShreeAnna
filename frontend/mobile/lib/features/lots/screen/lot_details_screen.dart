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
                    final isCompleted = step.status == 'COMPLETED';
                    final isCurrent = step.status == 'IN_PROGRESS';
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
                Column(
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
                      subtitle: l10n.qualityInspectionSubtitle,
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => QualityResultsScreen(lotId: widget.lotId),
                          ),
                        );
                      },
                      actionLabel: l10n.viewResults,
                    ),
                    _buildTimelineItem(
                      title: l10n.qualityCertificate,
                      subtitle: l10n.qualityCertificateSubtitle,
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => QualityCertificateScreen(lotId: widget.lotId),
                          ),
                        );
                      },
                      actionLabel: l10n.viewCertificate,
                    ),
                    _buildTimelineItem(
                      title: l10n.procurementAgreement,
                      subtitle: l10n.procurementAgreementSubtitle,
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ProcurementAgreementScreen(),
                          ),
                        );
                      },
                      actionLabel: l10n.viewAgreement,
                    ),
                    _buildTimelineItem(
                      title: l10n.pickupDelivery,
                      subtitle: l10n.pickupDeliverySubtitle,
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PickupDeliveryScreen(),
                          ),
                        );
                      },
                      actionLabel: l10n.trackDetails,
                    ),
                    _buildTimelineItem(
                      title: l10n.warehouseReceipt,
                      subtitle: l10n.warehouseReceiptSubtitle,
                      isCompleted: true,
                      isCurrent: false,
                      isLast: false,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const WarehouseReceiptScreen(),
                          ),
                        );
                      },
                      actionLabel: l10n.viewReceipt,
                    ),
                    _buildTimelineItem(
                      title: l10n.payment,
                      subtitle: l10n.paymentSubtitle,
                      isCompleted: true,
                      isCurrent: true,
                      isLast: true,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PaymentStatusScreen(),
                          ),
                        );
                      },
                      actionLabel: l10n.viewPayment,
                    ),
                  ],
                ),

              const SizedBox(height: 16),

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
        if (canInteract) {
          actionLabel = l10n.viewResults;
          onTap = () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => QualityResultsScreen(lotId: widget.lotId)),
              );
        }
        break;
      case 'QUALITY_CERTIFICATE':
        title = l10n.qualityCertificate;
        subtitle = l10n.qualityCertificateSubtitle;
        if (canInteract) {
          actionLabel = l10n.viewCertificate;
          onTap = () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => QualityCertificateScreen(lotId: widget.lotId)),
              );
        }
        break;
      case 'PROCUREMENT_AGREEMENT':
        title = l10n.procurementAgreement;
        subtitle = l10n.procurementAgreementSubtitle;
        if (canInteract) {
          actionLabel = l10n.viewAgreement;
          onTap = () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProcurementAgreementScreen()),
              );
        }
        break;
      case 'PICKUP':
        title = l10n.pickupDelivery;
        subtitle = l10n.pickupDeliverySubtitle;
        if (canInteract) {
          actionLabel = l10n.trackDetails;
          onTap = () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PickupDeliveryScreen()),
              );
        }
        break;
      case 'PAYMENT':
        title = l10n.payment;
        subtitle = l10n.paymentSubtitle;
        if (canInteract) {
          actionLabel = l10n.viewPayment;
          onTap = () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PaymentStatusScreen()),
              );
        }
        break;
    }

    return _buildTimelineItem(
      title: title,
      subtitle: subtitle,
      isCompleted: isCompleted,
      isCurrent: isCurrent,
      isLast: isLast,
      onTap: onTap,
      actionLabel: actionLabel,
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
  }) {
    final Color circleColor;

    if (isCompleted) {
      circleColor = ShreeAnnaTheme.primaryGreen;
    } else if (isCurrent) {
      circleColor = const Color(0xFFE97900);
    } else {
      circleColor = const Color(0xFFC7CEC7);
    }

    final content = Row(
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
                Container(width: 2, height: 52, color: const Color(0xFFD5DDD5)),
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
        ),

        if ((isCurrent || isCompleted) && actionLabel != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 22, left: 8),
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
                  icon: const Icon(Icons.message, size: 16),
                  label: const Text('SMS / Info', style: TextStyle(fontSize: 12)),
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
}
