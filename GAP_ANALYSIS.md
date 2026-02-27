# Gap Analysis: Frontend Actions vs Backend Endpoints

## Vue d'ensemble

Ce document recense les fonctionnalités attendues par le frontend et leur statut côté backend.

---

## 1. MODULE PROPRIÉTAIRE (LANDLORD)

### 1.1 Dashboard
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Stats globales | `GET /dashboard` | ✅ Oui | LandlordDashboardController@stats |
| Occupation stats | `GET /landlord/occupation-stats` | ✅ Oui | TenantController@getOccupationStats |

### 1.2 Gestion des Biens (MesBiens)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste des biens | `GET /properties` | ✅ Oui | PropertyController@index |
| Créer un bien | `POST /properties` | ✅ Oui | PropertyController@store |
| Modifier un bien | `PUT /properties/{id}` | ✅ Oui | PropertyController@update |
| Supprimer un bien | `DELETE /properties/{id}` | ✅ Oui | PropertyController@destroy |
| Détails bien | `GET /properties/{id}` | ✅ Oui | PropertyController@show |

### 1.3 Gestion des Locataires (TenantsList)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste des locataires | `GET /tenants` | ✅ Oui | TenantController@index |
| Détails locataire | `GET /tenants/{id}` | ❌ **NON** | Manque méthode show() dans TenantController |
| Modifier locataire | `PUT /tenants/{id}` | ❌ **NON** | Manque méthode update() dans TenantController |
| Supprimer locataire | `DELETE /tenants/{id}` | ❌ **NON** | Manque méthode destroy() dans TenantController |
| Inviter locataire | `POST /tenants/invite` | ✅ Oui | TenantController@invite |
| Assigner bien | `POST /tenants/{id}/assign-property` | ✅ Oui | TenantController@assignProperty |
| Désassigner bien | `DELETE /tenants/{id}/properties/{propertyId}` | ✅ Oui | TenantController@unassignProperty |
| Historique bien | `GET /properties/{id}/history` | ✅ Oui | TenantController@getPropertyHistory |

### 1.4 Gestion des Locations (NouvelleLocation)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Créer un bail | `POST /leases` | ✅ Oui | LeaseController@store |
| Liste des baux | `GET /leases` | ✅ Oui | LeaseController@index |
| Détails bail | `GET /leases/{uuid}` | ✅ Oui | LeaseController@show |
| Résilier bail | `POST /leases/{uuid}/terminate` | ✅ Oui | LeaseController@terminate |
| Générer contrat PDF | `POST /pdf/generate-rental-contract` | ✅ Oui | PdfController@generateRentalContract |
| Télécharger contrat | `GET /pdf/contrat-bail/{uuid}` | ✅ Oui | PdfController@generateLeaseContract |

### 1.5 Paiements (Payments)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste factures | `GET /invoices` | ✅ Oui | InvoiceController@index |
| Créer facture | `POST /invoices` | ✅ Oui | InvoiceController@store |
| Détails facture | `GET /invoices/{id}` | ✅ Oui | InvoiceController@show |
| Modifier facture | `PUT /invoices/{id}` | ❌ **NON** | Manque méthode update() dans InvoiceController |
| Supprimer facture | `DELETE /invoices/{id}` | ❌ **NON** | Manque méthode destroy() dans InvoiceController |
| Envoyer rappel | `POST /invoices/{id}/remind` | ✅ Oui | InvoiceController@sendReminder |
| Créer lien paiement | `POST /invoices/{id}/pay-link` | ✅ Oui | PaymentLinkController@create |
| Générer quittance PDF | `GET /rent-receipts/{id}/pdf` | ✅ Oui | RentReceiptController@pdf |
| **Envoyer quittance par mail** | `POST /rent-receipts/{id}/send` | ❌ **NON** | **Manque - endpoint à créer** |

### 1.6 États des Lieux (EtatsLieux)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste états des lieux | `GET /condition-reports` | ✅ Oui | PropertyConditionReportController@allForLandlord |
| Créer état des lieux | `POST /properties/{id}/condition-reports` | ✅ Oui | PropertyConditionReportController@store |
| Détails état des lieux | `GET /condition-reports/{id}` | ✅ Oui | PropertyConditionReportController@show |
|Signer état des lieux | `POST /condition-reports/{id}/sign` | ✅ Oui | PropertyConditionReportController@sign |
| Ajouter photos | `POST /condition-reports/{id}/photos` | ✅ Oui | PropertyConditionReportController@addPhotos |
| Supprimer état des lieux | `DELETE /condition-reports/{id}` | ✅ Oui | PropertyConditionReportController@destroy |

### 1.7 Quittances de Loyer (QuittancesLoyers)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste quittances | `GET /rent-receipts` | ✅ Oui | RentReceiptController@index |
| Créer quittance | `POST /rent-receipts` | ✅ Oui | RentReceiptController@store |
| Modifier quittance | `PUT /rent-receipts/{id}` | ✅ Oui | RentReceiptController@update |
| Supprimer quittance | `DELETE /rent-receipts/{id}` | ✅ Oui | RentReceiptController@destroy |
| Télécharger quittance | `GET /rent-receipts/{id}/pdf` | ✅ Oui | RentReceiptController@pdf |
| **Envoyer par mail** | `POST /rent-receipts/{id}/send` | ❌ **NON** | **Manque - endpoint à créer** |

### 1.8 Avis d'Échéance (DocumentsManager / Notices)
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste avis | `GET /notices` | ✅ Oui | NoticeController@index |
| Créer avis | `POST /notices` | ✅ Oui | NoticeController@store |
| Modifier avis | `PUT /notices/{id}` | ✅ Oui | NoticeController@update |
| Supprimer avis | `DELETE /notices/{id}` | ✅ Oui | NoticeController@destroy |
| Générer PDF avis | `GET /pdf/avis-echeance/{id}` | ✅ Oui | PdfController@generateAvisEcheance |

### 1.9 Incidents/Maintenance
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Liste incidents | `GET /incidents` | ✅ Oui | LandlordMaintenanceRequestController@index |
| Détails incident | `GET /incidents/{id}` | ✅ Oui | LandlordMaintenanceRequestController@show |
| Modifier incident | `PUT /incidents/{id}` | ✅ Oui | LandlordMaintenanceRequestController@update |

### 1.10 Délégations
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Créer déléagation | `POST /property-delegations` | ✅ Oui | PropertyDelegationController@delegate |
| Révoquer déléagation | `DELETE /property-delegations/{id}` | ✅ Oui | PropertyDelegationController@revoke |
| Liste délégations co-owner | `GET /co-owners/me/delegations` | ✅ Oui | CoOwnerMeController@getDelegations |

### 1.11 Paramètres Fedapay
| Fonction Frontend | Endpoint nécessaire | Existe ? | Remarques |
|------------------|-------------------|----------|-----------|
| Voir profil Fedapay | `GET /landlord/fedapay` | ✅ Oui | LandlordFedapayController@show |
| Créer/maj subaccount | `POST /landlord/fedapay/subaccount` | ✅ Oui | LandlordFedapayController@createOrUpdate |

---

## 2. RÉSUMÉ DES ENDPOINTS MANQUANTS

### 🔴 Endpoints CRITIQUES à implémenter

| # | Endpoint | Méthode | Controller | Priorité |
|---|----------|---------|------------|----------|
| 1 | `/tenants/{id}` | GET | TenantController | Haute |
| 2 | `/tenants/{id}` | PUT | TenantController | Haute |
| 3 | `/tenants/{id}` | DELETE | TenantController | Haute |
| 4 | `/rent-receipts/{id}/send` | POST | RentReceiptController | Moyenne |
| 5 | `/invoices/{id}` | PUT | InvoiceController | Moyenne |
| 6 | `/invoices/{id}` | DELETE | InvoiceController | Moyenne |

---

## 3. FONCTIONNALITÉS AVEC ENDPOINTS PARTIELS

| Fonctionnalité | Status | Commentaire |
|---------------|--------|-------------|
| Dashboard stats | ⚠️ Partiel | Retourne des stats de base - à enrichir avec plus de métriques |
| Occupation stats | ✅ OK | Existe mais peut être optimisé |
| Génération documents | ✅ OK | PDF fonctionne pour contrats, quittances, avis |

---

## 4. RECOMMANDATIONS

### Priorité 1 (Urgent)
1. **Implémenter CRUD complet pour les locataires**
   - Ajouter `show()`, `update()`, `destroy()` dans `TenantController`
   - Ajouter les routes correspondantes dans `api.php`

### Priorité 2 (Moyen)
2. **Ajouter envoi de quittance par email**
   - Créer `send()` dans `RentReceiptController`
   - Ajouter route `POST /rent-receipts/{id}/send`

3. **Ajouter gestion des factures**
   - Ajouter `update()` et `destroy()` dans `InvoiceController`

### Priorité 3 (Amélioration)
4. **Enrichir le dashboard**
   - Ajouter plus de métriques (tendance mensuelle, historique)
