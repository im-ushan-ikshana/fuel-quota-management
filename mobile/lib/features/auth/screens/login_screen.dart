import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/core/widgets/app_button.dart';
import 'package:mobile/core/widgets/app_text_field.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/repositories/auth_repository.dart';
import 'package:mobile/features/dashboard/screens/dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _rememberMe = false;
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }
    Future<void> _loadSavedCredentials() async {
    final authRepository = Provider.of<AuthRepository>(context, listen: false);
    final savedUsername = await authRepository.getSavedUsername();
    final rememberMe = await authRepository.getRememberMe();
    
    if (mounted) {
      setState(() {
        if (savedUsername != null) {
          _usernameController.text = savedUsername;
        }
        _rememberMe = rememberMe;
      });
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Logo and app name
                    _buildLogoSection(),
                    UIHelper.vSpaceLarge,
                    UIHelper.vSpaceLarge,
                    
                    // Form fields
                    AppTextField(
                      label: 'Username',
                      hint: 'Enter your username',
                      controller: _usernameController,
                      prefixIcon: Icons.person,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your username';
                        }
                        return null;
                      },
                    ),
                    UIHelper.vSpaceMedium,
                    
                    AppTextField(
                      label: 'Password',
                      hint: 'Enter your password',
                      controller: _passwordController,
                      obscureText: true,
                      prefixIcon: Icons.lock,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        return null;
                      },
                    ),
                    UIHelper.vSpaceMedium,
                    
                    // Remember me checkbox
                    _buildRememberMeSection(),
                    UIHelper.vSpaceLarge,
                    
                    // Login button
                    AppButton(
                      label: 'Login',
                      onPressed: _handleLogin,
                      isLoading: _isLoading,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoSection() {
    return Column(
      children: [
        Container(
          height: 100,
          width: 100,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.local_gas_station,
            size: 60,
            color: Colors.white,
          ),
        ),
        UIHelper.vSpaceMedium,
        Text(
          'Fuel Quota Manager',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.primary,
              ),
        ),
        UIHelper.vSpaceSmall,
        Text(
          'Station Operator Portal',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
              ),
        ),
      ],
    );
  }

  Widget _buildRememberMeSection() {
    return Row(
      children: [
        Checkbox(
          value: _rememberMe,
          onChanged: (value) {
            setState(() {
              _rememberMe = value ?? false;
            });
          },
          activeColor: Theme.of(context).colorScheme.primary,
        ),
        const Text('Remember me'),
      ],
    );
  }  void _handleLogin() async {
    if (_formKey.currentState?.validate() != true) {
      return;
    }
    
    final authRepository = Provider.of<AuthRepository>(context, listen: false);
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final username = _usernameController.text.trim();
      final password = _passwordController.text.trim();
      
      final success = await authRepository.login(
        username, 
        password, 
        rememberMe: _rememberMe
      );
      
      if (success && mounted) {
        final user = authRepository.currentUser;
        
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => DashboardScreen(user: user!),
          ),
        );      } else if (mounted) {
        UIHelper.showSnackBar(
          context,
          authRepository.error ?? 'Login failed',
          isError: true,
        );
      }
    } catch (e) {
      if (mounted) {
        UIHelper.showSnackBar(
          context,
          'Login error: ${e.toString()}',
          isError: true,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}
