import 'package:mobile/data/models/fuel/fuel_quota_response.dart';
import 'package:mobile/data/models/fuel/pump_fuel_request.dart';

/// Interface for fuel service operations
abstract class FuelServiceInterface {
  Future<FuelQuotaResponse> checkQuota(String qrCode);
  Future<void> pumpFuel(PumpFuelRequest request);
}
