class Vehicle {
  final String id;
  final String registrationNumber;
  final String vehicleType;
  final String ownerName;
  final double totalQuota;
  final double usedQuota;
  final double availableQuota;

  Vehicle({
    required this.id,
    required this.registrationNumber,
    required this.vehicleType,
    required this.ownerName,
    required this.totalQuota,
    required this.usedQuota,
    required this.availableQuota,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      registrationNumber: json['registrationNumber'],
      vehicleType: json['vehicleType'],
      ownerName: json['ownerName'],
      totalQuota: double.parse(json['totalQuota'].toString()),
      usedQuota: double.parse(json['usedQuota'].toString()),
      availableQuota: double.parse(json['availableQuota'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registrationNumber': registrationNumber,
      'vehicleType': vehicleType,
      'ownerName': ownerName,
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
        vehicleType: 'Car',
        ownerName: 'James Smith',
        totalQuota: 40.0,
        usedQuota: 12.5,
        availableQuota: 27.5,
      ),
      Vehicle(
        id: '2',
        registrationNumber: 'XYZ-5678',
        vehicleType: 'Van',
        ownerName: 'Sarah Johnson',
        totalQuota: 60.0,
        usedQuota: 35.0,
        availableQuota: 25.0,
      ),
      Vehicle(
        id: '3',
        registrationNumber: 'DEF-9012',
        vehicleType: 'Motorcycle',
        ownerName: 'Michael Brown',
        totalQuota: 20.0,
        usedQuota: 5.0,
        availableQuota: 15.0,
      ),
    ];
  }
}
