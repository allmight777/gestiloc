<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Tenant;
use App\Models\PropertyDelegation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CoOwnerPaymentController extends Controller
{
    /**
     * Affiche la page de gestion des paiements avec statistiques et liste
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $landlordId = $user->landlord ? $user->landlord->id : null;

        // Si c'est un co-propriétaire, récupérer les propriétés déléguées
        $delegatedPropertyIds = [];
        if ($user->coOwner) {
            $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $user->coOwner->id)
                ->where('status', 'active') // Correction: 'active' au lieu de 'accepted'
                ->pluck('property_id')
                ->toArray();
        }

        // Base query pour les paiements
        $paymentsQuery = Payment::query()
            ->with(['lease.property', 'lease.tenant.user', 'invoice'])
            ->when($landlordId, function($q) use ($landlordId) {
                $q->where('landlord_user_id', $user->id);
            })
            ->when(!empty($delegatedPropertyIds), function($q) use ($delegatedPropertyIds) {
                $q->whereHas('lease.property', function($sq) use ($delegatedPropertyIds) {
                    $sq->whereIn('id', $delegatedPropertyIds);
                });
            });

        // Filtre par bien
        if ($request->filled('property_id') && $request->property_id !== 'all') {
            $paymentsQuery->whereHas('lease', function($q) use ($request) {
                $q->where('property_id', $request->property_id);
            });
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $paymentsQuery->where('status', $request->status);
        }

        // Filtre par recherche (locataire ou bien)
        if ($request->filled('search')) {
            $search = $request->search;
            $paymentsQuery->where(function($q) use ($search) {
                $q->whereHas('lease.tenant.user', function($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('lease.property', function($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                       ->orWhere('address', 'like', "%{$search}%");
                });
            });
        }

        // Calcul des statistiques
        $currentMonth = now()->startOfMonth();
        $nextMonth = now()->endOfMonth();

        $stats = [
            'expected_rent' => (clone $paymentsQuery)
                ->whereBetween('created_at', [$currentMonth, $nextMonth])
                ->sum('amount_total'),
            'received_rent' => (clone $paymentsQuery)
                ->where('status', 'approved')
                ->whereBetween('paid_at', [$currentMonth, $nextMonth])
                ->sum('amount_total'),
            'late_amount' => (clone $paymentsQuery)
                ->whereIn('status', ['pending', 'initiated'])
                ->whereHas('invoice', function($q) {
                    $q->where('due_date', '<', now());
                })
                ->sum('amount_total'),
            'total_payments' => (clone $paymentsQuery)->count(),
            'paid_count' => (clone $paymentsQuery)->where('status', 'approved')->count(),
        ];

        // Taux de recouvrement
        $stats['recovery_rate'] = $stats['expected_rent'] > 0
            ? round(($stats['received_rent'] / $stats['expected_rent']) * 100, 0)
            : 0;

        // Comptage pour les onglets
        $activeCount = (clone $paymentsQuery)->whereIn('status', ['initiated', 'pending', 'approved'])->count();
        $archivedCount = (clone $paymentsQuery)->whereIn('status', ['cancelled', 'failed', 'declined'])->count();

        // Pagination
        $perPage = $request->input('per_page', 100);
        $payments = $paymentsQuery->latest('created_at')->paginate($perPage);

        // Liste des biens pour le filtre
        $properties = Property::when($landlordId, function($q) use ($landlordId) {
                $q->where('landlord_id', $landlordId);
            })
            ->when(!empty($delegatedPropertyIds), function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            })
            ->get();

        // Données pour le graphique de tendance (optionnel)
        $trendData = $this->getRecoveryTrend($user->id, $landlordId, $delegatedPropertyIds);

        return view('co-owner.payments.index', compact(
            'payments',
            'stats',
            'properties',
            'activeCount',
            'archivedCount',
            'trendData'
        ));
    }

    /**
     * Affiche le formulaire d'enregistrement d'un paiement manuel
     */
    public function create()
    {
        $user = auth()->user();
        $landlordId = $user->landlord ? $user->landlord->id : null;

        // Si c'est un co-propriétaire, récupérer les propriétés déléguées
        $delegatedPropertyIds = [];
        if ($user->coOwner) {
            $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $user->coOwner->id)
                ->where('status', 'active')
                ->pluck('property_id')
                ->toArray();
        }

        // Récupérer les baux actifs pour le sélecteur
        $leases = Lease::with(['tenant.user', 'property'])
            ->where('status', 'active')
            ->where(function($q) use ($landlordId, $delegatedPropertyIds) {
                if ($landlordId) {
                    $q->whereHas('property', function($sq) use ($landlordId) {
                        $sq->where('landlord_id', $landlordId);
                    });
                }
                if (!empty($delegatedPropertyIds)) {
                    $q->orWhereHas('property', function($sq) use ($delegatedPropertyIds) {
                        $sq->whereIn('id', $delegatedPropertyIds);
                    });
                }
            })
            ->get();

        return view('co-owner.payments.create', compact('leases'));
    }

    /**
     * Enregistre un nouveau paiement manuel
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lease_id' => 'required|exists:leases,id',
            'amount_total' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:virement,especes,cheque,mobile_money,card',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $lease = Lease::with('tenant')->findOrFail($validated['lease_id']);

        // Vérification des droits
        $this->authorize('view', $lease->property);

        // Calcul des frais (exemple: 5%)
        $feeRate = 0.05;
        $feeAmount = $validated['amount_total'] * $feeRate;
        $amountNet = $validated['amount_total'] - $feeAmount;

        DB::transaction(function () use ($validated, $user, $lease, $feeAmount, $amountNet) {
            Payment::create([
                'invoice_id' => null, // Ou lier à une facture existante
                'lease_id' => $validated['lease_id'],
                'tenant_id' => $lease->tenant_id,
                'landlord_user_id' => $user->id,
                'provider' => 'manual',
                'status' => 'approved', // Paiement manuel validé immédiatement
                'amount_total' => $validated['amount_total'],
                'fee_amount' => $feeAmount,
                'amount_net' => $amountNet,
                'currency' => 'XOF',
                'paid_at' => $validated['payment_date'],
                'provider_payload' => json_encode([
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'] ?? null,
                    'recorded_by' => $user->id,
                ]),
            ]);

            // Mettre à jour le statut de la facture si liée
            if ($validated['invoice_id'] ?? null) {
                $invoice = \App\Models\Invoice::find($validated['invoice_id']);
                if ($invoice) {
                    $invoice->update(['status' => 'paid', 'paid_at' => now()]);
                }
            }
        });

        return redirect()->route('co-owner.payments.index')
            ->with('success', 'Paiement enregistré avec succès.');
    }

    /**
     * Affiche les détails d'un paiement
     */
    public function show(Payment $payment)
    {
        $this->authorize('view', $payment->lease->property);

        $payment->load(['lease.property', 'lease.tenant.user', 'invoice']);

        return view('co-owner.payments.show', compact('payment'));
    }

    /**
     * Exporte les paiements (CSV/PDF)
     */
    public function export(Request $request)
    {
        $format = $request->input('format', 'csv');

        // Logique d'export selon le format
        if ($format === 'csv') {
            return $this->exportCsv($request);
        }

        return $this->exportPdf($request);
    }

    /**
     * Export CSV
     */
    private function exportCsv(Request $request)
    {
        $user = auth()->user();
        $landlordId = $user->landlord ? $user->landlord->id : null;

        // Si c'est un co-propriétaire, récupérer les propriétés déléguées
        $delegatedPropertyIds = [];
        if ($user->coOwner) {
            $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $user->coOwner->id)
                ->where('status', 'active')
                ->pluck('property_id')
                ->toArray();
        }

        $payments = Payment::with(['lease.property', 'lease.tenant.user', 'invoice'])
            ->when($landlordId, function($q) use ($landlordId) {
                $q->where('landlord_user_id', $user->id);
            })
            ->when(!empty($delegatedPropertyIds), function($q) use ($delegatedPropertyIds) {
                $q->whereHas('lease.property', function($sq) use ($delegatedPropertyIds) {
                    $sq->whereIn('id', $delegatedPropertyIds);
                });
            })
            ->latest('created_at')
            ->get();

        $filename = 'paiements_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($payments) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID', 'Date', 'Bien', 'Locataire', 'Montant Total',
                'Frais', 'Net', 'Statut', 'Méthode', 'Date Paiement'
            ]);

            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->id,
                    $payment->created_at->format('d/m/Y'),
                    $payment->lease->property->name ?? 'N/A',
                    $payment->lease->tenant->user->name ?? 'N/A',
                    $payment->amount_total,
                    $payment->fee_amount,
                    $payment->amount_net,
                    $payment->status,
                    $payment->provider_payload ? json_decode($payment->provider_payload)->payment_method ?? 'N/A' : 'N/A',
                    $payment->paid_at ? $payment->paid_at->format('d/m/Y') : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export PDF
     */
    private function exportPdf(Request $request)
    {
        $user = auth()->user();
        $landlordId = $user->landlord ? $user->landlord->id : null;

        // Si c'est un co-propriétaire, récupérer les propriétés déléguées
        $delegatedPropertyIds = [];
        if ($user->coOwner) {
            $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $user->coOwner->id)
                ->where('status', 'active')
                ->pluck('property_id')
                ->toArray();
        }

        $payments = Payment::with(['lease.property', 'lease.tenant.user', 'invoice'])
            ->when($landlordId, function($q) use ($landlordId) {
                $q->where('landlord_user_id', $user->id);
            })
            ->when(!empty($delegatedPropertyIds), function($q) use ($delegatedPropertyIds) {
                $q->whereHas('lease.property', function($sq) use ($delegatedPropertyIds) {
                    $sq->whereIn('id', $delegatedPropertyIds);
                });
            })
            ->latest('created_at')
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('co-owner.payments.export-pdf', [
            'payments' => $payments,
            'user' => $user,
            'date' => now()->format('d/m/Y')
        ]);

        return $pdf->download('paiements_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Génère les rappels de paiement
     */
    public function reminders()
    {
        $user = auth()->user();
        $landlordId = $user->landlord ? $user->landlord->id : null;

        // Si c'est un co-propriétaire, récupérer les propriétés déléguées
        $delegatedPropertyIds = [];
        if ($user->coOwner) {
            $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $user->coOwner->id)
                ->where('status', 'active')
                ->pluck('property_id')
                ->toArray();
        }

        $latePayments = Payment::with(['lease.tenant.user', 'lease.property'])
            ->where('status', 'pending')
            ->whereHas('invoice', function($q) {
                $q->where('due_date', '<', now()->subDays(7));
            })
            ->where(function($q) use ($landlordId, $delegatedPropertyIds) {
                if ($landlordId) {
                    $q->whereHas('lease.property', function($sq) use ($landlordId) {
                        $sq->where('landlord_id', $landlordId);
                    });
                }
                if (!empty($delegatedPropertyIds)) {
                    $q->orWhereHas('lease.property', function($sq) use ($delegatedPropertyIds) {
                        $sq->whereIn('id', $delegatedPropertyIds);
                    });
                }
            })
            ->get();

        return view('co-owner.payments.reminders', compact('latePayments'));
    }

    /**
     * Envoie un rappel par email
     */
    public function sendReminder(Payment $payment)
    {
        $this->authorize('view', $payment->lease->property);

        $tenant = $payment->lease->tenant;

        if ($tenant && $tenant->user) {
            // Envoi de l'email de rappel
            \Illuminate\Support\Facades\Mail::to($tenant->user->email)
                ->queue(new \App\Mail\PaymentReminderMail($payment));

            return back()->with('success', 'Rappel envoyé avec succès.');
        }

        return back()->with('error', 'Impossible d\'envoyer le rappel : email non trouvé.');
    }

    /**
     * Archive un paiement
     */
    public function archive(Payment $payment)
    {
        $this->authorize('view', $payment->lease->property);

        $payment->update(['status' => 'cancelled']);

        return back()->with('success', 'Paiement archivé.');
    }

    /**
     * Récupère la tendance de recouvrement sur 6 mois
     */
    private function getRecoveryTrend($userId, $landlordId, $delegatedPropertyIds)
    {
        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $expectedQuery = Payment::where('landlord_user_id', $userId)
                ->whereBetween('created_at', [$monthStart, $monthEnd]);

            $receivedQuery = Payment::where('landlord_user_id', $userId)
                ->where('status', 'approved')
                ->whereBetween('paid_at', [$monthStart, $monthEnd]);

            // Filtrer par propriétés déléguées si applicable
            if (!empty($delegatedPropertyIds)) {
                $expectedQuery->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                    $q->whereIn('id', $delegatedPropertyIds);
                });
                $receivedQuery->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                    $q->whereIn('id', $delegatedPropertyIds);
                });
            }

            $expected = $expectedQuery->sum('amount_total');
            $received = $receivedQuery->sum('amount_total');

            $rate = $expected > 0 ? round(($received / $expected) * 100, 0) : 0;

            $trend[] = [
                'month' => $month->format('M Y'),
                'rate' => $rate
            ];
        }

        return $trend;
    }
}
