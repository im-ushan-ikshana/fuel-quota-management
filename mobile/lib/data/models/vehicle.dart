class Vehicle {
  final String id;
  final String registrationNumber;
  final String vehicleType;
  final String fuelType;
  final String ownerName;
  final QuotaInfo? quota;

  Vehicle({
    required this.id,
    required this.registrationNumber,
    required this.vehicleType,
    required this.fuelType,
    required this.ownerName,
    this.quota,
  });
  // For backward compatibility
  double get totalQuota => quota?.allocatedQuota ?? 0.0;
  double get usedQuota => quota?.usedQuota ?? 0.0;
  double get availableQuota => quota?.remainingQuota ?? 0.0;
  QuotaInfo? get quotaInfo => quota;

  // Factory for backend API response from QR scan
  factory Vehicle.fromQrScanResponse(Map<String, dynamic> json) {
    final vehicleData = json['vehicle'] ?? json;
    final quotaData = json['quota'];
    
    return Vehicle(
      id: vehicleData['id'],
      registrationNumber: vehicleData['registrationNumber'],
      vehicleType: vehicleData['vehicleType'],
      fuelType: vehicleData['fuelType'],
      ownerName: vehicleData['ownerName'],
      quota: quotaData != null ? QuotaInfo.fromJson(quotaData) : null,
    );
  }

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      registrationNumber: json['registrationNumber'],
      vehicleType: json['vehicleType'],
      fuelType: json['fuelType'] ?? 'PETROL_92_OCTANE',
      ownerName: json['ownerName'],
      quota: json['quota'] != null ? QuotaInfo.fromJson(json['quota']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registrationNumber': registrationNumber,
      'vehicleType': vehicleType,
      'fuelType': fuelType,
      'ownerName': ownerName,
      'quota': quota?.toJson(),
      // Backward compatibility
      'totalQuota': totalQuota,
      'usedQuota': usedQuota,
      'availableQuota': availableQuota,
    };
  }
  // For demo purposes
  static List<Vehicle> getDemoVehicles() {
    return [
      Vehicle(
        id: '1',
        registrationNumber: 'ABC-1234',
        vehicleType: 'CAR',
        fuelType: 'PETROL_92_OCTANE',
        ownerName: 'James Smith',
        quota: QuotaInfo(
          allocatedQuota: 40.0,
          usedQuota: 12.5,
          remainingQuota: 27.5,
          quotaPercentage: 31.25,
        ),
      ),
      Vehicle(
        id: '2',
        registrationNumber: 'XYZ-5678',
        vehicleType: 'VAN',
        fuelType: 'AUTO_DIESEL',
        ownerName: 'Sarah Johnson',
        quota: QuotaInfo(
          allocatedQuota: 60.0,
          usedQuota: 35.0,
          remainingQuota: 25.0,
          quotaPercentage: 58.33,
        ),
      ),
      Vehicle(
        id: '3',
        registrationNumber: 'DEF-9012',
        vehicleType: 'MOTORCYCLE',
        fuelType: 'PETROL_92_OCTANE',
        ownerName: 'Michael Brown',
        quota: QuotaInfo(
          allocatedQuota: 20.0,
          usedQuota: 5.0,
          remainingQuota: 15.0,
          quotaPercentage: 25.0,
        ),
      ),
    ];
  }

  Vehicle copyWith({
    String? id,
    String? registrationNumber,
    String? vehicleType,
    String? fuelType,
    String? ownerName,
    QuotaInfo? quota,
    QuotaInfo? quotaInfo,
  }) {
    return Vehicle(
      id: id ?? this.id,
      registrationNumber: registrationNumber ?? this.registrationNumber,
      vehicleType: vehicleType ?? this.vehicleType,
      fuelType: fuelType ?? this.fuelType,
      ownerName: ownerName ?? this.ownerName,
      quota: quotaInfo ?? quota ?? this.quota,
    );
  }
}

class QuotaInfo {
  final double allocatedQuota;
  final double usedQuota;
  final double remainingQuota;
  final double quotaPercentage;

  QuotaInfo({
    required this.allocatedQuota,
    required this.usedQuota,
    required this.remainingQuota,
    required this.quotaPercentage,
  });

  factory QuotaInfo.fromJson(Map<String, dynamic> json) {
    return QuotaInfo(
      allocatedQuota: double.tryParse(json['allocatedQuota'].toString()) ?? 0.0,
      usedQuota: double.tryParse(json['usedQuota'].toString()) ?? 0.0,
      remainingQuota: double.tryParse(json['remainingQuota'].toString()) ?? 0.0,
      quotaPercentage: double.tryParse(json['quotaPercentage'].toString()) ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'allocatedQuota': allocatedQuota,
      'usedQuota': usedQuota,
      'remainingQuota': remainingQuota,
      'quotaPercentage': quotaPercentage,
    };
  }
}
