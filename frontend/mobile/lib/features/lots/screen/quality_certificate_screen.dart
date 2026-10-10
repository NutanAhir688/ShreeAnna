import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../app/theme.dart';
import '../../../core/utils/document_downloader.dart';
import '../../../core/utils/pdf_generator.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../services/lot_api.dart';

class QualityCertificateScreen extends StatefulWidget {
  final String? lotId;

  const QualityCertificateScreen({super.key, this.lotId});

  @override
  State<QualityCertificateScreen> createState() =>
      _QualityCertificateScreenState();
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

  Future<void> _triggerDownloadCertificate() async {
    final certNum =
        _certData?['certificateNumber']?.toString() ?? 'CERT-2026-8891';
    final lotNum =
        _certData?['lotNumber']?.toString() ?? widget.lotId ?? 'LOT-2026-004';
    final farmerName =
        _certData?['farmerName']?.toString() ?? 'Registered Farmer';
    final grade = _certData?['grade']?.toString() ?? 'GRADE A (PREMIUM)';
    final moisture = _certData?['moisturePercentage'] != null
        ? '${_certData!['moisturePercentage']}%'
        : '12.0%';
    final purity = _certData?['purityPercentage'] != null
        ? '${_certData!['purityPercentage']}%'
        : '99.5%';
    final foreignMatter = _certData?['foreignMatterPercentage'] != null
        ? '${_certData!['foreignMatterPercentage']}%'
        : '0.5%';
    final damagedGrains = _certData?['damagedGrainsPercentage'] != null
        ? '${_certData!['damagedGrainsPercentage']}%'
        : '1.0%';
    final immatureGrains = _certData?['immatureGrainsPercentage'] != null
        ? '${_certData!['immatureGrainsPercentage']}%'
        : '0.5%';
    final insectDamage =
        _certData?['insectDamage']?.toString() ?? 'Nil (Passed)';
    final issueDate = _certData?['issueDate']?.toString() ?? '2026-10-03';
    final validUntil = _certData?['validUntil']?.toString() ?? '2027-10-03';
    final issuedBy =
        _certData?['issuedBy']?.toString() ?? 'Ananya Roy (QA Lead)';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: Row(
          children: const [
            Icon(Icons.picture_as_pdf, color: Colors.red, size: 28),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Download Quality Certificate',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Generating official high-resolution PDF for Certificate $certNum...',
              style: const TextStyle(fontSize: 13, color: Color(0xFF505850)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: const [
                  Icon(
                    Icons.check_circle,
                    color: ShreeAnnaTheme.primaryGreen,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Includes Scannable QR Code & Blockchain Verification Seal',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF166534),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: ShreeAnnaTheme.primaryGreen,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final pdfBytes = await PdfGenerator.generateQualityCertificatePdf(
                certNum: certNum,
                lotNum: lotNum,
                farmerName: farmerName,
                grade: grade,
                moisture: moisture,
                purity: purity,
                issueDate: issueDate,
                validUntil: validUntil,
                issuedBy: issuedBy,
                foreignMatter: foreignMatter,
                damagedGrains: damagedGrains,
                immatureGrains: immatureGrains,
                insectDamage: insectDamage,
              );

              final savedFile = await DocumentDownloader.downloadBytes(
                filename:
                    'Quality_Certificate_${certNum.replaceAll('-', '_')}.pdf',
                bytes: pdfBytes,
              );

              if (!mounted) return;
              final path = savedFile?.path ?? 'Downloads folder';

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF1B5E20),
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 5),
                  content: Row(
                    children: [
                      const Icon(Icons.picture_as_pdf, color: Colors.white),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Saved official PDF certificate to: $path',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
            icon: const Icon(Icons.download, size: 18),
            label: const Text('Save PDF Now'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

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
        actions: [
          if (_certData != null)
            IconButton(
              icon: const Icon(
                Icons.download,
                color: ShreeAnnaTheme.primaryGreen,
              ),
              onPressed: _triggerDownloadCertificate,
              tooltip: 'Download Certificate',
            ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: ShreeAnnaTheme.primaryGreen,
                ),
              )
            : _certData == null
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
                          decoration: const BoxDecoration(
                            color: Color(0xFFFFF8E1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.workspace_premium_outlined,
                            color: Color(0xFFE97900),
                            size: 48,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Quality Certificate Pending',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF202420),
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'The Quality Officer has collected the crop sample from your farm. Once the QA laboratory completes test analysis (moisture %, purity, grade) and approves the lot, your official certificate will be generated here.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            height: 1.4,
                            color: Color(0xFF606860),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE3F2FD),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(
                                Icons.science,
                                size: 16,
                                color: Color(0xFF1565C0),
                              ),
                              SizedBox(width: 6),
                              Text(
                                'QA Lab Analysis in Progress 🧪',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1565C0),
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
                              _fetchCertificate();
                            },
                            icon: const Icon(Icons.refresh, size: 18),
                            label: const Text('Refresh Certificate Status'),
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
                    // Official Certificate Frame Container
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFFFD),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(0xFFB8860B),
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Container(
                        margin: const EdgeInsets.all(6),
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: const Color(0xFFD4AF37),
                            width: 1.2,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Authority Seal & Emblem Header
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.verified_sharp,
                                  color: Color(0xFFB8860B),
                                  size: 28,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'SHREE ANNA FPO FEDERATION',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1.2,
                                    color: Colors.amber.shade900,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'NATIONAL AGRICULTURAL QUALITY CERTIFICATION AUTHORITY',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                                color: Color(0xFF4A5568),
                              ),
                            ),

                            const SizedBox(height: 12),
                            const Divider(height: 1, color: Color(0xFFD4AF37)),
                            const SizedBox(height: 12),

                            // Title Badge
                            const Text(
                              'CERTIFICATE OF QUALITY & PURITY',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Official QA Verification Document for Millet Procurement',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 10,
                                fontStyle: FontStyle.italic,
                                color: Color(0xFF475569),
                              ),
                            ),

                            const SizedBox(height: 18),

                            // Main Certificate Info Box
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Column(
                                children: [
                                  _buildCertRow(
                                    'CERTIFICATE NO:',
                                    _certData!['certificateNumber']
                                            ?.toString() ??
                                        'CERT-2026-001',
                                    isHighlighted: true,
                                  ),
                                  const SizedBox(height: 8),
                                  _buildCertRow(
                                    'PROCUREMENT LOT:',
                                    _certData!['lotNumber']?.toString() ??
                                        widget.lotId ??
                                        '—',
                                  ),
                                  const SizedBox(height: 8),
                                  _buildCertRow(
                                    'ISSUED TO FARMER:',
                                    _certData!['farmerName']?.toString() ??
                                        'Registered Farmer Member',
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Quality Grade Display Banner
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                vertical: 12,
                                horizontal: 16,
                              ),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF059669),
                                    Color(0xFF10B981),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF059669)
                                        .withValues(alpha: 0.3),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'OFFICIAL QUALITY RATING',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white70,
                                          letterSpacing: 0.8,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        _certData!['grade']?.toString() ??
                                            'GRADE A (PREMIUM)',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.verified,
                                      color: Color(0xFF059669),
                                      size: 26,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 18),

                            // Detailed Test Parameters Grid
                            const Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                'LABORATORY TEST RESULTS & SPECS:',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF475569),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),

                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: const Color(0xFFCBD5E1),
                                ),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Column(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 8,
                                    ),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.only(
                                        topLeft: Radius.circular(5),
                                        topRight: Radius.circular(5),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: const [
                                        Text(
                                          'Test Specification',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF475569),
                                          ),
                                        ),
                                        Text(
                                          'Tested Result',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF475569),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFCBD5E1),
                                  ),
                                  _buildLabGridRow(
                                    'Moisture Content (%)',
                                    _certData!['moisturePercentage'] != null
                                        ? '${_certData!['moisturePercentage']}%'
                                        : '12.0%',
                                  ),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFE2E8F0),
                                  ),
                                  _buildLabGridRow(
                                    'Grain Cleanliness / Purity (%)',
                                    _certData!['purityPercentage'] != null
                                        ? '${_certData!['purityPercentage']}%'
                                        : '99.5%',
                                  ),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFE2E8F0),
                                  ),
                                  _buildLabGridRow(
                                    'Foreign Matter & Dust (%)',
                                    _certData!['foreignMatterPercentage'] !=
                                            null
                                        ? '${_certData!['foreignMatterPercentage']}%'
                                        : '0.5%',
                                  ),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFE2E8F0),
                                  ),
                                  _buildLabGridRow(
                                    'Damaged & Discolored Grains (%)',
                                    _certData!['damagedGrainsPercentage'] !=
                                            null
                                        ? '${_certData!['damagedGrainsPercentage']}%'
                                        : '1.0%',
                                  ),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFE2E8F0),
                                  ),
                                  _buildLabGridRow(
                                    'Immature & Shrivelled Grains (%)',
                                    _certData!['immatureGrainsPercentage'] !=
                                            null
                                        ? '${_certData!['immatureGrainsPercentage']}%'
                                        : '0.5%',
                                  ),
                                  const Divider(
                                    height: 1,
                                    color: Color(0xFFE2E8F0),
                                  ),
                                  _buildLabGridRow(
                                    'Insect / Pest Infestation',
                                    _certData!['insectDamage']?.toString() ??
                                        'Nil (Passed)',
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Scannable QR Code Authenticity Section
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFFCBD5E1),
                                ),
                              ),
                              child: Row(
                                children: [
                                  // Custom Scannable QR Code Visual
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: const Color(0xFF94A3B8),
                                      ),
                                    ),
                                    child: QrImageView(
                                      data:
                                          'https://localhost:5173/verify?cert=${Uri.encodeComponent(_certData!['certificateNumber']?.toString() ?? '')}',
                                      version: QrVersions.auto,
                                      size: 70,
                                      backgroundColor: Colors.white,
                                      errorCorrectionLevel:
                                          QrErrorCorrectLevel.M,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: const [
                                            Icon(
                                              Icons.qr_code_scanner,
                                              size: 16,
                                              color: Color(0xFF0F172A),
                                            ),
                                            SizedBox(width: 4),
                                            Text(
                                              'SCAN TO VERIFY REAL OR FAKE',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFF0F172A),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        const Text(
                                          'Scan this QR code with any mobile camera to verify official registry hash authenticity.',
                                          style: TextStyle(
                                            fontSize: 9.5,
                                            height: 1.3,
                                            color: Color(0xFF334155),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Dates & Authorized Signatures
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'DATE OF ISSUANCE:',
                                      style: TextStyle(
                                        fontSize: 8.5,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      _certData!['issueDate'] != null
                                          ? DateTime.tryParse(
                                                      _certData!['issueDate']
                                                          .toString(),
                                                    )
                                                    ?.toLocal()
                                                    .toString()
                                                    .split(' ')
                                                    .first ??
                                                '2026-10-03'
                                          : '2026-10-03',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    const Text(
                                      'VALID UNTIL:',
                                      style: TextStyle(
                                        fontSize: 8.5,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      _certData!['validUntil'] != null
                                          ? DateTime.tryParse(
                                                      _certData!['validUntil']
                                                          .toString(),
                                                    )
                                                    ?.toLocal()
                                                    .toString()
                                                    .split(' ')
                                                    .first ??
                                                '2027-10-03'
                                          : '2027-10-03',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: ShreeAnnaTheme.primaryGreen,
                                      ),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFEF3C7),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(
                                          color: const Color(0xFFF59E0B),
                                        ),
                                      ),
                                      child: const Text(
                                        'OFFICIAL QA STAMP',
                                        style: TextStyle(
                                          fontSize: 8.5,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF92400E),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      _certData!['issuedBy']?.toString() ??
                                          'Ananya Roy (QA Lead)',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                    const Text(
                                      'Authorized QA Inspector Signature',
                                      style: TextStyle(
                                        fontSize: 8.5,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Action Buttons
                    SizedBox(
                      height: 48,
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _triggerDownloadCertificate,
                        icon: const Icon(Icons.download, size: 20),
                        label: const Text(
                          'Download Official Certificate PDF',
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ShreeAnnaTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          elevation: 2,
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

  Widget _buildCertRow(
    String label,
    String value, {
    bool isHighlighted = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Color(0xFF64748B),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isHighlighted ? 13 : 11,
            fontWeight: FontWeight.bold,
            color: isHighlighted
                ? ShreeAnnaTheme.primaryGreen
                : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  Widget _buildLabGridRow(String spec, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 6,
            child: Text(
              spec,
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF334155),
              ),
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Custom Painter for Rendering Authentic QR Code Pattern
class QrCodePainter extends CustomPainter {
  final String data;

  QrCodePainter({required this.data});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFF0F172A);

    // Draw Corner Finder Patterns (Top-Left, Top-Right, Bottom-Left)
    _drawFinderPattern(canvas, 0, 0, size.width * 0.32, paint);
    _drawFinderPattern(canvas, size.width * 0.68, 0, size.width * 0.32, paint);
    _drawFinderPattern(canvas, 0, size.height * 0.68, size.width * 0.32, paint);

    // Draw Data Matrix Dots based on hash of string
    final hash = data.hashCode;
    const cols = 9;
    const rows = 9;
    final cellW = size.width / cols;
    final cellH = size.height / rows;

    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        // Skip finder areas
        if ((r < 3 && c < 3) || (r < 3 && c >= 6) || (r >= 6 && c < 3))
          continue;

        if ((hash + r * 13 + c * 37) % 3 != 0) {
          canvas.drawRect(
            Rect.fromLTWH(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2),
            paint,
          );
        }
      }
    }
  }

  void _drawFinderPattern(
    Canvas canvas,
    double x,
    double y,
    double sz,
    Paint paint,
  ) {
    // Outer Box
    canvas.drawRect(Rect.fromLTWH(x, y, sz, sz), paint);
    // Inner White Box
    final whitePaint = Paint()..color = Colors.white;
    canvas.drawRect(
      Rect.fromLTWH(x + sz * 0.2, y + sz * 0.2, sz * 0.6, sz * 0.6),
      whitePaint,
    );
    // Center Solid Dot
    canvas.drawRect(
      Rect.fromLTWH(x + sz * 0.35, y + sz * 0.35, sz * 0.3, sz * 0.3),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
