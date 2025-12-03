import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const benefits = [
  "Sans engagement",
  "Gratuit pour commencer",
  "Assistance incluse",
];

export function CTASection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-subtle p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4 md:text-4xl">
          Gérer vos biens en location n'a jamais été aussi facile !
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers de propriétaires qui simplifient leur gestion locative avec GestiLoc
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-base">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="text-base px-8">
          <Link to="/register">Ouvrir un compte gratuit</Link>
        </Button>
        
        <p className="text-sm text-muted-foreground mt-6">
          Aucune carte bancaire requise • Démarrez en 3 minutes
        </p>
      </div>
    </section>
  );
}
