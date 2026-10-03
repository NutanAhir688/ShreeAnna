import 'package:flutter/material.dart';

import '../../../l10n/generated/app_localizations.dart';
import '../services/lot_api.dart';

class RejectAgreementDialog extends StatefulWidget {
  final String lotId;

  const RejectAgreementDialog({
    super.key,
    required this.lotId,
  });

  @override
  State<RejectAgreementDialog> createState() => _RejectAgreementDialogState();
}

class _RejectAgreementDialogState extends State<RejectAgreementDialog> {
  final LotApi _lotApi = LotApi();

  String? _selectedReason = 'Price is not acceptable';
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitRejection() async {
    if (_selectedReason == null || _selectedReason!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a reason for rejection.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final comment = _commentController.text.trim();
      await _lotApi.rejectAgreement(
        widget.lotId,
        reason: _selectedReason!,
        comment: comment,
      );

      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to reject agreement: ${e.toString().replaceFirst('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.rejectAgreement,
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),

            const SizedBox(height: 4),

            const Text(
              'Why are you rejecting this procurement agreement?',
              style: TextStyle(fontSize: 12, color: Color(0xFF707870)),
            ),

            const SizedBox(height: 8),

            _radioTile('Price is not acceptable', 'Price is not acceptable'),
            _radioTile('Quantity is not acceptable', 'Quantity is not acceptable'),
            _radioTile('Pickup charges too high', 'Pickup charges too high'),
            _radioTile('Other reason', 'Other reason'),

            const SizedBox(height: 8),

            TextField(
              controller: _commentController,
              enabled: !_isSubmitting,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Provide additional details for FPO officer...',
                hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),

            const SizedBox(height: 14),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(l10n.cancel.toUpperCase()),
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitRejection,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(l10n.rejectAgreement.toUpperCase()),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _radioTile(String label, String value) {
    return RadioListTile<String>(
      dense: true,
      contentPadding: EdgeInsets.zero,
      title: Text(label, style: const TextStyle(fontSize: 13)),
      value: value,
      groupValue: _selectedReason,
      onChanged: _isSubmitting
          ? null
          : (v) {
              setState(() {
                _selectedReason = v;
              });
            },
    );
  }
}
