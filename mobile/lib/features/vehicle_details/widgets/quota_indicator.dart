import 'package:flutter/material.dart';

class QuotaIndicator extends StatelessWidget {
  final double usedQuota;
  final double totalQuota;

  const QuotaIndicator({
    Key? key,
    required this.usedQuota,
    required this.totalQuota,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double percentage = (usedQuota / totalQuota).clamp(0.0, 1.0);
    final double availablePercentage = 1.0 - percentage;

    // Define colors based on availability
    Color progressColor;
    if (availablePercentage > 0.6) {
      progressColor = Colors.green;
    } else if (availablePercentage > 0.3) {
      progressColor = Colors.orange;
    } else {
      progressColor = Colors.red;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: percentage,
            backgroundColor: Colors.grey[200],
            color: progressColor,
            minHeight: 15,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildLegendItem('Used', Colors.grey[400]!, percentage),
            _buildLegendItem('Available', progressColor, availablePercentage),
          ],
        ),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color, double percentage) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          '$label (${(percentage * 100).toStringAsFixed(1)}%)',
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }
}
