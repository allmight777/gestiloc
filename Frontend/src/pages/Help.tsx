import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  FileText,
  CreditCard,
  FolderLock,
  Wrench,
  Calculator,
  Search,
} from "lucide-react";

const categories = [
  {
    icon: User,
    title: "Comptes & Profils",
    description: "Création de compte, paramètres, sécurité",
    articles: 5,
    slug: "comptes-profils",
  },
  {
    icon: Building2,
    title: "Gestion des biens",
    description: "Ajout, modification, suppression de biens",
    articles: 4,
    slug: "gestion-biens",
  },
  {
    icon: FileText,
    title: "Baux & Locataires",
    description: "Création de baux, gestion des locataires",
    articles: 5,
    slug: "baux-locataires",
  },
  {
    icon: CreditCard,
    title: "Paiements & Loyers",
    description: "Quittances, impayés, relances Mobile Money",
    articles: 5,
    slug: "paiements-loyers",
  },
  {
    icon: FolderLock,
    title: "Documents & Coffre-fort",
    description: "Upload, organisation, partage de documents",
    articles: 4,
    slug: "documents-coffre",
  },
  {
    icon: Wrench,
    title: "Interventions & Travaux",
    description: "Demandes d'intervention, suivi des travaux",
    articles: 4,
    slug: "interventions-travaux",
  },
  {
    icon: Calculator,
    title: "Comptabilité & Fiscalité",
    description: "Déclarations, exports comptables, charges",
    articles: 5,
    slug: "comptabilite-fiscalite",
  },
];

export default function Help() {
  return (
    <div className="pb-16">
      <section className="bg-background py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary">
            Centre d'aide
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-foreground">
            Trouvez rapidement des réponses à vos questions
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher dans l'aide..."
                className="pl-10 bg-background border-input"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link key={index} to={`/help/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.articles} articles
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container">
        <Card className="bg-muted/50 text-center p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Notre équipe support est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/contact">Nous contacter</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/help/faq">Voir la FAQ</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
