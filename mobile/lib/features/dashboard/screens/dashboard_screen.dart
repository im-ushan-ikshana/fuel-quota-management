import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/data/models/transaction.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/repositories/auth_repository.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/dashboard/widgets/recent_transaction_card.dart';
import 'package:mobile/features/dashboard/widgets/summary_card.dart';
import 'package:mobile/features/qr_scanner/screens/qr_scanner_screen.dart';

class DashboardScreen extends StatefulWidget {
  final User user;

  const DashboardScreen({Key? key, required this.user}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Demo data
  late List<Transaction> _recentTransactions;
  late double _totalFuelDispensed;
  late int _customersServed;
  
  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  void _loadDashboardData() {
    // In a real app, this would come from an API
    _recentTransactions = Transaction.getDemoTransactions();
    
    // Calculate summary values
    _totalFuelDispensed = _recentTransactions.fold(
      0, (sum, transaction) => sum + transaction.fuelAmount);
    _customersServed = _recentTransactions.length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: UIHelper.pagePadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome message
                _buildWelcomeSection(),
                UIHelper.vSpaceMedium,
                
                // Scan QR Code Button
                _buildScanQRButton(),
                UIHelper.vSpaceLarge,
                
                // Today's summary cards
                _buildSummarySection(),
                UIHelper.vSpaceLarge,
                
                // Recent transactions
                _buildRecentTransactionsSection(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome, ${widget.user.fullName}',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        UIHelper.vSpaceSmall,
        Text(
          widget.user.stationName,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
              ),
        ),
        Text(
          'Today: ${Formatter.formatDate(DateTime.now())}',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.6),
              ),
        ),
      ],
    );
  }

  Widget _buildScanQRButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton.icon(
        onPressed: _handleScanQR,
        icon: const Icon(Icons.qr_code_scanner, size: 30),
        label: const Text(
          'Scan QR Code',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
          elevation: 3,
        ),
      ),
    );
  }
  Widget _buildSummarySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Today\'s Summary',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, '/sample-qr');
              },
              icon: const Icon(Icons.qr_code),
              label: const Text('QR Samples'),
              style: TextButton.styleFrom(
                foregroundColor: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
        UIHelper.vSpaceMedium,
        Row(
          children: [
            Expanded(
              child: SummaryCard(
                title: 'Fuel Dispensed',
                value: Formatter.formatFuel(_totalFuelDispensed),
                icon: Icons.local_gas_station,
                color: Colors.blue,
              ),
            ),
            UIHelper.hSpaceMedium,
            Expanded(
              child: SummaryCard(
                title: 'Customers Served',
                value: _customersServed.toString(),
                icon: Icons.people,
                color: Colors.green,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentTransactionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Transactions',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        UIHelper.vSpaceMedium,
        _recentTransactions.isEmpty
            ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No recent transactions'),
                ),
              )
            : ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _recentTransactions.length,
                separatorBuilder: (context, index) => UIHelper.vSpaceSmall,
                itemBuilder: (context, index) {
                  return RecentTransactionCard(
                    transaction: _recentTransactions[index],
                  );
                },
              ),
      ],
    );
  }

  void _handleScanQR() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const QRScannerScreen(),
      ),
    );
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) => const LoginScreen(),
                ),
              );
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleRefresh() async {
    // In a real app, this would refresh data from a server
    await Future.delayed(const Duration(seconds: 1));
    _loadDashboardData();
    setState(() {});
  }
}
