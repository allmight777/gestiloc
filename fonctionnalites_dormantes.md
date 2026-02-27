# Tableau des Fonctionnalités Dormantes - Espace Propriétaire

## Fonctionnalités Backend PROPRE au PROPRIÉTAIRE avec API mais Frontend non connecté

| # | Fonctionnalité | Controller | Route API | Service Frontend | Status |
|---|----------------|------------|-----------|------------------|--------|
| 1 | **Incidents/Maintenance** | `LandlordMaintenanceRequestController.php` | `GET /api/incidents` | ❌ Non exposé | 🔴 Dormant |
| 2 | **Paramètres Fedapay** | `LandlordFedapayController.php` | `GET/POST /api/landlord/fedapay` | ❌ Non exposé | 🔴 Dormant |
| 3 | **Audits des Délégations** | `DelegationAuditController.php` | `/api/properties/{id}/delegation-audits` | ❌ Non exposé | 🔴 Dormant |
| 4 | **Préavis (Notices)** | `NoticeController.php` | `/api/notices` | `noticeService` | ⚠️ Partiel |
| 5 | **États des lieux** | `PropertyConditionReportController.php` | `/api/properties/{id}/condition-reports` | `conditionReportService` | ⚠️ Partiel |

---

## Fonctionnalités PROPRIÉTAIRE Connectées ✅

| # | Fonctionnalité | Composant | Service | Status |
|---|----------------|-----------|---------|--------|
| 1 | **Paiements** | `Payments.tsx` | `landlordPayments.listInvoices()` | ✅ Connecté |
| 2 | **Quittances** | `QuittancesLoyers.tsx` | `rentReceiptService.listIndependent()` | ✅ Connecté |
| 3 | **Contrats de bail** | `DocumentsManager.tsx` | `leaseService.listLeases()` + `contractService.downloadLeaseContract()` | ✅ Connecté |
| 4 | **Gestion des biens** | `MesBiens.tsx` | `propertyService` | ✅ Connecté |
| 5 | **Gestion des locataires** | `TenantsList.tsx` | `tenantService.listTenants()` | ✅ Connecté |

---

## Détails des Fonctionnalités Dormantes PROPRIÉTAIRE

### 1. Incidents/Maintenance - 🔴 Dormant
- **Route**: `GET /api/incidents`
- **Controller**: `Backend/app/Http/Controllers/Api/LandlordMaintenanceRequestController.php`
- **Middleware**: `role:landlord`
- **Service Frontend**: ❌ Non exposé dans `api.ts`
- **Description**: Liste des demandes de maintenance/incidents signalés par les locataires

### 2. Paramètres Fedapay - 🔴 Dormant
- **Routes**: 
  - `GET /api/landlord/fedapay` - Récupérer les paramètres
  - `POST /api/landlord/fedapay/subaccount` - Créer/mettre à jour
- **Controller**: `Backend/app/Http/Controllers/Api/LandlordFedapayController.php`
- **Service Frontend**: ❌ Non exposé
- **Description**: Configuration des paramètres de paiement Fedapay pour les versements

### 3. Audits des Délégations - 🔴 Dormant
- **Routes**:
  - `GET /api/properties/{property}/delegation-audits`
  - `GET /api/landlords/delegation-audit-stats`
- **Controller**: `Backend/app/Http/Controllers/Api/DelegationAuditController.php`
- **Service Frontend**: ❌ Non exposé
- **Description**: Historique des modifications sur les biens délégués

### 4. Préavis (Notices) - ⚠️ Partiel
- **Routes**: `GET/POST/PUT/DELETE /api/notices`
- **Controller**: `Backend/app/Http/Controllers/Api/NoticeController.php`
- **Service Frontend**: `noticeService` ✅ Existe dans `api.ts`
- **Status**: Service existant mais pas de composant UI dédié dans l'espace propriétaire

### 5. États des lieux - ⚠️ Partiel
- **Routes**: `/api/properties/{property}/condition-reports`
- **Controller**: `Backend/app/Http/Controllers/Api/PropertyConditionReportController.php`
- **Service Frontend**: `conditionReportService` ✅ Existe dans `api.ts`
- **Status**: Service existant mais pas de composant UI complet

---

## Prochaines Priorités pour l'Espace Propriétaire

1. **Haute priorité**: Ajouter le service de maintenance au frontend
2. **Moyenne priorité**: Créer l'UI pour les préavis
3. **Basse priorité**: Intégrer les audits de délégations
