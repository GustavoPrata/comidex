"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChefHat, Users, ChevronRight } from "lucide-react";

// Import das imagens geradas
const adminImage = "/generated_images/Dashboard_focused_office_view_8abde768.png";
const posImage = "/generated_images/POS_system_interface_6e354903.png";

export default function HomePage() {
  const router = useRouter();

  const cards = [
    {
      id: "admin",
      title: "Painel Administrativo",
      description: "Gerencie cardápio, mesas e configurações",
      icon: ChefHat,
      image: adminImage,
      route: "/admin",
      gradient: "from-orange-500 to-orange-600",
      features: ["Dashboard Completo", "Gestão de Cardápio", "Controle de Mesas"]
    },
    {
      id: "pos",
      title: "Sistema POS",
      description: "Interface para atendimento de mesas",
      icon: Users,
      image: posImage,
      route: "/pos",
      gradient: "from-gray-700 to-gray-900",
      features: ["Pedidos Rápidos", "Status em Tempo Real", "Interface Intuitiva"]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-hidden relative">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header elegante */}
      <header className="relative border-b border-gray-100 dark:border-gray-900 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {/* Ícone com animação */}
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full shadow-2xl">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                ComideX
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                Sistema Premium de Gestão para Restaurante Japonês
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Cards principais com mega hover effect */}
      <main className="relative container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => router.push(card.route)}
              className="group relative cursor-pointer transform-gpu transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Card container */}
              <div className="relative h-[400px]">
                {/* Card principal */}
                <div className="relative h-full bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  {/* Imagem com overlay gradient */}
                  <div className="relative h-[240px] overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}>
                          <card.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {card.title}
                        </h3>
                      </div>
                      
                      {/* Ícone de seta */}
                      <div className="transform transition-all duration-300 group-hover:translate-x-1">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {card.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {card.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Texto de rodapé elegante */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Escolha uma interface para começar
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-1 w-8 bg-gradient-to-r from-transparent to-orange-500 rounded-full" />
            <div className="h-1 w-1 bg-orange-500 rounded-full" />
            <div className="h-1 w-8 bg-gradient-to-l from-transparent to-orange-500 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
}