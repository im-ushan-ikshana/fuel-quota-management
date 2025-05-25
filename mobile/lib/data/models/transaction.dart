class Transaction {
  final String id;
  final String fuelType;
  final double quantityLiters;
  final double quotaBefore;
  final double quotaAfter;
  final String qrCodeScanned;
  final DateTime transactionDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String vehicleId;
  final String fuelStationId;
  final String operatorId;
  
  // Optional detailed info (when fetched with details)
  final VehicleInfo? vehicle;
  final FuelStationInfo? fuelStation;

  Transaction({
    required this.id,
    required this.fuelType,
    required this.quantityLiters,
    required this.quotaBefore,
    required this.quotaAfter,
    required this.qrCodeScanned,
    required this.transactionDate,
    required this.createdAt,
    required this.updatedAt,
    required this.vehicleId,
    required this.fuelStationId,
    required this.operatorId,
    this.vehicle,
    this.fuelStation,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      fuelType: json['fuelType'],
      quantityLiters: double.parse(json['quantityLiters'].toString()),
      quotaBefore: double.parse(json['quotaBefore'].toString()),
      quotaAfter: double.parse(json['quotaAfter'].toString()),
      qrCodeScanned: json['qrCodeScanned'],
      transactionDate: DateTime.parse(json['transactionDate']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      vehicleId: json['vehicleId'],
      fuelStationId: json['fuelStationId'],
      operatorId: json['operatorId'],
      vehicle: json['vehicle'] != null ? VehicleInfo.fromJson(json['vehicle']) : null,
      fuelStation: json['fuelStation'] != null ? FuelStationInfo.fromJson(json['fuelStation']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fuelType': fuelType,
      'quantityLiters': quantityLiters,
      'quotaBefore': quotaBefore,
      'quotaAfter': quotaAfter,
      'qrCodeScanned': qrCodeScanned,
      'transactionDate': transactionDate.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'vehicleId': vehicleId,
      'fuelStationId': fuelStationId,
      'operatorId': operatorId,
      'vehicle': vehicle?.toJson(),
      'fuelStation': fuelStation?.toJson(),
    };
  }
  // For backward compatibility with existing UI
  String get vehicleRegistrationNumber => vehicle?.registrationNumber ?? '';
  double get fuelAmount => quantityLiters;
  DateTime get timestamp => transactionDate;

  // For demo purposes
  static List<Transaction> getDemoTransactions() {
    final now = DateTime.now();
    return [
      Transaction(
        id: '1',
        fuelType: 'PETROL',
        quantityLiters: 12.5,
        quotaBefore: 40.0,
        quotaAfter: 27.5,
        qrCodeScanned: '12345',
        transactionDate: now.subtract(const Duration(minutes: 30)),
        createdAt: now.subtract(const Duration(minutes: 30)),
        updatedAt: now.subtract(const Duration(minutes: 30)),
        vehicleId: 'vehicle-1',
        fuelStationId: 'station-1',
        operatorId: 'operator-1',
        vehicle: VehicleInfo(
          id: 'vehicle-1',
          registrationNumber: 'ABC-1234',
          vehicleType: 'Car',
        ),
      ),
      Transaction(
        id: '2',
        fuelType: 'PETROL',
        quantityLiters: 15.0,
        quotaBefore: 60.0,
        quotaAfter: 45.0,
        qrCodeScanned: '56782',
        transactionDate: now.subtract(const Duration(hours: 2)),
        createdAt: now.subtract(const Duration(hours: 2)),
        updatedAt: now.subtract(const Duration(hours: 2)),
        vehicleId: 'vehicle-2',
        fuelStationId: 'station-1',
        operatorId: 'operator-1',
        vehicle: VehicleInfo(
          id: 'vehicle-2',
          registrationNumber: 'XYZ-5678',
          vehicleType: 'Van',
        ),
      ),
      Transaction(
        id: '3',
        fuelType: 'PETROL',
        quantityLiters: 5.0,
        quotaBefore: 20.0,
        quotaAfter: 15.0,
        qrCodeScanned: '90123',
        transactionDate: now.subtract(const Duration(hours: 3, minutes: 15)),
        createdAt: now.subtract(const Duration(hours: 3, minutes: 15)),
        updatedAt: now.subtract(const Duration(hours: 3, minutes: 15)),
        vehicleId: 'vehicle-3',
        fuelStationId: 'station-1',
        operatorId: 'operator-1',
        vehicle: VehicleInfo(
          id: 'vehicle-3',
          registrationNumber: 'DEF-9012',
          vehicleType: 'Motorcycle',
        ),
      ),
      Transaction(
        id: '4',
        fuelType: 'PETROL',
        quantityLiters: 20.0,
        quotaBefore: 50.0,
        quotaAfter: 30.0,
        qrCodeScanned: '34567',
        transactionDate: now.subtract(const Duration(hours: 5)),
        createdAt: now.subtract(const Duration(hours: 5)),
        updatedAt: now.subtract(const Duration(hours: 5)),
        vehicleId: 'vehicle-4',
        fuelStationId: 'station-1',
        operatorId: 'operator-1',
        vehicle: VehicleInfo(
          id: 'vehicle-4',
          registrationNumber: 'GHI-3456',
          vehicleType: 'Car',        ),
      ),
    ];
  }
}

// Transaction helper classes
class VehicleInfo {
  final String id;
  final String registrationNumber;
  final String vehicleType;
  final OwnerInfo? owner;

  VehicleInfo({
    required this.id,
    required this.registrationNumber,
    required this.vehicleType,
    this.owner,
  });

  factory VehicleInfo.fromJson(Map<String, dynamic> json) {
    return VehicleInfo(
      id: json['id'],
      registrationNumber: json['registrationNumber'],
      vehicleType: json['vehicleType'],
      owner: json['owner'] != null ? OwnerInfo.fromJson(json['owner']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registrationNumber': registrationNumber,
      'vehicleType': vehicleType,
      'owner': owner?.toJson(),
    };
  }
}

class OwnerInfo {
  final UserInfo user;

  OwnerInfo({required this.user});

  factory OwnerInfo.fromJson(Map<String, dynamic> json) {
    return OwnerInfo(
      user: UserInfo.fromJson(json['user']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
    };
  }
}

class UserInfo {
  final String firstName;
  final String lastName;
  final String phoneNumber;

  UserInfo({
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      firstName: json['firstName'],
      lastName: json['lastName'],
      phoneNumber: json['phoneNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
    };
  }
}

class FuelStationInfo {
  final String id;
  final String name;
  final AddressInfo? address;

  FuelStationInfo({
    required this.id,
    required this.name,
    this.address,
  });

  factory FuelStationInfo.fromJson(Map<String, dynamic> json) {
    return FuelStationInfo(
      id: json['id'],
      name: json['name'],
      address: json['address'] != null ? AddressInfo.fromJson(json['address']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address?.toJson(),
    };
  }
}

class AddressInfo {
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String district;
  final String province;

  AddressInfo({
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    required this.district,
    required this.province,
  });

  factory AddressInfo.fromJson(Map<String, dynamic> json) {
    return AddressInfo(
      addressLine1: json['addressLine1'],
      addressLine2: json['addressLine2'],
      city: json['city'],
      district: json['district'],
      province: json['province'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'district': district,
      'province': province,
    };
  }
}
