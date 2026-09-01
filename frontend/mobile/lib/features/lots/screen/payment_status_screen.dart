import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class PaymentStatusScreen extends StatelessWidget {
  const PaymentStatusScreen({super.key});

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
          'Payment Status',
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
                      'Bill Number',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'BILL-2026-001',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'Agreement #',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'AGR-2026-001',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12),
                    Text('Quantity: 500 kg'),
                    SizedBox(height: 6),
                    Text('Agreed Price: ₹45 / kg'),
                    SizedBox(height: 6),
                    Text('Pickup Charge: ₹1,000'),
                    SizedBox(height: 12),
                    Text(
                      'Total Amount: ₹23,500',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF087F23),
                      ),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'Status: Completed',
                      style: TextStyle(
                        color: Color(0xFF087F23),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text('Date: 28 Aug 2026'),
                    SizedBox(height: 6),
                    Text('Reference: TXN-984421'),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    foregroundColor: Colors.white,
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                  ),
                  child: const Text('Return to Home'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
