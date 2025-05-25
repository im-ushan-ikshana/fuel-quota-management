import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/features/dashboard/widgets/recent_transaction_card.dart';

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() => _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  @override
  void initState() {
    super.initState();
    // Load transactions when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FuelRepository>().loadRecentTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction History'),
        actions: [
          IconButton(
            onPressed: _refreshTransactions,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Consumer<FuelRepository>(
        builder: (context, fuelRepo, child) {
          if (fuelRepo.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (fuelRepo.error != null) {
            return Center(
              child: Padding(
                padding: UIHelper.pagePadding,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.red[300],
                    ),
                    UIHelper.vSpaceMedium,
                    Text(
                      'Failed to load transactions',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    UIHelper.vSpaceSmall,
                    Text(
                      fuelRepo.error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    UIHelper.vSpaceMedium,
                    ElevatedButton(
                      onPressed: _refreshTransactions,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (fuelRepo.recentTransactions.isEmpty) {
            return Center(
              child: Padding(
                padding: UIHelper.pagePadding,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.receipt_long,
                      size: 64,
                      color: Colors.grey[300],
                    ),
                    UIHelper.vSpaceMedium,
                    Text(
                      'No Transactions Found',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    UIHelper.vSpaceSmall,
                    Text(
                      'Start by scanning vehicle QR codes to record transactions.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshTransactions,
            child: ListView.builder(
              padding: UIHelper.pagePadding,
              itemCount: fuelRepo.recentTransactions.length,
              itemBuilder: (context, index) {
                final transaction = fuelRepo.recentTransactions[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: RecentTransactionCard(transaction: transaction),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Future<void> _refreshTransactions() async {
    await context.read<FuelRepository>().loadRecentTransactions();
  }
}
