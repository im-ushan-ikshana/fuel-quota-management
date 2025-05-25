class User {
  final String id;
  final String username;
  final String? fullName;
  final String stationName;
  final String? stationId;
  final String role;

  User({
    required this.id, 
    required this.username,
    this.fullName,
    required this.stationName,
    this.stationId,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      username: json['username'],
      fullName: json['fullName'],
      stationName: json['stationName'],
      stationId: json['stationId'],
      role: json['role'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullName': fullName,
      'stationName': stationName,
      'stationId': stationId,
      'role': role,
    };
  }

  // For demo purposes
  factory User.demo() {
    return User(
      id: '1',
      username: 'station001',
      fullName: 'John Doe',
      stationName: 'City Fuel Station',
      stationId: 'FS001',
      role: 'STATION_OPERATOR',
    );
  }
  
  // Demo users for testing
  static User demoUser(String username) {
    switch (username) {
      case 'station001':
        return User(
          id: '1',
          username: 'station001',
          fullName: 'John Doe',
          stationName: 'City Fuel Station',
          stationId: 'FS001',
          role: 'STATION_OPERATOR',
        );
      case 'station002':
        return User(
          id: '2',
          username: 'station002',
          fullName: 'Jane Smith',
          stationName: 'Highway Fuel Station',
          stationId: 'FS002',
          role: 'STATION_OPERATOR',
        );
      case 'station003':
        return User(
          id: '3',
          username: 'station003',
          fullName: 'Mike Johnson',
          stationName: 'Rural Fuel Station',
          stationId: 'FS003',
          role: 'STATION_OPERATOR',
        );
      default:
        return User(
          id: '1',
          username: 'station001',
          fullName: 'John Doe',
          stationName: 'City Fuel Station',
          stationId: 'FS001',
          role: 'STATION_OPERATOR',
        );
    }
  }
}
