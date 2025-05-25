import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/data/models/transaction.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/features/dashboard/widgets/recent_transaction_card.dart';
import 'package:mobile/features/transaction_history/screens/transaction_history_screen.dart';

class RecentTransactionsSection extends StatelessWidget {
  const RecentTransactionsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<FuelRepository>(
      builder: (context, fuelRepo, child) {
        final recentTransactions = fuelRepo.recentTransactions.take(3).toList();
        
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
            ),            TextButton(
              onPressed: () => _navigateToAllTransactions(context),
              child: const Text('View All'),
            ),
          ],
        ),        const SizedBox(height: 16),
        
        if (fuelRepo.isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 32.0),
              child: CircularProgressIndicator(),
            ),
          )
        else if (fuelRepo.error != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.red[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.red[200]!),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Colors.red[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Error loading transactions',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.red[700],
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  fuelRepo.error!,
                  style: TextStyle(color: Colors.red[700]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => fuelRepo.loadRecentTransactions(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          )
        else if (recentTransactions.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).colorScheme.outline.withAlpha(51), // 0.2 opacity
              ),
            ),
            child: Column(
              children: [                Icon(
                  Icons.receipt_long_outlined,
                  size: 48,
                  color: Theme.of(context).colorScheme.outline.withAlpha(128), // 0.5 opacity
                ),
                const SizedBox(height: 16),
                Text(
                  'No transactions yet',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Start by scanning a QR code to pump fuel',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.outline.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          )
        else
          ...recentTransactions.map(
            (transaction) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: RecentTransactionCard(transaction: transaction),
            ),
          ),      ],
    );
      },
    );
  }
  
  void _navigateToAllTransactions(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const TransactionHistoryScreen(),
      ),
    );
  }
}