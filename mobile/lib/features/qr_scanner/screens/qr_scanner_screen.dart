import 'dart:io';
import 'package:flutter/material.dart';
import 'package:mobile/data/models/vehicle.dart';
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

  @override
  void dispose() {
    _scannerController.dispose();
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
      body: Stack(
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
            bottom: 100,
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
      // In a real app, this would be an API call to validate the QR code
      // For now, we'll just simulate a network delay and show a demo vehicle
      await Future.delayed(const Duration(seconds: 2));
      
      // Demo vehicle data - in a real app, this would come from the API
      final demoVehicles = Vehicle.getDemoVehicles();
      
      if (code.length < 3 || int.tryParse(code) == null) {
        _showErrorDialog('Invalid vehicle code. Please scan a valid QR code.');
        return;
      }
      
      // Pick a vehicle based on the code's last digit to simulate different vehicles
      final index = int.parse(code.substring(code.length - 1)) % demoVehicles.length;
      final vehicle = demoVehicles[index];
      
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => VehicleDetailsScreen(vehicle: vehicle),
          ),
        );
      }
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
