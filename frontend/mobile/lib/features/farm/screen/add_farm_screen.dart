import 'dart:io';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart' show rootBundle, PlatformException;

import '../../../app/theme.dart';

class AddFarmScreen extends StatefulWidget {
  const AddFarmScreen({super.key});

  @override
  State<AddFarmScreen> createState() => _AddFarmScreenState();
}

class _AddFarmScreenState extends State<AddFarmScreen> {
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

  File? _photo;
  Position? _position;
  String _soilType = 'Black Soil';
  bool _isActive = true;

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

  void _save() {
    final lat = _position?.latitude;
    final lng = _position?.longitude;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Saved ${_nameController.text} area:${_areaController.text} soil:$_soilType district:${_selectedDistrict ?? ''} taluka:${_selectedTaluka ?? ''} village:${_selectedVillage ?? ''} survey:${_selectedSurveyNumber ?? ''} status:${_isActive ? 'Active' : 'Inactive'} lat:$lat lng:$lng photo:${_photo != null}',
        ),
      ),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        title: const Text(
          'Add New Farm',
          style: TextStyle(color: ShreeAnnaTheme.primaryGreen),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Create Farm',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Farm Name'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _areaController,
                decoration: const InputDecoration(
                  labelText: 'Total Area (Acres)',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),

              // Soil Type
              DropdownButtonFormField<String>(
                value: _soilType,
                decoration: const InputDecoration(labelText: 'Soil Type'),
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

              DropdownButtonFormField<String>(
                value: _selectedDistrict,
                decoration: const InputDecoration(labelText: 'District'),
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
                decoration: const InputDecoration(labelText: 'Taluka'),
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

                  if (_selectedDistrict != null)
                    await _populateVillagesForTaluka(_selectedDistrict!, v);
                },
              ),

              const SizedBox(height: 8),

              DropdownButtonFormField<String>(
                value: _selectedVillage,
                decoration: const InputDecoration(labelText: 'Village'),
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

                  if (_selectedDistrict != null && _selectedTaluka != null)
                    await _populateSurveysForVillage(
                      _selectedDistrict!,
                      _selectedTaluka!,
                      v,
                    );
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

              const Text(
                'Farm Status',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  Switch(
                    value: _isActive,
                    onChanged: (v) => setState(() => _isActive = v),
                    activeColor: ShreeAnnaTheme.primaryGreen,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isActive ? 'Active' : 'Inactive',
                    style: TextStyle(
                      color: _isActive
                          ? ShreeAnnaTheme.primaryGreen
                          : Colors.grey,
                    ),
                  ),
                ],
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
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _save,
                      child: const Text('Save'),
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
