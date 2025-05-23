import 'package:dio/dio.dart';
import 'package:mobile/data/models/fuel/fuel_quota_response.dart';
import 'package:mobile/data/models/fuel/pump_fuel_request.dart';

abstract class FuelService {
  Future<FuelQuotaResponse> checkQuota(String qrCode);
  Future<void> pumpFuel(PumpFuelRequest request);
}

// Implementation using Dio without Retrofit for simplicity
class FuelServiceImpl implements FuelService {
  final Dio _dio;
  final String _baseUrl;

  FuelServiceImpl(this._dio, this._baseUrl);

  @override
  Future<FuelQuotaResponse> checkQuota(String qrCode) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/quota/$qrCode',
      );
      
      if (response.statusCode == 200) {
        return FuelQuotaResponse.fromJson(response.data);
      } else {
        throw DioException(
          requestOptions: RequestOptions(path: '/quota/$qrCode'),
          error: 'Failed to check quota with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is DioException) {
        throw DioException(
          requestOptions: e.requestOptions,
          error: 'Failed to check quota: ${e.message}',
        );
      }
      throw Exception('Failed to check quota: $e');
    }
  }

  @override
  Future<void> pumpFuel(PumpFuelRequest request) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/pump',
        data: request.toJson(),
      );
      
      if (response.statusCode != 200) {
        throw DioException(
          requestOptions: RequestOptions(path: '/pump'),
          error: 'Pump fuel failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is DioException) {
        throw DioException(
          requestOptions: e.requestOptions,
          error: 'Pump fuel failed: ${e.message}',
        );
      }
      throw Exception('Pump fuel failed: $e');
    }
  }
}
