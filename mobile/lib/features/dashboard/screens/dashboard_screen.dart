import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/data/repositories/auth_repository_new.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/features/dashboard/widgets/operator_info_card.dart';
import 'package:mobile/features/dashboard/widgets/quick_actions_section.dart';
import 'package:mobile/features/dashboard/widgets/recent_transactions_section.dart';
import 'package:mobile/features/qr_scanner/screens/qr_scanner_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Load recent transactions when dashboard opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FuelRepository>().loadRecentTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fuel Quota Manager'),
        automaticallyImplyLeading: false,
        actions: [
          Consumer<AuthRepository>(
            builder: (context, authRepo, child) {
              return PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'logout') {
                    _handleLogout(authRepo);
                  } else if (value == 'profile') {
                    _showOperatorProfile(authRepo);
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'profile',
                    child: Row(
                      children: [
                        Icon(Icons.person, color: Colors.grey[600]),
                        const SizedBox(width: 8),
                        const Text('Profile'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout, color: Colors.grey[600]),
                        const SizedBox(width: 8),
                        const Text('Logout'),
                      ],
                    ),
                  ),
                ],
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: Theme.of(context).colorScheme.secondary,
                        child: Text(
                          authRepo.currentUser?.firstName.substring(0, 1).toUpperCase() ?? 'O',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        Icons.arrow_drop_down,
                        color: Colors.white,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            context.read<AuthRepository>().refreshProfile(),
            context.read<FuelRepository>().loadRecentTransactions(),
          ]);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Operator info card
              Consumer<AuthRepository>(
                builder: (context, authRepo, child) {
                  if (authRepo.currentUser != null) {
                    return OperatorInfoCard(operator: authRepo.currentUser!);
                  }
                  return const SizedBox.shrink();
                },
              ),
              
              const SizedBox(height: 24),
              
              // Quick actions
              const QuickActionsSection(),
              
              const SizedBox(height: 24),
                // Recent transactions
              const RecentTransactionsSection(),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToQRScanner(),
        icon: const Icon(Icons.qr_code_scanner),
        label: const Text('Scan QR'),
        backgroundColor: Theme.of(context).colorScheme.secondary,
      ),
    );
  }

  void _navigateToQRScanner() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const QRScannerScreen(),
      ),
    );
  }

  void _handleLogout(AuthRepository authRepo) async {
    final confirm = await UIHelper.showConfirmDialog(
      context,
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
    );

    if (confirm == true) {
      await authRepo.logout();
      if (mounted) {
        UIHelper.showSnackBar(
          context,
          'You have been logged out successfully',
        );
      }
    }
  }

  void _showOperatorProfile(AuthRepository authRepo) {
    final user = authRepo.currentUser;
    if (user == null) return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: Theme.of(context).colorScheme.secondary,
              child: Text(
                user.firstName.substring(0, 1).toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Text('Profile'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileRow('Name', user.fullName),
            _buildProfileRow('Email', user.email),
            _buildProfileRow('Employee ID', user.employeeId ?? 'N/A'),
            _buildProfileRow('Station', user.stationName ?? 'N/A'),
            _buildProfileRow('Station Code', user.stationCode ?? 'N/A'),
            _buildProfileRow('Role', user.role),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}