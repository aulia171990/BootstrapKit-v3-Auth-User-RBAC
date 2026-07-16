import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api_client.dart';
import '../auth_provider.dart';

class CreateOrderScreen extends StatefulWidget {
  const CreateOrderScreen({super.key});
  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  final _pickupAddr = TextEditingController();
  final _dropoffAddr = TextEditingController();
  final _pickupLat = TextEditingController(text: '-6.200000');
  final _pickupLng = TextEditingController(text: '106.800000');
  final _dropoffLat = TextEditingController(text: '-6.210000');
  final _dropoffLng = TextEditingController(text: '106.820000');
  final _price = TextEditingController(text: '15000');
  bool _busy = false;
  String? _err;

  Future<void> _submit() async {
    setState(() => _busy = true);
    try {
      await context.read<AuthProvider>().api.createOrder(
            pickupLat: double.parse(_pickupLat.text),
            pickupLng: double.parse(_pickupLng.text),
            pickupAddress: _pickupAddr.text,
            dropoffLat: double.parse(_dropoffLat.text),
            dropoffLng: double.parse(_dropoffLng.text),
            dropoffAddress: _dropoffAddr.text,
            price: double.tryParse(_price.text),
          );
      if (mounted) Navigator.pop(context);
    } on ApiException catch (e) {
      setState(() => _err = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _field(TextEditingController c, String label, {TextInputType? kt}) =>
      Padding(padding: const EdgeInsets.only(bottom: 10), child: TextField(controller: c, decoration: InputDecoration(labelText: label), keyboardType: kt));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Buat Order')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          children: [
            const Text('Pickup', style: TextStyle(fontWeight: FontWeight.bold)),
            _field(_pickupAddr, 'Alamat pickup'),
            _field(_pickupLat, 'pickup_lat', kt: TextInputType.number),
            _field(_pickupLng, 'pickup_lng', kt: TextInputType.number),
            const SizedBox(height: 8),
            const Text('Dropoff', style: TextStyle(fontWeight: FontWeight.bold)),
            _field(_dropoffAddr, 'Alamat dropoff'),
            _field(_dropoffLat, 'dropoff_lat', kt: TextInputType.number),
            _field(_dropoffLng, 'dropoff_lng', kt: TextInputType.number),
            const SizedBox(height: 8),
            _field(_price, 'Harga (Rp)', kt: TextInputType.number),
            const SizedBox(height: 12),
            if (_err != null) Text(_err!, style: const TextStyle(color: Colors.red)),
            ElevatedButton(onPressed: _busy ? null : _submit, child: _busy ? const CircularProgressIndicator() : const Text('Pesan')),
          ],
        ),
      ),
    );
  }
}
