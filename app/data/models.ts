import type { Model } from "~/types/model";

export const models: Model[] = [
  {
    id: "1",
    title: "Декоративная ваза",
    description:
      "Элегантная декоративная ваза с уникальным геометрическим узором. Идеально подходит для интерьера в современном стиле. Модель оптимизирована для печати без поддержек.",
    shortDescription: "Элегантная декоративная ваза с геометрическим узором",
    technicalSpecs: {
      dimensions: {
        width: 120,
        height: 180,
        depth: 120,
        unit: "mm",
      },
      volume: 450,
      weight: 35,
      material: "PLA",
      layerHeight: 0.2,
      infill: 15,
      printTime: "4ч 30мин",
    },
    printInfo: {
      printerModel: "Ender 3",
      filamentType: "PLA",
      filamentColor: "Белый",
      supports: false,
      notes:
        "Печать без поддержек. Рекомендуется использовать brim для лучшей адгезии.",
    },
    images: ["/models/vase/vase-1.jpg", "/models/vase/vase-2.jpg"],
    previewImage: "/models/vase/preview.jpg",
    modelPath: "/models/vase/model.glb",
    modelFormat: "glb",
    tags: ["декор", "интерьер", "ваза"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Органайзер для канцелярии",
    description:
      "Удобный органайзер для рабочего стола с отделениями для ручек, карандашей и мелких предметов. Компактный дизайн с минималистичным внешним видом.",
    shortDescription: "Компактный органайзер для рабочего стола",
    technicalSpecs: {
      dimensions: {
        width: 200,
        height: 80,
        depth: 150,
        unit: "mm",
      },
      volume: 320,
      weight: 28,
      material: "PLA",
      layerHeight: 0.2,
      infill: 20,
      printTime: "3ч 15мин",
    },
    printInfo: {
      printerModel: "Prusa i3",
      filamentType: "PLA",
      filamentColor: "Серый",
      supports: false,
    },
    images: ["/models/organizer/organizer-1.jpg"],
    previewImage: "/models/organizer/preview.jpg",
    modelPath: "/models/organizer/model.glb",
    modelFormat: "glb",
    tags: ["органайзер", "рабочий стол", "канцелярия"],
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Корпус для электроники",
    description:
      "Защитный корпус для небольших электронных проектов. Имеет отверстия для вентиляции и удобное размещение плат. Подходит для Arduino и Raspberry Pi.",
    shortDescription: "Защитный корпус для электронных проектов",
    technicalSpecs: {
      dimensions: {
        width: 100,
        height: 60,
        depth: 80,
        unit: "mm",
      },
      volume: 180,
      weight: 15,
      material: "PETG",
      layerHeight: 0.15,
      infill: 25,
      printTime: "2ч 45мин",
    },
    printInfo: {
      printerModel: "Anycubic",
      filamentType: "PETG",
      filamentColor: "Черный",
      supports: true,
      notes:
        "Требуется поддержка для внутренних элементов. Используйте тонкие поддержки.",
    },
    images: ["/models/enclosure/enclosure-1.jpg"],
    previewImage: "/models/enclosure/preview.jpg",
    modelPath: "/models/enclosure/model.glb",
    modelFormat: "glb",
    tags: ["электроника", "корпус", "Arduino"],
    createdAt: "2024-02-01",
  },
];
