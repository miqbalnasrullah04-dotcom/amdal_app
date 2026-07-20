<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Order;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // User pilih paket -> set package_id di Expert, dan kalau berbayar, buat Order
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

        $expert->update(['package_id' => $package->id]);

        if ($package->price > 0) {
            $order = Order::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'package_name' => $package->name,
                'amount' => $package->price,
                'reference_code' => 'ORD-'.strtoupper(Str::random(8)),
                'status' => 'menunggu_pembayaran',
            ]);

            return response()->json(['expert' => $expert, 'order' => $order], 201);
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
