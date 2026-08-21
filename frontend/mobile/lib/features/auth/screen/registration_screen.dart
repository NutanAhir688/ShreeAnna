import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  // ------------------------------------------------------------
  // FORM
  // ------------------------------------------------------------

  final _formKey = GlobalKey<FormState>();

  // ------------------------------------------------------------
  // CONTROLLERS
  // ------------------------------------------------------------

  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _addressController = TextEditingController();
  final _villageController = TextEditingController();
  final _districtController = TextEditingController();

  // ------------------------------------------------------------
  // DROPDOWN VALUE
  // ------------------------------------------------------------

  String? _selectedState;
  String? _selectedFpo;

  final List<String> _states = [
    'Gujarat',
    'Maharashtra',
    'Rajasthan',
    'Madhya Pradesh',
  ];

  final List<String> _fpos = [
    'Kisan Vikas FPO',
    'Green Valley FPO',
    'Shree Farmer FPO',
  ];

  // ------------------------------------------------------------
  // DISPOSE
  // ------------------------------------------------------------

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _addressController.dispose();
    _villageController.dispose();
    _districtController.dispose();

    super.dispose();
  }

  // ------------------------------------------------------------
  // REGISTER
  // ------------------------------------------------------------

  void _registerFarmer() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final farmerName = _nameController.text.trim();
    final mobile = _mobileController.text.trim();
    final address = _addressController.text.trim();
    final village = _villageController.text.trim();
    final district = _districtController.text.trim();
    final state = _selectedState!;
    final fpo = _selectedFpo!;

    debugPrint('Farmer Name: $farmerName');
    debugPrint('Mobile: $mobile');
    debugPrint('Address: $address');
    debugPrint('Village: $village');
    debugPrint('District: $district');
    debugPrint('State: $state');
    debugPrint('FPO: $fpo');

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Registration form is valid')));
  }

  // ------------------------------------------------------------
  // BUILD
  // ------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      // ----------------------------------------------------------
      // HEADER
      // ----------------------------------------------------------
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,

        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
          onPressed: () {
            Navigator.pop(context);
          },
        ),

        title: const Text(
          'ShreeAnna',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: ShreeAnnaTheme.primaryGreen,
          ),
        ),
      ),

      // ----------------------------------------------------------
      // BODY
      // ----------------------------------------------------------
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(26, 20, 26, 30),

          child: Form(
            key: _formKey,

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ------------------------------------------------
                // TITLE
                // ------------------------------------------------

                const Center(
                  child: Text(
                    'Farmer Registration',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF202420),
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                const Center(
                  child: Text(
                    'Enter your details to create an account.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: Color(0xFF596159)),
                  ),
                ),

                const SizedBox(height: 28),

                // ------------------------------------------------
                // FARMER NAME
                // ------------------------------------------------
                _buildLabel('Farmer Name'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: _inputDecoration(
                    hintText: 'John Doe',
                    icon: Icons.person_outline,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your name';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ------------------------------------------------
                // MOBILE NUMBER
                // ------------------------------------------------
                _buildLabel('Mobile No'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _mobileController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,

                  decoration: _inputDecoration(
                    hintText: '+91 (555) 000-0000',
                    icon: Icons.phone_outlined,
                  ).copyWith(counterText: ''),

                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter mobile number';
                    }

                    if (value.length != 10) {
                      return 'Enter a valid 10-digit number';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ------------------------------------------------
                // ADDRESS
                // ------------------------------------------------
                _buildLabel('Address'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _addressController,
                  maxLines: 1,
                  decoration: _inputDecoration(
                    hintText: '123 Farm Lane',
                    icon: Icons.location_on_outlined,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your address';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ------------------------------------------------
                // VILLAGE
                // ------------------------------------------------
                _buildLabel('Village'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _villageController,
                  textCapitalization: TextCapitalization.words,
                  decoration: _inputDecoration(
                    hintText: 'Oakridge',
                    icon: Icons.home_work_outlined,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your village';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ------------------------------------------------
                // DISTRICT
                // ------------------------------------------------
                _buildLabel('District'),

                const SizedBox(height: 7),

                TextFormField(
                  controller: _districtController,
                  textCapitalization: TextCapitalization.words,
                  decoration: _inputDecoration(
                    hintText: 'Central County',
                    icon: Icons.map_outlined,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your district';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ------------------------------------------------
                // STATE
                // ------------------------------------------------
                _buildLabel('State'),

                const SizedBox(height: 7),

                DropdownButtonFormField<String>(
                  initialValue: _selectedState,
                  decoration: _inputDecoration(
                    hintText: 'Select state',
                    icon: Icons.landscape_outlined,
                  ),
                  items: _states.map((state) {
                    return DropdownMenuItem(value: state, child: Text(state));
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedState = value;
                    });
                  },
                  validator: (value) {
                    if (value == null) {
                      return 'Please select your state';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ------------------------------------------------
                // FPO
                // ------------------------------------------------
                _buildLabel('Associated FPO'),

                const SizedBox(height: 7),

                DropdownButtonFormField<String>(
                  initialValue: _selectedFpo,
                  decoration: _inputDecoration(
                    hintText: 'Select FPO',
                    icon: Icons.business_outlined,
                  ),
                  items: _fpos.map((fpo) {
                    return DropdownMenuItem(value: fpo, child: Text(fpo));
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedFpo = value;
                    });
                  },
                  validator: (value) {
                    if (value == null) {
                      return 'Please select your FPO';
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 30),

                // ------------------------------------------------
                // REGISTER BUTTON
                // ------------------------------------------------
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _registerFarmer,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      foregroundColor: Colors.white,
                      elevation: 1,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    child: const Text(
                      'Register',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
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

  // ------------------------------------------------------------
  // LABEL HELPER
  // ------------------------------------------------------------

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: Color(0xFF303530),
      ),
    );
  }

  // ------------------------------------------------------------
  // INPUT DECORATION HELPER
  // ------------------------------------------------------------

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
}
