import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:ojol_mobile/api_client.dart';
import 'package:ojol_mobile/auth_provider.dart';
import 'package:ojol_mobile/main.dart';

void main() {
  testWidgets('Ojol app boots without crashing', (WidgetTester tester) async {
    // Mirror main(): Provider harus ada di atas MaterialApp.
    final api = ApiClient();
    final auth = AuthProvider(api);
    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: auth,
        child: const OjolApp(),
      ),
    );
    await tester.pump();
    expect(tester.takeException(), isNull);
  });
}
