/// Response model for fuel quota information
class FuelQuotaResponse {
  final String registrationNo;
  final String vehicleType;
  final double allocatedLitres;
  final double usedLitres;
  final double remainingLitres;
  final String quotaPeriod;
  final String? ownerName;

  FuelQuotaResponse({
    required this.registrationNo,
    required this.vehicleType,
    required this.allocatedLitres,
    required this.usedLitres,
    required this.remainingLitres,
    required this.quotaPeriod,
    this.ownerName,
  });

  factory FuelQuotaResponse.fromJson(Map<String, dynamic> json) {
    return FuelQuotaResponse(
      registrationNo: json['registrationNo'],
      vehicleType: json['vehicleType'],
      allocatedLitres: json['allocatedLitres'].toDouble(),
      usedLitres: json['usedLitres'].toDouble(),
      remainingLitres: json['remainingLitres'].toDouble(),
      quotaPeriod: json['quotaPeriod'],
      ownerName: json['ownerName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'registrationNo': registrationNo,
      'vehicleType': vehicleType,
      'allocatedLitres': allocatedLitres,
      'usedLitres': usedLitres,
      'remainingLitres': remainingLitres,
      'quotaPeriod': quotaPeriod,
      'ownerName': ownerName,
    };
  }
}