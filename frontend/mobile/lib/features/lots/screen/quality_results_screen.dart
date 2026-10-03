import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../services/lot_api.dart';
import 'quality_certificate_screen.dart';

class QualityResultsScreen extends StatefulWidget {
  final String? lotId;

  const QualityResultsScreen({super.key, this.lotId});

  @override
  State<QualityResultsScreen> createState() => _QualityResultsScreenState();
}

class _QualityResultsScreenState extends State<QualityResultsScreen> {
  final LotApi _lotApi = LotApi();
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _inspectionData;

  @override
  void initState() {
    super.initState();
    _fetchQualityResults();
  }

  Future<void> _fetchQualityResults() async {
    if (widget.lotId == null || widget.lotId!.isEmpty) {
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      final data = await _lotApi.getQualityInspection(widget.lotId!);
      setState(() {
        _inspectionData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

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
          'Quality Results',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: ShreeAnnaTheme.primaryGreen,
                ),
              )
            : _inspectionData == null
                ? Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFD5DFD0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F5E9),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.science,
                                color: ShreeAnnaTheme.primaryGreen,
                                size: 48,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'QA Lab Inspection Pending',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF202420),
                              ),
                            ),
                            const SizedBox(height: 10),
                            const Text(
                              'The Quality Officer has collected the grain sample from your farm. Moisture percentage, purity, and grade rating are being tested in the QA Laboratory.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.4,
                                color: Color(0xFF606860),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF3E0),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Icon(Icons.hourglass_top, size: 16, color: Color(0xFFE97900)),
                                  SizedBox(width: 6),
                                  Text(
                                    'Sample Arrived at QA Lab 🧪',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFFE97900),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  setState(() {
                                    _isLoading = true;
                                  });
                                  _fetchQualityResults();
                                },
                                icon: const Icon(Icons.refresh, size: 18),
                                label: const Text('Refresh Inspection Results'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: ShreeAnnaTheme.primaryGreen,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Result card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFD5DFD0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const Text(
                                'FINAL GRADE',
                                style: TextStyle(fontSize: 12, color: Color(0xFF707870)),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: (_inspectionData!['status']?.toString().toUpperCase() == 'PASSED')
                                      ? const Color(0xFFF0FBF3)
                                      : const Color(0xFFFFEBEE),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  _inspectionData!['grade']?.toString() ?? 'Grade A',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: (_inspectionData!['status']?.toString().toUpperCase() == 'PASSED')
                                        ? ShreeAnnaTheme.primaryGreen
                                        : Colors.red,
                                  ),
                                ),
                              ),

                              const SizedBox(height: 16),

                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                children: [
                                  _Metric(
                                    label: 'MOISTURE',
                                    value: _inspectionData!['moisturePercentage'] != null
                                        ? '${_inspectionData!['moisturePercentage']}%'
                                        : '—',
                                  ),
                                  _Metric(
                                    label: 'PURITY',
                                    value: _inspectionData!['purityPercentage'] != null
                                        ? '${_inspectionData!['purityPercentage']}%'
                                        : '—',
                                  ),
                                  _Metric(
                                    label: 'INSPECTOR',
                                    value: _inspectionData!['inspectorName']?.toString() ?? 'QA Inspector',
                                  ),
                                ],
                              ),

                              const SizedBox(height: 12),

                              Text(
                                'Date: ${_inspectionData!['inspectionDate'] != null ? DateTime.tryParse(_inspectionData!['inspectionDate'].toString())?.toLocal().toString().split(' ').first ?? '—' : '—'}',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF707870)),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Observations and result
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(19),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFD5DFD0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'OBSERVATIONS & NOTES',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _inspectionData!['notes']?.toString() ?? 'Quality verified in lab.',
                                style: const TextStyle(color: Color(0xFF707870)),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'RESULT',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _inspectionData!['status']?.toString().toUpperCase() == 'PASSED'
                                    ? 'PASSED'
                                    : 'REJECTED',
                                style: TextStyle(
                                  color: _inspectionData!['status']?.toString().toUpperCase() == 'PASSED'
                                      ? const Color(0xFF087F23)
                                      : Colors.red,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        if (_inspectionData!['status']?.toString().toUpperCase() == 'PASSED')
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => QualityCertificateScreen(
                                          lotId: widget.lotId,
                                        ),
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.workspace_premium),
                                  label: const Text('QUALITY CERTIFICATE'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
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
}

class _Metric extends StatelessWidget {
  final String label;
  final String value;

  const _Metric({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF707870)),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ],
    );
  }
}
