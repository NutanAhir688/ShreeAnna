import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class PickupDeliveryScreen extends StatelessWidget {
  const PickupDeliveryScreen({super.key});

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
          'Pickup / Delivery',
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
              // Header
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 6),
                    const Text(
                      'Scheduled for 25 Aug',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const Text(
                      '2026',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFD5DFD0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.local_shipping,
                            size: 16,
                            color: ShreeAnnaTheme.primaryGreen,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'FPO Pickup',
                            style: TextStyle(
                              color: ShreeAnnaTheme.primaryGreen,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Map / location card
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Map placeholder
                    Container(
                      height: 140,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        color: const Color(0xFFE4EBDC),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: Image.asset(
                          'assets/images/map.png',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Icon(
                                Icons.map_outlined,
                                size: 48,
                                color: ShreeAnnaTheme.primaryGreen,
                              ),
                            );
                          },
                        ),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'PICKUP LOCATION',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF707870),
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Lot 42, North Field',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '1540 Valley Road\nCounty Line, Ag District',
                            style: TextStyle(color: Color(0xFF707870)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Details grid
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _detailLabel(
                            'MILLET TYPE',
                            'Pearl Millet (Bajra)',
                          ),
                        ),
                        Expanded(child: _detailLabel('QUANTITY', '500 kg')),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _detailLabel(
                            'TRANSPORTATION TYPE',
                            'FPO Pickup',
                          ),
                        ),
                        Expanded(child: _detailLabel('STATUS', 'Scheduled')),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Preparation instructions
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F7ED),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(
                          Icons.info_outline,
                          color: ShreeAnnaTheme.primaryGreen,
                          size: 18,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Preparation Instructions',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _prepItem(
                      'Ensure grain is properly aerated and ready for loading.',
                    ),
                    const SizedBox(height: 8),
                    _prepItem(
                      'Clear access roads for heavy transport vehicles (min 15ft width).',
                    ),
                    const SizedBox(height: 8),
                    _prepItem(
                      'Have relevant quality certs available for driver.',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Contact driver button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Contacting driver...')),
                    );
                  },
                  icon: const Icon(Icons.phone, size: 18),
                  label: const Text(
                    'Contact Driver',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailLabel(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Color(0xFF707870)),
        ),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _prepItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: const BoxDecoration(
            color: ShreeAnnaTheme.primaryGreen,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, color: Colors.white, size: 14),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Color(0xFF465046),
              fontSize: 12,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }
}
