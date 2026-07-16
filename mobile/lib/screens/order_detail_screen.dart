import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

import '../api_client.dart';
import '../auth_provider.dart';
import '../models.dart';
import '../widgets.dart';
import '../widgets_map.dart';

/// Detail order + live tracking via polling.
///
/// v1: posisi driver di-poll tiap 3 detik (`GET /orders/{id}/track`),
/// lalu ditampilkan di peta (google_maps_flutter) + teks koordinat.
/// Upgrade ke Reverb WS (lihat ApiConfig.wsHost) bisa menggantikan timer ini.
class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  Map<String, dynamic>? _track;
  bool _loading = true;
  String? _err;
  Timer? _timer;

  LatLng? _driverPos(Order o) {
    final drv = _track?['driver'] as Map?;
    if (drv != null && drv['latitude'] != null && drv['longitude'] != null) {
      return LatLng(_toDouble(drv['latitude'])!, _toDouble(drv['longitude'])!);
    }
    // Fallback: posisi driver dari relasi order (kalau ada).
    final d = o.driver;
    if (d?.latitude != null && d?.longitude != null) {
      return LatLng(d!.latitude!, d.longitude!);
    }
    return null;
  }

  @override
  void initState() {
    super.initState();
    _load();
    _startPolling();
  }

  void _startPolling() {
    _timer = Timer.periodic(const Duration(seconds: 3), (_) async {
      try {
        final t = await context.read<AuthProvider>().api.track(widget.orderId);
        if (mounted) setState(() => _track = t);
      } catch (_) {}
    });
  }

  Future<void> _load() async {
    try {
      _order = await context.read<AuthProvider>().api.order(widget.orderId);
    } on ApiException catch (e) {
      _err = e.message;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _act(Future Function() fn) async {
    try {
      await fn();
      await _load();
    } on ApiException catch (e) {
      if (mounted) setState(() => _err = e.message);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isDriver = user?.hasRole('driver') ?? false;
    final o = _order;

    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (o == null) return Scaffold(appBar: AppBar(), body: Center(child: Text(_err ?? 'Order tidak ditemukan')));

    final drv = _track?['driver'] as Map?;
    final driverPos = _driverPos(o);

    return Scaffold(
      appBar: AppBar(title: Text('Order ${o.id.substring(0, 8)}')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            if (_err != null) Text(_err!, style: const TextStyle(color: Colors.red)),
            Row(children: [const Text('Status: ', style: TextStyle(fontWeight: FontWeight.bold)), statusBadge(o.status)]),
            const SizedBox(height: 8),
            Text('Price: ${money(o.price)}'),
            Text('Pickup: ${o.pickupAddress ?? "(${o.pickupLat}, ${o.pickupLng})"}'),
            Text('Dropoff: ${o.dropoffAddress ?? "(${o.dropoffLat}, ${o.dropoffLng})"}'),
            const SizedBox(height: 16),
            const Text('Live Tracking', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TrackMap(
              driverPos: driverPos,
              pickup: o.pickupLat != null && o.pickupLng != null ? LatLng(o.pickupLat!, o.pickupLng!) : null,
              dropoff: o.dropoffLat != null && o.dropoffLng != null ? LatLng(o.dropoffLat!, o.dropoffLng!) : null,
            ),
            const SizedBox(height: 8),
            if (drv != null)
              Text('Driver @ ${drv['latitude']}, ${drv['longitude']} (${drv['status']})')
            else
              const Text('menunggu posisi driver…', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            if (isDriver && o.status == 'pending')
              ElevatedButton(onPressed: () => _act(() => context.read<AuthProvider>().api.acceptOrder(o.id)), child: const Text('Terima Order')),
            if (isDriver && (o.status == 'accepted' || o.status == 'ongoing'))
              ElevatedButton(onPressed: () => _act(() => context.read<AuthProvider>().api.updateStatus(o.id, 'ongoing')), child: const Text('Mulai Trip')),
            if (isDriver && o.status == 'ongoing')
              ElevatedButton(onPressed: () => _act(() => context.read<AuthProvider>().api.updateStatus(o.id, 'completed')), child: const Text('Selesaikan')),
            // Customer: bayar setelah selesai
            if (!isDriver && o.status == 'completed')
              ElevatedButton(onPressed: () => _act(() => context.read<AuthProvider>().api.pay(o.id, 'cash')), child: const Text('Bayar (Cash)')),
          ],
        ),
      ),
    );
  }
}

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

