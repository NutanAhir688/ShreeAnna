import 'package:flutter/material.dart';

import '../../../app/theme.dart';

import '../../lots/screen/my_lots_screen.dart';
import '../../lots/screen/sell_millet_screen.dart';
import '../../lots/screen/lot_details_screen.dart';
import '../../farm/screen/farm_management_screen.dart';

import '../../profile/screen/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _onNavigationItemSelected(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShreeAnnaTheme.background,

      // ----------------------------------------------------------
      // BODY
      // ----------------------------------------------------------
      body: _getBody(),

      // ----------------------------------------------------------
      // BOTTOM NAVIGATION
      // ----------------------------------------------------------
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _getBody() {
    switch (_selectedIndex) {
      case 0:
        return SafeArea(child: _buildHomeContent());
      case 1:
        return const MyLotsScreen();
      case 2:
        return const FarmManagementScreen();
      case 3:
        return const ProfileScreen();
      default:
        return SafeArea(child: _buildHomeContent());
    }
  }

  // ============================================================
  // HOME CONTENT
  // ============================================================

  Widget _buildHomeContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ------------------------------------------------------
          // HEADER
          // ------------------------------------------------------

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, Ramesh Kumar',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF202420),
                    ),
                  ),

                  SizedBox(height: 5),

                  Text(
                    'Current FPO: Green Valley Cooperative',
                    style: TextStyle(fontSize: 11, color: Color(0xFF596159)),
                  ),
                ],
              ),

              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: ShreeAnnaTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Icon(
                  Icons.notifications_none,
                  color: Colors.white,
                  size: 22,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // ------------------------------------------------------
          // SELL MILLET BUTTON
          // ------------------------------------------------------
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SellMilletScreen()),
                );
              },
              icon: const Icon(Icons.agriculture, size: 19),
              label: const Text(
                'Sell Millet',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: ShreeAnnaTheme.primaryGreen,
                foregroundColor: Colors.white,
                elevation: 1,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ------------------------------------------------------
          // ACTIVE LOTS
          // ------------------------------------------------------
          _buildActiveLotsCard(),

          const SizedBox(height: 22),

          // ------------------------------------------------------
          // RECENT LOT STATUS
          // ------------------------------------------------------
          const Text(
            'Recent Lot Status',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF202420),
            ),
          ),

          const SizedBox(height: 10),

          _buildLotCard(
            lotNumber: '#001',
            millet: 'Pearl Millet',
            status: 'Inspection Completed',
            statusColor: const Color(0xFF087F23),
            statusBackground: const Color(0xFFDFF3E2),
            submittedDate: 'Oct 24, 2026',
            action: 'Agreement Awaiting Approval',
          ),

          const SizedBox(height: 10),

          _buildLotCard(
            lotNumber: '#002',
            millet: 'Finger Millet',
            status: 'Pickup Scheduled',
            statusColor: const Color(0xFF1265C0),
            statusBackground: const Color(0xFFDCEBFA),
            submittedDate: 'Oct 26, 2026',
            action: 'Pickup Scheduled',
          ),

          const SizedBox(height: 10),

          _buildLotCard(
            lotNumber: '#003',
            millet: 'Pearl Millet',
            status: 'Payment Processing',
            statusColor: const Color(0xFF008A29),
            statusBackground: const Color(0xFFDFF3E2),
            submittedDate: 'Oct 15, 2026',
            action: 'Payment Processing',
          ),

          const SizedBox(height: 18),

          // ------------------------------------------------------
          // WAREHOUSE IMAGE
          // ------------------------------------------------------
          ClipRRect(
            borderRadius: BorderRadius.circular(5),
            child: Image.asset(
              'assets/images/warehouse.png',
              width: double.infinity,
              height: 150,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: double.infinity,
                  height: 150,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE4EBDC),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: const Icon(
                    Icons.warehouse_outlined,
                    size: 50,
                    color: ShreeAnnaTheme.primaryGreen,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // ACTIVE LOTS CARD
  // ============================================================

  Widget _buildActiveLotsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F7ED),
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Active Lots',
                  style: TextStyle(fontSize: 12, color: Color(0xFF596159)),
                ),

                const SizedBox(height: 6),

                const Text(
                  '3 Lots',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF202420),
                  ),
                ),

                const SizedBox(height: 5),

                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: ShreeAnnaTheme.primaryGreen,
                        shape: BoxShape.circle,
                      ),
                    ),

                    const SizedBox(width: 6),

                    const Text(
                      '2 Pending Action',
                      style: TextStyle(
                        fontSize: 11,
                        color: ShreeAnnaTheme.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: ShreeAnnaTheme.primaryGreen,
              borderRadius: BorderRadius.circular(5),
            ),
            child: const Icon(
              Icons.inventory_2_outlined,
              color: Colors.white,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // LOT CARD
  // ============================================================

  Widget _buildLotCard({
    required String lotNumber,
    required String millet,
    required String status,
    required Color statusColor,
    required Color statusBackground,
    required String submittedDate,
    required String action,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: const Color(0xFFD5DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ------------------------------------------------------
          // LOT HEADER
          // ------------------------------------------------------

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lot $lotNumber',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF596159),
                ),
              ),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBackground,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          Text(
            millet,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF202420),
            ),
          ),

          const SizedBox(height: 6),

          Text(
            'Submitted: $submittedDate',
            style: const TextStyle(fontSize: 10, color: Color(0xFF707870)),
          ),

          const SizedBox(height: 8),

          // ------------------------------------------------------
          // CURRENT ACTION
          // ------------------------------------------------------
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
              ),

              const SizedBox(width: 6),

              Expanded(
                child: Text(
                  action,
                  style: TextStyle(
                    fontSize: 10,
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ------------------------------------------------------
          // VIEW DETAILS
          // ------------------------------------------------------
          SizedBox(
            width: double.infinity,
            height: 34,
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => LotDetailsScreen(
                      lotNumber: lotNumber,
                      milletName: millet,
                      quantity: '1,200 kg',
                      submissionDate: submittedDate,
                      status: status,
                    ),
                  ),
                );
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: ShreeAnnaTheme.primaryGreen,
                side: const BorderSide(color: ShreeAnnaTheme.primaryGreen),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              child: const Text(
                'View Details',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // BOTTOM NAVIGATION
  // ============================================================

  Widget _buildBottomNavigationBar() {
    return NavigationBar(
      selectedIndex: _selectedIndex,
      onDestinationSelected: _onNavigationItemSelected,

      backgroundColor: Colors.white,

      indicatorColor: const Color(0xFFDDEED9),

      height: 65,

      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home),
          label: 'Home',
        ),

        NavigationDestination(
          icon: Icon(Icons.inventory_2_outlined),
          selectedIcon: Icon(Icons.inventory_2),
          label: 'My Lots',
        ),

        NavigationDestination(
          icon: Icon(Icons.agriculture_outlined),
          selectedIcon: Icon(Icons.agriculture),
          label: 'Farm',
        ),

        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
    );
  }
}
