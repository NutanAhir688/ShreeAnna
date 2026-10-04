import 'package:flutter/material.dart';

import '../../../app/theme.dart';

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

  @override
  Widget build(BuildContext context) {
    final displayMillet = (milletName != null && milletName!.isNotEmpty) ? milletName! : 'Finger Millet (Ragi)';
    final displayQty = (quantity != null && quantity!.isNotEmpty) ? quantity! : '3,500 kg';
    final displayFarm = (farmName != null && farmName!.isNotEmpty) ? farmName! : 'Registered Farm Location';
    final displayLocation = (pickupLocation != null && pickupLocation!.isNotEmpty) ? pickupLocation! : 'Bordi Farm, Dahod Sector 2';
    final displayTransport = (transportType != null && transportType!.isNotEmpty) ? transportType! : 'FPO Pickup';
    final displayStatus = (status != null && status!.isNotEmpty) ? status! : 'Scheduled';
    final displayDate = (scheduledDate != null && scheduledDate!.isNotEmpty) ? 'Scheduled for $scheduledDate' : 'Scheduled Pickup';
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
                        child: Image.asset(
                          'assets/images/map.png',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Icon(
                                Icons.map_outlined,
                                size: 48,
                                color: ShreeAnnaTheme.primaryGreen,
                              ),
                            );
                          },
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
                          child: _detailLabel(
                            'MILLET TYPE',
                            displayMillet,
                          ),
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
                          _showContactDriverModal(context, driverName!, driverPhone ?? '');
                        }
                      : null,
                  icon: const Icon(Icons.phone, size: 18),
                  label: Text(
                    hasDriver ? 'Contact Driver ($driverName)' : 'Driver Pending Assignment',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: hasDriver ? ShreeAnnaTheme.primaryGreen : Colors.grey,
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
                        style: TextStyle(fontSize: 12, color: Color(0xFFB45309)),
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
    const liveLocation = 'Bordi Village Sector 2 (22.8397° N, 74.2558° E)';

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
                  Icon(Icons.local_shipping, color: ShreeAnnaTheme.primaryGreen, size: 22),
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
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF81C784)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.fiber_manual_record, color: Colors.green, size: 10),
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
                child: const Icon(Icons.person, color: ShreeAnnaTheme.primaryGreen, size: 24),
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
                      SnackBar(content: Text('Calling driver $actualDriverName ($actualDriverPhone)...')),
                    );
                  },
                  icon: const Icon(Icons.phone, size: 18, color: ShreeAnnaTheme.primaryGreen),
                  label: const Text(
                    'Call Driver',
                    style: TextStyle(color: ShreeAnnaTheme.primaryGreen, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showChatDialog(context, actualDriverName),
                  icon: const Icon(Icons.chat, size: 18, color: Colors.white),
                  label: const Text(
                    'Live Chat',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShreeAnnaTheme.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
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
                        style: TextStyle(fontSize: 10, color: Color(0xFF687068), fontWeight: FontWeight.w600),
                      ),
                      SizedBox(height: 2),
                      Text(
                        liveLocation,
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF202420)),
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
              border: Border.all(color: ShreeAnnaTheme.primaryGreen.withOpacity(0.3)),
            ),
            child: Column(
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.security, size: 16, color: ShreeAnnaTheme.primaryGreen),
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
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: ShreeAnnaTheme.primaryGreen, width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: ShreeAnnaTheme.primaryGreen.withOpacity(0.15),
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

  void _showChatDialog(BuildContext context, String driverName) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: Row(
            children: [
              const Icon(Icons.chat, color: ShreeAnnaTheme.primaryGreen),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Chat with $driverName',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F7F4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const CircleAvatar(
                      radius: 14,
                      backgroundColor: ShreeAnnaTheme.primaryGreen,
                      child: Text('R', style: TextStyle(color: Colors.white, fontSize: 12)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Ravi (Driver)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('Hello! I am on my way to your farm location for pickup.', style: TextStyle(fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  hintText: 'Type your message to driver...',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: ShreeAnnaTheme.primaryGreen),
              onPressed: () {
                if (controller.text.trim().isNotEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Message sent to driver successfully!')),
                  );
                }
                Navigator.pop(ctx);
              },
              child: const Text('Send'),
            ),
          ],
        );
      },
    );
  }

  void _showContactDriverModal(BuildContext context, String name, String phone) {
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
                    child: Icon(Icons.person, color: ShreeAnnaTheme.primaryGreen),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Phone: ${phone.isNotEmpty ? phone : "+91 98765 43210"}',
                          style: const TextStyle(fontSize: 13, color: Color(0xFF687068)),
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
                      SnackBar(content: Text('Calling Driver $name ($phone)...')),
                    );
                  },
                  icon: const Icon(Icons.phone),
                  label: const Text('Call Driver Now', style: TextStyle(fontWeight: FontWeight.bold)),
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
      },
    );
  }
}
