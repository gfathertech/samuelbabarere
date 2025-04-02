import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SiReact, SiNodedotjs, SiExpress, SiMongodb } from "react-icons/si";

const skillsData = [
  { icon: SiReact, name: "React.js" },
  { icon: SiNodedotjs, name: "Node.js" },
  { icon: SiExpress, name: "Express.js" },
  { icon: SiMongodb, name: "MongoDB" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Skills() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={container}
        className="max-w-5xl mx-auto px-4"
      >
        <motion.h2 
          variants={item}
          className="text-2xl font-bold text-center mb-8 text-gray-900"
        >
          Technical Skills
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {skillsData.map((skill) => (
            <motion.div key={skill.name} variants={item}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border-pink-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <skill.icon className="w-5 h-5 text-pink-500" />
                    <h3 className="text-sm font-semibold text-gray-800">{skill.name}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}