/// Model data — persis mengikuti kontrak JSON Laravel (`success`/`data` wrapper
/// sudah dibongkar di ApiClient, jadi di sini kita hanya parse `data`).
library models;

class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final int status;
  final List<String> roles;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.status,
    this.roles = const [],
  });

  factory User.fromJson(Map<String, dynamic> j) {
    final r = j['roles'];
    List<String> roles = [];
    if (r is List) {
      roles = r.map((e) => e is Map ? (e['name'] ?? '') : e.toString()).where((s) => s.isNotEmpty).toList().cast<String>();
    }
    return User(
      id: (j['id'] ?? '').toString(),
      name: j['name'] ?? '',
      email: j['email'] ?? '',
      phone: j['phone'] ?? '',
      status: j['status'] is int ? j['status'] : int.tryParse('${j['status']}') ?? 1,
      roles: roles,
    );
  }

  bool hasRole(String role) => roles.contains(role);
}

class Driver {
  final String id;
  final String? userId;
  final String? licensePlate;
  final String? vehicleType;
  final String? status;
  final double? rating;
  final double? latitude;
  final double? longitude;
  final User? user;

  Driver({
    required this.id,
    this.userId,
    this.licensePlate,
    this.vehicleType,
    this.status,
    this.rating,
    this.latitude,
    this.longitude,
    this.user,
  });

  factory Driver.fromJson(Map<String, dynamic> j) {
    return Driver(
      id: (j['id'] ?? '').toString(),
      userId: j['user_id']?.toString(),
      licensePlate: j['license_plate'],
      vehicleType: j['vehicle_type'],
      status: j['status'],
      rating: _toDouble(j['rating']),
      latitude: _toDouble(j['latitude']),
      longitude: _toDouble(j['longitude']),
      user: j['user'] is Map ? User.fromJson(j['user']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'license_plate': licensePlate,
        'vehicle_type': vehicleType,
        'status': status,
      };
}

class Order {
  final String id;
  final String? customerId;
  final String? driverId;
  final double? pickupLat;
  final double? pickupLng;
  final String? pickupAddress;
  final double? dropoffLat;
  final double? dropoffLng;
  final String? dropoffAddress;
  final double? distanceKm;
  final double? price;
  final String status;
  final User? customer;
  final Driver? driver;
  final List<OrderHistory>? histories;
  final Payment? payment;

  Order({
    required this.id,
    this.customerId,
    this.driverId,
    this.pickupLat,
    this.pickupLng,
    this.pickupAddress,
    this.dropoffLat,
    this.dropoffLng,
    this.dropoffAddress,
    this.distanceKm,
    this.price,
    required this.status,
    this.customer,
    this.driver,
    this.histories,
    this.payment,
  });

  factory Order.fromJson(Map<String, dynamic> j) {
    return Order(
      id: (j['id'] ?? '').toString(),
      customerId: j['customer_id']?.toString(),
      driverId: j['driver_id']?.toString(),
      pickupLat: _toDouble(j['pickup_lat']),
      pickupLng: _toDouble(j['pickup_lng']),
      pickupAddress: j['pickup_address'],
      dropoffLat: _toDouble(j['dropoff_lat']),
      dropoffLng: _toDouble(j['dropoff_lng']),
      dropoffAddress: j['dropoff_address'],
      distanceKm: _toDouble(j['distance_km']),
      price: _toDouble(j['price']),
      status: j['status'] ?? 'pending',
      customer: j['customer'] is Map ? User.fromJson(j['customer']) : null,
      driver: j['driver'] is Map ? Driver.fromJson(j['driver']) : null,
      histories: (j['histories'] is List)
          ? (j['histories'] as List).map((e) => OrderHistory.fromJson(e)).toList()
          : null,
      payment: j['payment'] is Map ? Payment.fromJson(j['payment']) : null,
    );
  }
}

class OrderHistory {
  final String status;
  final String? note;
  final String? createdAt;

  OrderHistory({required this.status, this.note, this.createdAt});

  factory OrderHistory.fromJson(Map<String, dynamic> j) => OrderHistory(
        status: j['status'] ?? '',
        note: j['note'],
        createdAt: j['created_at'],
      );
}

class Payment {
  final String? method;
  final double? amount;
  final String status;
  final String? paidAt;

  Payment({this.method, this.amount, required this.status, this.paidAt});

  factory Payment.fromJson(Map<String, dynamic> j) => Payment(
        method: j['method'],
        amount: _toDouble(j['amount']),
        status: j['status'] ?? 'unpaid',
        paidAt: j['paid_at'],
      );
}

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}
