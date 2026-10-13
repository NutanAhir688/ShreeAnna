import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/localization/app_language.dart';
import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'l10n/generated/app_localizations.dart';
import 'features/home/screens/home_screen.dart';
import 'features/auth/screen/welcome_screen.dart';
import 'features/driver/screens/driver_journey_screen.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/services/push_notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint('Note: .env file not loaded: $e');
  }

  await PushNotificationService().initialize();

  await AppLanguage.instance.loadLanguage();

  final tokenStorage = TokenStorage();
  final token = await tokenStorage.getAccessToken();
  final isLoggedIn = token != null && token.isNotEmpty;

  // Read persisted role — "farmer" | "driver" | null
  final userRole = isLoggedIn ? await tokenStorage.getUserRole() : null;
  final driverPhone = isLoggedIn ? await tokenStorage.getDriverPhone() : null;

  runApp(ShreeAnnaApp(
    appLanguage: AppLanguage.instance,
    isLoggedIn: isLoggedIn,
    userRole: userRole,
    driverPhone: driverPhone,
  ));
}

class ShreeAnnaApp extends StatelessWidget {
  final bool isLoggedIn;
  final String? userRole;
  final String? driverPhone;

  const ShreeAnnaApp({
    super.key,
    required AppLanguage appLanguage,
    required this.isLoggedIn,
    this.userRole,
    this.driverPhone,
  });

  @override
  Widget build(BuildContext context) {
    // Determine the correct home screen based on persisted role
    Widget homeScreen;
    if (!isLoggedIn) {
      homeScreen = const WelcomeScreen();
    } else if (userRole == 'driver') {
      homeScreen = DriverJourneyScreen(initialDriverPhone: driverPhone);
    } else {
      // "farmer" or any other role → farmer home
      homeScreen = const HomeScreen();
    }

    return AnimatedBuilder(
      animation: AppLanguage.instance,
      builder: (context, child) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,

          navigatorKey: navigatorKey,

          locale: AppLanguage.instance.locale,

          supportedLocales: const [Locale('en'), Locale('gu'), Locale('hi')],

          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],

          home: homeScreen,
        );
      },
    );
  }
}
