import 'package:flutter/foundation.dart';
import 'package:mobile/data/models/fuel/fuel_quota_response.dart';
import 'package:mobile/data/models/fuel/pump_fuel_request.dart';
import 'package:mobile/data/services/fuel_service.dart';

/// Repository that handles fuel-related operations
class FuelRepository extends ChangeNotifier {
  final FuelService _fuelService;
  
  bool _isLoading = false;
  String? _error;
  FuelQuotaResponse? _currentQuota;
  
  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  FuelQuotaResponse? get currentQuota => _currentQuota;
  
  FuelRepository({
    required FuelService fuelService,
  }) : _fuelService = fuelService;
  
  /// Check fuel quota for a vehicle using its QR code
  Future<FuelQuotaResponse?> checkQuota(String qrCode) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final quota = await _fuelService.checkQuota(qrCode);
      _currentQuota = quota;
      notifyListeners();
      return quota;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Record a fuel pumping transaction
  Future<bool> pumpFuel({
    required String qrCode,
    required String vehicleId,
    required double pumpedLitres,
    required String stationId,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final request = PumpFuelRequest(
        qrCode: qrCode,
        vehicleId: vehicleId,
        pumpedLitres: pumpedLitres,
        stationId: stationId,
      );
      
      await _fuelService.pumpFuel(request);
      
      // Update the local quota data if we have it
      if (_currentQuota != null) {
        final updatedUsedLitres = _currentQuota!.usedLitres + pumpedLitres;
        final updatedRemainingLitres = _currentQuota!.allocatedLitres - updatedUsedLitres;
        
        _currentQuota = FuelQuotaResponse(
          registrationNo: _currentQuota!.registrationNo,
          vehicleType: _currentQuota!.vehicleType,
          allocatedLitres: _currentQuota!.allocatedLitres,
          usedLitres: updatedUsedLitres,
          remainingLitres: updatedRemainingLitres,
          quotaPeriod: _currentQuota!.quotaPeriod,
          ownerName: _currentQuota!.ownerName,
        );
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Clear the current error
  void clearError() {
    _error = null;
    notifyListeners();
  }
  
  /// Reset the current quota data
  void resetQuotaData() {
    _currentQuota = null;
    notifyListeners();
  }
}