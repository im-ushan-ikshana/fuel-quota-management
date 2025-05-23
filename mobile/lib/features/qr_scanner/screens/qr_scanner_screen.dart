import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/data/models/vehicle.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/features/vehicle_details/screens/vehicle_details_screen.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({Key? key}) : super(key: key);

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    facing: CameraFacing.back,
    torchEnabled: false,
  );
  bool _isProcessingCode = false;
  final TextEditingController _registrationController = TextEditingController();

  @override
  void dispose() {
    _scannerController.dispose();
    _registrationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        actions: [
          IconButton(
            onPressed: _toggleTorch,
            icon: ValueListenableBuilder<TorchState>(
              valueListenable: _scannerController.torchState,
              builder: (context, state, child) {
                switch (state) {
                  case TorchState.off:
                    return const Icon(Icons.flash_off);
                  case TorchState.on:
                    return const Icon(Icons.flash_on);
                }
              },
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Scanner view (reduced height to make room for the input field)
          Expanded(
            flex: 3,
            child: Stack(
              children: [
                // Scanner view
                MobileScanner(
                  controller: _scannerController,
                  onDetect: _onDetect,
                ),
                
                // Scan overlay
                Center(
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.white,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                
                // Instructions
                Positioned(
                  bottom: 20,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    color: Colors.black.withOpacity(0.5),
                    child: const Text(
                      'Position the QR code within the square',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                
                // Processing indicator
                if (_isProcessingCode)
                  Container(
                    color: Colors.black.withOpacity(0.7),
                    child: const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  ),
              ],
            ),
          ),
          
          // Manual entry section
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(16.0),
              color: Theme.of(context).cardColor,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'OR Enter Vehicle Registration Number',
                    style: Theme.of(context).textTheme.titleMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _registrationController,
                          decoration: const InputDecoration(
                            hintText: 'e.g. ABC-1234',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          textCapitalization: TextCapitalization.characters,
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () => _processRegistrationNumber(_registrationController.text),
                        child: const Text('Search'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _toggleTorch() {
    _scannerController.toggleTorch();
  }
  
  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessingCode) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? code = barcodes.first.rawValue;
    if (code == null || code.isEmpty) {
      _showErrorDialog('Invalid QR code. Please try again.');
      return;
    }

    setState(() {
      _isProcessingCode = true;
    });

    try {
      await _processVehicleCode(code);
    } catch (e) {
      _showErrorDialog('Error processing QR code: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isProcessingCode = false;
        });
      }
    }
  }

  // Process either QR code or manual entry
  Future<void> _processVehicleCode(String code) async {
    // Get the fuel repository to check quota
    final fuelRepository = Provider.of<FuelRepository>(context, listen: false);
    
    // Try to fetch vehicle data using the code
    // For demo purposes, we'll still use the mock data since the API isn't ready
    
    // In a production app, we would call:
    // final quotaResponse = await fuelRepository.checkQuota(code);
    
    // Mock data for now
    await Future.delayed(const Duration(seconds: 1));
    final demoVehicles = Vehicle.getDemoVehicles();
    
    // Find matching vehicle by registration number (for manual entry)
    Vehicle? matchedVehicle = demoVehicles.firstWhere(
      (v) => v.registrationNumber.toLowerCase() == code.toLowerCase(),
      orElse: () => demoVehicles[0], // Default to first vehicle if not found
    );
    
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => VehicleDetailsScreen(vehicle: matchedVehicle),
        ),
      );
    }
  }
  
  // Handle manual entry of registration number
  void _processRegistrationNumber(String registrationNumber) {
    if (registrationNumber.isEmpty) {
      _showErrorDialog('Please enter a vehicle registration number');
      return;
    }
    
    setState(() {
      _isProcessingCode = true;
    });
    
    try {
      _processVehicleCode(registrationNumber);
    } catch (e) {
      _showErrorDialog('Error finding vehicle: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isProcessingCode = false;
        });
      }
    }
  }

  void _showErrorDialog(String message) {
    if (!mounted) return;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    ).then((_) {
      if (mounted) {
        setState(() {
          _isProcessingCode = false;
        });
      }
    });
  }
}
