import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

import '../../../app/theme.dart';
import 'driver_chat_screen.dart';

class PickupDeliveryScreen extends StatelessWidget {
  const PickupDeliveryScreen({
    super.key,
    this.lotId,
    this.driverName,
    this.driverPhone,
    this.vehicleNumber,
    this.verificationCode,
    this.milletName,
    this.quantity,
    this.farmName,
    this.pickupLocation,
    this.scheduledDate,
    this.status,
    this.transportType,
    this.apiBaseUrl,
    this.accessToken,
    this.pickupLatitude,
    this.pickupLongitude,
  });

  final String? lotId;
  final String? driverName;
  final String? driverPhone;
  final String? vehicleNumber;
  final String? verificationCode;
  final String? milletName;
  final String? quantity;
  final String? farmName;
  final String? pickupLocation;
  final String? scheduledDate;
  final String? status;
  final String? transportType;

  /// Backend origin, e.g. http://10.0.2.2:5066 for Android emulator.
  /// Pass the same authenticated API base URL used by your existing API client.
  final String? apiBaseUrl;
  final String? accessToken;
  final double? pickupLatitude;
  final double? pickupLongitude;

  @override
  Widget build(BuildContext context) {
    final displayMillet = (milletName != null && milletName!.isNotEmpty)
        ? milletName!
        : 'Finger Millet (Ragi)';
    final displayQty = (quantity != null && quantity!.isNotEmpty)
        ? quantity!
        : '3,500 kg';
    final displayFarm = (farmName != null && farmName!.isNotEmpty)
        ? farmName!
        : 'Registered Farm Location';
    final displayLocation =
        (pickupLocation != null && pickupLocation!.isNotEmpty)
        ? pickupLocation!
        : 'Bordi Farm, Dahod Sector 2';
    final displayTransport =
        (transportType != null && transportType!.isNotEmpty)
        ? transportType!
        : 'FPO Pickup';
    final displayStatus = (status != null && status!.isNotEmpty)
        ? status!
        : 'Scheduled';
    final displayDate = (scheduledDate != null && scheduledDate!.isNotEmpty)
        ? 'Scheduled for $scheduledDate'
        : 'Scheduled Pickup';
    final hasDriver = driverName != null && driverName!.trim().isNotEmpty;

    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,
      appBar: AppBar(
        backgroundColor: ShreeAnnaTheme.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF394139)),
        ),
        title: const Text(
          'Pickup / Delivery',
          style: TextStyle(
            color: ShreeAnnaTheme.primaryGreen,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 6),
                    Text(
                      displayDate,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFD5DFD0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.local_shipping,
                            size: 16,
                            color: ShreeAnnaTheme.primaryGreen,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            displayTransport,
                            style: const TextStyle(
                              color: ShreeAnnaTheme.primaryGreen,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              _buildDriverAndTransitCard(context),
              const SizedBox(height: 16),

              // Map / location card
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Map placeholder
                    Container(
                      height: 140,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        color: const Color(0xFFE4EBDC),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LiveDriverMap(
                          lotId: lotId,
                          apiBaseUrl: apiBaseUrl,
                          accessToken: accessToken,
                          pickupLatitude: pickupLatitude,
                          pickupLongitude: pickupLongitude,
                        ),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'PICKUP LOCATION',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF707870),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            displayFarm,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            displayLocation,
                            style: const TextStyle(color: Color(0xFF707870)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Details grid
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD5DFD0)),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _detailLabel('MILLET TYPE', displayMillet),
                        ),
                        Expanded(child: _detailLabel('QUANTITY', displayQty)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _detailLabel(
                            'TRANSPORTATION TYPE',
                            displayTransport,
                          ),
                        ),
                        Expanded(child: _detailLabel('STATUS', displayStatus)),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Preparation instructions
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F7ED),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(
                          Icons.info_outline,
                          color: ShreeAnnaTheme.primaryGreen,
                          size: 18,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Preparation Instructions',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _prepItem(
                      'Ensure grain is properly aerated and ready for loading.',
                    ),
                    const SizedBox(height: 8),
                    _prepItem(
                      'Clear access roads for heavy transport vehicles (min 15ft width).',
                    ),
                    const SizedBox(height: 8),
                    _prepItem(
                      'Have relevant quality certs available for driver.',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Contact driver button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: hasDriver
                      ? () {
                          _showContactDriverModal(
                            context,
                            driverName!,
                            driverPhone ?? '',
                          );
                        }
                      : null,
                  icon: const Icon(Icons.phone, size: 18),
                  label: Text(
                    hasDriver
                        ? 'Contact Driver ($driverName)'
                        : 'Driver Pending Assignment',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: hasDriver
                        ? ShreeAnnaTheme.primaryGreen
                        : Colors.grey,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
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

  Widget _detailLabel(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Color(0xFF707870)),
        ),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _prepItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: const BoxDecoration(
            color: ShreeAnnaTheme.primaryGreen,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, color: Colors.white, size: 14),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Color(0xFF465046),
              fontSize: 12,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDriverAndTransitCard(BuildContext context) {
    final hasDriver = driverName != null && driverName!.trim().isNotEmpty;
    if (!hasDriver) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFBEB),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFFCD34D), width: 1.5),
        ),
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.schedule, color: Color(0xFFD97706), size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Driver Assignment Pending',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF92400E),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'A driver & vehicle will be assigned once shipment is scheduled in FPO Logistics portal.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFB45309),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    final actualDriverName = driverName!;
    final actualDriverPhone = driverPhone ?? '-';
    final actualVehicleNo = vehicleNumber ?? '-';
    final actualPickupCode = verificationCode ?? '-';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFC2D6BE), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.local_shipping,
                    color: ShreeAnnaTheme.primaryGreen,
                    size: 22,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'DRIVER & TRANSIT DETAILS',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: Color(0xFF202420),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF81C784)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.fiber_manual_record,
                      color: Colors.green,
                      size: 10,
                    ),
                    SizedBox(width: 4),
                    Text(
                      'En Route',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: Color(0xFFE0E0E0)),
          const SizedBox(height: 14),
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: ShreeAnnaTheme.primaryGreen.withOpacity(0.15),
                child: const Icon(
                  Icons.person,
                  color: ShreeAnnaTheme.primaryGreen,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      actualDriverName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202420),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Vehicle: $actualVehicleNo | $actualDriverPhone',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF687068),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Calling driver $actualDriverName ($actualDriverPhone)...',
                        ),
                      ),
                    );
                  },
                  icon: const Icon(
                    Icons.phone,
                    size: 18,
                    color: ShreeAnnaTheme.primaryGreen,
                  ),
                  label: const Text(
                    'Call Driver',
                    style: TextStyle(
                      color: ShreeAnnaTheme.primaryGreen,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    final sessionKey = lotId ?? actualDriverName.replaceAll(' ', '_');
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DriverChatScreen(
                          sessionId: 'trip_$sessionKey',
                          lotId: lotId ?? '',
                          lotNumber: lotId ?? '',
                          milletType: milletName ?? 'Millet',
                          quantityKg: quantity ?? '',
                          otherPartyName: actualDriverName,
                          otherPartyPhone: actualDriverPhone != '-' ? actualDriverPhone : '',
                          vehicleNumber: actualVehicleNo != '-' ? actualVehicleNo : '',
                          pickupCode: actualPickupCode != '-' ? actualPickupCode : '',
                          pickupLocation: pickupLocation ?? farmName ?? 'Farm Location',
                          farmerName: 'Farmer Member',
                          isDriver: false,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat, size: 18, color: Colors.white),
                  label: const Text(
                    'Live Chat',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF7FAF7),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFFE2E8E2)),
            ),
            child: const Row(
              children: [
                Icon(Icons.location_on, color: Colors.redAccent, size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Live Location',
                        style: TextStyle(
                          fontSize: 10,
                          color: Color(0xFF687068),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Actual GPS coordinates are shown on the map when available.',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF202420),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  ShreeAnnaTheme.primaryGreen.withOpacity(0.08),
                  ShreeAnnaTheme.primaryGreen.withOpacity(0.03),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: ShreeAnnaTheme.primaryGreen.withOpacity(0.3),
              ),
            ),
            child: Column(
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.security,
                      size: 16,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'PICKUP VERIFICATION CODE',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                        color: ShreeAnnaTheme.primaryGreen,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: actualPickupCode.split('').map((char) {
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 5),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: ShreeAnnaTheme.primaryGreen,
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: ShreeAnnaTheme.primaryGreen.withOpacity(
                              0.15,
                            ),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        char,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: ShreeAnnaTheme.primaryGreen,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Share this 4-digit code with logistics officer upon pickup verification.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: Color(0xFF556055),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


  void _showContactDriverModal(
    BuildContext context,
    String name,
    String phone,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Color(0xFFE8F5E9),
                    child: Icon(
                      Icons.person,
                      color: ShreeAnnaTheme.primaryGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Phone: ${phone.isNotEmpty ? phone : "+91 98765 43210"}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF687068),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Calling Driver $name ($phone)...'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.phone),
                  label: const Text(
                    'Call Driver Now',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// Displays actual driver coordinates returned by the backend. It deliberately
/// does not invent a driver position when no location has been reported.
class LiveDriverMap extends StatefulWidget {
  const LiveDriverMap({
    super.key,
    required this.lotId,
    required this.apiBaseUrl,
    required this.accessToken,
    this.pickupLatitude,
    this.pickupLongitude,
  });

  final String? lotId;
  final String? apiBaseUrl;
  final String? accessToken;
  final double? pickupLatitude;
  final double? pickupLongitude;

  @override
  State<LiveDriverMap> createState() => _LiveDriverMapState();
}

class _LiveDriverMapState extends State<LiveDriverMap> {
  final MapController _mapController = MapController();
  Timer? _timer;
  LatLng? _driverPosition;
  DateTime? _lastUpdated;
  bool _loading = true;
  String? _error;

  bool get _hasPickup =>
      widget.pickupLatitude != null && widget.pickupLongitude != null;

  @override
  void initState() {
    super.initState();
    _loadDriverLocation();
    // Polling is a simple MVP approach; switch to SignalR later for push updates.
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      _loadDriverLocation();
    });
  }

  @override
  void didUpdateWidget(covariant LiveDriverMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.lotId != widget.lotId ||
        oldWidget.apiBaseUrl != widget.apiBaseUrl ||
        oldWidget.accessToken != widget.accessToken) {
      _loadDriverLocation();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _loadDriverLocation() async {
    final baseUrl = widget.apiBaseUrl?.trim();
    final lotId = widget.lotId?.trim();
    if (baseUrl == null || baseUrl.isEmpty || lotId == null || lotId.isEmpty) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Connect the tracking API to show the driver location.';
        });
      }
      return;
    }

    try {
      // BACKEND CONTRACT: GET /api/lots/{lotId}/location
      // Expected JSON: { "latitude": 22.8, "longitude": 74.2,
      //                  "updatedAt": "2026-10-11T09:00:00Z" }
      final base = baseUrl.endsWith('/')
          ? baseUrl.substring(0, baseUrl.length - 1)
          : baseUrl;
      final uri = Uri.parse(
        '$base/api/lots/${Uri.encodeComponent(lotId)}/location',
      );
      final token = widget.accessToken?.trim();

      debugPrint(
        'Tracking token provided: ${token != null && token.isNotEmpty}',
      );
      debugPrint('Tracking token length: ${token?.length ?? 0}');

      final headers = <String, String>{'Accept': 'application/json'};

      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 8));

      debugPrint('Tracking GET: $uri');
      debugPrint('Tracking HTTP status: ${response.statusCode}');

      // Do not log the Authorization header or access token.
      if (response.statusCode < 200 || response.statusCode >= 300) {
        debugPrint('Tracking response body: ${response.body}');

        if (response.statusCode == 401) {
          throw Exception('HTTP 401: token missing, expired, or rejected.');
        }

        if (response.statusCode == 403) {
          throw Exception(
            'HTTP 403: authenticated user lacks tracking permission.',
          );
        }

        if (response.statusCode == 404) {
          throw Exception('HTTP 404: lot or driver location not found.');
        }

        throw Exception('Tracking API returned HTTP ${response.statusCode}.');
      }

      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException('Location response must be a JSON object.');
      }
      final lat = _toDouble(
        decoded['latitude'] ?? decoded['Latitude'] ?? decoded['lat'],
      );
      final lon = _toDouble(
        decoded['longitude'] ??
            decoded['Longitude'] ??
            decoded['lng'] ??
            decoded['lon'],
      );
      if (lat == null ||
          lon == null ||
          lat < -90 ||
          lat > 90 ||
          lon < -180 ||
          lon > 180) {
        throw const FormatException(
          'API response has no valid latitude/longitude.',
        );
      }
      final point = LatLng(lat, lon);
      final updatedRaw =
          decoded['updatedAt'] ??
          decoded['UpdatedAt'] ??
          decoded['lastUpdatedAt'];
      final updated = updatedRaw is String
          ? DateTime.tryParse(updatedRaw)?.toLocal()
          : null;
      if (!mounted) return;
      final firstFix = _driverPosition == null;
      setState(() {
        _driverPosition = point;
        _lastUpdated = updated;
        _loading = false;
        _error = null;
      });
      if (firstFix) {
        _mapController.move(point, 15);
      } else {
        _mapController.move(point, _mapController.camera.zoom);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        // Keep last known point visible but clearly indicate refresh failure.
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  double? _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final initialCenter =
        _driverPosition ??
        (_hasPickup
            ? LatLng(widget.pickupLatitude!, widget.pickupLongitude!)
            : const LatLng(
                22.5,
                72.0,
              )); // Gujarat overview only; not a driver position.

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: initialCenter,
            initialZoom: _driverPosition != null || _hasPickup ? 14 : 6,
            minZoom: 3,
            maxZoom: 18,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              // Replace with your app's real Android application ID.
              userAgentPackageName: 'com.shreeanna.app',
              maxZoom: 19,
            ),
            if (_hasPickup)
              MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(
                      widget.pickupLatitude!,
                      widget.pickupLongitude!,
                    ),
                    width: 38,
                    height: 38,
                    child: const Icon(
                      Icons.location_on,
                      color: Colors.red,
                      size: 34,
                    ),
                  ),
                ],
              ),
            if (_driverPosition != null)
              MarkerLayer(
                markers: [
                  Marker(
                    point: _driverPosition!,
                    width: 48,
                    height: 48,
                    child: Container(
                      decoration: BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 5),
                        ],
                      ),
                      child: const Icon(
                        Icons.local_shipping,
                        color: Colors.white,
                        size: 23,
                      ),
                    ),
                  ),
                ],
              ),
            const RichAttributionWidget(
              attributions: [
                TextSourceAttribution('© OpenStreetMap contributors'),
              ],
            ),
          ],
        ),
        Positioned(
          top: 8,
          left: 8,
          right: 8,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.95),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  _driverPosition == null
                      ? Icons.location_searching
                      : Icons.my_location,
                  color: _driverPosition == null
                      ? Colors.orange
                      : ShreeAnnaTheme.primaryGreen,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    _driverPosition == null
                        ? (_loading
                              ? 'Waiting for driver GPS…'
                              : 'Driver location unavailable')
                        : 'Live driver location',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                IconButton(
                  tooltip: 'Refresh location',
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 28,
                    minHeight: 28,
                  ),
                  onPressed: _loadDriverLocation,
                  icon: const Icon(Icons.refresh, size: 18),
                ),
              ],
            ),
          ),
        ),
        if (_error != null)
          Positioned(
            left: 8,
            right: 8,
            bottom: 8,
            child: Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                _driverPosition == null
                    ? _error!
                    : 'Location refresh failed: $_error',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 10, color: Colors.deepOrange),
              ),
            ),
          ),
        if (_lastUpdated != null)
          Positioned(
            right: 8,
            bottom: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(5),
              ),
              child: Text(
                'Updated ${TimeOfDay.fromDateTime(_lastUpdated!).format(context)}',
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
