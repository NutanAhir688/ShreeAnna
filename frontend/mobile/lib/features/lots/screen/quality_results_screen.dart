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
    // Extract real values or fallback to default
    final grade = _inspectionData?['grade']?.toString() ?? 'A';
    final moisture = _inspectionData?['moisturePercentage'] != null
        ? '${_inspectionData!['moisturePercentage']}%'
        : '11.8%';
    final purity = _inspectionData?['purityPercentage'] != null
        ? '${_inspectionData!['purityPercentage']}%'
        : '99.2%';
    final rawStatus = _inspectionData?['status']?.toString() ?? 'PASSED';
    final isPassed = rawStatus.toUpperCase() == 'PASSED';
    final notes = _inspectionData?['notes']?.toString() ??
        'Uniform grain size, quality verified.';
    final dateStr = _inspectionData?['inspectionDate']?.toString();
    final formattedDate = dateStr != null
        ? DateTime.tryParse(dateStr)?.toLocal().toString().split(' ').first ??
            '15 Aug'
        : '15 Aug';

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
            : _errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red),
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
                              color: isPassed
                                  ? const Color(0xFFF0FBF3)
                                  : const Color(0xFFFFEBEE),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              grade,
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: isPassed
                                    ? ShreeAnnaTheme.primaryGreen
                                    : Colors.red,
                              ),
                            ),
                          ),

                          const SizedBox(height: 16),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _Metric(label: 'MOISTURE', value: moisture),
                              _Metric(label: 'PURITY', value: purity),
                              _Metric(
                                label: 'INSPECTOR',
                                value: _inspectionData?['inspectorName'] ?? 'FPO Inspector',
                              ),
                            ],
                          ),

                          const SizedBox(height: 12),

                          Text(
                            'Date: $formattedDate',
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
                            notes,
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
                            isPassed ? 'PASSED' : 'REJECTED',
                            style: TextStyle(
                              color: isPassed ? const Color(0xFF087F23) : Colors.red,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    if (isPassed)
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
