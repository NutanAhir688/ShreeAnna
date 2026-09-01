import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class QualityCertificateScreen extends StatelessWidget {
  const QualityCertificateScreen({super.key});

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
          'Quality Certificate',
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
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'CERTIFICATE NUMBER',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'QC-2026-001',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'FARMER',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'John Doe',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'LOT NUMBER',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'LOT-001',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'QUALITY GRADE',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'A',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'ISSUE DATE',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text('15 Aug 2026'),
                    SizedBox(height: 12),
                    Text(
                      'VALID UNTIL',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                    ),
                    SizedBox(height: 6),
                    Text('15 Sep 2026'),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              Container(
                height: 50,
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Downloading PDF...')),
                    );
                  },
                  icon: const Icon(Icons.download),
                  label: const Text(
                    'Download PDF',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
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
}
