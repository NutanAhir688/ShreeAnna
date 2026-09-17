import 'dart:io';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart' show rootBundle, PlatformException;

import '../../../app/theme.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../farmers/services/farmer_api.dart';
import '../data/farm_api.dart';

class AddFarmScreen extends StatefulWidget {
  const AddFarmScreen({super.key});

  @override
  State<AddFarmScreen> createState() => _AddFarmScreenState();
}

class _AddFarmScreenState extends State<AddFarmScreen> {
  final FarmerApi _farmerApi = FarmerApi();
  final FarmApi _farmApi = FarmApi();

  final _nameController = TextEditingController();
  final _areaController = TextEditingController();

  // dropdown data
  List<String> _districts = [];
  List<String> _talukas = [];
  List<String> _villages = [];
  List<String> _surveyNumbers = [];

  String? _selectedDistrict;
  String? _selectedTaluka;
  String? _selectedVillage;
  String? _selectedSurveyNumber;
  String? _selectedMilletType;

  File? _photo;
  Position? _position;
  String _soilType = 'Black Soil';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadLandData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  Future<void> _loadLandData() async {
    try {
      final raw = await rootBundle.loadString(
        'assets/data/gujarat_land_records.json',
      );
      final data = json.decode(raw) as Map<String, dynamic>;
      final districts = (data['districts'] as List<dynamic>?) ?? [];

      _districts = districts
          .map<String>((d) => d['district_name'] as String)
          .toList();
      setState(() {});
    } catch (e) {
      // ignore
    }
  }

  Future<void> _populateTalukasForDistrict(String districtName) async {
    try {
      final raw = await rootBundle.loadString(
        'assets/data/gujarat_land_records.json',
      );
      final data = json.decode(raw) as Map<String, dynamic>;
      final districts = (data['districts'] as List<dynamic>?) ?? [];

      final match = districts.firstWhere(
        (d) => (d['district_name'] as String) == districtName,
        orElse: () => null,
      );
      if (match != null) {
        final talukas = (match['talukas'] as List<dynamic>?) ?? [];
        _talukas = talukas
            .map<String>((t) => t['taluka_name'] as String)
            .toList();
      } else {
        _talukas = [];
      }

      setState(() {});
    } catch (e) {
      // ignore
    }
  }

  Future<void> _populateVillagesForTaluka(
    String districtName,
    String talukaName,
  ) async {
    try {
      final raw = await rootBundle.loadString(
        'assets/data/gujarat_land_records.json',
      );
      final data = json.decode(raw) as Map<String, dynamic>;
      final districts = (data['districts'] as List<dynamic>?) ?? [];

      final match = districts.firstWhere(
        (d) => (d['district_name'] as String) == districtName,
        orElse: () => null,
      );
      if (match != null) {
        final talukas = (match['talukas'] as List<dynamic>?) ?? [];
        final tal = talukas.firstWhere(
          (t) => (t['taluka_name'] as String) == talukaName,
          orElse: () => null,
        );
        if (tal != null) {
          final villages = (tal['villages'] as List<dynamic>?) ?? [];
          _villages = villages
              .map<String>((v) => v['village_name'] as String)
              .toList();
        } else {
          _villages = [];
        }
      }

      setState(() {});
    } catch (e) {
      // ignore
    }
  }

  Future<void> _populateSurveysForVillage(
    String districtName,
    String talukaName,
    String villageName,
  ) async {
    try {
      final raw = await rootBundle.loadString(
        'assets/data/gujarat_land_records.json',
      );
      final data = json.decode(raw) as Map<String, dynamic>;
      final districts = (data['districts'] as List<dynamic>?) ?? [];

      final match = districts.firstWhere(
        (d) => (d['district_name'] as String) == districtName,
        orElse: () => null,
      );
      if (match != null) {
        final talukas = (match['talukas'] as List<dynamic>?) ?? [];
        final tal = talukas.firstWhere(
          (t) => (t['taluka_name'] as String) == talukaName,
          orElse: () => null,
        );
        if (tal != null) {
          final villages = (tal['villages'] as List<dynamic>?) ?? [];
          final vil = villages.firstWhere(
            (v) => (v['village_name'] as String) == villageName,
            orElse: () => null,
          );
          if (vil != null) {
            final surveys = (vil['survey_numbers'] as List<dynamic>?) ?? [];
            _surveyNumbers = surveys.map<String>((s) => s.toString()).toList();
          } else {
            _surveyNumbers = [];
          }
        }
      }

      setState(() {});
    } catch (e) {
      // ignore
    }
  }

  Future<void> _askLocationAndCapture() async {
    // Request location permission using geolocator
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location permission is required')),
      );
      return;
    }

    // Get current position
    final pos = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    setState(() {
      _position = pos;
    });

    // After acquiring location, ask user to take photo
    await _takePhoto();
  }

  Future<void> _takePhoto() async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );
      if (picked == null) return;

      setState(() {
        _photo = File(picked.path);
      });
    } on PlatformException catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Camera permission is required or camera is unavailable',
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Failed to open camera: $e')));
    }
  }

  Future<void> _save() async {
    if (_isLoading) return;

    var name = _nameController.text.trim();
    final areaText = _areaController.text.trim();
    var area = double.tryParse(areaText);

    if (name.isEmpty) {
      name = _selectedVillage != null
          ? 'Farm - $_selectedVillage'
          : (_selectedDistrict != null ? 'Farm - $_selectedDistrict' : 'My Farm');
    }

    if (area == null || area <= 0) {
      area = 1.0;
    }

    if (_selectedDistrict == null ||
        _selectedTaluka == null ||
        _selectedVillage == null ||
        _selectedSurveyNumber == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Please select district, taluka, village, and survey number',
          ),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final farmer = await _farmerApi.getMe();
      String imageUrl = '';

      if (_photo != null) {
        imageUrl = await _farmApi.uploadImage(_photo!);
      }

      await _farmApi.createFarm(
        farmerId: farmer.id,
        farmName: name,
        areaInAcres: area,
        soilType: _soilType,
        milletType: _selectedMilletType ?? 'Pearl Millet',
        surveyNumber: _selectedSurveyNumber!,
        district: _selectedDistrict!,
        taluka: _selectedTaluka!,
        village: _selectedVillage!,
        latitude: _position?.latitude ?? 0.0,
        longitude: _position?.longitude ?? 0.0,
        imageUrl: imageUrl,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Farm added successfully!')),
      );

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add farm: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
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
        title: Text(
          l10n.addFarmTitle,
          style: const TextStyle(color: ShreeAnnaTheme.primaryGreen),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.addFarmTitle,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(labelText: l10n.farmName),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _areaController,
                decoration: InputDecoration(
                  labelText: l10n.area,
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),

              // Soil Type
              DropdownButtonFormField<String>(
                initialValue: _soilType,
                decoration: InputDecoration(labelText: l10n.soilType),
                items: const [
                  DropdownMenuItem(
                    value: 'Black Soil',
                    child: Text('Black Soil'),
                  ),
                  DropdownMenuItem(value: 'Red Soil', child: Text('Red Soil')),
                  DropdownMenuItem(
                    value: 'Alluvial Soil',
                    child: Text('Alluvial Soil'),
                  ),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _soilType = v);
                },
              ),

              const SizedBox(height: 12),

              const SizedBox(height: 12),

              // Millet Type
              DropdownButtonFormField<String>(
                initialValue: _selectedMilletType,
                decoration: InputDecoration(labelText: l10n.milletType),
                items: [
                  DropdownMenuItem(
                    value: 'Sorghum',
                    child: Text(l10n.milletSorghum),
                  ),
                  DropdownMenuItem(
                    value: 'Pearl Millet',
                    child: Text(l10n.milletPearl),
                  ),
                  DropdownMenuItem(
                    value: 'Finger Millet',
                    child: Text(l10n.milletFinger),
                  ),
                  DropdownMenuItem(
                    value: 'Foxtail Millet',
                    child: Text(l10n.milletFoxtail),
                  ),
                  DropdownMenuItem(
                    value: 'Little Millet',
                    child: Text(l10n.milletLittle),
                  ),
                  DropdownMenuItem(
                    value: 'Kodo Millet',
                    child: Text(l10n.milletKodo),
                  ),
                  DropdownMenuItem(
                    value: 'Barnyard Millet',
                    child: Text(l10n.milletBarnyard),
                  ),
                  DropdownMenuItem(
                    value: 'Proso Millet',
                    child: Text(l10n.milletProso),
                  ),
                  DropdownMenuItem(
                    value: 'Browntop Millet',
                    child: Text(l10n.milletBrowntop),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedMilletType = value;
                  });
                },
              ),
              const SizedBox(height: 12),

              DropdownButtonFormField<String>(
                initialValue: _selectedDistrict,
                decoration: InputDecoration(labelText: l10n.district),
                items: _districts
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (v) async {
                  if (v == null) return;
                  setState(() {
                    _selectedDistrict = v;
                    _selectedTaluka = null;
                    _selectedVillage = null;
                    _selectedSurveyNumber = null;
                    _talukas = [];
                    _villages = [];
                    _surveyNumbers = [];
                  });

                  await _populateTalukasForDistrict(v);
                },
              ),

              const SizedBox(height: 8),

              DropdownButtonFormField<String>(
                value: _selectedTaluka,
                decoration: InputDecoration(labelText: l10n.taluka),
                items: _talukas
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) async {
                  if (v == null) return;
                  setState(() {
                    _selectedTaluka = v;
                    _selectedVillage = null;
                    _selectedSurveyNumber = null;
                    _villages = [];
                    _surveyNumbers = [];
                  });

                  if (_selectedDistrict != null) {
                    await _populateVillagesForTaluka(_selectedDistrict!, v);
                  }
                },
              ),

              const SizedBox(height: 8),

              DropdownButtonFormField<String>(
                value: _selectedVillage,
                decoration: InputDecoration(labelText: l10n.village),
                items: _villages
                    .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                    .toList(),
                onChanged: (v) async {
                  if (v == null) return;
                  setState(() {
                    _selectedVillage = v;
                    _selectedSurveyNumber = null;
                    _surveyNumbers = [];
                  });

                  if (_selectedDistrict != null && _selectedTaluka != null) {
                    await _populateSurveysForVillage(
                      _selectedDistrict!,
                      _selectedTaluka!,
                      v,
                    );
                  }
                },
              ),

              const SizedBox(height: 8),

              DropdownButtonFormField<String>(
                value: _selectedSurveyNumber,
                decoration: const InputDecoration(labelText: 'Survey Number'),
                items: _surveyNumbers
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (v) {
                  setState(() => _selectedSurveyNumber = v);
                },
              ),

              const SizedBox(height: 12),

              // const Text(
              //   'Farm Status',
              //   style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              // ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F8EF),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFD5E3C9)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen.withValues(
                          alpha: 0.12,
                        ),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.hourglass_top,
                        color: ShreeAnnaTheme.primaryGreen,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Cross Verfication will be done using AnyRoR Website',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: ShreeAnnaTheme.primaryGreen,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'The FPO will verify your land details using your survey number.',
                            style: TextStyle(
                              fontSize: 12,
                              height: 1.35,
                              color: Color(0xFF687068),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: _askLocationAndCapture,
                icon: const Icon(Icons.location_on),
                label: const Text('Enable location and take farm photo'),
              ),
              const SizedBox(height: 8),
              if (_position != null)
                Text(
                  'Location: ${_position!.latitude.toStringAsFixed(6)}, ${_position!.longitude.toStringAsFixed(6)}',
                ),
              const SizedBox(height: 8),
              if (_photo != null)
                Image.file(
                  _photo!,
                  width: double.infinity,
                  height: 220,
                  fit: BoxFit.cover,
                ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(l10n.cancel),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _save,
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(l10n.save),
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
