import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    title: "Healthcare Management System",
    description: "A web application for managing patient records and medical histories.",
    tech: ["React", "TypeScript", "MongoDB"],
    link: "#",
  }
];

export default function Projects() {
  return (
    <section className="py-16 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-pink-100/30 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-8 text-gray-900"
        >
          Featured Projects
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border-pink-100">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 bg-pink-500/10 text-pink-700 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs w-full"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Project
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}