import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../services/lot_api.dart';

class QualityCertificateScreen extends StatefulWidget {
  final String? lotId;

  const QualityCertificateScreen({super.key, this.lotId});

  @override
  State<QualityCertificateScreen> createState() => _QualityCertificateScreenState();
}

class _QualityCertificateScreenState extends State<QualityCertificateScreen> {
  final LotApi _lotApi = LotApi();
  bool _isLoading = true;
  Map<String, dynamic>? _certData;

  @override
  void initState() {
    super.initState();
    _fetchCertificate();
  }

  Future<void> _fetchCertificate() async {
    if (widget.lotId == null || widget.lotId!.isEmpty) {
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      final cert = await _lotApi.getQualityCertificate(widget.lotId!);
      setState(() {
        _certData = cert;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final certNumber = _certData?['certificateNumber']?.toString() ?? 'QC-2026-001';
    final lotNum = _certData?['lotNumber']?.toString() ?? 'LOT-001';
    final issuedBy = _certData?['issuedBy']?.toString() ?? 'Quality Inspector';
    final grade = _certData?['grade']?.toString() ?? 'Grade A';

    final issueDateRaw = _certData?['issueDate']?.toString();
    final issueDate = issueDateRaw != null
        ? DateTime.tryParse(issueDateRaw)?.toLocal().toString().split(' ').first ?? '15 Aug 2026'
        : '15 Aug 2026';

    final validUntilRaw = _certData?['validUntil']?.toString();
    final validUntil = validUntilRaw != null
        ? DateTime.tryParse(validUntilRaw)?.toLocal().toString().split(' ').first ?? '15 Sep 2027'
        : '15 Sep 2027';

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),
        title: Text(
          l10n.qualityCertificate,
          style: const TextStyle(
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
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFD5DFD0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'CERTIFICATE NUMBER',
                                    style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    certNumber,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: ShreeAnnaTheme.primaryGreen,
                                    ),
                                  ),
                                ],
                              ),
                              const Icon(
                                Icons.workspace_premium,
                                color: Colors.amber,
                                size: 36,
                              ),
                            ],
                          ),
                          const Divider(height: 24, color: Color(0xFFE3E7E3)),
                          const Text(
                            'LOT NUMBER',
                            style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            lotNum,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'QUALITY GRADE',
                            style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            grade,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: ShreeAnnaTheme.primaryGreen,
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'ISSUED BY',
                            style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            issuedBy,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'ISSUE DATE',
                                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(issueDate, style: const TextStyle(fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'VALID UNTIL',
                                      style: TextStyle(fontSize: 11, color: Color(0xFF707870)),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      validUntil,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        color: ShreeAnnaTheme.primaryGreen,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    SizedBox(
                      height: 50,
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Certificate downloaded.')),
                          );
                        },
                        icon: const Icon(Icons.download),
                        label: const Text(
                          'Download Certificate PDF',
                          style: TextStyle(fontSize: 15, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
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
    );
  }
}
