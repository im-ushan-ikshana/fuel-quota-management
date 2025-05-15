import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/data/api/api_client_factory.dart';
import 'package:mobile/data/repositories/auth_repository.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/data/services/token_manager.dart';
import 'package:mobile/data/services/token_storage.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/qr_code_generator/sample_qr_generator.dart';
import 'package:provider/provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FuelQuotaApp());
}

class FuelQuotaApp extends StatelessWidget {
  const FuelQuotaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth repository that handles login, logout, and token management
        ChangeNotifierProvider<AuthRepository>(
          create: (_) => ApiClientFactory.createAuthRepository(),
        ),
        // Fuel repository that handles fuel quota and pumping operations
        ChangeNotifierProxyProvider<AuthRepository, FuelRepository>(
          create: (context) {
            // Create token manager for fuel repository
            final tokenStorage = TokenStorage();
            final authService = ApiClientFactory.createAuthService(null);
            final tokenManager = TokenManager(
              tokenStorage: tokenStorage,
              authService: authService,
            );
            return ApiClientFactory.createFuelRepository(tokenManager);
          },
          update: (context, authRepo, previous) {
            // We don't need to update the fuel repository based on auth changes
            // since the token manager handles token refreshes automatically
            return previous!;
          },
        ),
      ],
      child: MaterialApp(
        title: 'Fuel Quota Manager',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        routes: {
          '/': (context) => const LoginScreen(),
          '/sample-qr': (context) => const SampleQRCodeGenerator(),
        },
      ),
    );
  }
}