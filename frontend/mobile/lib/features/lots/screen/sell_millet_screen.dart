import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class SellMilletScreen extends StatefulWidget {
  const SellMilletScreen({super.key});

  @override
  State<SellMilletScreen> createState() => _SellMilletScreenState();
}

class _SellMilletScreenState extends State<SellMilletScreen> {
  // ============================================================
  // FORM
  // ============================================================

  final _formKey = GlobalKey<FormState>();

  // ============================================================
  // CONTROLLERS
  // ============================================================

  final _quantityController = TextEditingController();
  final _descriptionController = TextEditingController();

  // ============================================================
  // DROPDOWN VALUES
  // ============================================================

  String? _selectedFarm;
  String? _selectedMillet;

  DateTime? _harvestDate;

  final List<String> _farms = ['Green Hill Farm', 'North Farm'];

  final List<String> _milletTypes = [
    'Pearl Millet (Bajra)',
    'Finger Millet (Ragi)',
    'Foxtail Millet',
    'Sorghum (Jowar)',
  ];

  // ============================================================
  // DISPOSE
  // ============================================================

  @override
  void dispose() {
    _quantityController.dispose();
    _descriptionController.dispose();

    super.dispose();
  }

  // ============================================================
  // DATE PICKER
  // ============================================================

  Future<void> _selectHarvestDate() async {
    final now = DateTime.now();

    final pickedDate = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(now.year - 2),
      lastDate: now,
    );

    if (pickedDate == null) {
      return;
    }

    setState(() {
      _harvestDate = pickedDate;
    });
  }

  // ============================================================
  // SUBMIT LOT
  // ============================================================

  void _submitLot() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_harvestDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select the harvest date')),
      );

      return;
    }

    final farm = _selectedFarm!;
    final millet = _selectedMillet!;
    final quantity = _quantityController.text.trim();
    final description = _descriptionController.text.trim();

    debugPrint('Farm: $farm');
    debugPrint('Millet: $millet');
    debugPrint('Quantity: $quantity kg');
    debugPrint('Harvest Date: $_harvestDate');
    debugPrint('Description: $description');

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Lot submitted successfully')));
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      // ========================================================
      // APP BAR
      // ========================================================
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,

        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),

        title: const Text(
          'ShreeAnna',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // ========================================================
      // BODY
      // ========================================================
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(26, 18, 26, 30),

          child: Form(
            key: _formKey,

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ------------------------------------------------
                // INTRO
                // ------------------------------------------------

                const Text(
                  'This information will be submitted to your FPO for quality inspection.',
                  style: TextStyle(fontSize: 11, color: Color(0xFF687068)),
                ),

                const SizedBox(height: 24),

                // ------------------------------------------------
                // FARM
                // ------------------------------------------------
                _buildLabel('Select Farm'),

                const SizedBox(height: 7),

                DropdownButtonFormField<String>(
                  initialValue: _selectedFarm,
                  decoration: _inputDecoration(
                    hintText: 'Choose a farm...',
                    icon: Icons.agriculture_outlined,
                  ),
                  items: _farms.map((farm) {
                    return DropdownMenuItem(value: farm, child: Text(farm));
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedFarm = value;
                    });
                  },
                  validator: (value) {
                    if (value == null) {
                      return 'Please select a farm';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // MILLET TYPE
                // ------------------------------------------------
                _buildLabel('Millet Type'),

                const SizedBox(height: 7),

                DropdownButtonFormField<String>(
                  initialValue: _selectedMillet,
                  decoration: _inputDecoration(
                    hintText: 'Choose millet type...',
                    icon: Icons.grass_outlined,
                  ),
                  items: _milletTypes.map((millet) {
                    return DropdownMenuItem(value: millet, child: Text(millet));
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedMillet = value;
                    });
                  },
                  validator: (value) {
                    if (value == null) {
                      return 'Please select millet type';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // QUANTITY
                // ------------------------------------------------
                _buildLabel('Estimated Quantity (kg)'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _quantityController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: _inputDecoration(
                    hintText: 'e.g. 500',
                    icon: Icons.scale_outlined,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter estimated quantity';
                    }

                    final quantity = double.tryParse(value);

                    if (quantity == null || quantity <= 0) {
                      return 'Enter a valid quantity';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // HARVEST DATE
                // ------------------------------------------------
                _buildLabel('Harvest Date'),

                const SizedBox(height: 7),

                InkWell(
                  onTap: _selectHarvestDate,
                  borderRadius: BorderRadius.circular(2),
                  child: InputDecorator(
                    decoration: _inputDecoration(
                      hintText: 'dd/mm/yyyy',
                      icon: Icons.calendar_today_outlined,
                    ),
                    child: Text(
                      _harvestDate == null
                          ? 'dd/mm/yyyy'
                          : _formatDate(_harvestDate!),
                      style: TextStyle(
                        fontSize: 13,
                        color: _harvestDate == null
                            ? const Color(0xFF9A9F9A)
                            : const Color(0xFF303530),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // DESCRIPTION
                // ------------------------------------------------
                _buildLabel('Description (Optional)'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _descriptionController,
                  maxLines: 4,
                  decoration: _inputDecoration(
                    hintText: 'Add any specific details about this lot...',
                    icon: Icons.notes_outlined,
                  ),
                ),

                const SizedBox(height: 28),

                // ------------------------------------------------
                // SUBMIT
                // ------------------------------------------------
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: () => _showSubmitLotConfirmation(context),
                    icon: const Icon(Icons.lock_outline, size: 16),
                    label: const Text(
                      'SUBMIT LOT',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      foregroundColor: Colors.white,
                      elevation: 1,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ============================================================
  // LABEL
  // ============================================================

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: Color(0xFF303530),
      ),
    );
  }

  // ============================================================
  // INPUT DECORATION
  // ============================================================

  InputDecoration _inputDecoration({
    required String hintText,
    required IconData icon,
  }) {
    return InputDecoration(
      hintText: hintText,

      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9A9F9A)),

      prefixIcon: Icon(icon, size: 19, color: const Color(0xFF596159)),

      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),

      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(2),
        borderSide: const BorderSide(color: Color(0xFF7E877E)),
      ),

      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(2),
        borderSide: const BorderSide(color: Color(0xFF7E877E)),
      ),

      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(2),
        borderSide: const BorderSide(
          color: ShreeAnnaTheme.primaryGreen,
          width: 1.5,
        ),
      ),

      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(2),
        borderSide: const BorderSide(color: Colors.red),
      ),

      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(2),
        borderSide: const BorderSide(color: Colors.red, width: 1.5),
      ),
    );
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();

    return '$day/$month/$year';
  }

  void _showSubmitLotConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Confirm Submission'),

          content: const Text(
            'Are you sure you want to submit this lot for quality inspection?',
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);

                _submitLot();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: ShreeAnnaTheme.primaryGreen,
                foregroundColor: Colors.white,
              ),
              child: const Text('Submit'),
            ),
          ],
        );
      },
    );
  }
}
