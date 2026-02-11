@extends('layouts.co-owner')

@section('title', 'Nouvel état des lieux')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">
            <i class="fas fa-clipboard-check text-primary me-2"></i>
            Nouvel état des lieux
        </h1>
        <a href="{{ route('co-owner.condition-reports.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Retour
        </a>
    </div>

    <div class="card shadow">
        <div class="card-body">
            <form action="{{ route('co-owner.condition-reports.store') }}" method="POST" enctype="multipart/form-data">
                @csrf

                <div class="row mb-4">
                    <div class="col-md-6">
                        <label class="form-label required">Bien</label>
                        <select name="property_id" id="property_id" class="form-select" required>
                            <option value="">Sélectionner un bien</option>
                            @foreach($properties as $property)
                                <option value="{{ $property->id }}"
                                        data-leases="{{ json_encode($property->leases) }}">
                                    {{ $property->name }} - {{ $property->address }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label required">Bail associé</label>
                        <select name="lease_id" id="lease_id" class="form-select" required disabled>
                            <option value="">Sélectionnez d'abord un bien</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-4">
                        <label class="form-label required">Type d'état des lieux</label>
                        <select name="type" class="form-select" required>
                            <option value="entry">État des lieux d'entrée</option>
                            <option value="exit">État des lieux de sortie</option>
                            <option value="intermediate">État des lieux intermédiaire</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label required">Date de l'état des lieux</label>
                        <input type="date" name="report_date" class="form-control"
                               value="{{ date('Y-m-d') }}" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Notes générales</label>
                        <textarea name="notes" class="form-control" rows="2"
                                  placeholder="Observations générales..."></textarea>
                    </div>
                </div>

                <!-- Photos -->
                <div class="mb-4">
                    <label class="form-label required">Photos</label>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Ajoutez au moins une photo. Pour chaque photo, indiquez un statut et des notes si nécessaire.
                    </div>

                    <div id="photos-container">
                        <!-- Les photos seront ajoutées dynamiquement ici -->
                    </div>

                    <button type="button" class="btn btn-outline-primary mt-2" onclick="addPhotoField()">
                        <i class="fas fa-plus me-2"></i>Ajouter une photo
                    </button>
                </div>

                <!-- Boutons -->
                <div class="d-flex justify-content-end gap-2">
                    <a href="{{ route('co-owner.condition-reports.index') }}" class="btn btn-secondary">
                        Annuler
                    </a>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Enregistrer l'état des lieux
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
// Gérer la sélection du bien pour charger les baux
document.getElementById('property_id').addEventListener('change', function() {
    const propertySelect = this;
    const leaseSelect = document.getElementById('lease_id');
    const leases = JSON.parse(propertySelect.selectedOptions[0].dataset.leases || '[]');

    leaseSelect.innerHTML = '<option value="">Sélectionnez un bail</option>';

    if (leases.length > 0) {
        leases.forEach(lease => {
            const option = document.createElement('option');
            option.value = lease.id;
            option.textContent = `Bail #${lease.id} - ${lease.tenant?.full_name || 'Locataire inconnu'}`;
            leaseSelect.appendChild(option);
        });
        leaseSelect.disabled = false;
    } else {
        leaseSelect.innerHTML = '<option value="">Aucun bail actif pour ce bien</option>';
        leaseSelect.disabled = true;
    }
});

// Gérer l'ajout dynamique de photos
let photoCount = 0;
function addPhotoField() {
    const container = document.getElementById('photos-container');
    const photoId = `photo_${photoCount}`;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'card mb-3 photo-field';
    photoDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Photo ${photoCount + 1}</h6>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removePhotoField(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="row">
                <div class="col-md-6 mb-2">
                    <label class="form-label">Fichier photo</label>
                    <input type="file" name="photos[]" class="form-control" accept="image/*" required>
                </div>
                <div class="col-md-3 mb-2">
                    <label class="form-label">Statut</label>
                    <select name="condition_statuses[]" class="form-select">
                        <option value="good">Bon</option>
                        <option value="satisfactory">Correct</option>
                        <option value="poor">Mauvais</option>
                        <option value="damaged">Abîmé</option>
                    </select>
                </div>
                <div class="col-md-3 mb-2">
                    <label class="form-label">Notes sur l'état</label>
                    <input type="text" name="condition_notes[]" class="form-control"
                           placeholder="ex: fissure mur salon">
                </div>
            </div>
        </div>
    `;

    container.appendChild(photoDiv);
    photoCount++;
}

function removePhotoField(button) {
    if (document.querySelectorAll('.photo-field').length > 1) {
        button.closest('.photo-field').remove();
    } else {
        alert('Au moins une photo est requise');
    }
}

// Ajouter un champ photo au chargement
document.addEventListener('DOMContentLoaded', function() {
    addPhotoField();
});
</script>
@endpush
@endsection
