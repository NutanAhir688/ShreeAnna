import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../farm/data/farm_api.dart';
import '../../farm/model/farm.dart';
import '../../farmers/services/farmer_api.dart';
import '../services/lot_api.dart';

class SellMilletScreen extends StatefulWidget {
  const SellMilletScreen({super.key});

  @override
  State<SellMilletScreen> createState() => _SellMilletScreenState();
}

class _SellMilletScreenState extends State<SellMilletScreen> {
  final _formKey = GlobalKey<FormState>();

  final _quantityController = TextEditingController();
  final _descriptionController = TextEditingController();

  final FarmApi _farmApi = FarmApi();
  final FarmerApi _farmerApi = FarmerApi();
  final LotApi _lotApi = LotApi();

  bool _isLoadingFarms = true;
  bool _isSubmitting = false;

  String? _farmerId;
  List<Farm> _farms = [];
  Farm? _selectedFarmObj;
  String? _selectedMillet;

  DateTime? _harvestDate;

  final List<String> _milletTypes = [
    'Pearl Millet (Bajra)',
    'Finger Millet (Ragi)',
    'Foxtail Millet',
    'Sorghum (Jowar)',
    'Kodo Millet',
    'Little Millet',
    'Barnyard Millet',
  ];

  @override
  void initState() {
    super.initState();
    _loadFarms();
  }

  Future<void> _loadFarms() async {
    try {
      final farmer = await _farmerApi.getMe();
      _farmerId = farmer.id;
      final farms = await _farmApi.getMyFarms(farmer.id);
      setState(() {
        _farms = farms;
        _isLoadingFarms = false;
        if (farms.isNotEmpty) {
          _selectedFarmObj = farms.first;
        }
      });
    } catch (e) {
      setState(() {
        _isLoadingFarms = false;
      });
      debugPrint('Error loading farms: $e');
    }
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectHarvestDate() async {
    final now = DateTime.now();

    final pickedDate = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(now.year - 2),
      lastDate: now,
    );

    if (pickedDate == null) return;

    setState(() {
      _harvestDate = pickedDate;
    });
  }

  Future<void> _submitLot() async {
    final l10n = AppLocalizations.of(context)!;

    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_harvestDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.pleaseSelectHarvestDate)),
      );
      return;
    }

    if (_selectedFarmObj == null || _farmerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a valid farm.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final quantityStr = _quantityController.text.trim();
      final quantityKg = double.parse(quantityStr);
      final description = _descriptionController.text.trim();

      await _lotApi.createLot(
        farmerId: _farmerId!,
        farmId: _selectedFarmObj!.id,
        milletType: _selectedMillet!,
        estimatedQuantityKg: quantityKg,
        harvestDate: _harvestDate!,
        description: description,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.lotSubmittedSuccessfully)),
      );

      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit lot: ${e.toString().replaceFirst('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

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

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(26, 18, 26, 30),

          child: Form(
            key: _formKey,

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.sellMilletSubtitle,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF687068)),
                ),

                const SizedBox(height: 24),

                // ------------------------------------------------
                // FARM SELECTOR
                // ------------------------------------------------
                _buildLabel(l10n.selectFarm),

                const SizedBox(height: 7),

                if (_isLoadingFarms)
                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen),
                  )
                else if (_farms.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.amber),
                      borderRadius: BorderRadius.circular(4),
                      color: Colors.amber.shade50,
                    ),
                    child: const Text(
                      'No registered farms found. Please add a farm first before submitting a lot.',
                      style: TextStyle(fontSize: 12, color: Colors.black87),
                    ),
                  )
                else
                  DropdownButtonFormField<Farm>(
                    initialValue: _selectedFarmObj,
                    decoration: _inputDecoration(
                      hintText: l10n.chooseFarm,
                      icon: Icons.agriculture_outlined,
                    ),
                    items: _farms.map((farm) {
                      return DropdownMenuItem<Farm>(
                        value: farm,
                        child: Text(farm.farmName),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedFarmObj = value;
                      });
                    },
                    validator: (value) {
                      if (value == null) {
                        return l10n.pleaseSelectFarm;
                      }
                      return null;
                    },
                  ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // MILLET TYPE
                // ------------------------------------------------
                _buildLabel(l10n.milletType),

                const SizedBox(height: 7),

                DropdownButtonFormField<String>(
                  initialValue: _selectedMillet,
                  decoration: _inputDecoration(
                    hintText: l10n.chooseMilletType,
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
                      return l10n.pleaseSelectMilletType;
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // QUANTITY
                // ------------------------------------------------
                _buildLabel(l10n.quantityKg),

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
                      return l10n.pleaseEnterQuantity;
                    }

                    final quantity = double.tryParse(value);

                    if (quantity == null || quantity <= 0) {
                      return l10n.enterValidQuantity;
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 18),

                // ------------------------------------------------
                // HARVEST DATE
                // ------------------------------------------------
                _buildLabel(l10n.harvestDate),

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
                _buildLabel(l10n.descriptionOptional),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _descriptionController,
                  maxLines: 4,
                  decoration: _inputDecoration(
                    hintText: l10n.descriptionHint,
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
                    onPressed: _isSubmitting ? null : () => _showSubmitLotConfirmation(context),
                    icon: _isSubmitting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.lock_outline, size: 16),
                    label: Text(
                      l10n.submitLot,
                      style: const TextStyle(
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

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();

    return '$day/$month/$year';
  }

  void _showSubmitLotConfirmation(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(l10n.confirmSubmission),

          content: Text(l10n.confirmSubmitMessage),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text(l10n.cancel),
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
              child: Text(l10n.submit),
            ),
          ],
        );
      },
    );
  }
}
