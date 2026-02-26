<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class InviteTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        // controller checks landlord role, keep true here
        return true;
    }

    public function rules(): array
    {
        return [
            // Informations de base
            'email'                    => 'required|email',
            'first_name'               => 'required|string|max:100',
            'last_name'                => 'required|string|max:100',
            'phone'                    => 'nullable|string|max:20',

            // Informations personnelles
            'tenant_type'              => 'nullable|string|max:50',
            'birth_date'               => 'nullable|date',
            'birth_place'              => 'nullable|string|max:100',
            'marital_status'           => 'nullable|string|max:50',

            // Adresse
            'address'                  => 'nullable|string|max:255',
            'city'                     => 'nullable|string|max:100',
            'zip_code'                 => 'nullable|string|max:20',
            'country'                  => 'nullable|string|max:100',

            // Situation professionnelle
            'profession'               => 'nullable|string|max:100',
            'employer'                 => 'nullable|string|max:255',
            'contract_type'            => 'nullable|string|max:50',
            'monthly_income'           => 'nullable|numeric|min:0',
            'annual_income'            => 'nullable|numeric|min:0',

            // Contact d'urgence
            'emergency_contact_name'   => 'nullable|string|max:200',
            'emergency_contact_phone'  => 'nullable|string|max:20',
            'emergency_contact_email'  => 'nullable|email',

            // Notes
            'notes'                    => 'nullable|string',

            // Garant
            'has_guarantor'            => 'nullable|boolean',
            'guarantor_name'           => 'nullable|string|max:200',
            'guarantor_phone'          => 'nullable|string|max:20',
            'guarantor_email'          => 'nullable|email',
            'guarantor_profession'     => 'nullable|string|max:100',
            'guarantor_monthly_income' => 'nullable|numeric|min:0',
            'guarantor_annual_income'  => 'nullable|numeric|min:0',
            'guarantor_address'        => 'nullable|string|max:255',
            'guarantor_birth_date'     => 'nullable|date',
            'guarantor_birth_place'    => 'nullable|string|max:100',

            // Documents
            'document_type'            => 'nullable|string|max:50',
            'document_name'            => 'nullable|string|max:255',
            'document_file'            => 'nullable|string|max:500', // Pour URL/base64 du fichier
        ];
    }

    protected function passedValidation()
    {
        $validated = $this->validated();
        Log::info('InviteTenantRequest validation passed:', $validated);
        Log::info('Phone in validated data:', ['phone' => $validated['phone'] ?? 'null']);
    }
}
