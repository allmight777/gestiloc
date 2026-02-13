import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nous aidons les bailleurs à gérer sereinement leurs emplacements
          </h2>
          <p className="text-gray-600 text-lg">
            Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="relative h-[700px] md:h-[600px]">
          
          {/* Left side - Pierre + 67% */}
          <motion.div 
            className="absolute top-0 left-0 md:left-12 z-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Testimonial box */}
            <div className="bg-white border border-green-400 rounded-lg p-5 w-64 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </p>
              <p className="text-gray-500 text-xs">
                Pierre , Cotonou, Bénin
              </p>
            </div>
            
            {/* Stat box - touching testimonial */}
            <div className="bg-green-600 text-white rounded-lg p-5 w-64 shadow-md -mt-2 ml-8 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">67%</div>
              <p className="text-sm leading-relaxed">
                de nos clients recommandent GestiLoc à leur entourage.
              </p>
            </div>
          </motion.div>

          {/* Right side - Francine + 97% */}
          <motion.div 
            className="absolute top-0 right-0 md:right-12 z-10"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Testimonial box */}
            <div className="bg-white border border-green-400 rounded-lg p-5 w-64 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "Je tiens à vous dire un grand merci pour votre site. J'y ai énormément appris de choses. Bravo !"
              </p>
              <p className="text-gray-500 text-xs">
                Francine , Porto-Novo, Bénin
              </p>
            </div>
            
            {/* Stat box - touching testimonial */}
            <div className="bg-green-500 text-white rounded-lg p-5 w-64 shadow-md -mt-2 ml-8 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">97%</div>
              <p className="text-sm leading-relaxed">
                de nos clients affirment gagner en efficacité et en productivité.
              </p>
            </div>
          </motion.div>

          {/* Center bottom - Pierre + 83% */}
          <motion.div 
            className="absolute top-72 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Testimonial box */}
            <div className="bg-white border border-green-400 rounded-lg p-5 w-64 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </p>
              <p className="text-gray-500 text-xs">
                Pierre , Cotonou, Bénin
              </p>
            </div>
            
            {/* Stat box - touching testimonial */}
            <div className="bg-purple-500 text-white rounded-lg p-5 w-64 shadow-md -mt-2 ml-8 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">83%</div>
              <p className="text-sm leading-relaxed">
                de nos clients affirment que GestiLoc les aide à mieux suivre les loyers, charges et quittances.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
