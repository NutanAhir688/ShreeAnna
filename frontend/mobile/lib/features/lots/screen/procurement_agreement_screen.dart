import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import 'reject_agreement_dialog.dart';

class ProcurementAgreementScreen extends StatelessWidget {
  const ProcurementAgreementScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
          'Procurement Agreement',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Farmer / Lot header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Lot #LOT-2026-001',
                      style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Procurement Agreement',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 10),
                    Text(
                      'Farmer: Ramesh Kumar',
                      style: TextStyle(fontSize: 13),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'FPO: Green Hill Farm',
                      style: TextStyle(fontSize: 12, color: Color(0xFF707870)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Procurement terms
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Procurement Terms',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _termRow('Millet Type', 'Pearl Millet (Bajra)'),
                    const Divider(),
                    _termRow('Quality Grade', 'Grade A'),
                    const Divider(),
                    _termRow('Agreed Quantity', '500 kg'),
                    const Divider(),
                    _termRow('Govt Minimum Price', '₹42/kg'),
                    const Divider(),
                    _termRow('Agreed Price', '₹45/kg'),
                    const Divider(),
                    _termRow('Pickup Charge', '₹1,000'),
                    const SizedBox(height: 12),
                    const Text(
                      'Total Contract Value',
                      style: TextStyle(color: Color(0xFF707870), fontSize: 12),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      '₹23,500',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        // Reject -> open modal
                        showDialog(
                          context: context,
                          builder: (_) => const RejectAgreementDialog(),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 14),
                        child: Text('REJECT AGREEMENT'),
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // Accept logic placeholder
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Agreement accepted')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ShreeAnnaTheme.primaryGreen,
                        foregroundColor: Colors.white,
                      ),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 14),
                        child: Text('ACCEPT AGREEMENT'),
                      ),
                    ),
                  ),
                ],
              ),
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
          Text(label, style: const TextStyle(color: Color(0xFF707870))),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
