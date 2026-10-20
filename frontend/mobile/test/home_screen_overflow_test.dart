import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shreeanna/features/home/screens/home_screen.dart';
import 'package:shreeanna/l10n/generated/app_localizations.dart';

void main() {
  testWidgets('HomeScreen renders without RenderFlex pixel overflow on small mobile screens', (WidgetTester tester) async {
    for (final size in [const Size(320, 568), const Size(360, 640), const Size(375, 667)]) {
      tester.view.physicalSize = size;
      tester.view.devicePixelRatio = 1.0;

      for (final locale in [const Locale('en'), const Locale('hi'), const Locale('gu')]) {
        await tester.pumpWidget(
          MaterialApp(
            locale: locale,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
            home: const HomeScreen(),
          ),
        );

        await tester.pump();

        expect(find.byType(HomeScreen), findsOneWidget);
        expect(tester.takeException(), isNull);
      }
    }
    tester.view.resetPhysicalSize();
  });
}
