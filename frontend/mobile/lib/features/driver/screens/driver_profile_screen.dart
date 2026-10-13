import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../core/storage/token_storage.dart';
import '../../auth/screen/welcome_screen.dart';
import '../models/driver_dispatch_model.dart';

class DriverProfileScreen extends StatefulWidget {
  final RegisteredDriver? driver;
  final DriverDispatchModel? activeDispatch;
  final bool isTracking;
  final VoidCallback? onStopTracking;
  final Function(RegisteredDriver)? onDriverChanged;
  final List<RegisteredDriver> availableDrivers;

  const DriverProfileScreen({
    super.key,
    required this.driver,
    this.activeDispatch,
    this.isTracking = false,
    this.onStopTracking,
    this.onDriverChanged,
    this.availableDrivers = const [],
  });

  @override
  State<DriverProfileScreen> createState() => _DriverProfileScreenState();
}

class _DriverProfileScreenState extends State<DriverProfileScreen> {
  late bool _isActive;

  @override
  void initState() {
    super.initState();
    // Initialize from driver status — treat AVAILABLE / ON_DUTY as active
    final status = (widget.driver?.status ?? 'AVAILABLE').toUpperCase();
    _isActive = status == 'AVAILABLE' || status == 'ON_DUTY' || status == 'ACTIVE';
  }

  Future<void> _handleLogout(BuildContext context) async {
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

    if (confirmed == true && context.mounted) {
      if (widget.onStopTracking != null) {
        widget.onStopTracking!();
      }
      await TokenStorage().clearAll();

      if (context.mounted) {
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
    final String name = (widget.driver?.name != null && widget.driver!.name.trim().isNotEmpty)
        ? widget.driver!.name
        : ((widget.activeDispatch?.driverName != null && widget.activeDispatch!.driverName.trim().isNotEmpty)
            ? widget.activeDispatch!.driverName
            : 'Rajesh Kumar');
    final String phone = (widget.driver?.phone != null && widget.driver!.phone.trim().isNotEmpty)
        ? widget.driver!.phone
        : ((widget.activeDispatch?.driverPhone != null && widget.activeDispatch!.driverPhone.trim().isNotEmpty)
            ? widget.activeDispatch!.driverPhone
            : '9827246276');
    final String vehicleNo = (widget.driver?.vehicleNumber != null && widget.driver!.vehicleNumber.trim().isNotEmpty)
        ? widget.driver!.vehicleNumber
        : ((widget.activeDispatch?.vehicleNumber != null && widget.activeDispatch!.vehicleNumber.trim().isNotEmpty)
            ? widget.activeDispatch!.vehicleNumber
            : 'GJ-01-HT-4589');
    final String code = (widget.driver?.driverCode != null && widget.driver!.driverCode.trim().isNotEmpty)
        ? widget.driver!.driverCode
        : 'DRV-004';
    final String license = (widget.driver?.licenseNumber != null && widget.driver!.licenseNumber.trim().isNotEmpty)
        ? widget.driver!.licenseNumber
        : 'DL-GJ-2024-8891';
    final double capacity = widget.driver?.vehicleCapacityKg ?? widget.activeDispatch?.vehicleCapacityKg ?? 7000.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        title: const Text(
          'Driver Profile',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
            tooltip: 'Logout',
            onPressed: () => _handleLogout(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Profile Card with Active/Inactive toggle
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: const [
                  BoxShadow(color: Color(0x06000000), blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  // Active / Inactive toggle row at the TOP
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: _isActive ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _isActive ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                              size: 18,
                              color: _isActive ? const Color(0xFF059669) : const Color(0xFFDC2626),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _isActive ? 'ACTIVE — Available for Dispatch' : 'INACTIVE — Not Available',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _isActive ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                              ),
                            ),
                          ],
                        ),
                        Switch(
                          value: _isActive,
                          activeThumbColor: const Color(0xFF059669),
                          activeTrackColor: const Color(0xFFA7F3D0),
                          inactiveThumbColor: const Color(0xFFDC2626),
                          inactiveTrackColor: const Color(0xFFFCA5A5),
                          onChanged: (value) {
                            setState(() => _isActive = value);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: value ? const Color(0xFF059669) : const Color(0xFFDC2626),
                                content: Text(
                                  value
                                      ? 'Status set to Active — You are now available for dispatch.'
                                      : 'Status set to Inactive — You will not receive new dispatches.',
                                ),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Avatar
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F766E).withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF0F766E), width: 2.5),
                        ),
                        child: const Icon(
                          Icons.local_shipping,
                          size: 38,
                          color: Color(0xFF0F766E),
                        ),
                      ),
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: _isActive ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: Icon(
                          _isActive ? Icons.check : Icons.remove,
                          size: 14,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Driver ID: $code  •  $phone',
                    style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 10),
                  if (widget.isTracking)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.gps_fixed, size: 10, color: Color(0xFFD97706)),
                          SizedBox(width: 5),
                          Text(
                            'GPS LIVE',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF92400E),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Vehicle Information Card
            const Text(
              'VEHICLE & TRANSPORTATION',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _infoRow(
                    icon: Icons.directions_car,
                    title: 'Vehicle Number',
                    value: vehicleNo,
                    iconColor: const Color(0xFF0F766E),
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),
                  _infoRow(
                    icon: Icons.fitness_center,
                    title: 'Vehicle Capacity',
                    value: '${capacity.toStringAsFixed(0)} kg',
                    iconColor: const Color(0xFF0F766E),
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),
                  _infoRow(
                    icon: Icons.card_membership,
                    title: 'License Number',
                    value: license,
                    iconColor: const Color(0xFF0F766E),
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),
                  _infoRow(
                    icon: Icons.domain,
                    title: 'Organization',
                    value: 'ShreeAnna Logistics FPO',
                    iconColor: const Color(0xFF0F766E),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Current Active Assignment Card
            const Text(
              'ACTIVE DISPATCH ASSIGNMENT',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _infoRow(
                    icon: Icons.confirmation_number_outlined,
                    title: 'Shipment Code',
                    value: (widget.activeDispatch?.dispatchCode != null && widget.activeDispatch!.dispatchCode.trim().isNotEmpty)
                        ? '#${widget.activeDispatch!.dispatchCode}'
                        : 'No active shipment',
                    iconColor: ShreeAnnaTheme.primaryGreen,
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),
                  _infoRow(
                    icon: Icons.person_outline,
                    title: 'Assigned Farmer',
                    value: (widget.activeDispatch?.farmerOrProcessorName != null && widget.activeDispatch!.farmerOrProcessorName.trim().isNotEmpty)
                        ? widget.activeDispatch!.farmerOrProcessorName
                        : 'None',
                    iconColor: ShreeAnnaTheme.primaryGreen,
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),
                  _infoRow(
                    icon: Icons.warehouse_outlined,
                    title: 'Destination Warehouse',
                    value: (widget.activeDispatch?.warehouseName != null && widget.activeDispatch!.warehouseName.trim().isNotEmpty)
                        ? widget.activeDispatch!.warehouseName
                        : 'Mandya Central Warehouse',
                    iconColor: ShreeAnnaTheme.primaryGreen,
                  ),
                  const Divider(height: 20, color: Color(0xFFF1F5F9)),
                  _infoRow(
                    icon: Icons.route_outlined,
                    title: 'Trip Status',
                    value: (widget.activeDispatch?.status != null && widget.activeDispatch!.status.trim().isNotEmpty)
                        ? widget.activeDispatch!.status
                        : 'Pending Assignment',
                    iconColor: ShreeAnnaTheme.primaryGreen,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () => _handleLogout(context),
                icon: const Icon(Icons.logout, size: 20),
                label: const Text(
                  'LOGOUT FROM DRIVER ACCOUNT',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFDC2626),
                  foregroundColor: Colors.white,
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow({
    required IconData icon,
    required String title,
    required String value,
    required Color iconColor,
  }) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
