import 'package:flutter/material.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:qr_flutter/qr_flutter.dart';

class SampleQRCodeGenerator extends StatelessWidget {
  const SampleQRCodeGenerator({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sample QR Codes'),
      ),
      body: ListView(
        padding: UIHelper.pagePadding,
        children: [
          _buildInfoSection(context),
          UIHelper.vSpaceLarge,
          _buildQRTile(context, '12345', 'Car: ABC-1234', 'James Smith'),
          UIHelper.vSpaceLarge,
          _buildQRTile(context, '56782', 'Van: XYZ-5678', 'Sarah Johnson'),
          UIHelper.vSpaceLarge,
          _buildQRTile(context, '90123', 'Motorcycle: DEF-9012', 'Michael Brown'),
        ],
      ),
    );
  }
  
  Widget _buildInfoSection(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Icon(
              Icons.info_outline,
              size: 30,
              color: Colors.blue,
            ),
            UIHelper.vSpaceSmall,
            Text(
              'Sample QR Codes for Testing',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            UIHelper.vSpaceSmall,
            const Text(
              'Use these QR codes to test the scanning feature. Each code will show different vehicle details when scanned.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRTile(BuildContext context, String code, String vehicleInfo, String owner) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              vehicleInfo,
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            UIHelper.vSpaceSmall,
            Text(
              'Owner: $owner',
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            UIHelper.vSpaceMedium,
            QrImageView(
              data: code,
              version: QrVersions.auto,
              size: 200,
              backgroundColor: Colors.white,
              errorCorrectionLevel: QrErrorCorrectLevel.H,
            ),
            UIHelper.vSpaceMedium,
            Text(
              'Code: $code',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            UIHelper.vSpaceSmall,
            const Text(
              'Scan this code in the app to see vehicle details',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
