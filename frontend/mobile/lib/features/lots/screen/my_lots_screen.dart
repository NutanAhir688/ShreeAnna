import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import 'sell_millet_screen.dart';
import 'lot_details_screen.dart';

class MyLotsScreen extends StatelessWidget {
  const MyLotsScreen({super.key});

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
          'ShreeAnna',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 25),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --------------------------------------------------
              // HEADER
              // --------------------------------------------------

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'My Lots',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF202420),
                    ),
                  ),

                  SizedBox(
                    height: 40,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SellMilletScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.add, size: 17),
                      label: const Text(
                        'Submit New Lot',
                        style: TextStyle(
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

              const Text(
                'Manage and track your submitted harvest lots.',
                style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
              ),

              const SizedBox(height: 18),

              // --------------------------------------------------
              // LOTS
              // --------------------------------------------------
              _buildLotCard(
                context: context,
                lotNumber: '1042-A',
                milletName: 'Finger Millet (Ragi)',
                quantity: '450 kg',
                submissionDate: 'Oct 12, 2026',
                status: 'Submitted',
                statusColor: const Color(0xFFE97900),
                statusBackground: const Color(0xFFFFE9D0),
              ),

              const SizedBox(height: 12),

              _buildLotCard(
                context: context,
                lotNumber: '8472-B',
                milletName: 'Pearl Millet (Bajra)',
                quantity: '1,200 kg',
                submissionDate: 'Aug 10, 2026',
                status: 'Inspection in Progress',
                statusColor: const Color(0xFF1265C0),
                statusBackground: const Color(0xFFDCEBFA),
              ),

              const SizedBox(height: 12),

              _buildLotCard(
                context: context,
                lotNumber: '1038-C',
                milletName: 'Foxtail Millet',
                quantity: '850 kg',
                submissionDate: 'Sep 28, 2026',
                status: 'Certified',
                statusColor: const Color(0xFF087F23),
                statusBackground: const Color(0xFFDFF3E2),
              ),

              const SizedBox(height: 12),

              _buildLotCard(
                context: context,
                lotNumber: '1035-A',
                milletName: 'Sorghum (Jowar)',
                quantity: '300 kg',
                submissionDate: 'Sep 15, 2026',
                status: 'Agreement Awaiting Approval',
                statusColor: const Color(0xFFE97900),
                statusBackground: const Color(0xFFFFE9D0),
              ),

              const SizedBox(height: 12),

              _buildLotCard(
                context: context,
                lotNumber: '1032-D',
                milletName: 'Finger Millet (Ragi)',
                quantity: '500 kg',
                submissionDate: 'Sep 10, 2026',
                status: 'Pickup Scheduled',
                statusColor: const Color(0xFF1265C0),
                statusBackground: const Color(0xFFDCEBFA),
              ),

              const SizedBox(height: 12),

              _buildLotCard(
                context: context,
                lotNumber: '1028-E',
                milletName: 'Pearl Millet (Bajra)',
                quantity: '1,150 kg',
                submissionDate: 'Sep 01, 2026',
                status: 'Payment Completed',
                statusColor: const Color(0xFF087F23),
                statusBackground: const Color(0xFFDFF3E2),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // LOT CARD
  // ============================================================

  Widget _buildLotCard({
    required BuildContext context,
    required String lotNumber,
    required String milletName,
    required String quantity,
    required String submissionDate,
    required String status,
    required Color statusColor,
    required Color statusBackground,
  }) {
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
          // ----------------------------------------------------
          // TOP ROW
          // ----------------------------------------------------

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  'LOT #$lotNumber',
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
                  color: statusBackground,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  status,
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

          // ----------------------------------------------------
          // MILLET NAME
          // ----------------------------------------------------
          Text(
            milletName,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF202420),
            ),
          ),

          const SizedBox(height: 10),

          // ----------------------------------------------------
          // DETAILS
          // ----------------------------------------------------
          Row(
            children: [
              Expanded(
                child: _buildDetail(
                  label: 'Estimated Quantity',
                  value: quantity,
                ),
              ),

              Expanded(
                child: _buildDetail(
                  label: 'Submission Date',
                  value: submissionDate,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ----------------------------------------------------
          // VIEW DETAILS
          // ----------------------------------------------------
          SizedBox(
            width: double.infinity,
            height: 34,
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => LotDetailsScreen(
                      lotNumber: lotNumber,
                      milletName: milletName,
                      quantity: quantity,
                      submissionDate: submissionDate,
                      status: status,
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
              child: const Text(
                'View Details',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // DETAIL
  // ============================================================

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
