import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";

const categoryArticles: Record<string, { title: string; description: string; articles: Array<{ title: string; slug: string; content: string }> }> = {
  "comptes-profils": {
    title: "Comptes & Profils",
    description: "Gérez votre compte et vos paramètres",
    articles: [
      {
        title: "Comment créer un compte propriétaire",
        slug: "creer-compte-proprietaire",
        content: "Pour créer un compte propriétaire sur GestiLoc, cliquez sur 'Inscription' en haut à droite. Remplissez le formulaire avec vos informations personnelles : nom, prénom, email et mot de passe sécurisé. Validez votre email via le lien de confirmation reçu par mail."
      },
      {
        title: "Réinitialiser mon mot de passe",
        slug: "reinitialiser-mot-de-passe",
        content: "Si vous avez oublié votre mot de passe, cliquez sur 'Mot de passe oublié' sur la page de connexion. Saisissez votre adresse email et vous recevrez un lien de réinitialisation. Cliquez sur ce lien et définissez un nouveau mot de passe sécurisé."
      },
      {
        title: "Modifier mes informations personnelles",
        slug: "modifier-informations",
        content: "Pour modifier vos informations personnelles, connectez-vous et accédez à 'Mon profil' dans le menu. Vous pouvez y modifier votre nom, prénom, numéro de téléphone et adresse. N'oubliez pas de sauvegarder vos modifications."
      },
      {
        title: "Gérer mes préférences de notifications",
        slug: "preferences-notifications",
        content: "Dans les paramètres de votre compte, section 'Notifications', vous pouvez activer ou désactiver les notifications par email et SMS pour les loyers, les interventions et les messages des locataires."
      },
      {
        title: "Supprimer mon compte",
        slug: "supprimer-compte",
        content: "Pour supprimer votre compte, rendez-vous dans Paramètres > Compte > Supprimer mon compte. Attention : cette action est irréversible et supprimera toutes vos données."
      },
    ]
  },
  "gestion-biens": {
    title: "Gestion des biens",
    description: "Ajoutez et gérez vos propriétés",
    articles: [
      {
        title: "Ajouter un bien immobilier",
        slug: "ajouter-bien",
        content: "Pour ajouter un bien, accédez à 'Mes biens' puis cliquez sur 'Ajouter un bien'. Renseignez l'adresse complète, le type de bien (appartement, maison, studio), la surface, le nombre de pièces et ajoutez des photos. Vous pouvez aussi indiquer les équipements disponibles."
      },
      {
        title: "Modifier les informations d'un bien",
        slug: "modifier-bien",
        content: "Dans la liste de vos biens, cliquez sur le bien à modifier puis sur 'Modifier'. Vous pouvez changer toutes les informations : adresse, surface, loyer, description, photos et équipements."
      },
      {
        title: "Archiver ou supprimer un bien",
        slug: "archiver-bien",
        content: "Pour archiver un bien que vous ne louez plus, cliquez sur 'Archiver' dans les options du bien. Le bien restera dans votre historique. Pour supprimer définitivement un bien sans locataire ni historique, utilisez l'option 'Supprimer'."
      },
      {
        title: "Gérer les photos de mon bien",
        slug: "photos-bien",
        content: "Dans la fiche du bien, section 'Photos', vous pouvez ajouter jusqu'à 10 photos. Glissez-déposez vos images ou cliquez pour les sélectionner. Vous pouvez réorganiser l'ordre des photos et définir une photo principale."
      },
    ]
  },
  "baux-locataires": {
    title: "Baux & Locataires",
    description: "Gérez vos contrats et locataires",
    articles: [
      {
        title: "Créer un nouveau bail",
        slug: "creer-bail",
        content: "Pour créer un bail, sélectionnez le bien concerné puis cliquez sur 'Nouveau bail'. Renseignez les dates de début et fin, le montant du loyer, la caution, et les informations du locataire. Le système génère automatiquement un contrat de bail conforme."
      },
      {
        title: "Ajouter un locataire",
        slug: "ajouter-locataire",
        content: "Lors de la création d'un bail, ajoutez les informations du locataire : nom, prénom, email, téléphone, numéro Mobile Money. Le locataire recevra une invitation à créer son compte pour accéder à son espace locataire."
      },
      {
        title: "Renouveler un bail",
        slug: "renouveler-bail",
        content: "À l'approche de l'échéance du bail, vous recevrez une notification. Cliquez sur 'Renouveler le bail' pour créer un nouveau contrat avec les mêmes informations ou modifier le loyer et les conditions."
      },
      {
        title: "Résilier un bail",
        slug: "resilier-bail",
        content: "Pour résilier un bail, accédez à la fiche du locataire puis cliquez sur 'Résilier le bail'. Indiquez la date de fin effective et le motif. Le système calculera automatiquement les derniers paiements dus."
      },
      {
        title: "Gérer plusieurs locataires pour un même bien",
        slug: "colocataires",
        content: "Pour un bien en colocation, vous pouvez ajouter plusieurs locataires au même bail. Définissez la répartition des charges et du loyer entre les colocataires."
      },
    ]
  },
  "paiements-loyers": {
    title: "Paiements & Loyers",
    description: "Suivez les paiements et gérez les quittances",
    articles: [
      {
        title: "Enregistrer un paiement Mobile Money",
        slug: "enregistrer-paiement",
        content: "Lorsqu'un locataire effectue un paiement Mobile Money, enregistrez-le dans 'Paiements' en indiquant le montant, la date et le numéro de transaction Mobile Money. Le système met à jour automatiquement le solde du locataire."
      },
      {
        title: "Générer une quittance de loyer",
        slug: "generer-quittance",
        content: "Après avoir enregistré un paiement, cliquez sur 'Générer quittance' pour créer un reçu officiel. La quittance est automatiquement envoyée par email au locataire et stockée dans votre coffre-fort numérique."
      },
      {
        title: "Gérer les impayés",
        slug: "gerer-impayes",
        content: "Le tableau de bord affiche les loyers impayés en rouge. Vous pouvez envoyer des relances automatiques par SMS et email au locataire. Le système calcule les pénalités de retard selon les conditions du bail."
      },
      {
        title: "Configurer les paiements récurrents",
        slug: "paiements-recurrents",
        content: "Pour faciliter le suivi, configurez les échéances de loyer mensuelles. Le système créera automatiquement les lignes de paiement attendues et vous alertera en cas de retard."
      },
      {
        title: "Envoyer une relance de paiement",
        slug: "relance-paiement",
        content: "Dans la section Paiements, sélectionnez le loyer impayé et cliquez sur 'Envoyer une relance'. Vous pouvez personnaliser le message qui sera envoyé par SMS et email au locataire."
      },
    ]
  },
  "documents-coffre": {
    title: "Documents & Coffre-fort",
    description: "Organisez vos documents importants",
    articles: [
      {
        title: "Télécharger un document dans le coffre-fort",
        slug: "telecharger-document",
        content: "Accédez au coffre-fort numérique et cliquez sur 'Ajouter un document'. Glissez-déposez vos fichiers (PDF, images, Word) ou sélectionnez-les. Organisez-les par catégories : baux, quittances, états des lieux, factures, etc."
      },
      {
        title: "Partager un document avec un locataire",
        slug: "partager-document",
        content: "Dans la fiche d'un document, cliquez sur 'Partager'. Sélectionnez le ou les locataires destinataires. Ils recevront une notification et pourront consulter le document depuis leur espace locataire."
      },
      {
        title: "Organiser mes documents par dossier",
        slug: "organiser-documents",
        content: "Créez des dossiers personnalisés pour organiser vos documents par bien, par locataire ou par type. Vous pouvez déplacer les documents entre dossiers et ajouter des tags pour faciliter la recherche."
      },
      {
        title: "Rechercher un document",
        slug: "rechercher-document",
        content: "Utilisez la barre de recherche en haut du coffre-fort pour retrouver rapidement un document par nom, date ou tag. Vous pouvez aussi filtrer par type de document ou par bien immobilier."
      },
    ]
  },
  "interventions-travaux": {
    title: "Interventions & Travaux",
    description: "Gérez les demandes d'intervention",
    articles: [
      {
        title: "Créer une demande d'intervention",
        slug: "creer-intervention",
        content: "Accédez à 'Interventions' et cliquez sur 'Nouvelle intervention'. Sélectionnez le bien concerné, décrivez le problème, ajoutez des photos et définissez le niveau d'urgence. Vous pouvez assigner l'intervention à un prestataire."
      },
      {
        title: "Suivre l'état d'une intervention",
        slug: "suivre-intervention",
        content: "Toutes vos interventions sont listées avec leur statut : en attente, en cours, terminée. Cliquez sur une intervention pour voir les détails, les échanges avec le prestataire et les photos avant/après."
      },
      {
        title: "Ajouter un prestataire",
        slug: "ajouter-prestataire",
        content: "Dans 'Prestataires', cliquez sur 'Ajouter un prestataire'. Renseignez son nom, spécialité (plombier, électricien, etc.), téléphone et email. Vous pourrez ensuite lui assigner des interventions."
      },
      {
        title: "Planifier des travaux",
        slug: "planifier-travaux",
        content: "Pour des travaux d'envergure, créez un projet dans 'Travaux'. Définissez les tâches, leur ordre, les prestataires et le budget. Le système vous aide à suivre l'avancement et les dépenses."
      },
    ]
  },
  "comptabilite-fiscalite": {
    title: "Comptabilité & Fiscalité",
    description: "Gérez votre comptabilité et vos obligations fiscales",
    articles: [
      {
        title: "Exporter mes données comptables",
        slug: "export-comptable",
        content: "Dans 'Comptabilité', cliquez sur 'Exporter' et sélectionnez la période. Vous pouvez exporter vos données au format Excel ou PDF pour les transmettre à votre comptable ou pour vos déclarations fiscales."
      },
      {
        title: "Suivre mes revenus locatifs",
        slug: "revenus-locatifs",
        content: "Le tableau de bord comptable affiche vos revenus locatifs mois par mois. Vous pouvez filtrer par bien, voir les tendances annuelles et comparer les performances de vos différents biens."
      },
      {
        title: "Gérer mes charges et dépenses",
        slug: "charges-depenses",
        content: "Enregistrez toutes vos dépenses dans 'Charges' : travaux, entretien, taxe foncière, assurance, etc. Joignez les factures et catégorisez les dépenses pour faciliter votre suivi et vos déclarations."
      },
      {
        title: "Calculer ma rentabilité",
        slug: "calculer-rentabilite",
        content: "L'outil de calcul de rentabilité vous permet de voir le rendement de chaque bien. Il prend en compte les loyers perçus, les charges, les impayés et les dépenses pour calculer votre rentabilité nette."
      },
      {
        title: "Préparer ma déclaration fiscale",
        slug: "declaration-fiscale",
        content: "GestiLoc génère un récapitulatif annuel de vos revenus fonciers avec toutes les informations nécessaires pour votre déclaration d'impôts. Consultez 'Fiscalité' puis 'Récapitulatif annuel'."
      },
    ]
  },
};

export default function HelpCategory() {
  const { category } = useParams();
  const categoryData = category ? categoryArticles[category] : null;

  if (!categoryData) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
        <Button asChild>
          <Link to="/help">Retour à l'aide</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <section className="bg-background py-12">
        <div className="container">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/help">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au centre d'aide
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-primary">{categoryData.title}</h1>
            <p className="text-lg text-foreground">{categoryData.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {categoryData.articles.length} {categoryData.articles.length > 1 ? 'articles' : 'article'}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="grid gap-6">
          {categoryData.articles.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{article.content}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-8">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg mb-1">Besoin d'aide supplémentaire ?</h3>
                <p className="text-sm text-muted-foreground">
                  Notre équipe support d'Innovtech est disponible via le chat en bas à droite
                </p>
              </div>
              <Button asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
