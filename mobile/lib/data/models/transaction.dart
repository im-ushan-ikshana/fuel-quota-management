class Transaction {
  final String id;
  final String vehicleRegistrationNumber;
  final double fuelAmount;
  final DateTime timestamp;

  Transaction({
    required this.id,
    required this.vehicleRegistrationNumber,
    required this.fuelAmount,
    required this.timestamp,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      vehicleRegistrationNumber: json['vehicleRegistrationNumber'],
      fuelAmount: double.parse(json['fuelAmount'].toString()),
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'vehicleRegistrationNumber': vehicleRegistrationNumber,
      'fuelAmount': fuelAmount,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  // For demo purposes
  static List<Transaction> getDemoTransactions() {
    return [
      Transaction(
        id: '1',
        vehicleRegistrationNumber: 'ABC-1234',
        fuelAmount: 12.5,
        timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
      Transaction(
        id: '2',
        vehicleRegistrationNumber: 'XYZ-5678',
        fuelAmount: 15.0,
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Transaction(
        id: '3',
        vehicleRegistrationNumber: 'DEF-9012',
        fuelAmount: 5.0,
        timestamp: DateTime.now().subtract(const Duration(hours: 3, minutes: 15)),
      ),
      Transaction(
        id: '4',
        vehicleRegistrationNumber: 'GHI-3456',
        fuelAmount: 20.0,
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
      ),
    ];
  }
}
