import 'package:flutter/foundation.dart';
import '../models/vehicle.dart';
import '../models/transaction.dart';
import '../models/fuel/pump_fuel_request.dart';
import '../api/fuel_api_service.dart';
import '../../core/models/api_response.dart';

/// Repository that handles fuel-related operations
class FuelRepository extends ChangeNotifier {
  final FuelApiService _fuelApiService;
  
  bool _isLoading = false;
  String? _error;
  Vehicle? _currentVehicle;
  List<Transaction> _recentTransactions = [];
  
  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  Vehicle? get currentVehicle => _currentVehicle;
  List<Transaction> get recentTransactions => _recentTransactions;
  
  FuelRepository({
    FuelApiService? fuelApiService,
  }) : _fuelApiService = fuelApiService ?? FuelApiService.instance;
  
  /// Scan QR code to get vehicle quota information
  Future<Vehicle?> scanQrCode(String qrCode) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _fuelApiService.scanQrCode(qrCode);
      
      if (response.success && response.data != null) {
        _currentVehicle = response.data;
        notifyListeners();
        return response.data;
      } else {
        _error = response.message;
        notifyListeners();
        return null;
      }
    } catch (e) {
      _error = _handleError(e);
      notifyListeners();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Record a fuel pumping transaction
  Future<Transaction?> pumpFuel(PumpFuelRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _fuelApiService.pumpFuel(request);
      
      if (response.success && response.data != null) {
        final transaction = response.data!;
        
        // Update the local vehicle quota data if we have it
        if (_currentVehicle != null && _currentVehicle!.quotaInfo != null) {
          final newUsedQuota = _currentVehicle!.quotaInfo!.usedQuota + request.pumpedLitres;
          final newRemainingQuota = _currentVehicle!.quotaInfo!.allocatedQuota - newUsedQuota;
          final newQuotaPercentage = (newUsedQuota / _currentVehicle!.quotaInfo!.allocatedQuota * 100);
          
          _currentVehicle = _currentVehicle!.copyWith(
            quotaInfo: QuotaInfo(
              allocatedQuota: _currentVehicle!.quotaInfo!.allocatedQuota,
              usedQuota: newUsedQuota,
              remainingQuota: newRemainingQuota,
              quotaPercentage: newQuotaPercentage,
            ),
          );
        }
        
        // Add to recent transactions
        _recentTransactions.insert(0, transaction);
        if (_recentTransactions.length > 20) {
          _recentTransactions = _recentTransactions.take(20).toList();
        }
        
        notifyListeners();
        return transaction;
      } else {
        _error = response.message;
        notifyListeners();
        return null;
      }
    } catch (e) {
      _error = _handleError(e);
      notifyListeners();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Get transaction details by ID
  Future<Transaction?> getTransactionDetails(String transactionId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _fuelApiService.getTransactionDetails(transactionId);
      
      if (response.success && response.data != null) {
        notifyListeners();
        return response.data;
      } else {
        _error = response.message;
        notifyListeners();
        return null;
      }
    } catch (e) {
      _error = _handleError(e);
      notifyListeners();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Load recent transactions
  Future<void> loadRecentTransactions({int limit = 20}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _fuelApiService.getRecentTransactions(limit: limit);
      
      if (response.success && response.data != null) {
        _recentTransactions = response.data!;
        notifyListeners();
      } else {
        _error = response.message;
        notifyListeners();
      }
    } catch (e) {
      _error = _handleError(e);
      notifyListeners();
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
  
  /// Reset the current vehicle data
  void resetVehicleData() {
    _currentVehicle = null;
    notifyListeners();
  }
  
  /// Clear all data
  void clearAll() {
    _currentVehicle = null;
    _recentTransactions.clear();
    _error = null;
    notifyListeners();
  }
  
  /// Handle different types of errors
  String _handleError(dynamic error) {
    if (error is AuthException) {
      return 'Authentication failed. Please login again.';
    } else if (error is NetworkException) {
      return 'Network error. Please check your internet connection.';
    } else if (error is ApiException) {
      return error.message;
    } else {
      return 'An unexpected error occurred: ${error.toString()}';
    }
  }
}