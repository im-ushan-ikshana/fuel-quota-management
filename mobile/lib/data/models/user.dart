class User {
  final String id;
  final String username;
  final String fullName;
  final String stationName;
  final String role;

  User({
    required this.id, 
    required this.username,
    required this.fullName,
    required this.stationName,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      fullName: json['fullName'],
      stationName: json['stationName'],
      role: json['role'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullName': fullName,
      'stationName': stationName,
      'role': role,
    };
  }

  // For demo purposes
  factory User.demo() {
    return User(
      id: '1',
      username: 'operator1',
      fullName: 'John Doe',
      stationName: 'Central Fuel Station',
      role: 'operator',
    );
  }
}
