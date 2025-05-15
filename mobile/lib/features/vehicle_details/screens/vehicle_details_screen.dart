import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/core/widgets/app_button.dart';
import 'package:mobile/data/models/vehicle.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/repositories/auth_repository.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/features/dashboard/screens/dashboard_screen.dart';
import 'package:mobile/features/vehicle_details/widgets/quota_indicator.dart';
import 'package:provider/provider.dart';

class VehicleDetailsScreen extends StatefulWidget {
  final Vehicle vehicle;

  const VehicleDetailsScreen({
    Key? key,
    required this.vehicle,
  }) : super(key: key);

  @override
  State<VehicleDetailsScreen> createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends State<VehicleDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _fuelAmountController = TextEditingController();
  bool _isProcessing = false;
  double? _enteredFuelAmount;

  @override
  void dispose() {
    _fuelAmountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => _handleBackPress(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: UIHelper.pagePadding,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildVehicleInfoCard(),
                UIHelper.vSpaceLarge,
                _buildQuotaSection(),
                UIHelper.vSpaceLarge,
                _buildFuelInputSection(),
                UIHelper.vSpaceLarge,
                _buildConfirmButton(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVehicleInfoCard() {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  widget.vehicle.vehicleType.toLowerCase() == 'motorcycle'
                      ? Icons.motorcycle
                      : widget.vehicle.vehicleType.toLowerCase() == 'van'
                          ? Icons.airport_shuttle
                          : Icons.directions_car,
                  size: 50,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
            UIHelper.vSpaceMedium,
            _buildInfoRow(
              'Registration Number',
              widget.vehicle.registrationNumber,
              Icons.confirmation_number,
            ),
            const Divider(),
            _buildInfoRow(
              'Vehicle Type',
              widget.vehicle.vehicleType,
              Icons.category,
            ),
            const Divider(),
            _buildInfoRow(
              'Owner Name',
              widget.vehicle.ownerName,
              Icons.person,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20,
            color: Colors.grey[600],
          ),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuotaSection() {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Fuel Quota',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            UIHelper.vSpaceSmall,
            QuotaIndicator(
              usedQuota: widget.vehicle.usedQuota,
              totalQuota: widget.vehicle.totalQuota,
            ),
            UIHelper.vSpaceMedium,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildQuotaValueCard(
                  'Available',
                  Formatter.formatFuel(widget.vehicle.availableQuota),
                  Colors.green,
                ),
                _buildQuotaValueCard(
                  'Used',
                  Formatter.formatFuel(widget.vehicle.usedQuota),
                  Colors.orange,
                ),
                _buildQuotaValueCard(
                  'Total',
                  Formatter.formatFuel(widget.vehicle.totalQuota),
                  Colors.blue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuotaValueCard(String label, String value, Color color) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.26,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: color.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFuelInputSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Enter Fuel Amount',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        UIHelper.vSpaceSmall,
        TextFormField(
          controller: _fuelAmountController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,1}$')),
          ],
          decoration: InputDecoration(
            hintText: 'Enter amount in liters',
            suffixText: 'L',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter fuel amount';
            }
            
            final fuelAmount = double.tryParse(value);
            if (fuelAmount == null) {
              return 'Please enter a valid number';
            }
            
            if (fuelAmount <= 0) {
              return 'Amount must be greater than 0';
            }
            
            if (fuelAmount > widget.vehicle.availableQuota) {
              return 'Amount exceeds available quota (${widget.vehicle.availableQuota} L)';
            }
            
            return null;
          },
          onChanged: (value) {
            setState(() {
              _enteredFuelAmount = double.tryParse(value);
            });
          },
        ),
        if (_enteredFuelAmount != null && _enteredFuelAmount! > 0)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Text(
              _enteredFuelAmount! > widget.vehicle.availableQuota
                  ? 'Warning: Amount exceeds available quota'
                  : 'Remaining quota after this transaction: ${Formatter.formatFuel(widget.vehicle.availableQuota - _enteredFuelAmount!)}',
              style: TextStyle(
                fontSize: 14,
                color: _enteredFuelAmount! > widget.vehicle.availableQuota
                    ? Colors.red
                    : Colors.green[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildConfirmButton() {
    return AppButton(
      label: 'Confirm Transaction',
      onPressed: _handleConfirmTransaction,
      isLoading: _isProcessing,
      backgroundColor: Theme.of(context).colorScheme.secondary,
      icon: Icons.check_circle,
    );
  }

  void _handleConfirmTransaction() async {
    if (_formKey.currentState?.validate() != true) {
      return;
    }
    
    setState(() {
      _isProcessing = true;
    });
    
    try {
      final fuelRepository = context.read<FuelRepository>();
      final user = context.read<AuthRepository>().currentUser;
      
      if (user == null) {
        throw Exception('User not authenticated');
      }
      
      final fuelAmount = double.parse(_fuelAmountController.text);
        // Make sure stationId is not null
      if (user.stationId == null) {
        throw Exception('Station ID not found for current user');
      }
      
      final success = await fuelRepository.pumpFuel(
        qrCode: widget.vehicle.id,
        vehicleId: widget.vehicle.id,
        pumpedLitres: fuelAmount,
        stationId: user.stationId!,
      );
      
      if (success && mounted) {
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) {
        UIHelper.showSnackBar(
          context,
          'Error processing transaction: $e',
          isError: true,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  void _showSuccessDialog() {
    final fuelAmount = double.parse(_fuelAmountController.text);
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green[700]),
            const SizedBox(width: 8),
            const Text('Success!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('You have dispensed ${Formatter.formatFuel(fuelAmount)} to ${widget.vehicle.registrationNumber}.'),
            const SizedBox(height: 16),
            Text('Remaining quota: ${Formatter.formatFuel(widget.vehicle.availableQuota - fuelAmount)}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              // Return to dashboard
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(
                  builder: (context) => DashboardScreen(
                    user: User.demo(),
                  ),
                ),
                (route) => false,
              );
            },
            child: const Text('Back to Dashboard'),
          ),
        ],
      ),
    );
  }

  void _handleBackPress(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Transaction'),
        content: const Text('Are you sure you want to cancel this transaction?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Close vehicle details screen
            },
            child: const Text('Yes'),
          ),
        ],
      ),
    );
  }
}
