import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class TermsConditionsScreen extends StatelessWidget {
  const TermsConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF202420)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Terms & Conditions',
          style: TextStyle(
            color: Color(0xFF202420),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Badge Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFD5DFD0)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.10),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.description_outlined,
                      color: ShreeAnnaTheme.primaryGreen,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ShreeAnna Procurement Platform',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF202420),
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Version 2.4 • Effective from October 2026',
                          style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            _buildSection(
              number: '1',
              title: 'Platform Overview & Farmer Eligibility',
              content:
                  'ShreeAnna is a digital procurement, quality grading, and supply chain ecosystem connecting millet-growing farmers with Farmer Producer Organizations (FPOs), authorized aggregators, and central storage warehouses. By registering on ShreeAnna, you represent that you are an active farmer, legal cultivator, or recognized member of an affiliated FPO.',
            ),

            _buildSection(
              number: '2',
              title: 'Fair Pricing & Minimum Support Price (MSP)',
              content:
                  'All millet procurement transactions (Finger Millet, Pearl Millet, Foxtail Millet, Proso Millet, Barnyard Millet, Kodo Millet, and Little Millet) initiated via ShreeAnna adhere strictly to Government of India MSP benchmarks and fair grade adjustments negotiated through transparent electronic agreements.',
            ),

            _buildSection(
              number: '3',
              title: 'Field Quality Inspection & Assay Guidelines',
              content:
                  'Prior to dispatch agreement confirmation, an accredited Quality Inspector visits your farm to extract representative samples. Assays evaluate moisture content (optimal ≤ 12%), foreign matter percentage (≤ 1.0%), insect damage, and overall grain viability. Accepted lots receive a verifiable digital Quality Certificate.',
            ),

            _buildSection(
              number: '4',
              title: 'Procurement Agreement & Digital Acceptance',
              content:
                  'Once an inspection is approved, the FPO issues a binding Procurement Agreement specifying quantity (kg), price per kg, delivery window, and receiving warehouse. Accepting the agreement digitally in the app constitutes a mutual, legally valid supply commitment.',
            ),

            _buildSection(
              number: '5',
              title: 'Farm Pickup & Verification Code (OTP)',
              content:
                  'For FPO pickups, an authorized logistics driver is assigned. The driver must arrive at your registered farm GPS coordinates. You must ONLY hand over the bagged millet after the driver requests and enters your confidential 4-digit Pickup Verification Code generated in your app. Never share this code prior to physical loading.',
            ),

            _buildSection(
              number: '6',
              title: 'Warehouse Weighbridge & Reconciliation',
              content:
                  'Gross and tare weights are measured at the certified destination warehouse weighbridge. In case of moisture loss or transit variance, the digital goods receipt note (GRN) generated at the warehouse dock shall serve as the final settlement weight for DBT disbursement.',
            ),

            _buildSection(
              number: '7',
              title: 'Direct Benefit Transfer (DBT) Payment',
              content:
                  'Payments for procured millets are disbursed directly to your Aadhaar-linked bank account within 48 to 72 bank working hours following warehouse receipt confirmation. No cash handling or third-party intermediary deductions are permitted.',
            ),

            _buildSection(
              number: '8',
              title: 'Dispute Resolution & Grievance Redressal',
              content:
                  'In the event of an assay disagreement or transit delay, farmers may flag an issue directly within the mobile app or reach the FPO Grievance Redressal Committee via the Support hotline (1800-SHREE-ANNA).',
            ),

            const SizedBox(height: 12),

            // Acknowledgment Button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.check, size: 18),
                label: const Text('I Understand & Agree'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ShreeAnnaTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String number,
    required String title,
    required String content,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.primaryGreen.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  number,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: ShreeAnnaTheme.primaryGreen,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF202420),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF555B55),
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
