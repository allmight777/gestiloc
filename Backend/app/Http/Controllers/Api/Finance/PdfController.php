<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\RentReceipt;
use App\Models\Invoice;
use App\Models\Lease;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PdfController extends Controller
{
    protected PdfService $pdfService;

    public function __construct(PdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    public function generateQuittance($id)
    {
        try {
            $invoice = Invoice::with(['lease.property.landlord.user', 'lease.tenant.user', 'lease'])
                ->findOrFail($id);

            if ($invoice->status !== 'paid') {
                return response()->json([
                    'message' => 'Seules les factures payées peuvent générer une quittance'
                ], 400);
            }

            $tempPath = $this->pdfService->generateInvoicePdf($invoice, 'quittance');

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=quittance_{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération de la quittance',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Quittance indépendante (bailleur)
     * Route: GET /api/quittance-independent/{id}
     */
    public function generateIndependentRentReceipt($id)
    {
        $user = auth()->user();

        Log::info('[PdfController@generateIndependentRentReceipt] incoming', [
            'auth_id'    => $user?->id,
            'roles'      => $user?->roles?->pluck('name'),
            'receipt_id' => $id,
        ]);

        $receipt = RentReceipt::with([
            'property',
            'tenant',   // User
            'landlord', // User
            'lease',
            'lease.tenant',
            'lease.tenant.user',
            'lease.property',
            'lease.property.landlord',
            'lease.property.landlord.user',
        ])->findOrFail($id);

        // ✅ Vérif role uniquement
        if (!$user || !$user->hasRole('landlord')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ IMPORTANT : ici on compare users.id vs users.id
        if ((int) $receipt->landlord_id !== (int) $user->id) {
            Log::warning('[PdfController@generateIndependentRentReceipt] forbidden', [
                'auth_id'            => $user->id,
                'receipt_landlord_id'=> $receipt->landlord_id,
                'expected_landlord_id'=> $user->id,
            ]);
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ View : attention dossier "pdfs" (avec s)
        $pdf = \PDF::loadView('pdfs.rent_receipt_independent', [
            'receipt' => $receipt
        ]);

        $filename = "quittance-{$receipt->year}-" . str_pad($receipt->month, 2, '0', STR_PAD_LEFT) . "-{$receipt->reference}.pdf";

        return $pdf->download($filename);
    }

    public function generateAvisEcheance($id)
    {
        try {
            $invoice = Invoice::with(['lease.property.landlord.user', 'lease.tenant.user', 'lease'])
                ->findOrFail($id);

            if ($invoice->status === 'paid') {
                return response()->json([
                    'message' => 'Les factures payées ne peuvent pas générer d\'avis d\'échéance'
                ], 400);
            }

            $tempPath = $this->pdfService->generateInvoicePdf($invoice, 'avis_echeance');

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=avis_echeance_{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération de l\'avis d\'échéance',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function generateLeaseContract($uuid)
    {
        try {
            $lease = Lease::with(['property.landlord.user', 'property.landlord', 'tenant.user', 'tenant'])
                ->where('uuid', $uuid)
                ->firstOrFail();

            $user = auth()->user();
            $hasAccess = false;

            if ($user && $user->isLandlord() && $user->landlord) {
                $hasAccess = (int) $lease->property->landlord_id === (int) $user->landlord->id;
            } elseif ($user && $user->isTenant() && $user->tenant) {
                $hasAccess = (int) $lease->tenant_id === (int) $user->tenant->id;
            } elseif ($user && $user->isAdmin()) {
                $hasAccess = true;
            }

            if (!$hasAccess) {
                return response()->json(['message' => 'Accès non autorisé'], 403);
            }

            $tempPath = $this->pdfService->generateLeaseContractPdf($lease);

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=contrat_bail_{$lease->lease_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération du contrat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function generateLandlordSummary(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->isLandlord() || !$user->landlord) {
                return response()->json(['message' => 'Accès réservé aux bailleurs'], 403);
            }

            $data = [
                'monthly_revenue'  => 0,
                'pending_invoices' => []
            ];

            $tempPath = $this->pdfService->generateLandlordSummaryPdf($user->landlord, $data);

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            $filename = sprintf(
                'recap_bailleur_%s_%s.pdf',
                $user->landlord->last_name ?? 'bailleur',
                now()->format('Y-m-d')
            );

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename={$filename}");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération du récapitulatif',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
