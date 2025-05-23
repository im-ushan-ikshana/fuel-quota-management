/// Request model for pumping fuel to a vehicle
class PumpFuelRequest {
  final String qrCode;
  final String vehicleId;
  final double pumpedLitres;
  final String stationId;

  PumpFuelRequest({
    required this.qrCode,
    required this.vehicleId,
    required this.pumpedLitres,
    required this.stationId,
  });

  Map<String, dynamic> toJson() {
    return {
      'qrCode': qrCode,
      'vehicleId': vehicleId,
      'pumpedLitres': pumpedLitres,
      'stationId': stationId,
    };
  }

  factory PumpFuelRequest.fromJson(Map<String, dynamic> json) {
    return PumpFuelRequest(
      qrCode: json['qrCode'],
      vehicleId: json['vehicleId'],
      pumpedLitres: json['pumpedLitres'].toDouble(),
      stationId: json['stationId'],
    );
  }
}