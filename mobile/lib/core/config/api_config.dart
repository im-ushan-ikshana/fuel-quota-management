class ApiConfig {
  // Base URL - Update this to your backend server URL
  static const String baseUrl = 'http://10.229.45.117:4000/api/v1';
  
  // API Endpoints
  static const String fuelOperatorsBase = '/fuel/operators';
  
  // Auth endpoints
  static const String operatorLogin = '$fuelOperatorsBase/login';
  static const String operatorProfile = '$fuelOperatorsBase/me';
    // Transaction endpoints  
  static const String scanQrCode = '$fuelOperatorsBase/transactions/scan-qr';
  static const String pumpFuel = '$fuelOperatorsBase/transactions/pump';
  static const String listTransactions = '$fuelOperatorsBase/transactions';
  static const String getTransactionById = '$fuelOperatorsBase/transactions/:transactionId';
  
  // Headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
    // Timeouts
  static const Duration timeout = Duration(seconds: 30);
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
