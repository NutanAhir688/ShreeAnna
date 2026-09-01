import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import 'procurement_agreement_screen.dart';
import 'quality_results_screen.dart';
import 'quality_certificate_screen.dart';
import 'pickup_delivery_screen.dart';
import 'payment_status_screen.dart';
import 'warehouse_receipt_screen.dart';

class LotDetailsScreen extends StatelessWidget {
  const LotDetailsScreen({
    super.key,
    required this.lotNumber,
    required this.milletName,
    required this.quantity,
    required this.submissionDate,
    required this.status,
  });

  final String lotNumber;
  final String milletName;
  final String quantity;
  final String submissionDate;
  final String status;

  @override
  Widget build(BuildContext context) {
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

        title: const Text(
          'Lot Details',
          style: TextStyle(
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
                      'LOT #$lotNumber',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF687068),
                      ),
                    ),

                    const SizedBox(height: 7),

                    Text(
                      milletName,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),

                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(child: _buildInfo('Quantity', quantity)),
                        Expanded(
                          child: _buildInfo('Submitted', submissionDate),
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
                        status,
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

              const SizedBox(height: 22),

              // ==================================================
              // PROCUREMENT JOURNEY
              // ==================================================
              const Text(
                'Procurement Journey',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202420),
                ),
              ),

              const SizedBox(height: 14),

              _buildTimelineItem(
                title: 'Lot Submitted',
                subtitle: 'Your lot has been submitted to the FPO.',
                isCompleted: true,
                isCurrent: false,
                isLast: false,
              ),

              _buildTimelineItem(
                title: 'Quality Inspection',
                subtitle: 'Quality inspection is currently in progress.',
                isCompleted: true,
                isCurrent: false,
                isLast: false,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const QualityResultsScreen(),
                    ),
                  );
                },
                actionLabel: 'View Results',
                actionOnTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const QualityResultsScreen(),
                    ),
                  );
                },
              ),

              _buildTimelineItem(
                title: 'Quality Certificate',
                subtitle: 'Certificate will be issued after inspection.',
                isCompleted: true,
                isCurrent: false,
                isLast: false,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const QualityCertificateScreen(),
                    ),
                  );
                },
                actionLabel: 'View Certificate',
                actionOnTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const QualityCertificateScreen(),
                    ),
                  );
                },
              ),

              _buildTimelineItem(
                title: 'Procurement Agreement',
                subtitle: 'Agreement will be created after approval.',
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
                actionLabel: 'View Agreement',
                actionOnTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ProcurementAgreementScreen(),
                    ),
                  );
                },
              ),

              _buildTimelineItem(
                title: 'Pickup / Delivery',
                subtitle: 'Pickup schedule will appear here.',
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
                actionLabel: 'Track Details',
                actionOnTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const PickupDeliveryScreen(),
                    ),
                  );
                },
              ),

              _buildTimelineItem(
                title: 'Warehouse Receipt',
                subtitle: 'Warehouse receipt will be recorded here.',
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
                actionLabel: 'View Receipt',
                actionOnTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const WarehouseReceiptScreen(),
                    ),
                  );
                },
              ),

              _buildTimelineItem(
                title: 'Payment',
                subtitle: 'Payment status will appear here.',
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
                actionLabel: 'View Payment',
                actionOnTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const PaymentStatusScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),

              // ==================================================
              // HARVEST DETAILS
              // ==================================================
              const Text(
                'Harvest Details',
                style: TextStyle(
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
                    _buildDetailRow('Millet Type', milletName),
                    _buildDivider(),
                    _buildDetailRow('Estimated Quantity', quantity),
                    _buildDivider(),
                    _buildDetailRow('Harvest Date', '20/08/2026'),
                    _buildDivider(),
                    _buildDetailRow('Farm', 'Green Hill Farm'),
                    _buildDivider(),
                    _buildDetailRow('FPO', 'Green Valley Cooperative'),
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
                        'Your FPO will update the lot status as it moves through the procurement process.',
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

  // ============================================================
  // INFO
  // ============================================================

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

  // ============================================================
  // TIMELINE ITEM
  // ============================================================

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
        // --------------------------------------------------------
        // TIMELINE
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // CONTENT
        // --------------------------------------------------------
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

        // Optional contextual action button — only visible when this
        // timeline step is current or already completed.
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

  // ============================================================
  // DETAIL ROW
  // ============================================================

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
}
