import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Home Chef",
      content: "Finally, an AI that actually understands what I want to cook. Perfect recipes every time.",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "Busy Professional", 
      content: "Saves me hours of meal planning. Just tell it what I'm craving and boom - perfect recipe.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Food Enthusiast",
      content: "The AI adapts to my dietary needs flawlessly. It's like having a personal chef.",
      rating: 5
    }
  ]

  return (
    <section id="testimonials" className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Loved by Home Cooks
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands who've transformed their cooking experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simple stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-gray-200"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 rating</span>
            </div>
            <div>100K+ recipes generated</div>
            <div>30s average time</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 