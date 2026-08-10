<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MembershipService;
use App\Models\MembershipTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class MembershipController extends Controller
{
    protected $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }

    /**
     * Get current membership status
     */
    public function status(): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak terautentikasi'
                ], 401);
            }

            $status = $this->membershipService->getMembershipStatus($user);

            return response()->json([
                'status' => 'success',
                'data' => $status
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get premium pricing for current user
     */
    public function pricing(): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak terautentikasi'
                ], 401);
            }

            $pricing = $this->membershipService->calculatePremiumPrice($user);

            return response()->json([
                'status' => 'success',
                'data' => $pricing
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upgrade to premium (create transaction)
     */
    public function upgrade(): JsonResponse
    {
        try {
            $user = auth()->user();
            $transaction = $this->membershipService->upgradeToPremium($user);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi upgrade premium berhasil dibuat',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'package' => $transaction->package,
                    'type' => $transaction->type,
                    'total_price' => $transaction->total_price,
                    'discount' => $transaction->discount,
                    'started_at' => $transaction->started_at,
                    'expires_at' => $transaction->expires_at,
                    'payment_status' => $transaction->payment_status,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Renew premium membership (create transaction)
     */
    public function renew(): JsonResponse
    {
        try {
            $user = auth()->user();
            $transaction = $this->membershipService->renewPremium($user);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi perpanjangan premium berhasil dibuat',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'package' => $transaction->package,
                    'type' => $transaction->type,
                    'total_price' => $transaction->total_price,
                    'discount' => $transaction->discount,
                    'started_at' => $transaction->started_at,
                    'expires_at' => $transaction->expires_at,
                    'payment_status' => $transaction->payment_status,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Process payment callback (webhook)
     */
    public function paymentCallback(Request $request): JsonResponse
    {
        try {
            $transactionId = $request->input('transaction_id');
            $paymentStatus = $request->input('payment_status'); // 'success', 'failed', 'cancelled'

            $transaction = MembershipTransaction::findOrFail($transactionId);

            if ($paymentStatus === 'success') {
                $this->membershipService->processSuccessfulPayment($transaction);
                $message = 'Pembayaran berhasil, membership telah diaktifkan';
            } elseif ($paymentStatus === 'failed') {
                $this->membershipService->processFailedPayment($transaction);
                $message = 'Pembayaran gagal';
            } elseif ($paymentStatus === 'cancelled') {
                $this->membershipService->cancelTransaction($transaction);
                $message = 'Pembayaran dibatalkan';
            } else {
                throw new Exception('Status pembayaran tidak valid');
            }

            return response()->json([
                'status' => 'success',
                'message' => $message
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get point transaction history
     */
    public function pointHistory(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $limit = $request->input('limit', 10);

            $history = $this->membershipService->getPointHistory($user, $limit);

            return response()->json([
                'status' => 'success',
                'data' => $history
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get membership transaction history
     */
    public function membershipHistory(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $limit = $request->input('limit', 10);

            $history = $this->membershipService->getMembershipHistory($user, $limit);

            return response()->json([
                'status' => 'success',
                'data' => $history
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel pending transaction
     */
    public function cancelTransaction(Request $request, $transactionId): JsonResponse
    {
        try {
            $user = auth()->user();
            $transaction = MembershipTransaction::where('user_id', $user->id)
                ->findOrFail($transactionId);

            $this->membershipService->cancelTransaction($transaction);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dibatalkan'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
