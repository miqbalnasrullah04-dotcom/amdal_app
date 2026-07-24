<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Order;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class OrderController extends Controller
{
    public function __construct()
    {
        // Konfigurasi Midtrans
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = config('services.midtrans.is_sanitized');
        Config::$is3ds = config('services.midtrans.is_3ds');
    }
    // User pilih paket -> set package_id di Expert, dan kalau berbayar, buat Order dengan Midtrans
    public function choosePackage(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'package_id' => ['required', 'exists:packages,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $expert = Expert::where('user_id', $user->id)->firstOrFail();
        $package = Package::findOrFail($request->package_id);

        // Prevent downgrading to Free if currently on active Premium
        $currentPackage = $expert->package;
        if ($currentPackage && $currentPackage->price > 0 && $package->price == 0) {
            if (!$expert->package_expires_at || now()->lessThan($expert->package_expires_at)) {
                return response()->json(['message' => 'Anda tidak bisa kembali ke Paket Free selama Paket Premium masih aktif.'], 422);
            }
        }

        $expert->update(['package_id' => $package->id]);

        if ($package->price > 0) {
            // Generate order reference
            $referenceCode = 'ORD-'.strtoupper(Str::random(8));

            $order = Order::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'package_name' => $package->name,
                'amount' => $package->price,
                'reference_code' => $referenceCode,
                'status' => 'menunggu_pembayaran',
            ]);

            // Create Midtrans transaction if key is configured
            if (Config::$serverKey && Config::$serverKey !== 'your-server-key-here') {
                try {
                    $params = [
                        'transaction_details' => [
                            'order_id' => $referenceCode,
                            'gross_amount' => (int) $package->price,
                        ],
                        'customer_details' => [
                            'first_name' => $user->name,
                            'email' => $user->email,
                            'phone' => $expert->phone ?? '',
                        ],
                        'item_details' => [
                            [
                                'id' => $package->id,
                                'price' => (int) $package->price,
                                'quantity' => 1,
                                'name' => $package->name,
                            ],
                        ],
                    ];

                    $snapToken = Snap::getSnapToken($params);

                    $order->update([
                        'snap_token' => $snapToken,
                    ]);

                    return response()->json([
                        'expert' => $expert,
                        'order' => $order,
                        'snap_token' => $snapToken,
                    ], 201);
                } catch (\Exception $e) {
                    \Log::error('Midtrans Snap Error: ' . $e->getMessage());
                    // Fallback to manual payment if Snap fails
                }
            }

            // Fallback: return without snap_token (manual payment flow)
            return response()->json([
                'expert' => $expert,
                'order' => $order,
                'snap_token' => null,
            ], 201);
        }

        // Paket gratis -> tidak perlu order/pembayaran
        return response()->json(['expert' => $expert, 'order' => null]);
    }

    public function package()
    {
        // Dipertahankan untuk kompatibilitas lama (tidak dipakai lagi di frontend baru)
        return response()->json(Package::where('is_active', true)->orderBy('order')->get());
    }

    public function myOrder(Request $request)
    {
        $order = Order::where('user_id', $request->user()->id)->latest()->first();
        return response()->json($order);
    }

    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('package:id,name,price')
            ->latest()
            ->get();
        return response()->json($orders);
    }

    // Webhook dari Midtrans untuk notification pembayaran
    public function notification(Request $request)
    {
        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;
            $orderId = $notification->order_id;

            \Log::info('Midtrans Notification', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
            ]);

            $order = Order::where('reference_code', $orderId)->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'accept') {
                    $order->update(['status' => 'verified']);
                    $expert = \App\Models\Expert::where('user_id', $order->user_id)->first();
                    if ($expert) {
                        $expert->update([
                            'package_expires_at' => now()->addYear(),
                            'package_id' => $order->package_id
                        ]);
                    }
                }
            } elseif ($transactionStatus == 'settlement') {
                $order->update([
                    'status' => 'verified',
                    'verified_at' => now(),
                ]);
                $expert = \App\Models\Expert::where('user_id', $order->user_id)->first();
                if ($expert) {
                    $expert->update([
                        'package_expires_at' => now()->addYear(),
                        'package_id' => $order->package_id
                    ]);
                }
            } elseif ($transactionStatus == 'pending') {
                $order->update(['status' => 'menunggu_pembayaran']);
            } elseif ($transactionStatus == 'deny') {
                $order->update(['status' => 'rejected', 'reject_reason' => 'Payment denied']);
            } elseif ($transactionStatus == 'expire') {
                $order->update(['status' => 'rejected', 'reject_reason' => 'Payment expired']);
            } elseif ($transactionStatus == 'cancel') {
                $order->update(['status' => 'rejected', 'reject_reason' => 'Payment cancelled']);
            }

            return response()->json(['message' => 'Notification handled']);
        } catch (\Exception $e) {
            \Log::error('Midtrans Notification Error: ' . $e->getMessage());
            return response()->json(['message' => 'Notification error'], 500);
        }
    }

    public function uploadProof(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $path = $request->file('proof')->store('bukti-transfer', 'public');

        $order->update([
            'proof_of_payment' => $path,
            'status' => 'menunggu_verifikasi',
        ]);

        return response()->json($order);
    }

    // ================== ADMIN ==================

    public function adminIndex(Request $request)
    {
        $query = Order::with('user:id,name,email')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function verify(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $order->update([
            'status' => 'verified',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        $expert = \App\Models\Expert::where('user_id', $order->user_id)->first();
        if ($expert) {
            $expert->update([
                'package_expires_at' => now()->addYear(),
                'package_id' => $order->package_id
            ]);
        }

        return response()->json($order);
    }

    public function reject(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reject_reason' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $order->update([
            'status' => 'rejected',
            'reject_reason' => $request->reject_reason,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json($order);
    }
}
