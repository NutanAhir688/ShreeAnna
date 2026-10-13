import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

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
          'Privacy Policy',
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
                      Icons.shield_outlined,
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
                          'Farmer Data Protection',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF202420),
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Compliant with DPDP Act • Updated October 2026',
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
              icon: Icons.info_outline,
              title: '1. What Information We Collect',
              content:
                  'We collect personal details necessary to verify farmer identity and process procurement payments: your full name, mobile number, residential address, farmer code, and FPO membership. For crop listing, we record millet variety, estimated quantity, harvest date, and farm survey details.',
            ),

            _buildSection(
              icon: Icons.my_location,
              title: '2. GPS Geolocation & Farm Coordinates',
              content:
                  'When you register or verify a farm land parcel, ShreeAnna records the latitude and longitude of your farm location. These coordinates are strictly used to:\n• Guide authorized field inspectors to conduct mandatory quality assays.\n• Direct assigned logistics trucks to the exact farm pickup point.\n• Prevent transport misdirections in rural areas.\nYour GPS location data is NEVER sold, rented, or shared with commercial marketing agencies.',
            ),

            _buildSection(
              icon: Icons.security,
              title: '3. Role-Based Data Access',
              content:
                  'Only authorized stakeholders in the procurement lifecycle have access to specific data points:\n• Quality Inspectors only receive farm coordinates during scheduled visits.\n• Logistics Drivers receive pickup coordinates ONLY after vehicle dispatch is confirmed.\n• Verification codes (OTP) remain private to the farmer until physical loading.',
            ),

            _buildSection(
              icon: Icons.account_balance,
              title: '4. Banking & Financial Security',
              content:
                  'Bank account details and Aadhaar-seeded credentials used for Direct Benefit Transfer (DBT) are encrypted using industry-standard TLS/SSL encryption and processed strictly through certified public financial management systems (PFMS) and authorized banking gateways.',
            ),

            _buildSection(
              icon: Icons.fact_check_outlined,
              title: '5. Quality Certificates & Public Traceability',
              content:
                  'To guarantee consumer trust in ShreeAnna millets, grain assay reports, batch codes, and warehouse receiving certificates may be stored on tamper-proof audit trails for supply chain traceability. Personal identifying numbers are redacted in public batch lookups.',
            ),

            _buildSection(
              icon: Icons.manage_accounts_outlined,
              title: '6. Your Rights & Data Rectification',
              content:
                  'You have the right to access, review, and request updates to your personal profile or registered farm details at any time through the app. In case of mobile number or address changes, update your profile or consult your FPO representative.',
            ),

            _buildSection(
              icon: Icons.contact_mail_outlined,
              title: '7. Contact & Data Grievance',
              content:
                  'For questions regarding data privacy or to file a grievance, contact our Data Protection Officer at privacy@shreeanna.gov.in or write to: ShreeAnna Platform Support, Krishi Bhawan, New Delhi - 110001.',
            ),

            const SizedBox(height: 12),

            // Close button
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 18),
                label: const Text('Back to Profile'),
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
    required IconData icon,
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
              Icon(icon, size: 20, color: ShreeAnnaTheme.primaryGreen),
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
