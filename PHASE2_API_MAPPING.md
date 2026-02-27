# PHASE 2: Cartographie API Frontend → Backend

## Services ajoutés dans api.ts

✅ `landlordDashboardService` - NOUVEAU
- `getStats()` → GET /landlord/dashboard
- `getOccupationStats()` → GET /landlord/occupation-stats

✅ `tenantService` - ÉTENDU
- `getTenant(id)` → GET /tenants/{id} (NOUVEAU)
- `updateTenantProperty(tenantId, propertyId, payload)` → PUT /tenants/{tenant}/properties/{property} (NOUVEAU)

---

## Tableau de correspondance FINAL

| Fonctionnalité Front | Endpoint Backend | Méthode | Service Front | Statut |
|---------------------|-----------------|---------|---------------|--------|
| **DASHBOARD** | | | | |
| Stats globales | `/api/landlord/dashboard` | GET | `landlordDashboardService.getStats()` | ✅ Prêt |
| Taux occupation | `/api/landlord/occupation-stats` | GET | `landlordDashboardService.getOccupationStats()` | ✅ Prêt |
| Graphiques loyers | Via dashboard | GET | `landlordDashboardService.getStats()` | 🔄 À connecter |
| Documents récents | - | - | - | ⚠️ Pas d'endpoint |
| **TENANTS LIST** | | | | |
| Liste locataire | `/api/tenants` | GET | `tenantService.listTenants()` | ✅ Connecté |
| Voir détail | `/api/tenants/{id}` | GET | `tenantService.getTenant(id)` | ✅ Prêt |
| Modifier locataire | Via assign | PUT | `tenantService.updateTenantProperty()` | ✅ Prêt |
| Supprimer/Desassigner | `/api/tenants/{tenant}/properties/{property}` | DELETE | `tenantService.updateTenantProperty()` | ✅ Prêt |
| **PAYMENTS** | | | | |
| Liste factures | `/api/invoices` | GET | `invoiceService.listInvoices()` | ✅ Connecté |
| Créer facture | `/api/invoices` | POST | `invoiceService.createInvoice()` | ✅ Connecté |
| Détails facture | `/api/invoices/{id}` | GET | - | 🔄 À connecter |
| Envoyer rappel | `/api/landlord/invoices/{id}/remind` | POST | - | 🔄 À connecter |
| **QUITTANCES** | | | | |
| Liste quittances | `/api/rent-receipts` | GET | `rentReceiptService.listIndependent()` | ✅ Connecté |
| Créer quittance | `/api/rent-receipts` | POST | `rentReceiptService.createIndependent()` | ✅ Connecté |
| PDF quittance | `/api/rent-receipts/{id}/pdf` | GET | `rentReceiptService.downloadPdf()` | ✅ Connecté |
| **PROPERTIES** | | | | |
| Liste biens | `/api/properties` | GET | `propertyService.listProperties()` | ✅ Connecté |
| Créer bien | `/api/properties` | POST | `propertyService.createProperty()` | ✅ Connecté |
| Modifier bien | `/api/properties/{id}` | PUT | `propertyService.updateProperty()` | ✅ Connecté |
| **LEASES** | | | | |
| Liste contrats | `/api/leases` | GET | `leaseService.listLeases()` | ✅ Connecté |
| Créer contrat | `/api/leases` | POST | `leaseService.createLease()` | ✅ Connecté |
| PDF contrat | `/api/leases/{uuid}/contract` | GET | `contractService.downloadLeaseContract()` | ✅ Connecté |

---

## Services disponibles dans api.ts

```typescript
// ==== AUTH ====
authService.login()
authService.register()
authService.logout()
authService.getCurrentUser()

// ==== PROPERTIES ====
propertyService.listProperties()
propertyService.getProperty()
propertyService.createProperty()
propertyService.updateProperty()
propertyService.deleteProperty()
propertyService.listAvailableProperties()

// ==== TENANTS ====
tenantService.listTenants()
tenantService.inviteTenant()
tenantService.getTenant()          // NOUVEAU
tenantService.updateTenantProperty() // NOUVEAU
tenantService.uploadTenantDocuments()
tenantService.completeTenantRegistration()

// ==== LEASES ====
leaseService.listLeases()
leaseService.getLease()
leaseService.createLease()
leaseService.updateLease()
leaseService.terminateLease()

// ==== INVOICES ====
invoiceService.listInvoices()
invoiceService.createInvoice()

// ==== RENT RECEIPTS ====
rentReceiptService.listIndependent()
rentReceiptService.createIndependent()
rentReceiptService.downloadPdf()

// ==== CONDITION REPORTS ====
conditionReportService.listAll()
conditionReportService.listForProperty()
conditionReportService.getForProperty()
conditionReportService.createForProperty()
conditionReportService.addPhotos()

// ==== CONTRACTS ====
contractService.downloadLeaseContract()
contractService.generateRentalContract()

// ==== NOTICES ====
noticeService.list()
noticeService.create()
noticeService.update()
noticeService.delete()

// ==== LANDLORD DASHBOARD (NOUVEAU) ====
landlordDashboardService.getStats()
landlordDashboardService.getOccupationStats()
```

---

## Prochaines étapes pour connecteur le Frontend

### 1. Dashboard.tsx - Connecter les données réelles
```typescript
// Importer le service
import { landlordDashboardService } from '@/services/api';

// Dans le composant
const { data: stats } = useQuery({
  queryKey: ['landlord-dashboard'],
  queryFn: () => landlordDashboardService.getStats()
});
```

### 2. TenantsList.tsx - Connecter View/Edit
```typescript
// handleView
const handleView = async (locataire: Locataire) => {
  const details = await tenantService.getTenant(Number(locataire.id));
  // Afficher dans une modal ou naviguer
};

// handleEdit  
const handleEdit = async (locataire: Locataire) => {
  // Utiliser updateTenantProperty pour assigner/désassigner
};
```

### 3. Payments.tsx - Connecter création de facture
```typescript
const handleCreateInvoice = async (formData) => {
  await invoiceService.createInvoice(formData);
  notify('Facture créée avec succès', 'success');
};
```

### 4. QuittancesLoyers.tsx - Déjà connecté
- Les services sont déjà en place, vérifier que les handlers utilisent bien les méthodes du service.
