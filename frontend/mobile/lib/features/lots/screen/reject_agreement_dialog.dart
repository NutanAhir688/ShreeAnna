import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class RejectAgreementDialog extends StatefulWidget {
  const RejectAgreementDialog({super.key});

  @override
  State<RejectAgreementDialog> createState() => _RejectAgreementDialogState();
}

class _RejectAgreementDialogState extends State<RejectAgreementDialog> {
  String? _selectedReason;
  final TextEditingController _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Reject Agreement',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),

            const SizedBox(height: 6),

            const Text(
              'Why are you rejecting?',
              style: TextStyle(fontSize: 12, color: Color(0xFF707870)),
            ),

            const SizedBox(height: 8),

            _radioTile('Price is not acceptable', 'price'),
            _radioTile('Quantity is not acceptable', 'quantity'),
            _radioTile('Pickup charges', 'pickup'),
            _radioTile('Other', 'other'),

            const SizedBox(height: 8),

            TextField(
              controller: _commentController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Provide more details...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Text('CANCEL'),
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: ElevatedButton(
                    onPressed: _submitRejection,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Text('SUBMIT REJECTION'),
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
      contentPadding: EdgeInsets.zero,
      title: Text(label, style: const TextStyle(fontSize: 13)),
      value: value,
      groupValue: _selectedReason,
      onChanged: (v) {
        setState(() {
          _selectedReason = v;
        });
      },
    );
  }

  void _submitRejection() {
    // For now, just close and show a snack. Hook API here later.
    Navigator.pop(context);
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Rejection submitted')));
  }
}
