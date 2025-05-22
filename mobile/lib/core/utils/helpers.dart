import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Formatter {
  // Format date to user-friendly string
  static String formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  // Format date and time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM dd, yyyy HH:mm').format(dateTime);
  }

  // Format time only
  static String formatTime(DateTime time) {
    return DateFormat('HH:mm').format(time);
  }

  // Format currency
  static String formatCurrency(double amount) {
    return NumberFormat.currency(symbol: '\$', decimalDigits: 2).format(amount);
  }

  // Format fuel amount with liters
  static String formatFuel(double amount) {
    return '${amount.toStringAsFixed(1)} L';
  }
}

class UIHelper {
  // Show a snackbar
  static void showSnackBar(BuildContext context, String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Show a dialog
  static Future<bool?> showConfirmDialog(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
  }) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }

  // Common vertical spacing
  static const SizedBox vSpaceSmall = SizedBox(height: 8.0);
  static const SizedBox vSpaceMedium = SizedBox(height: 16.0);
  static const SizedBox vSpaceLarge = SizedBox(height: 24.0);

  // Common horizontal spacing
  static const SizedBox hSpaceSmall = SizedBox(width: 8.0);
  static const SizedBox hSpaceMedium = SizedBox(width: 16.0);
  static const SizedBox hSpaceLarge = SizedBox(width: 24.0);

  // Page padding
  static const EdgeInsets pagePadding = EdgeInsets.all(16.0);
  static const EdgeInsets pagePaddingHorizontal = EdgeInsets.symmetric(horizontal: 16.0);
  static const EdgeInsets pagePaddingVertical = EdgeInsets.symmetric(vertical: 16.0);
}
