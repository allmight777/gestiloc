import React from 'react';

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Container for the staggered layout */}
        <div className="relative h-[700px]">
          
          {/* First testimonial and stat pair */}
          <div className="absolute top-0 left-0 md:left-8 z-20">
            {/* Testimonial box */}
            <div className="bg-green-50 border border-green-300 rounded-2xl p-5 mb-3 w-72 shadow-md transform -rotate-3">
              <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </p>
              <p className="text-gray-600 font-semibold text-sm">
                Pierre, Cotonou, Bénin
              </p>
            </div>
            
            {/* Stat box */}
            <div className="bg-green-600 text-white rounded-2xl p-5 w-72 shadow-lg transform rotate-2 ml-6">
              <div className="text-5xl font-bold mb-2">67%</div>
              <p className="text-sm leading-relaxed">
                de nos clients recommandent GestiLoc à leur entourage.
              </p>
            </div>
          </div>

          {/* Second testimonial and stat pair */}
          <div className="absolute top-32 right-0 md:right-8 z-10">
            {/* Testimonial box */}
            <div className="bg-green-50 border border-green-300 rounded-2xl p-5 mb-3 w-72 shadow-md transform rotate-2">
              <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">
                "Je tiens à vous dire un grand merci pour votre site. J'y ai énormément appris de choses. Bravo !"
              </p>
              <p className="text-gray-600 font-semibold text-sm">
                Francine, Porto-Novo, Bénin
              </p>
            </div>
            
            {/* Stat box */}
            <div className="bg-purple-600 text-white rounded-2xl p-5 w-72 shadow-lg transform -rotate-3 ml-6">
              <div className="text-5xl font-bold mb-2">83%</div>
              <p className="text-sm leading-relaxed">
                de nos clients affirment que GestiLoc les aide à mieux suivre les loyers, charges et quittances.
              </p>
            </div>
          </div>

          {/* Third testimonial and stat pair */}
          <div className="absolute top-80 left-0 md:left-16 z-0">
            {/* Testimonial box */}
            <div className="bg-green-50 border border-green-300 rounded-2xl p-5 mb-3 w-72 shadow-md transform rotate-1">
              <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </p>
              <p className="text-gray-600 font-semibold text-sm">
                Pierre, Cotonou, Bénin
              </p>
            </div>
            
            {/* Stat box */}
            <div className="bg-green-600 text-white rounded-2xl p-5 w-72 shadow-lg transform rotate-3 ml-6">
              <div className="text-5xl font-bold mb-2">97%</div>
              <p className="text-sm leading-relaxed">
                de nos clients affirment gagner en efficacité et en productivité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
