
class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final String? employeeId;
  final String? stationId;
  final String? stationCode;
  final String? stationName;
  final String role;
  final bool isActive;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    this.employeeId,
    this.stationId,
    this.stationCode,
    this.stationName,
    required this.role,
    this.isActive = true,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromOperatorResponse(Map<String, dynamic> json) {
    final operator = json['operator'] ?? json;
    final station = operator['station'] ?? {};
    
    return User(
      id: operator['id']?.toString() ?? '',
      email: operator['email'] ?? '',
      firstName: operator['firstName'] ?? '',
      lastName: operator['lastName'] ?? '',
      phoneNumber: operator['phoneNumber'] ?? '',
      employeeId: operator['employeeId'],
      stationId: station['id'],
      stationCode: station['stationCode'],
      stationName: station['name'],
      role: 'FUEL_STATION_OPERATOR',
      isActive: operator['isActive'] ?? true,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      email: json['email'] ?? json['username'] ?? '',
      firstName: json['firstName'] ?? json['fullName']?.split(' ')[0] ?? '',
      lastName: json['lastName'] ?? json['fullName']?.split(' ')[1] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      employeeId: json['employeeId'],
      stationId: json['stationId'],
      stationCode: json['stationCode'],
      stationName: json['stationName'],
      role: json['role'] ?? 'FUEL_STATION_OPERATOR',
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
      'employeeId': employeeId,
      'stationId': stationId,
      'stationCode': stationCode,
      'stationName': stationName,
      'role': role,
      'isActive': isActive,
    };
  }

  // For demo purposes
  factory User.demo() {
    return User(
      id: '1',
      email: 'operator@teststation.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+94771234567',
      employeeId: 'EMP001',
      stationId: 'station-1',
      stationCode: 'FS001',
      stationName: 'City Fuel Station',
      role: 'FUEL_STATION_OPERATOR',
      isActive: true,
    );
  }
    // Demo users for testing
  static User demoUser(String email) {
    switch (email) {
      case 'station001@fuel.com':
        return User(
          id: '1',
          email: 'station001@fuel.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+94771234567',
          employeeId: 'EMP001',
          stationId: 'station-1',
          stationCode: 'FS001',
          stationName: 'City Fuel Station',
          role: 'FUEL_STATION_OPERATOR',
        );
      case 'station002@fuel.com':
        return User(
          id: '2',
          email: 'station002@fuel.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+94771234568',
          employeeId: 'EMP002',
          stationId: 'station-2',
          stationCode: 'FS002',
          stationName: 'Highway Fuel Station',
          role: 'FUEL_STATION_OPERATOR',
        );
      case 'station003@fuel.com':
        return User(
          id: '3',
          email: 'station003@fuel.com',
          firstName: 'Mike',
          lastName: 'Johnson',
          phoneNumber: '+94771234569',
          employeeId: 'EMP003',
          stationId: 'station-3',
          stationCode: 'FS003',
          stationName: 'Rural Fuel Station',
          role: 'FUEL_STATION_OPERATOR',
        );
      default:
        return User(
          id: '1',
          email: 'station001@fuel.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+94771234567',
          employeeId: 'EMP001',
          stationId: 'station-1',
          stationCode: 'FS001',
          stationName: 'City Fuel Station',
          role: 'FUEL_STATION_OPERATOR',
        );
    }
  }
}
