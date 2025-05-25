import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/features/dashboard/widgets/recent_transaction_card.dart';
import 'package:mobile/features/transaction_history/screens/transaction_history_screen.dart';

class RecentTransactionsSection extends StatelessWidget {
  const RecentTransactionsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Transactions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () => _showAllTransactions(context),
              child: const Text('View All'),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        Consumer<FuelRepository>(
          builder: (context, fuelRepo, child) {
            if (fuelRepo.isLoading) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: CircularProgressIndicator(),
                ),
              );
            }

            if (fuelRepo.error != null) {
              return Card(
                color: Colors.red[50],
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: Colors.red[700],
                        size: 32,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Failed to load transactions',
                        style: TextStyle(
                          color: Colors.red[700],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        fuelRepo.error!,
                        style: TextStyle(
                          color: Colors.red[600],
                          fontSize: 12,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => fuelRepo.loadRecentTransactions(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              );
            }

            if (fuelRepo.recentTransactions.isEmpty) {
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      Icon(
                        Icons.receipt_long,
                        size: 48,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No Recent Transactions',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Start by scanning a vehicle QR code to record your first transaction.',
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              );
            }

            // Show recent transactions (limit to 5)
            final transactions = fuelRepo.recentTransactions.take(5).toList();
            
            return Column(
              children: transactions.map((transaction) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: RecentTransactionCard(transaction: transaction),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  void _showAllTransactions(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const TransactionHistoryScreen(),
      ),
    );
  }
}
