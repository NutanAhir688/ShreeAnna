import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import '../models/driver_dispatch_model.dart';
import '../services/driver_api.dart';

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

  bool _isLoading = true;
  bool _isVerifying = false;
  final TextEditingController _otpController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadDriverData();
  }

  @override
  void dispose() {
    _otpController.dispose();
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

      if (mounted) {
        setState(() {
          _drivers = driversList;
          _selectedDriver = selected;
          _activeDispatch = dispatches.isNotEmpty ? dispatches.first : null;
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

  Future<void> _handleDriverChange(RegisteredDriver driver) async {
    setState(() {
      _selectedDriver = driver;
      _isLoading = true;
    });

    try {
      final dispatches = await _driverApi.getDriverJourneys(driver.phone);
      if (mounted) {
        setState(() {
          _activeDispatch = dispatches.isNotEmpty ? dispatches.first : null;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showPickupCodeModal() {
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
                    'Ask farmer (${_activeDispatch?.farmerOrProcessorName ?? 'Farmer'}) for the 4-digit verification code to confirm pickup.',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF596159)),
                  ),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFA5D6A7)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: Color(0xFF2E7D32), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Pickup Code for this lot: ${_activeDispatch?.verificationCode ?? '4829'}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1B5E20),
                            ),
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

                              setModalState(() => _isVerifying = true);
                              try {
                                if (_activeDispatch != null) {
                                  final updated = await _driverApi.verifyPickup(_activeDispatch!.id, code);
                                  if (mounted) {
                                    setState(() {
                                      _activeDispatch = updated;
                                    });
                                  }
                                  Navigator.pop(context);
                                  ScaffoldMessenger.of(this.context).showSnackBar(
                                    const SnackBar(
                                      backgroundColor: Color(0xFF087F23),
                                      content: Text('Pickup Verified! Route set to Warehouse Destination.'),
                                    ),
                                  );
                                }
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
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
            icon: const Icon(Icons.refresh, color: ShreeAnnaTheme.primaryGreen),
            onPressed: _loadDriverData,
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
                  const SizedBox(height: 16),
                  if (_activeDispatch == null)
                    _buildNoJourneyCard()
                  else ...[
                    _buildMapCard(),
                    const SizedBox(height: 16),
                    _buildJourneyDetailsCard(),
                    const SizedBox(height: 16),
                    _buildActionCard(),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildDriverProfileCard() {
    final driverName = _selectedDriver?.name ?? _activeDispatch?.driverName ?? 'Ravi Kumar';
    final vehicleNo = _selectedDriver?.vehicleNumber ?? _activeDispatch?.vehicleNumber ?? 'KA-09-AB-4521';
    final phone = _selectedDriver?.phone ?? _activeDispatch?.driverPhone ?? '9876543210';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD5DFD0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
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
          if (_drivers.length > 1)
            PopupMenuButton<RegisteredDriver>(
              icon: const Icon(Icons.swap_horiz, color: ShreeAnnaTheme.primaryGreen),
              onSelected: _handleDriverChange,
              itemBuilder: (context) {
                return _drivers.map((d) {
                  return PopupMenuItem(
                    value: d,
                    child: Text('${d.name} (${d.vehicleNumber})'),
                  );
                }).toList();
              },
            ),
        ],
      ),
    );
  }

  Widget _buildNoJourneyCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        children: const [
          Icon(Icons.check_circle_outline, size: 48, color: ShreeAnnaTheme.primaryGreen),
          SizedBox(height: 12),
          Text(
            'No Active Journey Assigned',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
          ),
          SizedBox(height: 4),
          Text(
            'All dispatches for your vehicle are currently completed.',
            style: TextStyle(fontSize: 12, color: Color(0xFF596159)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMapCard() {
    final statusUpper = (_activeDispatch?.status ?? '').toUpperCase();
    final isInTransit = statusUpper == 'IN_TRANSIT' || statusUpper == 'DELIVERED';

    final mapTitle = isInTransit ? 'DESTINATION WAREHOUSE ROUTE' : 'PICKUP LOCATION TRANSIT MAP';
    final targetLocation = isInTransit
        ? (_activeDispatch?.destinationAddress ?? 'Mandya Central Warehouse')
        : (_activeDispatch?.sourceAddress ?? 'Bordi Farm, Dahod');

    final lat = isInTransit ? '22.8397° N' : '37.4220° N';
    final lng = isInTransit ? '74.2558° E' : '122.0840° W';

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.vertical(top: Radius.circular(13)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      isInTransit ? Icons.warehouse_outlined : Icons.navigation_outlined,
                      color: isInTransit ? const Color(0xFF38BDF8) : const Color(0xFF34D399),
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      mapTitle,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isInTransit ? const Color(0xFF0284C7) : const Color(0xFF059669),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    isInTransit ? 'IN TRANSIT' : 'TRANSIT TO PICKUP',
                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          Container(
            height: 180,
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: CustomPaint(
              painter: _MapRoutePainter(isInTransit: isInTransit),
              child: Stack(
                children: [
                  Positioned(
                    left: 8,
                    top: isInTransit ? 110 : 20,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.local_shipping, color: Colors.amber, size: 14),
                          SizedBox(width: 4),
                          Text('Driver Vehicle', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    right: 8,
                    top: isInTransit ? 20 : 110,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isInTransit ? const Color(0xFF0284C7) : const Color(0xFF059669),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Icon(isInTransit ? Icons.warehouse : Icons.agriculture, color: Colors.white, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            isInTransit ? 'Warehouse Dock' : 'Farmer Farm',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(13)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isInTransit ? 'WAREHOUSE DESTINATION' : 'FARMER PICKUP LOCATION',
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
                Text(
                  'GPS: $lat, $lng',
                  style: const TextStyle(fontSize: 10, color: Color(0xFF34D399), fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJourneyDetailsCard() {
    final d = _activeDispatch;
    final statusUpper = (d?.status ?? '').toUpperCase();
    final isInTransit = statusUpper == 'IN_TRANSIT' || statusUpper == 'DELIVERED';

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
                  color: isInTransit ? const Color(0xFFDCEBFA) : const Color(0xFFFFE9D0),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  isInTransit ? 'IN TRANSIT' : 'PENDING PICKUP',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isInTransit ? const Color(0xFF1265C0) : const Color(0xFFE97900),
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xFFE2E8F0)),
          _buildInfoRow(Icons.agriculture_outlined, 'Farmer', d?.farmerOrProcessorName ?? 'Ramesh Patel'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.grass_outlined, 'Millet Type', '${d?.milletType ?? 'Finger Millet'} (${d?.totalQuantityKg.toStringAsFixed(0)} kg)'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.location_on_outlined, 'Pickup Location', d?.sourceAddress ?? 'Bordi Farm, Dahod'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.warehouse_outlined, 'Destination Warehouse', d?.destinationAddress ?? 'Mandya Central Warehouse'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.lock_outline, 'Pickup Code (OTP)', d?.verificationCode ?? '4829', isCode: true),
        ],
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
    final isInTransit = statusUpper == 'IN_TRANSIT' || statusUpper == 'DELIVERED';

    if (isInTransit) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFE3F2FD),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF90CAF9)),
        ),
        child: Column(
          children: const [
            Row(
              children: [
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
            SizedBox(height: 8),
            Text(
              'Show warehouse receiving team the shipment code upon arrival at Dock A.',
              style: TextStyle(fontSize: 11, color: Color(0xFF1E88E5)),
            ),
          ],
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton.icon(
        onPressed: _showPickupCodeModal,
        icon: const Icon(Icons.key, size: 20),
        label: const Text(
          'ARRIVED AT PICKUP - ENTER PICKUP CODE',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: ShreeAnnaTheme.primaryGreen,
          foregroundColor: Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }
}

class _MapRoutePainter extends CustomPainter {
  final bool isInTransit;

  _MapRoutePainter({required this.isInTransit});

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = isInTransit ? const Color(0xFF38BDF8) : const Color(0xFF34D399)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final dotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final startPoint = isInTransit ? Offset(40, size.height - 40) : Offset(40, 40);
    final endPoint = isInTransit ? Offset(size.width - 40, 40) : Offset(size.width - 40, size.height - 40);

    final path = Path();
    path.moveTo(startPoint.dx, startPoint.dy);
    path.cubicTo(
      size.width * 0.4,
      startPoint.dy,
      size.width * 0.6,
      endPoint.dy,
      endPoint.dx,
      endPoint.dy,
    );

    canvas.drawPath(path, linePaint);

    canvas.drawCircle(startPoint, 8, linePaint);
    canvas.drawCircle(startPoint, 4, dotPaint);

    canvas.drawCircle(endPoint, 8, linePaint);
    canvas.drawCircle(endPoint, 4, dotPaint);
  }

  @override
  bool shouldRepaint(covariant _MapRoutePainter oldDelegate) => oldDelegate.isInTransit != isInTransit;
}
