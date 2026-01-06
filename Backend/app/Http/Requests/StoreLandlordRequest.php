<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLandlordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public registration
    }

    public function rules(): array
{
    return [
        'email' => 'required|email:rfc,dns|unique:users,email',
        'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        'phone' => 'required|string|regex:/^[\+]?[0-9\s\-\(\)]{10,15}$/|unique:users,phone',

        'is_professional' => 'required|boolean',

        // identité
        'id_type' => 'required|string|in:CNI,PASSPORT,PERMIS,SEJOUR',
        'id_number' => 'nullable|string|max:100',

        // adresse bailleur
        'address' => 'required|string|max:500',

        // Particulier => prénom/nom obligatoires
        'first_name' => 'required_if:is_professional,false|nullable|string|regex:/^[a-zA-ZÀ-ÿ\s\-]+$/u|max:100',
        'last_name'  => 'required_if:is_professional,false|nullable|string|regex:/^[a-zA-ZÀ-ÿ\s\-]+$/u|max:100',

        // Pro => raison sociale + IFU + RCCM obligatoires
        'company_name' => 'required_if:is_professional,true|nullable|string|max:255|regex:/^[a-zA-Z0-9À-ÿ\s\-\&\.\,]+$/u',
        'ifu'  => 'required_if:is_professional,true|nullable|string|max:50',
        'rccm' => 'required_if:is_professional,true|nullable|string|max:50',

        // tu peux garder vat_number si tu veux, sinon on le retire
        'vat_number' => 'nullable|string|max:50',
        'address_billing' => 'nullable|string|max:500',
    ];
}

}
