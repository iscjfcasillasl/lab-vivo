<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\Phase;
use App\Models\Activity;
use Illuminate\Support\Facades\DB;

class PlanOperativoSeeder extends Seeder
{
    public function run()
    {
        $user = \App\Models\User::first();
        $userId = $user ? $user->id : null;

        $planData = $this->getPlanData();

        foreach ($planData as $entry) {
            $project = null;

            // Try to find existing project by key
            if (!empty($entry['key'])) {
                $project = Project::where('key', $entry['key'])->first();
            }

            // If not found, create new project
            if (!$project) {
                $project = Project::create([
                    'name' => $entry['name'],
                    'description' => $entry['description'],
                    'color' => $entry['color'],
                    'icon' => $entry['icon'],
                    'key' => $entry['key'] ?? 'proj_' . time() . '_' . rand(1000, 9999),
                ]);
                echo "  [NUEVO] Proyecto: {$project->name}\n";
            } else {
                // Update project description if empty
                if (empty($project->description) && !empty($entry['description'])) {
                    $project->update(['description' => $entry['description']]);
                }
                echo "  [EXISTE] Proyecto: {$project->name} (ID:{$project->id})\n";
            }

            // Get the max order of existing phases
            $maxOrder = $project->phases()->max('order') ?? -1;

            // Process phases
            foreach ($entry['phases'] as $phaseIdx => $phaseData) {
                $order = $maxOrder + 1 + $phaseIdx;

                $phase = $project->phases()->create([
                    'name' => $phaseData['name'],
                    'description' => $phaseData['description'] ?? null,
                    'order' => $order,
                ]);
                echo "    + Fase: {$phase->name}\n";

                // Create activities for this phase
                foreach ($phaseData['activities'] as $actData) {
                    Activity::create([
                        'phase_id' => $phase->id,
                        'project_id' => $project->id,
                        'text' => $actData['text'],
                        'description' => $actData['description'] ?? null,
                        'days' => $actData['days'] ?? 1,
                        'done' => false,
                        'progress' => 0,
                        'start_time' => $actData['start_time'] ?? null,
                        'end_time' => $actData['end_time'] ?? null,
                        'priority' => $actData['priority'] ?? 'medium',
                        'created_by' => $userId,
                    ]);
                }
                echo "      ({$this->countActivities($phaseData)} actividades)\n";
            }
        }

        echo "\n✅ Plan Operativo sembrado exitosamente.\n";
    }

    private function countActivities($phaseData)
    {
        return count($phaseData['activities']);
    }

    private function getPlanData(): array
    {
        return [
            // ═══════════════════════════════════════════════
            // 1. Gestión del Paisaje y Zonificación (EXISTE: key=gestion)
            // ═══════════════════════════════════════════════
            [
                'key' => 'gestion',
                'name' => 'Gestión del Paisaje y Zonificación',
                'description' => 'Orquestar la interdependencia de los subsistemas y asegurar la protección del campus.',
                'color' => '#6366f1',
                'icon' => 'ri-tools-line',
                'phases' => [
                    [
                        'name' => 'Fase de Instalación (Mecanización y Delimitación)',
                        'description' => 'Mecanización del terreno, marcaje GPS y preparación de infraestructura base.',
                        'activities' => [
                            [
                                'text' => 'Zonificación GPS: Marcaje con estacas de áreas de Control, Producción e Infraestructura',
                                'description' => 'Marcaje con estacas de las áreas de Control (Escudo Verde), Producción (Agrosilvopastoril) e Infraestructura (Invernadero).',
                                'days' => 2,
                                'priority' => 'critical',
                                'start_time' => '07:00',
                                'end_time' => '14:00',
                            ],
                            [
                                'text' => 'Limpieza Mecanizada: Desmonte de maleza y guardarrayas de 2m',
                                'description' => 'Uso del tractor para el desmonte de maleza y preparación de las guardarrayas de 2 metros de suelo mineral.',
                                'days' => 3,
                                'priority' => 'critical',
                                'start_time' => '06:00',
                                'end_time' => '15:00',
                            ],
                            [
                                'text' => 'Trazado de Caminos: Definición de rutas logísticas',
                                'description' => 'Definición de rutas logísticas para el movimiento de materiales y personal.',
                                'days' => 2,
                                'priority' => 'high',
                                'start_time' => '07:00',
                                'end_time' => '13:00',
                            ],
                        ],
                    ],
                    [
                        'name' => 'Fase de Operación (Mantenimiento Sistémico)',
                        'description' => 'Mantenimiento continuo del perímetro y gestión de residuos orgánicos.',
                        'activities' => [
                            [
                                'text' => 'Vigilancia de Perímetro: Rondas semanales de guardarrayas',
                                'description' => 'Rondas semanales para asegurar que las guardarrayas estén libres de vegetación seca.',
                                'days' => 1,
                                'priority' => 'high',
                            ],
                            [
                                'text' => 'Gestión de Residuos: Recolección de biomasa para compostaje',
                                'description' => 'Recolección de biomasa de la limpieza para alimentar el área de compostaje.',
                                'days' => 1,
                                'priority' => 'medium',
                            ],
                        ],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════
            // 2. Vivero de Reproducción Integral (EXISTE: key=vivero)
            // ═══════════════════════════════════════════════
            [
                'key' => 'vivero',
                'name' => 'Vivero de Reproducción Integral',
                'description' => 'Producir in-situ el 100% de la biomasa vegetal necesaria para todos los subsistemas (200 Maracuyás, 500+ árboles para Escudo Verde y forrajes de alto valor).',
                'color' => '#10b981',
                'icon' => 'ri-plant-line',
                'phases' => [
                    [
                        'name' => 'Fase de Instalación (Infraestructura de Propagación Masiva)',
                        'description' => 'Estructuras de germinación, nebulización de precisión y laboratorio de sustratos.',
                        'activities' => [
                            [
                                'text' => 'Estructuras de Germinación Avanzada: Camas elevadas con mallas térmicas',
                                'description' => 'Instalación de camas elevadas con mallas térmicas en los bordes internos del invernadero para control de patógenos del suelo.',
                                'days' => 3,
                                'priority' => 'critical',
                                'start_time' => '07:00',
                                'end_time' => '15:00',
                            ],
                            [
                                'text' => 'Sistema de Nebulización de Precisión: Micro-aspersores automatizados',
                                'description' => 'Instalación de micro-aspersores automatizados conectados a la red de riego central para mantener humedad relativa constante (80-90%).',
                                'days' => 2,
                                'priority' => 'critical',
                                'start_time' => '08:00',
                                'end_time' => '16:00',
                            ],
                            [
                                'text' => 'Laboratorio de Sustratos Orgánicos: Mezcla técnica y solarización',
                                'description' => 'Mezcla técnica de tierra local, arena de río y composta enriquecida con fermentos, sometida a solarización para eliminar malezas y hongos.',
                                'days' => 2,
                                'priority' => 'high',
                                'start_time' => '07:00',
                                'end_time' => '14:00',
                            ],
                        ],
                    ],
                    [
                        'name' => 'Fase de Operación (Escalabilidad y Producción)',
                        'description' => 'Banco de germoplasma, siembra programada, gestión de vigor y trazabilidad digital.',
                        'activities' => [
                            [
                                'text' => 'Banco de Germoplasma Local: Recolección de semillas/esquejes élite',
                                'description' => 'Recolección científica y selección de semillas/esquejes de árboles élite de la región (Amapa, Cocoite, Moringa y Leucaena) para garantizar adaptabilidad climática.',
                                'days' => 3,
                                'priority' => 'high',
                            ],
                            [
                                'text' => 'Siembra Programada en Charolas: Calendario escalonado 128 celdas',
                                'description' => 'Distribución en cavidades de 128 celdas siguiendo un calendario de siembra escalonado para talla ideal al momento del trasplante definitivo.',
                                'days' => 2,
                                'priority' => 'high',
                                'start_time' => '07:00',
                                'end_time' => '12:00',
                            ],
                            [
                                'text' => 'Gestión de Vigor Vegetativo: Inoculantes micorrícicos y bio-estimulantes',
                                'description' => 'Aplicación de inoculantes micorrícicos y bio-estimulantes foliares para acelerar el desarrollo radicular.',
                                'days' => 1,
                                'priority' => 'medium',
                            ],
                            [
                                'text' => 'Sistema de Trazabilidad: Bitácoras digitales y etiquetado por lotes',
                                'description' => 'Implementación de bitácoras digitales y etiquetado por lotes que registren origen, fecha de germinación y destino.',
                                'days' => 2,
                                'priority' => 'medium',
                            ],
                        ],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════
            // 3. Sistema de Riego Autónomo (NUEVO)
            // ═══════════════════════════════════════════════
            [
                'key' => 'riego',
                'name' => 'Sistema de Riego Autónomo',
                'description' => 'Automatizar el suministro hídrico para optimizar el recurso mediante distribución por gravedad y control inteligente.',
                'color' => '#0ea5e9',
                'icon' => 'ri-water-flash-line',
                'phases' => [
                    [
                        'name' => 'Fase de Instalación (Ingeniería de Red e Infraestructura)',
                        'description' => 'Diseño de red, obra civil hídrica, almacenamiento e interconexión estratégica.',
                        'activities' => [
                            [
                                'text' => 'Diseño de Red de Distribución: Cálculo de pendientes y diámetros',
                                'description' => 'Cálculo de pendientes y diámetros de tubería para garantizar presión constante.',
                                'days' => 2,
                                'priority' => 'critical',
                                'start_time' => '08:00',
                                'end_time' => '16:00',
                            ],
                            [
                                'text' => 'Obra Civil Hídrica: Excavación de zanjas e instalación subterránea',
                                'description' => 'Excavación de zanjas e instalación subterránea de tubería de alta presión.',
                                'days' => 4,
                                'priority' => 'critical',
                                'start_time' => '06:00',
                                'end_time' => '15:00',
                            ],
                            [
                                'text' => 'Estructuras de Almacenamiento: Tanques a nivel y elevados',
                                'description' => 'Instalación de recipientes a nivel de suelo y construcción de soportes para tanques elevados (distribución por gravedad).',
                                'days' => 3,
                                'priority' => 'high',
                                'start_time' => '07:00',
                                'end_time' => '15:00',
                            ],
                            [
                                'text' => 'Interconexión Estratégica: Tomas para bebederos avícolas',
                                'description' => 'Preparación de tomas para la futura integración con el sistema de bebederos avícolas.',
                                'days' => 1,
                                'priority' => 'medium',
                            ],
                        ],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════
            // 4. Escudo Verde (EXISTE: key=escudo)
            // ═══════════════════════════════════════════════
            [
                'key' => 'escudo',
                'name' => 'Escudo Verde',
                'description' => 'Protección civil y biológica del predio mediante cerca viva multi-estrato.',
                'color' => '#f59e0b',
                'icon' => 'ri-shield-line',
                'phases' => [
                    [
                        'name' => 'Fase de Instalación (Trasplante y Barrera)',
                        'description' => 'Ahoyado perimetral, aplicación de hidrogel y plantación escalonada desde el Vivero.',
                        'activities' => [
                            [
                                'text' => 'Ahoyado Perimetral: Excavación de hoyos 30x30x30 cm',
                                'description' => 'Excavación de hoyos de 30x30x30 cm a lo largo del perímetro.',
                                'days' => 3,
                                'priority' => 'high',
                                'start_time' => '06:00',
                                'end_time' => '13:00',
                            ],
                            [
                                'text' => 'Aplicación de Hidrogel: Polímeros retenedores en base de árboles',
                                'description' => 'Colocación de polímeros retenedores de humedad en la base de cada árbol trasplantado.',
                                'days' => 1,
                                'priority' => 'high',
                                'start_time' => '07:00',
                                'end_time' => '12:00',
                            ],
                            [
                                'text' => 'Plantación Escalonada: Agaves, Cocoite y Amapas del Vivero',
                                'description' => 'Siembra de Agaves, Cocoite y Amapas provenientes del Vivero Integral.',
                                'days' => 3,
                                'priority' => 'critical',
                                'start_time' => '06:00',
                                'end_time' => '14:00',
                            ],
                        ],
                    ],
                    [
                        'name' => 'Fase de Operación (Consolidación)',
                        'description' => 'Riego sistematizado y podas de formación para consolidar la barrera viva.',
                        'activities' => [
                            [
                                'text' => 'Riego Sistematizado: Conexión a red de goteo controlado',
                                'description' => 'Conexión a la red de riego autónoma para goteo controlado en el perímetro.',
                                'days' => 2,
                                'priority' => 'high',
                            ],
                            [
                                'text' => 'Podas de Formación: Inducción de crecimiento lateral en Cocoite',
                                'description' => 'Inducción de crecimiento lateral en el Cocoite para densificar la barrera.',
                                'days' => 1,
                                'priority' => 'medium',
                            ],
                        ],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════
            // 5. Sistema Agrosilvopastoril (NUEVO)
            // ═══════════════════════════════════════════════
            [
                'key' => 'agrosilvopastoril',
                'name' => 'Sistema Agrosilvopastoril de Alto Rendimiento',
                'description' => 'Lograr la autosuficiencia total en producción de huevo y carne (10,000 aves) bajo un modelo de cero insumos externos y mejora continua.',
                'color' => '#d97706',
                'icon' => 'ri-seedling-line',
                'phases' => [
                    [
                        'name' => 'Fase de Instalación (Infraestructura, Salud y Genética)',
                        'description' => 'Construcción de naves, laboratorio de fermentación, incubadora e IoT.',
                        'activities' => [
                            [
                                'text' => 'Construcción de Naves y Módulos de Pastoreo',
                                'description' => 'Montaje de refugios móviles y nidos estratégicos para las aves.',
                                'days' => 5,
                                'priority' => 'critical',
                                'start_time' => '06:00',
                                'end_time' => '16:00',
                            ],
                            [
                                'text' => 'Laboratorio de Fermentación (Bio-salud)',
                                'description' => 'Instalación de unidades de fermentación para producir probióticos y bio-fertilizantes.',
                                'days' => 3,
                                'priority' => 'high',
                                'start_time' => '08:00',
                                'end_time' => '15:00',
                            ],
                            [
                                'text' => 'Proyecto Incubadora: Unidad de incubación controlada',
                                'description' => 'Montaje de una unidad de incubación controlada para asegurar el ciclo de vida completo in-situ.',
                                'days' => 3,
                                'priority' => 'high',
                                'start_time' => '07:00',
                                'end_time' => '14:00',
                            ],
                            [
                                'text' => 'Red IoT Proactiva: Sensores LoRaWAN',
                                'description' => 'Sensores LoRaWAN para monitorear calidad de agua, temperatura y salud del suelo en tiempo real.',
                                'days' => 2,
                                'priority' => 'high',
                            ],
                        ],
                    ],
                    [
                        'name' => 'Fase de Operación (Ciclo de Autosuficiencia)',
                        'description' => 'Gestión nutricional de cero insumos, sanidad natural y rotación regenerativa.',
                        'activities' => [
                            [
                                'text' => 'Gestión Nutricional (Cero Insumos): Proteína de insectos y forrajes fermentados',
                                'description' => 'Producción masiva de proteína de insectos (grillo/larva) y forrajes fermentados.',
                                'days' => 3,
                                'priority' => 'critical',
                            ],
                            [
                                'text' => 'Protocolo de Sanidad Natural: Extractos fermentados y propóleo',
                                'description' => 'Uso de extractos fermentados y propóleo en los bebederos automáticos.',
                                'days' => 1,
                                'priority' => 'high',
                            ],
                            [
                                'text' => 'Rotación Regenerativa: Movimiento programado de aves',
                                'description' => 'Movimiento programado de las aves para abonado natural del suelo.',
                                'days' => 2,
                                'priority' => 'high',
                            ],
                        ],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════
            // 6. Sistema de Maracuyá (EXISTE: key=maracuya)
            // ═══════════════════════════════════════════════
            [
                'key' => 'maracuya',
                'name' => 'Sistema de Maracuyá Experto',
                'description' => 'Implementar una unidad productiva de alta eficiencia que sirva como microclima protegido para aves jóvenes y genere ingresos por fruta premium.',
                'color' => '#a855f7',
                'icon' => 'ri-leaf-line',
                'phases' => [
                    [
                        'name' => 'Establecimiento y Siembra Técnica',
                        'description' => 'Selección de semilla, siembra en sitio y tutoreo inicial hasta los 2 metros.',
                        'activities' => [
                            [
                                'text' => 'Selección de Semilla: Plantas élite del Vivero Integral',
                                'description' => 'Uso de plantas élite producidas en el Vivero Integral.',
                                'days' => 1,
                                'priority' => 'critical',
                            ],
                            [
                                'text' => 'Siembra en Sitio: Trasplante con lombricomposta (2 kg/hoyo)',
                                'description' => 'Trasplante a hoyos enriquecidos con 2 kg de lombricomposta al alcanzar los 20-30 cm de altura.',
                                'days' => 2,
                                'priority' => 'critical',
                                'start_time' => '06:00',
                                'end_time' => '12:00',
                            ],
                            [
                                'text' => 'Tutoreo Inicial: Guía vertical hasta alambre de ramada (2m)',
                                'description' => 'Guía vertical hasta el alambre de la ramada (2 metros).',
                                'days' => 2,
                                'priority' => 'high',
                            ],
                        ],
                    ],
                    [
                        'name' => 'Manejo de Podas (El secreto del Productor)',
                        'description' => 'Podas de formación, producción y renovación para maximizar rendimiento frutal.',
                        'activities' => [
                            [
                                'text' => 'Poda de Formación: Eliminación de chupones, formación en "T"',
                                'description' => 'Eliminación de chupones laterales; formación en "T" al llegar al alambre.',
                                'days' => 1,
                                'priority' => 'high',
                            ],
                            [
                                'text' => 'Poda de Producción: Cortinas a 30 cm del suelo',
                                'description' => 'Manejo de cortinas a 30 cm del suelo para facilitar el paso de las aves.',
                                'days' => 1,
                                'priority' => 'high',
                            ],
                            [
                                'text' => 'Poda de Renovación: Corte anual post-cosecha',
                                'description' => 'Corte anual post-cosecha para rejuvenecer las plantas.',
                                'days' => 1,
                                'priority' => 'medium',
                            ],
                        ],
                    ],
                ],
            ],

            // ═══════════════════════════════════════════════
            // 7. Sistema Aeropónico (EXISTE: key=aeroponia)
            // ═══════════════════════════════════════════════
            [
                'key' => 'aeroponia',
                'name' => 'Sistema Aeropónico',
                'description' => 'Producción intensiva vegetal de alta eficiencia hídrica con tecnología 4.0.',
                'color' => '#00ccff',
                'icon' => 'ri-flask-line',
                'phases' => [
                    [
                        'name' => 'Fase de Instalación (Tecnología 4.0)',
                        'description' => 'Ensamblaje de sistema aeropónico e integración con controlador ESP32.',
                        'activities' => [
                            [
                                'text' => 'Ensamblaje y Automatización: Bombas de recirculación + ESP32',
                                'description' => 'Integración de bombas de recirculación al controlador central ESP32.',
                                'days' => 3,
                                'priority' => 'critical',
                                'start_time' => '08:00',
                                'end_time' => '17:00',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
