import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';
import '../../../app/theme.dart';
import '../../../core/network/api_config.dart';
import '../../../core/storage/token_storage.dart';
import '../models/driver_dispatch_model.dart';
import '../services/driver_api.dart';
import '../services/driver_location_publisher.dart';
import '../../auth/screen/welcome_screen.dart';
import 'driver_profile_screen.dart';
import 'driver_fullscreen_map_screen.dart';
import '../../lots/screen/driver_chat_screen.dart';

class DriverJourneyScreen extends StatefulWidget {
  final String? initialDriverPhone;

  const DriverJourneyScreen({super.key, this.initialDriverPhone});

  @override
  State<DriverJourneyScreen> createState() => _DriverJourneyScreenState();
}

class _DriverJourneyScreenState extends State<DriverJourneyScreen> {
  final DriverApi _driverApi = DriverApi();

  List<RegisteredDriver> _drivers = [];
  RegisteredDriver? _selectedDriver;
  DriverDispatchModel? _activeDispatch;

  List<DriverDispatchModel> _activeDispatches = [];
  List<DriverDispatchModel> _historyDispatches = [];

  List<Map<String, dynamic>> _assignedCustomerOrders = [];
  List<Map<String, dynamic>> _historyCustomerOrders = [];

  int _selectedTab = 0; // 0: Assigned & Active, 1: Delivery History

  DriverLocationPublisher? _locationPublisher;
  bool _isTracking = false;
  bool _isStartingTracking = false;

  bool _isLoading = true;
  bool _isVerifying = false;
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _orderOtpController = TextEditingController();
  bool _isVerifyingOrderOtp = false;

  @override
  void initState() {
    super.initState();
    _loadDriverData();
  }

  @override
  void dispose() {
    _locationPublisher?.dispose();
    _otpController.dispose();
    _orderOtpController.dispose();
    super.dispose();
  }

  Future<void> _loadDriverData() async {
    setState(() => _isLoading = true);
    try {
      final driversList = await _driverApi.getDrivers();
      RegisteredDriver? selected;

      if (driversList.isNotEmpty) {
        selected = driversList.firstWhere(
          (d) => d.phone == widget.initialDriverPhone,
          orElse: () => driversList.first,
        );
      }

      final phoneToQuery = selected?.phone ?? widget.initialDriverPhone ?? '9876543210';
      final dispatches = await _driverApi.getDriverJourneys(phoneToQuery);

      // Separate dispatches into active and history
      final activeList = dispatches.where((d) {
        final s = d.status.toUpperCase();
        return s == 'IN_TRANSIT' || s == 'VEHICLE_ASSIGNED' || s == 'SCHEDULED';
      }).toList();

      final historyList = dispatches.where((d) {
        final s = d.status.toUpperCase();
        return s == 'DELIVERED' || s == 'COMPLETED' || s == 'ABORTED';
      }).toList();

      // Only assign active dispatch if activeList has one; strictly null if all are completed
      DriverDispatchModel? active;
      if (activeList.isNotEmpty) {
        try {
          active = activeList.firstWhere((d) => d.status.toUpperCase() == 'IN_TRANSIT');
        } catch (_) {
          active = activeList.first;
        }
      } else {
        active = null;
      }

      // Fetch customer orders
      final allOrders = await _driverApi.getCustomerOrders();

      List<Map<String, dynamic>> driverAssignedOrders = [];
      if (selected != null) {
        driverAssignedOrders = allOrders.where((o) {
          final s = (o['status'] ?? '').toString().toUpperCase();
          if (s == 'DELIVERED' || s == 'COMPLETED' || s == 'CANCELLED') return false;
          final orderDriverPhone = (o['driverPhone'] ?? '').toString();
          final orderDriverId = (o['assignedDriverId'] ?? '').toString();
          return (orderDriverPhone.isNotEmpty && orderDriverPhone == selected!.phone) ||
                 (orderDriverId.isNotEmpty && orderDriverId == selected!.id);
        }).toList();
      }

      final effectiveAssignedOrders = driverAssignedOrders.isNotEmpty
          ? driverAssignedOrders
          : allOrders.where((o) {
              final s = (o['status'] ?? '').toString().toUpperCase();
              return s != 'DELIVERED' && s != 'COMPLETED' && s != 'CANCELLED';
            }).toList();

      List<Map<String, dynamic>> driverHistoryOrders = [];
      if (selected != null) {
        driverHistoryOrders = allOrders.where((o) {
          final s = (o['status'] ?? '').toString().toUpperCase();
          if (s != 'DELIVERED' && s != 'COMPLETED') return false;
          final orderDriverPhone = (o['driverPhone'] ?? '').toString();
          final orderDriverId = (o['assignedDriverId'] ?? '').toString();
          return (orderDriverPhone.isNotEmpty && orderDriverPhone == selected!.phone) ||
                 (orderDriverId.isNotEmpty && orderDriverId == selected!.id);
        }).toList();
      }

      final effectiveHistoryOrders = driverHistoryOrders.isNotEmpty
          ? driverHistoryOrders
          : allOrders.where((o) {
              final s = (o['status'] ?? '').toString().toUpperCase();
              return s == 'DELIVERED' || s == 'COMPLETED';
            }).toList();

      if (mounted) {
        setState(() {
          _drivers = driversList;
          _selectedDriver = selected;
          _activeDispatch = active;
          _activeDispatches = activeList;
          _historyDispatches = historyList;
          _assignedCustomerOrders = effectiveAssignedOrders;
          _historyCustomerOrders = effectiveHistoryOrders;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading driver journey: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _startTracking() async {
    if (_activeDispatch == null) return;
    setState(() => _isStartingTracking = true);
    try {
      final token = await TokenStorage().getAccessToken() ?? '';
      final lotId = _activeDispatch!.lotId;

      await _locationPublisher?.stop();
      _locationPublisher = DriverLocationPublisher(
        apiBaseUrl: ApiConfig.baseUrl,
        lotId: lotId,
        accessToken: token,
      );

      await _locationPublisher!.start();
      if (mounted) {
        setState(() {
          _isTracking = true;
          _isStartingTracking = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF087F23),
            content: Text('Live GPS tracking started! Location is broadcasting to farmer & warehouse.'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isStartingTracking = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red,
            content: Text(e.toString().replaceFirst('Exception: ', '')),
          ),
        );
      }
    }
  }

  Future<void> _stopTracking() async {
    if (_locationPublisher != null) {
      await _locationPublisher!.stop();
    }
    if (mounted) {
      setState(() => _isTracking = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Live GPS tracking stopped.'),
        ),
      );
    }
  }

  Future<void> _openGoogleMapsForJourney() async {
    if (_activeDispatch == null) return;

    final statusUpper = _activeDispatch!.status.toUpperCase();
    final isInTransit = statusUpper == 'IN_TRANSIT' || statusUpper == 'DELIVERED';

    final lat = isInTransit ? _activeDispatch!.destinationLatitude : _activeDispatch!.pickupLatitude;
    final lng = isInTransit ? _activeDispatch!.destinationLongitude : _activeDispatch!.pickupLongitude;
    final address = isInTransit ? _activeDispatch!.destinationAddress : _activeDispatch!.sourceAddress;

    final hasCoords = lat != null && lng != null && lat != 0 && lng != 0;

    // Check device's current location to determine if we are in local India or emulator (USA)
    Position? currentPos;
    try {
      currentPos = await Geolocator.getLastKnownPosition();
    } catch (_) {}

    // India bounding box approx: lat 8.0 - 37.0, lng 68.0 - 97.5
    final bool isDeviceInIndia = currentPos != null &&
        currentPos.latitude >= 8.0 && currentPos.latitude <= 37.0 &&
        currentPos.longitude >= 68.0 && currentPos.longitude <= 97.5;

    String urlString;
    if (hasCoords) {
      if (isDeviceInIndia) {
        // Real device physically in India: Google Maps uses device live location
        urlString = 'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving';
      } else {
        // Emulator or foreign GPS location (e.g. California):
        // Provide the dispatch route's origin in Gujarat so Google Maps doesn't fail across oceans with "Can't seem to find a way there"
        final originLat = isInTransit
            ? (_activeDispatch!.pickupLatitude ?? (lat - 0.05))
            : (lat + 0.045);
        final originLng = isInTransit
            ? (_activeDispatch!.pickupLongitude ?? (lng - 0.05))
            : (lng - 0.055);
        urlString = 'https://www.google.com/maps/dir/?api=1&origin=$originLat,$originLng&destination=$lat,$lng&travelmode=driving';
      }
    } else {
      urlString = 'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(address)}&travelmode=driving';
    }

    final Uri uri = Uri.parse(urlString);

    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      debugPrint('Error opening Google Maps: $e');
      // Fallback: search pin mode
      try {
        final fallbackUri = Uri.parse(hasCoords
            ? 'https://www.google.com/maps/search/?api=1&query=$lat,$lng'
            : 'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}');
        await launchUrl(fallbackUri, mode: LaunchMode.externalApplication);
      } catch (err) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Could not open Google Maps: $err'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _openGoogleMapsForLocation(double? lat, double? lng, String address) async {
    final hasCoords = lat != null && lng != null && lat != 0 && lng != 0;
    final urlString = hasCoords
        ? 'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving'
        : 'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(address)}&travelmode=driving';
    final Uri uri = Uri.parse(urlString);
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      debugPrint('Error launching map: $e');
    }
  }

  Future<void> _callPhone(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final Uri uri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint('Error calling phone: $e');
    }
  }

  Future<void> _handleDriverChange(RegisteredDriver driver) async {
    if (_isTracking) {
      await _stopTracking();
    }
    await _locationPublisher?.dispose();
    _locationPublisher = null;

    setState(() {
      _selectedDriver = driver;
      _isLoading = true;
    });

    try {
      final dispatches = await _driverApi.getDriverJourneys(driver.phone);
      final activeList = dispatches.where((d) {
        final s = d.status.toUpperCase();
        return s == 'IN_TRANSIT' || s == 'VEHICLE_ASSIGNED' || s == 'SCHEDULED';
      }).toList();

      final historyList = dispatches.where((d) {
        final s = d.status.toUpperCase();
        return s == 'DELIVERED' || s == 'COMPLETED' || s == 'ABORTED';
      }).toList();

      DriverDispatchModel? active;
      if (activeList.isNotEmpty) {
        try {
          active = activeList.firstWhere((d) => d.status.toUpperCase() == 'IN_TRANSIT');
        } catch (_) {
          active = activeList.first;
        }
      } else {
        active = null;
      }

      final allOrders = await _driverApi.getCustomerOrders();

      List<Map<String, dynamic>> driverAssignedOrders = allOrders.where((o) {
        final s = (o['status'] ?? '').toString().toUpperCase();
        if (s == 'DELIVERED' || s == 'COMPLETED' || s == 'CANCELLED') return false;
        final orderDriverPhone = (o['driverPhone'] ?? '').toString();
        final orderDriverId = (o['assignedDriverId'] ?? '').toString();
        return (orderDriverPhone.isNotEmpty && orderDriverPhone == driver.phone) ||
               (orderDriverId.isNotEmpty && orderDriverId == driver.id);
      }).toList();

      final effectiveAssignedOrders = driverAssignedOrders.isNotEmpty
          ? driverAssignedOrders
          : allOrders.where((o) {
              final s = (o['status'] ?? '').toString().toUpperCase();
              return s != 'DELIVERED' && s != 'COMPLETED' && s != 'CANCELLED';
            }).toList();

      List<Map<String, dynamic>> driverHistoryOrders = allOrders.where((o) {
        final s = (o['status'] ?? '').toString().toUpperCase();
        if (s != 'DELIVERED' && s != 'COMPLETED') return false;
        final orderDriverPhone = (o['driverPhone'] ?? '').toString();
        final orderDriverId = (o['assignedDriverId'] ?? '').toString();
        return (orderDriverPhone.isNotEmpty && orderDriverPhone == driver.phone) ||
               (orderDriverId.isNotEmpty && orderDriverId == driver.id);
      }).toList();

      final effectiveHistoryOrders = driverHistoryOrders.isNotEmpty
          ? driverHistoryOrders
          : allOrders.where((o) {
              final s = (o['status'] ?? '').toString().toUpperCase();
              return s == 'DELIVERED' || s == 'COMPLETED';
            }).toList();

      if (mounted) {
        setState(() {
          _activeDispatch = active;
          _activeDispatches = activeList;
          _historyDispatches = historyList;
          _assignedCustomerOrders = effectiveAssignedOrders;
          _historyCustomerOrders = effectiveHistoryOrders;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showPickupCodeModal([DriverDispatchModel? targetDispatch]) {
    final dispatch = targetDispatch ?? _activeDispatch;
    if (dispatch == null) return;
    _otpController.clear();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.pin_outlined, color: ShreeAnnaTheme.primaryGreen, size: 24),
                          SizedBox(width: 8),
                          Text(
                            'Enter Pickup Code',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF202420),
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Ask farmer (${dispatch.farmerOrProcessorName}) for the 4-digit verification code to confirm pickup.',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
                  ),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.shield_outlined, color: Color(0xFF0F766E), size: 18),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'Farmer verification required. Please obtain the 4-digit OTP directly from the farmer.',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF334155),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            _openFarmerChat(dispatch);
                          },
                          icon: const Icon(Icons.chat_bubble_outline, size: 14, color: ShreeAnnaTheme.primaryGreen),
                          label: const Text(
                            'Chat',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ShreeAnnaTheme.primaryGreen),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 4,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 12,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                    decoration: InputDecoration(
                      hintText: '••••',
                      counterText: '',
                      filled: true,
                      fillColor: const Color(0xFFF5F7F5),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFD5DFD0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: ShreeAnnaTheme.primaryGreen, width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isVerifying
                          ? null
                          : () async {
                              final code = _otpController.text.trim();
                              if (code.length != 4) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please enter 4 digits.')),
                                );
                                return;
                              }

                              final nav = Navigator.of(context);
                              final messenger = ScaffoldMessenger.of(this.context);
                              setModalState(() => _isVerifying = true);
                              try {
                                final updated = await _driverApi.verifyPickup(dispatch.id, code);
                                if (mounted) {
                                  setState(() {
                                    _activeDispatch = updated;
                                  });
                                }
                                nav.pop();
                                messenger.showSnackBar(
                                  const SnackBar(
                                    backgroundColor: Color(0xFF087F23),
                                    content: Text('Pickup Verified! Route set to Warehouse Destination.'),
                                  ),
                                );
                                await _loadDriverData();
                                _startTracking();
                              } catch (e) {
                                messenger.showSnackBar(
                                  SnackBar(
                                    backgroundColor: Colors.red,
                                    content: Text(e.toString().replaceAll('Exception: ', '')),
                                  ),
                                );
                              } finally {
                                setModalState(() => _isVerifying = false);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ShreeAnnaTheme.primaryGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: _isVerifying
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'VERIFY PICKUP & START TRANSIT',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showCompleteRideModal() {
    if (_activeDispatch == null) return;
    final notesController = TextEditingController(text: 'Delivered in good condition');
    final weightController = TextEditingController(text: _activeDispatch!.totalQuantityKg.toString());
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.check_circle, color: Color(0xFF2E7D32), size: 24),
                          SizedBox(width: 8),
                          Text(
                            'Complete Delivery Ride',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF202420),
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Confirm arrival and handover of Shipment #${_activeDispatch?.dispatchCode ?? ''} at ${_activeDispatch?.destinationAddress ?? 'destination warehouse'}.',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: weightController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: InputDecoration(
                      labelText: 'Delivered Weight (kg)',
                      prefixIcon: const Icon(Icons.scale_outlined, color: Color(0xFF2E7D32)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    decoration: InputDecoration(
                      labelText: 'Delivery Remarks / Handover Notes',
                      prefixIcon: const Icon(Icons.notes_outlined, color: Color(0xFF2E7D32)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              setModalState(() => isSubmitting = true);
                              final nav = Navigator.of(ctx);
                              final messenger = ScaffoldMessenger.of(this.context);
                              try {
                                final receivedKg = double.tryParse(weightController.text);
                                final notes = notesController.text.trim();
                                await _driverApi.confirmDelivery(
                                  _activeDispatch!.id,
                                  notes: notes.isNotEmpty ? notes : null,
                                  receivedKg: receivedKg,
                                );
                                if (_isTracking) {
                                  await _stopTracking();
                                }
                                nav.pop();
                                messenger.showSnackBar(
                                  SnackBar(
                                    backgroundColor: const Color(0xFF2E7D32),
                                    content: Text('Shipment #${_activeDispatch?.dispatchCode ?? ''} delivered! Moved to History. Assigned tasks shown below.'),
                                  ),
                                );
                                await _loadDriverData();
                              } catch (e) {
                                setModalState(() => isSubmitting = false);
                                messenger.showSnackBar(
                                  SnackBar(
                                    backgroundColor: Colors.red,
                                    content: Text('Failed to complete ride: $e'),
                                  ),
                                );
                              }
                            },
                      icon: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.check, color: Colors.white),
                      label: Text(
                        isSubmitting ? 'COMPLETING...' : 'CONFIRM & COMPLETE RIDE',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }





  void _showAbortRideModal() {
    if (_activeDispatch == null) return;
    String selectedReason = 'Vehicle Breakdown / Mechanical Issue';
    final customReasonController = TextEditingController();
    bool isSubmitting = false;

    final reasons = [
      'Vehicle Breakdown / Mechanical Issue',
      'Road Blockage / Severe Weather',
      'Driver Emergency / Health Issue',
      'Shipment Damage / Quality Issue',
      'Other',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.warning_amber_rounded, color: Color(0xFFC62828), size: 24),
                          SizedBox(width: 8),
                          Text(
                            'Abort Ride',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFC62828),
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Are you sure you want to abort this transit for Shipment #${_activeDispatch?.dispatchCode ?? ''}? This will notify logistics and release your vehicle.',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Select Cancellation Reason:',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: selectedReason,
                    items: reasons.map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setModalState(() => selectedReason = val);
                      }
                    },
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  if (selectedReason == 'Other') ...[
                    const SizedBox(height: 12),
                    TextField(
                      controller: customReasonController,
                      decoration: InputDecoration(
                        labelText: 'Specify Reason',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              setModalState(() => isSubmitting = true);
                              final nav = Navigator.of(ctx);
                              final messenger = ScaffoldMessenger.of(this.context);
                              try {
                                final reason = selectedReason == 'Other'
                                    ? customReasonController.text.trim()
                                    : selectedReason;
                                await _driverApi.abortRide(
                                  _activeDispatch!.id,
                                  reason: reason.isNotEmpty ? reason : 'Aborted by driver',
                                );
                                if (_isTracking) {
                                  await _stopTracking();
                                }
                                nav.pop();
                                messenger.showSnackBar(
                                  const SnackBar(
                                    backgroundColor: Color(0xFFC62828),
                                    content: Text('Transit ride aborted. Logistics coordinator notified.'),
                                  ),
                                );
                                await _loadDriverData();
                              } catch (e) {
                                setModalState(() => isSubmitting = false);
                                messenger.showSnackBar(
                                  SnackBar(
                                    backgroundColor: Colors.red,
                                    content: Text('Failed to abort ride: $e'),
                                  ),
                                );
                              }
                            },
                      icon: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.cancel, color: Colors.white),
                      label: Text(
                        isSubmitting ? 'ABORTING...' : 'CONFIRM ABORT RIDE',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC62828),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _openDriverProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DriverProfileScreen(
          driver: _selectedDriver,
          activeDispatch: _activeDispatch,
          isTracking: _isTracking,
          onStopTracking: _stopTracking,
          onDriverChanged: _handleDriverChange,
          availableDrivers: _drivers,
        ),
      ),
    );
  }

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: const Row(
            children: [
              Icon(Icons.logout, color: Color(0xFFDC2626)),
              SizedBox(width: 8),
              Text(
                'Logout Confirmation',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: const Text(
            'Are you sure you want to log out from your driver account? Active GPS broadcast will be stopped.',
            style: TextStyle(fontSize: 14, color: Color(0xFF475569)),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFDC2626),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );

    if (confirmed == true && mounted) {
      await _stopTracking();
      await _locationPublisher?.dispose();
      _locationPublisher = null;
      await TokenStorage().clearAll();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Logged out successfully.')),
        );
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const WelcomeScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F4),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Color(0xFF202420)),
        title: const Text(
          'Driver Journey Dashboard',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined, color: ShreeAnnaTheme.primaryGreen),
            tooltip: 'Driver Profile',
            onPressed: _openDriverProfile,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: ShreeAnnaTheme.primaryGreen),
            tooltip: 'Refresh',
            onPressed: _loadDriverData,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
            tooltip: 'Logout',
            onPressed: _confirmLogout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: ShreeAnnaTheme.primaryGreen))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDriverProfileCard(),
                  const SizedBox(height: 12),
                  _buildTabSwitcher(),
                  const SizedBox(height: 16),
                  if (_selectedTab == 0)
                    _buildActiveAndAssignedView()
                  else
                    _buildDeliveryHistoryView(),
                ],
              ),
            ),
    );
  }

  Widget _buildTabSwitcher() {
    final activeCount = _assignedCustomerOrders.length + _activeDispatches.length;
    final historyCount = _historyCustomerOrders.length + _historyDispatches.length;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => setState(() => _selectedTab = 0),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _selectedTab == 0 ? ShreeAnnaTheme.primaryGreen : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.assignment_outlined,
                      size: 16,
                      color: _selectedTab == 0 ? Colors.white : const Color(0xFF596159),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Assigned & Active',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _selectedTab == 0 ? Colors.white : const Color(0xFF596159),
                      ),
                    ),
                    if (activeCount > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: _selectedTab == 0 ? Colors.white.withValues(alpha: 0.25) : const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$activeCount',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _selectedTab == 0 ? Colors.white : ShreeAnnaTheme.primaryGreen,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: InkWell(
              onTap: () => setState(() => _selectedTab = 1),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _selectedTab == 1 ? ShreeAnnaTheme.primaryGreen : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.history,
                      size: 16,
                      color: _selectedTab == 1 ? Colors.white : const Color(0xFF596159),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Delivery History',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _selectedTab == 1 ? Colors.white : const Color(0xFF596159),
                      ),
                    ),
                    if (historyCount > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: _selectedTab == 1 ? Colors.white.withValues(alpha: 0.25) : const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$historyCount',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _selectedTab == 1 ? Colors.white : ShreeAnnaTheme.primaryGreen,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveAndAssignedView() {
    final pendingPickups = _activeDispatches.where((d) => d.status.toUpperCase() != 'IN_TRANSIT').toList();
    final hasActiveTransit = _activeDispatch != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasActiveTransit) ...[
          _buildActiveJourneyHeader(),
          const SizedBox(height: 12),
          _buildMapCard(),
          const SizedBox(height: 16),
          _buildJourneyDetailsCard(),
          const SizedBox(height: 16),
          _buildActionCard(),
          const SizedBox(height: 24),
        ],
        _buildAssignedCustomerDeliveriesSection(),
        const SizedBox(height: 20),
        if (pendingPickups.isNotEmpty) ...[
          _buildAssignedFarmerPickupsSection(pendingPickups),
          const SizedBox(height: 20),
        ],
        if (!hasActiveTransit && _assignedCustomerOrders.isEmpty && pendingPickups.isEmpty)
          _buildNoJourneyCard(),
      ],
    );
  }

  Widget _buildActiveJourneyHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: const [
              Icon(Icons.near_me, color: Color(0xFF38BDF8), size: 16),
              SizedBox(width: 8),
              Text(
                'ACTIVE TRANSIT IN PROGRESS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          Text(
            '#${_activeDispatch?.dispatchCode ?? ''}',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Color(0xFF38BDF8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAssignedCustomerDeliveriesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.local_shipping_outlined, color: Color(0xFF2563EB), size: 18),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Assigned Customer Deliveries',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: _assignedCustomerOrders.isNotEmpty ? const Color(0xFFDBEAFE) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${_assignedCustomerOrders.length} Pending',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: _assignedCustomerOrders.isNotEmpty ? const Color(0xFF1D4ED8) : const Color(0xFF64748B),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (_assignedCustomerOrders.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: const [
                Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'No pending customer doorstep deliveries right now.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ),
              ],
            ),
          )
        else
          ..._assignedCustomerOrders.map((o) => _buildCustomerOrderCard(o)),
      ],
    );
  }

  Widget _buildCustomerOrderCard(Map<String, dynamic> o) {
    final orderNum = o['orderNumber'] ?? 'Order';
    final custName = o['customerName'] ?? 'Customer';
    final custPhone = (o['customerPhone'] ?? '').toString();
    final address = o['shippingAddress'] ?? '';
    final city = o['city'] ?? '';
    final fullAddress = city.isNotEmpty ? '$address, $city' : address;
    final total = o['totalAmount'] ?? o['subtotal'] ?? 0;
    final double? custLat = (o['customerLatitude'] as num?)?.toDouble();
    final double? custLng = (o['customerLongitude'] as num?)?.toDouble();
    final items = (o['items'] as List<dynamic>?) ?? [];
    final itemsSummary = items.map((i) => '${i['quantity']}x ${i['productTitle']}').join(', ');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFBFDBFE)),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDBEAFE),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'DOORSTEP DELIVERY',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    orderNum,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              Text(
                '₹$total',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.person_pin_circle_outlined, size: 18, color: Color(0xFF2563EB)),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      custName,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    ),
                    if (custPhone.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Text(
                            custPhone,
                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                          ),
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () => _callPhone(custPhone),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                              child: Row(
                                children: [
                                  Icon(Icons.call, size: 12, color: Color(0xFF2563EB)),
                                  SizedBox(width: 2),
                                  Text(
                                    'Call',
                                    style: TextStyle(fontSize: 11, color: Color(0xFF2563EB), fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_outlined, size: 18, color: Color(0xFF64748B)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  fullAddress,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
                ),
              ),
            ],
          ),
          if (itemsSummary.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.shopping_bag_outlined, size: 18, color: Color(0xFF64748B)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    itemsSummary,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 4,
                child: OutlinedButton.icon(
                  onPressed: () => _openGoogleMapsForLocation(custLat, custLng, fullAddress),
                  icon: const Icon(Icons.directions, size: 16, color: Color(0xFF2563EB)),
                  label: const Text(
                    'NAVIGATE',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    side: const BorderSide(color: Color(0xFF93C5FD)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 6,
                child: ElevatedButton.icon(
                  onPressed: () => _showOrderDeliveryModal(o),
                  icon: const Icon(Icons.verified_outlined, size: 16, color: Colors.white),
                  label: const Text(
                    'HANDOVER (OTP)',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    elevation: 1,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showOrderDeliveryModal(Map<String, dynamic> order) {
    _orderOtpController.clear();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final orderNum = order['orderNumber'] ?? 'Order';
            final custName = order['customerName'] ?? 'Customer';
            final addr = order['shippingAddress'] ?? '';

            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.verified_outlined, color: Color(0xFF2563EB), size: 24),
                          SizedBox(width: 8),
                          Text(
                            'Customer Handover OTP',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ask recipient $custName for the 4-digit delivery PIN to complete handover for $orderNum at $addr.',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _orderOtpController,
                    keyboardType: TextInputType.number,
                    maxLength: 4,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
                    decoration: InputDecoration(
                      hintText: '• • • •',
                      counterText: '',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _isVerifyingOrderOtp
                          ? null
                          : () async {
                              final otp = _orderOtpController.text.trim();
                              if (otp.length != 4) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please enter the 4-digit OTP provided by customer.')),
                                );
                                return;
                              }
                              setModalState(() => _isVerifyingOrderOtp = true);
                              final nav = Navigator.of(ctx);
                              final messenger = ScaffoldMessenger.of(this.context);
                              try {
                                await _driverApi.confirmCustomerOrderDelivery(order['id'].toString(), otp);
                                _orderOtpController.clear();
                                nav.pop();
                                messenger.showSnackBar(
                                  SnackBar(
                                    backgroundColor: const Color(0xFF2E7D32),
                                    content: Text('Delivery confirmed! Handshake for Order $orderNum completed. Moved to history.'),
                                  ),
                                );
                                await _loadDriverData();
                              } catch (e) {
                                messenger.showSnackBar(
                                  SnackBar(
                                    backgroundColor: Colors.red,
                                    content: Text(e.toString().replaceAll('Exception: ', '')),
                                  ),
                                );
                              } finally {
                                setModalState(() => _isVerifyingOrderOtp = false);
                              }
                            },
                      icon: _isVerifyingOrderOtp
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.check_circle_outline, color: Colors.white),
                      label: Text(
                        _isVerifyingOrderOtp ? 'VERIFYING...' : 'CONFIRM DELIVERY & HANDOVER',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildAssignedFarmerPickupsSection(List<DriverDispatchModel> pickups) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.agriculture_outlined, color: Color(0xFFD97706), size: 18),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Assigned Procurement Pickups',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${pickups.length} Scheduled',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFB45309),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ...pickups.map((p) => _buildFarmerPickupCard(p)),
      ],
    );
  }

  Widget _buildFarmerPickupCard(DriverDispatchModel p) {
    final isSelectedActive = _activeDispatch?.id == p.id;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isSelectedActive ? ShreeAnnaTheme.primaryGreen : const Color(0xFFFDE68A),
          width: isSelectedActive ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.amber.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'FARMER PICKUP',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '#${p.dispatchCode}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${p.totalQuantityKg.toStringAsFixed(0)} kg',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.person_outline, size: 18, color: Color(0xFFD97706)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${p.farmerOrProcessorName} • ${p.milletType}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_outlined, size: 18, color: Color(0xFF64748B)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  p.sourceAddress,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.warehouse_outlined, size: 18, color: Color(0xFF64748B)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  p.destinationAddress,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: () => _openFarmerChat(p),
                icon: const Icon(Icons.chat_bubble_outline, size: 15, color: ShreeAnnaTheme.primaryGreen),
                label: const Text(
                  'CHAT',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ShreeAnnaTheme.primaryGreen),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
                  side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 4,
                child: OutlinedButton.icon(
                  onPressed: () => _openGoogleMapsForLocation(p.pickupLatitude, p.pickupLongitude, p.sourceAddress),
                  icon: const Icon(Icons.directions, size: 16, color: Color(0xFFD97706)),
                  label: const Text(
                    'NAVIGATE',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    side: const BorderSide(color: Color(0xFFFCD34D)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 5,
                child: ElevatedButton.icon(
                  onPressed: () => _showPickupCodeModal(p),
                  icon: const Icon(Icons.pin_outlined, size: 16, color: Colors.white),
                  label: const Text(
                    'VERIFY CODE',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 1,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryHistoryView() {
    final totalCount = _historyDispatches.length + _historyCustomerOrders.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.check_circle_outline, color: Color(0xFF16A34A), size: 18),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Delivery History',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '$totalCount Completed',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF166534),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (totalCount == 0)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: const [
                Icon(Icons.history_toggle_off_rounded, size: 40, color: Color(0xFF94A3B8)),
                SizedBox(height: 10),
                Text(
                  'No Delivery History Yet',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                ),
                SizedBox(height: 4),
                Text(
                  'Completed warehouse shipments and customer doorstep deliveries will appear here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          )
        else ...[
          if (_historyDispatches.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.only(left: 2, bottom: 8),
              child: Text(
                'Warehouse Shipments (${_historyDispatches.length})',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
              ),
            ),
            ..._historyDispatches.map((d) => _buildHistoryDispatchCard(d)),
            const SizedBox(height: 16),
          ],
          if (_historyCustomerOrders.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.only(left: 2, bottom: 8),
              child: Text(
                'Customer Doorstep Deliveries (${_historyCustomerOrders.length})',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
              ),
            ),
            ..._historyCustomerOrders.map((o) => _buildHistoryCustomerOrderCard(o)),
          ],
        ],
      ],
    );
  }

  Widget _buildHistoryDispatchCard(DriverDispatchModel d) {
    final statusUpper = d.status.toUpperCase();
    final isDelivered = statusUpper == 'DELIVERED' || statusUpper == 'COMPLETED';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDelivered ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDelivered ? const Color(0xFFE8F5E9) : const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      isDelivered ? 'DELIVERED' : statusUpper,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isDelivered ? const Color(0xFF166534) : const Color(0xFFC62828),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '#${d.dispatchCode}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              Text(
                '${d.finalReceivedQuantityKg ?? d.totalQuantityKg} kg',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${d.farmerOrProcessorName} • ${d.milletType}',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF64748B)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'From: ${d.sourceAddress}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.warehouse_outlined, size: 16, color: Color(0xFF16A34A)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Delivered To: ${d.destinationAddress}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF15803D), fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.verified, size: 12, color: Color(0xFF16A34A)),
                    SizedBox(width: 4),
                    Text('Warehouse Handover Verified', style: TextStyle(fontSize: 10, color: Color(0xFF475569))),
                  ],
                ),
              ),
              TextButton.icon(
                onPressed: () => _openGoogleMapsForLocation(d.destinationLatitude, d.destinationLongitude, d.destinationAddress),
                icon: const Icon(Icons.map_outlined, size: 14, color: Color(0xFF16A34A)),
                label: const Text('View Map', style: TextStyle(fontSize: 11, color: Color(0xFF16A34A), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCustomerOrderCard(Map<String, dynamic> o) {
    final orderNum = o['orderNumber'] ?? 'Order';
    final custName = o['customerName'] ?? 'Customer';
    final address = o['shippingAddress'] ?? '';
    final total = o['totalAmount'] ?? o['subtotal'] ?? 0;
    final items = (o['items'] as List<dynamic>?) ?? [];
    final itemsSummary = items.map((i) => '${i['quantity']}x ${i['productTitle']}').join(', ');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFBBF7D0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'DELIVERED',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    orderNum,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              Text(
                '₹$total',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Recipient: $custName',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.home_outlined, size: 16, color: Color(0xFF64748B)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  address,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
              ),
            ],
          ),
          if (itemsSummary.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.shopping_bag_outlined, size: 16, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    itemsSummary,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, size: 12, color: Color(0xFF16A34A)),
                SizedBox(width: 4),
                Text('Handshake Verified via Customer OTP', style: TextStyle(fontSize: 10, color: Color(0xFF475569))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDriverProfileCard() {
    final driverName = _selectedDriver?.name ?? _activeDispatch?.driverName ?? 'Assigned Driver';
    final vehicleNo = _selectedDriver?.vehicleNumber ?? _activeDispatch?.vehicleNumber ?? 'Vehicle Pending';
    final phone = _selectedDriver?.phone ?? _activeDispatch?.driverPhone ?? '';

    return InkWell(
      onTap: _openDriverProfile,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD5DFD0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                shape: BoxShape.circle,
                border: Border.all(color: ShreeAnnaTheme.primaryGreen, width: 2),
              ),
              child: const Icon(Icons.local_shipping_outlined, color: ShreeAnnaTheme.primaryGreen, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        driverName,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDFF3E2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'ON DUTY',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF087F23)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Vehicle: $vehicleNo  •  Ph: $phone',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF596159), fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
              tooltip: 'View Profile',
              onPressed: _openDriverProfile,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoJourneyCard() {
    final historyCount = _historyDispatches.length + _historyCustomerOrders.length;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD5DFD0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFFE8F5E9),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.task_alt, size: 36, color: ShreeAnnaTheme.primaryGreen),
          ),
          const SizedBox(height: 12),
          const Text(
            'All Deliveries & Pickups Completed',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
          ),
          const SizedBox(height: 6),
          Text(
            'Vehicle ${_selectedDriver?.vehicleNumber ?? _activeDispatch?.vehicleNumber ?? ''} is on duty and ready for new assignments.',
            style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
            textAlign: TextAlign.center,
          ),
          if (historyCount > 0) ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => setState(() => _selectedTab = 1),
              icon: const Icon(Icons.history, size: 16, color: ShreeAnnaTheme.primaryGreen),
              label: Text(
                'VIEW DELIVERY HISTORY ($historyCount)',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ShreeAnnaTheme.primaryGreen),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMapCard() {
    return _DispatchMapCard(
      dispatch: _activeDispatch!,
      onOpenGoogleMaps: _openGoogleMapsForJourney,
    );
  }

  Widget _buildJourneyDetailsCard() {
    final d = _activeDispatch;
    final statusUpper = (d?.status ?? '').toUpperCase();
    final isDelivered = statusUpper == 'DELIVERED' || statusUpper == 'COMPLETED';
    final isInTransit = statusUpper == 'IN_TRANSIT';

    String badgeText;
    Color badgeBg;
    Color badgeTextColor;

    if (isDelivered) {
      badgeText = 'DELIVERED';
      badgeBg = const Color(0xFFD1FAE5);
      badgeTextColor = const Color(0xFF065F46);
    } else if (isInTransit) {
      badgeText = 'IN TRANSIT';
      badgeBg = const Color(0xFFDCEBFA);
      badgeTextColor = const Color(0xFF1265C0);
    } else {
      badgeText = 'PENDING PICKUP';
      badgeBg = const Color(0xFFFFE9D0);
      badgeTextColor = const Color(0xFFE97900);
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Shipment #${d?.dispatchCode ?? 'SHP-2026-001'}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: badgeTextColor,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xFFE2E8F0)),
          _buildInfoRow(Icons.agriculture_outlined, 'Farmer', d?.farmerOrProcessorName ?? 'N/A'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.grass_outlined, 'Millet Type', '${d?.milletType ?? 'N/A'} (${d?.totalQuantityKg.toStringAsFixed(0) ?? '0'} kg)'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.location_on_outlined, 'Pickup Location', d?.sourceAddress ?? 'N/A'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.warehouse_outlined, 'Destination Warehouse', d?.destinationAddress ?? 'N/A'),
          const Divider(height: 20, color: Color(0xFFE2E8F0)),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    final phone = d?.driverPhone ?? '';
                    if (phone.isNotEmpty) {
                      launchUrl(Uri.parse('tel:${phone.replaceAll(' ', '')}'));
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Farmer phone not available')),
                      );
                    }
                  },
                  icon: const Icon(Icons.phone, size: 15, color: ShreeAnnaTheme.primaryGreen),
                  label: const Text(
                    'CALL FARMER',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ShreeAnnaTheme.primaryGreen),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    if (d != null) _openFarmerChat(d);
                  },
                  icon: const Icon(Icons.chat_bubble_outline, size: 15, color: Colors.white),
                  label: const Text(
                    'CHAT WITH FARMER',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _openFarmerChat(DriverDispatchModel p) {
    final sessionKey = p.lotId.isNotEmpty ? p.lotId : (p.id.isNotEmpty ? p.id : p.dispatchCode);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DriverChatScreen(
          sessionId: 'trip_$sessionKey',
          lotId: p.lotId,
          lotNumber: p.dispatchCode,
          milletType: p.milletType,
          quantityKg: '${p.totalQuantityKg.toStringAsFixed(0)} kg',
          otherPartyName: p.farmerOrProcessorName,
          otherPartyPhone: p.driverPhone,
          vehicleNumber: p.vehicleNumber,
          pickupCode: p.verificationCode,
          pickupLocation: p.sourceAddress,
          farmerName: p.farmerOrProcessorName,
          isDriver: true,
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, {bool isCode = false}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: ShreeAnnaTheme.primaryGreen),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontSize: 12, color: Color(0xFF596159), fontWeight: FontWeight.w500)),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isCode ? ShreeAnnaTheme.primaryGreen : const Color(0xFF202420),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionCard() {
    final statusUpper = (_activeDispatch?.status ?? '').toUpperCase();
    final isDelivered = statusUpper == 'DELIVERED' || statusUpper == 'COMPLETED';
    final isInTransit = statusUpper == 'IN_TRANSIT';

    if (isDelivered) {
      return Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF86EFAC), width: 1.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 28),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Delivery Completed Successfully! 🎉',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF14532D)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Shipment #${_activeDispatch?.dispatchCode ?? ''} was safely delivered to ${_activeDispatch?.destinationAddress ?? 'destination warehouse'}.',
              style: const TextStyle(fontSize: 12, color: Color(0xFF15803D)),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.scale, color: Color(0xFF16A34A), size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Delivered Quantity: ${_activeDispatch?.finalReceivedQuantityKg ?? _activeDispatch?.totalQuantityKg ?? 0} kg',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Trip closed • Vehicle released and ready for next assignment',
                          style: TextStyle(fontSize: 11, color: Color(0xFF4B5563)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: OutlinedButton.icon(
                onPressed: _openGoogleMapsForJourney,
                icon: const Icon(Icons.map_outlined, color: Color(0xFF16A34A), size: 18),
                label: const Text(
                  'VIEW ROUTE / DESTINATION ON MAP',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF86EFAC), width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _activeDispatch = null;
                    _selectedTab = 0;
                  });
                  _loadDriverData();
                },
                icon: const Icon(Icons.assignment_turned_in_outlined, color: Colors.white, size: 18),
                label: const Text(
                  'MOVE TO HISTORY & VIEW ASSIGNED TASKS',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ShreeAnnaTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (isInTransit) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFE3F2FD),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF90CAF9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.check_circle, color: Color(0xFF1565C0), size: 22),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Pickup Code Verified! You are currently in transit to Warehouse.',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Show warehouse receiving team the shipment code upon arrival at destination warehouse.',
              style: TextStyle(fontSize: 11, color: Color(0xFF1E88E5)),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _openGoogleMapsForJourney,
                icon: const Icon(Icons.navigation_rounded, color: Colors.white, size: 20),
                label: const Text(
                  'START JOURNEY TO WAREHOUSE (GOOGLE MAPS)',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1976D2),
                  foregroundColor: Colors.white,
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: _isStartingTracking
                    ? null
                    : (_isTracking ? _stopTracking : _startTracking),
                icon: _isStartingTracking
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Icon(
                        _isTracking ? Icons.stop_circle_outlined : Icons.my_location,
                        color: Colors.white,
                        size: 20,
                      ),
                label: Text(
                  _isTracking ? 'STOP LIVE GPS PUBLISHING' : 'START LIVE GPS BROADCAST',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isTracking ? Colors.red.shade700 : ShreeAnnaTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Divider(color: Color(0xFFBBDEFB)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _showCompleteRideModal,
                      icon: const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
                      label: const Text(
                        'COMPLETE RIDE',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _showAbortRideModal,
                      icon: const Icon(Icons.cancel_outlined, color: Colors.white, size: 20),
                      label: const Text(
                        'ABORT RIDE',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC62828),
                        foregroundColor: Colors.white,
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton.icon(
            onPressed: _openGoogleMapsForJourney,
            icon: const Icon(Icons.navigation_rounded, size: 20, color: Colors.white),
            label: const Text(
              'START JOURNEY IN GOOGLE MAPS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1976D2),
              foregroundColor: Colors.white,
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton.icon(
            onPressed: _showPickupCodeModal,
            icon: const Icon(Icons.key, size: 18),
            label: const Text(
              'ARRIVED AT PICKUP - ENTER PICKUP CODE',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: ShreeAnnaTheme.primaryGreen,
              foregroundColor: Colors.white,
              elevation: 1,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton.icon(
            onPressed: _isStartingTracking
                ? null
                : (_isTracking ? _stopTracking : _startTracking),
            icon: _isStartingTracking
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Icon(
                    _isTracking ? Icons.location_on : Icons.navigation_outlined,
                    color: _isTracking ? ShreeAnnaTheme.primaryGreen : const Color(0xFF202420),
                    size: 18,
                  ),
            label: Text(
              _isTracking ? 'LIVE GPS BROADCASTING ACTIVE (TAP TO STOP)' : 'START GPS TRIP BROADCAST TO PICKUP',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: _isTracking ? ShreeAnnaTheme.primaryGreen : const Color(0xFF202420),
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: BorderSide(
                color: _isTracking ? ShreeAnnaTheme.primaryGreen : const Color(0xFFCBD5E1),
                width: 1.5,
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton.icon(
            onPressed: _showAbortRideModal,
            icon: const Icon(Icons.cancel_outlined, color: Color(0xFFC62828), size: 18),
            label: const Text(
              'ABORT TRIP / CANCEL DISPATCH',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFFC62828),
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(
                color: Color(0xFFEF5350),
                width: 1.5,
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Geocoding helper — Nominatim (OpenStreetMap), free, no API key
// ---------------------------------------------------------------------------
Future<LatLng?> _geocodeAddress(String address) async {
  if (address.trim().isEmpty) return null;
  // If address contains coordinates e.g. "21.7204, 73.1532"
  final coordMatch = RegExp(r'(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)').firstMatch(address);
  if (coordMatch != null) {
    final lat = double.tryParse(coordMatch.group(1)!);
    final lon = double.tryParse(coordMatch.group(2)!);
    if (lat != null && lon != null) return LatLng(lat, lon);
  }

  // Progressive list of query strings to try
  final candidates = <String>[address];
  final clean = address.replaceAll('/', ',').replaceAll(RegExp(r'\s+'), ' ').trim();
  if (clean != address) candidates.add(clean);

  final parts = clean.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
  if (parts.length > 2) {
    candidates.add(parts.sublist(1).join(', '));
  }
  if (parts.length > 1) {
    candidates.add('${parts.last}, Gujarat, India');
  }

  for (final q in candidates) {
    try {
      final query = Uri.encodeComponent(q);
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/search?q=$query&format=json&limit=1',
      );
      final res = await http.get(uri, headers: {'User-Agent': 'ShreeAnnaApp/1.0'}).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as List<dynamic>;
        if (data.isNotEmpty) {
          final lat = double.tryParse(data[0]['lat'].toString());
          final lon = double.tryParse(data[0]['lon'].toString());
          if (lat != null && lon != null) return LatLng(lat, lon);
        }
      }
    } catch (_) {}
  }
  return null;
}

// ---------------------------------------------------------------------------
// Real map card — uses exact farm/warehouse coordinates, with OSM tiles
// ---------------------------------------------------------------------------
class _DispatchMapCard extends StatefulWidget {
  final DriverDispatchModel dispatch;
  final VoidCallback? onOpenGoogleMaps;
  const _DispatchMapCard({required this.dispatch, this.onOpenGoogleMaps});

  @override
  State<_DispatchMapCard> createState() => _DispatchMapCardState();
}

class _DispatchMapCardState extends State<_DispatchMapCard> {
  LatLng? _from;
  LatLng? _to;
  List<LatLng> _routePoints = [];
  double? _routeDistanceKm;
  int? _routeDurationMin;
  bool _loading = true;
  String? _error;
  bool _mapReady = false;
  final MapController _mapController = MapController();

  void _fitMapBounds() {
    if (!_mapReady || !mounted) return;
    final points = _routePoints.isNotEmpty
        ? _routePoints
        : (_from != null && _to != null ? [_from!, _to!] : null);
    if (points == null || points.isEmpty) return;

    try {
      final bounds = LatLngBounds.fromPoints(points);
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.all(42),
        ),
      );
    } catch (e) {
      debugPrint('MapController fitCamera deferred: $e');
    }
  }

  void _navigateToFullScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DriverFullScreenMapScreen(
          dispatch: widget.dispatch,
          onOpenGoogleMaps: widget.onOpenGoogleMaps,
          initialRoutePoints: _routePoints,
          from: _from,
          to: _to,
          distanceKm: _routeDistanceKm,
          durationMin: _routeDurationMin,
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _geocode();
  }

  @override
  void didUpdateWidget(_DispatchMapCard old) {
    super.didUpdateWidget(old);
    if (old.dispatch.status != widget.dispatch.status ||
        old.dispatch.pickupLatitude != widget.dispatch.pickupLatitude ||
        old.dispatch.pickupLongitude != widget.dispatch.pickupLongitude ||
        old.dispatch.destinationLatitude != widget.dispatch.destinationLatitude ||
        old.dispatch.destinationLongitude != widget.dispatch.destinationLongitude ||
        old.dispatch.sourceAddress != widget.dispatch.sourceAddress ||
        old.dispatch.destinationAddress != widget.dispatch.destinationAddress) {
      _geocode();
    }
  }

  Future<void> _fetchRoadRoute(LatLng start, LatLng end) async {
    try {
      final url = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/'
        '${start.longitude},${start.latitude};${end.longitude},${end.latitude}'
        '?overview=full&geometries=geojson',
      );
      final res = await http.get(url, headers: {
        'User-Agent': 'ShreeAnnaApp/1.0 (com.shreeanna.app; contact@shreeanna.com)',
      }).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['code'] == 'Ok' && data['routes'] != null && (data['routes'] as List).isNotEmpty) {
          final route = data['routes'][0];
          final geometry = route['geometry'];
          final coords = geometry['coordinates'] as List<dynamic>;
          final pts = coords.map<LatLng>((c) {
            final lon = (c[0] as num).toDouble();
            final lat = (c[1] as num).toDouble();
            return LatLng(lat, lon);
          }).toList();

          final distanceM = (route['distance'] as num?)?.toDouble() ?? 0;
          final durationS = (route['duration'] as num?)?.toDouble() ?? 0;

          if (mounted && pts.isNotEmpty) {
            setState(() {
              _routePoints = pts;
              _routeDistanceKm = distanceM / 1000.0;
              _routeDurationMin = (durationS / 60.0).round();
            });
            _fitMapBounds();
            return;
          }
        }
      }
    } catch (e) {
      debugPrint('OSRM road route fetch failed: $e');
    }

    if (mounted) {
      setState(() {
        _routePoints = [start, end];
      });
      _fitMapBounds();
    }
  }

  Future<void> _geocode() async {
    setState(() {
      _loading = true;
      _error = null;
      _routePoints = [];
      _routeDistanceKm = null;
      _routeDurationMin = null;
    });

    final statusUpper = widget.dispatch.status.toUpperCase();
    final isInTransit = statusUpper == 'IN_TRANSIT' || statusUpper == 'DELIVERED';

    LatLng? toLatLng;
    LatLng? fromLatLng;

    if (isInTransit) {
      // In transit: target is warehouse destination
      if (widget.dispatch.destinationLatitude != null &&
          widget.dispatch.destinationLongitude != null &&
          widget.dispatch.destinationLatitude != 0) {
        toLatLng = LatLng(
          widget.dispatch.destinationLatitude!,
          widget.dispatch.destinationLongitude!,
        );
      } else {
        toLatLng = await _geocodeAddress(widget.dispatch.destinationAddress);
      }

      // Origin is farm pickup location
      if (widget.dispatch.pickupLatitude != null &&
          widget.dispatch.pickupLongitude != null &&
          widget.dispatch.pickupLatitude != 0) {
        fromLatLng = LatLng(
          widget.dispatch.pickupLatitude!,
          widget.dispatch.pickupLongitude!,
        );
      } else {
        fromLatLng = await _geocodeAddress(widget.dispatch.sourceAddress);
      }
    } else {
      // Pending pickup: target is farmer farm location using coordinates directly
      if (widget.dispatch.pickupLatitude != null &&
          widget.dispatch.pickupLongitude != null &&
          widget.dispatch.pickupLatitude != 0) {
        toLatLng = LatLng(
          widget.dispatch.pickupLatitude!,
          widget.dispatch.pickupLongitude!,
        );
      } else {
        toLatLng = await _geocodeAddress(widget.dispatch.sourceAddress);
      }

      // Try reading actual driver GPS coordinates if available
      try {
        final pos = await Geolocator.getLastKnownPosition();
        if (pos != null) {
          fromLatLng = LatLng(pos.latitude, pos.longitude);
        }
      } catch (_) {}

      // Origin fallback representing the driver departing toward the farm (or when simulator is at same spot)
      if (toLatLng != null &&
          (fromLatLng == null ||
           ((fromLatLng.latitude - toLatLng.latitude).abs() < 0.002 &&
            (fromLatLng.longitude - toLatLng.longitude).abs() < 0.002))) {
        fromLatLng = LatLng(toLatLng.latitude + 0.045, toLatLng.longitude - 0.055);
      }
    }

    if (!mounted) return;

    // Ensure all points remain strictly in Gujarat
    if (fromLatLng != null && fromLatLng.latitude < 18.0) {
      fromLatLng = const LatLng(22.5645, 72.9289); // Anand, Gujarat
    }
    if (toLatLng != null && toLatLng.latitude < 18.0) {
      toLatLng = const LatLng(22.9754, 72.6322); // Ahmedabad, Gujarat
    }

    toLatLng ??= const LatLng(22.9754, 72.6322); // Destination: Ahmedabad, Gujarat

    final targetPoint = toLatLng;
    final startPoint = fromLatLng ?? const LatLng(22.5645, 72.9289); // Origin: Anand, Gujarat

    setState(() {
      _from = startPoint;
      _to = targetPoint;
      _loading = false;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fitMapBounds();
    });

    // Fetch the real turn-by-turn road route
    await _fetchRoadRoute(startPoint, targetPoint);
  }

  @override
  Widget build(BuildContext context) {
    final statusUpper = widget.dispatch.status.toUpperCase();
    final isDelivered = statusUpper == 'DELIVERED' || statusUpper == 'COMPLETED';
    final isInTransit = statusUpper == 'IN_TRANSIT';
    final targetLocation = (isInTransit || isDelivered)
        ? widget.dispatch.destinationAddress
        : widget.dispatch.sourceAddress;

    final headerColor = isDelivered
        ? const Color(0xFF10B981)
        : (isInTransit ? const Color(0xFF0284C7) : const Color(0xFF059669));
    final lineColor = isDelivered
        ? const Color(0xFF34D399)
        : (isInTransit ? const Color(0xFF38BDF8) : const Color(0xFF34D399));

    final mapHeaderTitle = isDelivered
        ? 'DELIVERY COMPLETED'
        : (isInTransit ? 'WAREHOUSE ROUTE' : 'PICKUP LOCATION MAP');
    final mapBadgeText = isDelivered
        ? 'DELIVERED'
        : (isInTransit ? 'IN TRANSIT' : 'TRANSIT TO PICKUP');
    final mapHeaderIcon = isDelivered
        ? Icons.check_circle_outline
        : (isInTransit ? Icons.warehouse_outlined : Icons.navigation_outlined);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: const [
          BoxShadow(color: Color(0x1F000000), blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──────────────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.vertical(top: Radius.circular(13)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        mapHeaderIcon,
                        color: lineColor,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          mapHeaderTitle,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.3,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_routeDistanceKm != null)
                      Container(
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.route, size: 10, color: Color(0xFF38BDF8)),
                            const SizedBox(width: 3),
                            Text(
                              '${_routeDistanceKm!.toStringAsFixed(1)} km${_routeDurationMin != null ? ' · ~${_routeDurationMin}m' : ''}',
                              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                            ),
                          ],
                        ),
                      ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: headerColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        mapBadgeText,
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Map ─────────────────────────────────────────────────────────────
          SizedBox(
            height: 220,
            child: ClipRRect(
              borderRadius: BorderRadius.zero,
              child: _loading
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: lineColor, strokeWidth: 2),
                          const SizedBox(height: 8),
                          Text(
                            'Loading map…',
                            style: TextStyle(color: lineColor, fontSize: 12),
                          ),
                        ],
                      ),
                    )
                  : _error != null
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.map_outlined, color: Color(0xFF94A3B8), size: 36),
                              const SizedBox(height: 8),
                              Text(
                                _error!,
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 10),
                              TextButton(
                                onPressed: _geocode,
                                child: Text('Retry', style: TextStyle(color: lineColor)),
                              ),
                            ],
                          ),
                        )
                      : Stack(
                          children: [
                            FlutterMap(
                              mapController: _mapController,
                              options: MapOptions(
                                initialCenter: _to ?? const LatLng(22.3039, 70.8022),
                                initialZoom: 11,
                                onMapReady: () {
                                  _mapReady = true;
                                  _fitMapBounds();
                                },
                              ),
                              children: [
                                // Carto / OpenStreetMap tile layer
                                TileLayer(
                                  urlTemplate: ApiConfig.cartoApiKey.isNotEmpty
                                      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${ApiConfig.cartoApiKey}'
                                      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                  subdomains: const ['a', 'b', 'c', 'd'],
                                  userAgentPackageName: 'com.shreeanna.app',
                                  tileProvider: NetworkTileProvider(
                                    headers: <String, String>{
                                      'User-Agent': 'ShreeAnnaApp/1.0 (com.shreeanna.app; contact@shreeanna.com)',
                                    },
                                  ),
                                  maxZoom: 20,
                                ),
                                // Real turn-by-turn road route polyline
                                if (_routePoints.isNotEmpty || (_from != null && _to != null))
                                  PolylineLayer(
                                    polylines: [
                                      // Road casing / drop shadow border for crisp road contrast
                                      Polyline(
                                        points: _routePoints.isNotEmpty ? _routePoints : [_from!, _to!],
                                        color: const Color(0xFF0F172A).withValues(alpha: 0.8),
                                        strokeWidth: 6.5,
                                      ),
                                      // Vibrant navigation road polyline
                                      Polyline(
                                        points: _routePoints.isNotEmpty ? _routePoints : [_from!, _to!],
                                        color: const Color(0xFF2563EB),
                                        strokeWidth: 4.5,
                                      ),
                                    ],
                                  ),
                                // Markers
                                MarkerLayer(
                                  markers: [
                                    // Driver / origin marker
                                    if (_from != null)
                                      Marker(
                                        point: _from!,
                                        width: 90,
                                        height: 38,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF1E293B).withValues(alpha: 0.92),
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(color: Colors.amber.withValues(alpha: 0.7)),
                                          ),
                                          child: const Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(Icons.local_shipping, color: Colors.amber, size: 14),
                                              SizedBox(width: 4),
                                              Flexible(
                                                child: Text(
                                                  'Driver',
                                                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    // Destination marker
                                    if (_to != null)
                                      Marker(
                                        point: _to!,
                                        width: 110,
                                        height: 38,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: headerColor,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(
                                                (isDelivered || isInTransit) ? Icons.warehouse : Icons.agriculture,
                                                color: Colors.white,
                                                size: 14,
                                              ),
                                              const SizedBox(width: 4),
                                              Flexible(
                                                child: Text(
                                                  isDelivered ? 'Warehouse (Delivered)' : (isInTransit ? 'Warehouse' : 'Farmer Farm'),
                                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                // Map attribution
                                RichAttributionWidget(
                                  attributions: [
                                    TextSourceAttribution(
                                      ApiConfig.cartoApiKey.isNotEmpty
                                          ? '© CARTO, © OpenStreetMap contributors'
                                          : 'OpenStreetMap contributors',
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            // Floating Full-Screen Map button
                            Positioned(
                              top: 10,
                              right: 10,
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: _navigateToFullScreen,
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: const Color(0xFF334155)),
                                      boxShadow: const [
                                        BoxShadow(color: Colors.black38, blurRadius: 4, offset: Offset(0, 2)),
                                      ],
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.fullscreen, color: Colors.white, size: 16),
                                        SizedBox(width: 4),
                                        Text(
                                          'Full Screen',
                                          style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
            ),
          ),

          // ── Footer ──────────────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(13)),
            ),
            child: Row(
              children: [
                Icon(
                  (isDelivered || isInTransit) ? Icons.warehouse_outlined : Icons.location_on_outlined,
                  color: lineColor,
                  size: 14,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isDelivered ? 'DELIVERED WAREHOUSE DESTINATION' : (isInTransit ? 'WAREHOUSE DESTINATION' : 'FARMER PICKUP LOCATION'),
                        style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        targetLocation,
                        style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (_to != null) ...[
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_routeDistanceKm != null)
                        Text(
                          '${_routeDistanceKm!.toStringAsFixed(1)} km by road',
                          style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      Text(
                        '${_to!.latitude.toStringAsFixed(4)}°N, ${_to!.longitude.toStringAsFixed(4)}°E',
                        style: TextStyle(fontSize: 9, color: lineColor, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: _navigateToFullScreen,
                    borderRadius: BorderRadius.circular(4),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF334155),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.fullscreen, color: Colors.white, size: 12),
                          SizedBox(width: 3),
                          Text(
                            'Full',
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (widget.onOpenGoogleMaps != null) ...[
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: widget.onOpenGoogleMaps,
                      borderRadius: BorderRadius.circular(4),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1976D2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.directions, color: Colors.white, size: 12),
                            SizedBox(width: 3),
                            Text(
                              'Maps',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
