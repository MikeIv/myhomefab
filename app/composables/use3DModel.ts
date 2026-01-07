import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface Use3DModelOptions {
  modelPath?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  enableControls?: boolean;
}

export function use3DModel(
  canvas: Ref<HTMLCanvasElement | null>,
  options: Use3DModelOptions = {},
) {
  const {
    modelPath,
    autoRotate = false,
    rotationSpeed = 0.01,
    enableControls = true,
  } = options;

  // Используем shallowRef для объектов Three.js, чтобы избежать проблем с реактивностью
  const scene = shallowRef<THREE.Scene | null>(null);
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null);
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null);
  const controls = shallowRef<OrbitControls | null>(null);
  const model = shallowRef<THREE.Group | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  let animationId: number | null = null;

  const initScene = () => {
    if (!canvas.value) return;

    // Получаем размеры canvas, используем дефолтные если размеры еще не определены
    const width = canvas.value.clientWidth || 800;
    const height = canvas.value.clientHeight || 600;
    const aspect = width / height || 1;

    // Создание сцены
    const newScene = new THREE.Scene();
    newScene.background = null; // Прозрачный фон, чтобы использовать CSS градиент

    // Камера
    const newCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    newCamera.position.set(0, 0, 5);

    // Рендерер
    const newRenderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
      alpha: true,
    });
    newRenderer.setSize(width, height);
    newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    newScene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    newScene.add(directionalLight2);

    // Орбитальные контролы
    let newControls: OrbitControls | null = null;
    if (enableControls) {
      newControls = new OrbitControls(newCamera, canvas.value);
      newControls.enableDamping = true;
      newControls.dampingFactor = 0.05;
      newControls.minDistance = 2;
      newControls.maxDistance = 10;
    }

    scene.value = newScene;
    camera.value = newCamera;
    renderer.value = newRenderer;
    controls.value = newControls;

    // Обработка изменения размера окна
    const handleResize = () => {
      if (!canvas.value || !camera.value || !renderer.value) return;

      const width = canvas.value.clientWidth || 800;
      const height = canvas.value.clientHeight || 600;
      const aspect = width / height || 1;

      camera.value.aspect = aspect;
      camera.value.updateProjectionMatrix();
      renderer.value.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Анимационный цикл
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (controls.value) {
        controls.value.update();
      }

      if (model.value && autoRotate) {
        // Вращение по оси Y (вертикальное вращение вазы, как на поворотном столе)
        model.value.rotation.y += rotationSpeed;
      }

      if (renderer.value && scene.value && camera.value) {
        renderer.value.render(scene.value, camera.value);
      }
    };

    animate();

    // Загрузка модели если путь указан
    // Используем requestAnimationFrame для загрузки после первого рендера
    if (modelPath) {
      requestAnimationFrame(() => {
        loadModel(modelPath);
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  };

  const loadModel = async (path: string) => {
    if (!scene.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      console.log("Загрузка модели:", path);
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(path);

      console.log("Модель загружена:", gltf);

      // Удаляем предыдущую модель если есть
      if (model.value) {
        scene.value.remove(model.value);
        model.value.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      model.value = gltf.scene;

      // Проверка и исправление материалов для моделей, конвертированных из 3MF
      // Некоторые конвертеры создают модели без материалов или с невидимыми материалами
      let meshCount = 0;
      model.value.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshCount++;
          
          // Если у меша нет материала или материал невидим, создаем стандартный материал
          if (!child.material || child.material.length === 0) {
            console.log("Найден меш без материала, создаем стандартный материал");
            child.material = new THREE.MeshStandardMaterial({
              color: 0x808080,
              roughness: 0.7,
              metalness: 0.1,
            });
          } else if (Array.isArray(child.material)) {
            // Обработка массива материалов
            child.material = child.material.map((mat) => {
              if (!mat || mat.visible === false) {
                return new THREE.MeshStandardMaterial({
                  color: 0x808080,
                  roughness: 0.7,
                  metalness: 0.1,
                });
              }
              return mat;
            });
          } else {
            // Одиночный материал
            if (child.material.visible === false) {
              child.material.visible = true;
            }
            // Если материал не имеет цвета или слишком темный, добавляем цвет
            if (!child.material.color || child.material.color.getHex() === 0x000000) {
              child.material.color = new THREE.Color(0x808080);
            }
          }
        }
      });

      console.log(`Найдено мешей: ${meshCount}`);

      // Центрирование и масштабирование модели
      const box = new THREE.Box3().setFromObject(model.value);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      console.log("Размер модели:", size);
      console.log("Центр модели:", center);

      // Проверка на пустую модель
      if (size.x === 0 && size.y === 0 && size.z === 0) {
        console.warn("Модель имеет нулевой размер!");
        error.value = "Модель не содержит геометрии или имеет нулевой размер";
        return;
      }

      // Центрируем модель: перемещаем так, чтобы центр bounding box был в начале координат
      model.value.position.set(-center.x, -center.y, -center.z);

      // Масштабируем модель
      const maxSize = Math.max(size.x, size.y, size.z);
      if (maxSize > 0) {
        const targetSize = 100;
        const scale = targetSize / maxSize;
        model.value.scale.setScalar(scale);
        console.log("✅ Масштаб модели:", scale.toFixed(4), "Исходный размер:", maxSize.toFixed(2));
        console.log("🎯 Целевой размер модели:", targetSize);
      }

      scene.value.add(model.value);

      // Настраиваем камеру для просмотра модели
      if (camera.value) {
        // Обновляем матрицу мира для корректного расчета финального bounding box
        model.value.updateMatrixWorld(true);
        const finalBox = new THREE.Box3().setFromObject(model.value);
        const finalSize = finalBox.getSize(new THREE.Vector3());
        const finalCenter = finalBox.getCenter(new THREE.Vector3());
        const finalMaxDimension = Math.max(finalSize.x, finalSize.y, finalSize.z);
        
        console.log("🔍 Финальные параметры модели:");
        console.log("  📏 Размер:", {
          x: finalSize.x.toFixed(2),
          y: finalSize.y.toFixed(2),
          z: finalSize.z.toFixed(2),
          max: finalMaxDimension.toFixed(2)
        });
        console.log("  📍 Центр:", {
          x: finalCenter.x.toFixed(4),
          y: finalCenter.y.toFixed(4),
          z: finalCenter.z.toFixed(4)
        });
        console.log("  🎭 Позиция модели:", {
          x: model.value.position.x.toFixed(4),
          y: model.value.position.y.toFixed(4),
          z: model.value.position.z.toFixed(4)
        });
        console.log("  🔧 Rotation:", {
          x: (model.value.rotation.x * 180 / Math.PI).toFixed(2) + "°",
          y: (model.value.rotation.y * 180 / Math.PI).toFixed(2) + "°",
          z: (model.value.rotation.z * 180 / Math.PI).toFixed(2) + "°"
        });
        console.log("  📐 Scale:", model.value.scale.x.toFixed(4));
        
        // Вычисляем расстояние для камеры
        // Камера должна быть на расстоянии 1.5-2 размера модели для хорошего обзора
        const distance = Math.max(finalMaxDimension * 1.5, 5);
        
        // Размещаем камеру под углом для лучшего обзора
        camera.value.position.set(distance * 0.6, distance * 0.5, distance * 0.8);
        // Смотрим на центр модели (после центрирования должен быть близок к 0,0,0)
        camera.value.lookAt(finalCenter.x, finalCenter.y, finalCenter.z);
        camera.value.updateProjectionMatrix();
        
        console.log("📷 Камера:");
        console.log("  Позиция:", {
          x: camera.value.position.x.toFixed(2),
          y: camera.value.position.y.toFixed(2),
          z: camera.value.position.z.toFixed(2)
        });
        console.log("  Смотрит на центр модели:", {
          x: finalCenter.x.toFixed(4),
          y: finalCenter.y.toFixed(4),
          z: finalCenter.z.toFixed(4)
        });
        console.log("  Расстояние от центра:", distance.toFixed(2));
        console.log("  FOV:", camera.value.fov + "°");
        console.log("  Aspect:", camera.value.aspect.toFixed(2));

        // Обновляем контролы если они есть
        // Центр вращения в центре модели
        if (controls.value) {
          controls.value.target.set(finalCenter.x, finalCenter.y, finalCenter.z);
          controls.value.minDistance = Math.max(finalMaxDimension * 0.5, 2);
          controls.value.maxDistance = finalMaxDimension * 5;
          controls.value.update();
          
          console.log("🎮 Контролы:");
          console.log("  Target (центр модели):", {
            x: finalCenter.x.toFixed(4),
            y: finalCenter.y.toFixed(4),
            z: finalCenter.z.toFixed(4)
          });
          console.log("  minDistance:", Math.max(finalMaxDimension * 0.5, 2).toFixed(2));
          console.log("  maxDistance:", (finalMaxDimension * 5).toFixed(2));
        }
      }

      // Принудительно вызываем рендер после добавления модели
      if (renderer.value && scene.value && camera.value) {
        renderer.value.render(scene.value, camera.value);
      }

      console.log("Модель успешно добавлена в сцену");
    } catch (err) {
      // Улучшенная обработка ошибок
      console.error("Ошибка загрузки модели:", err);
      let errorMessage = "Ошибка загрузки модели";

      if (err instanceof Error) {
        const message = err.message;

        // Проверка на типичную ошибку парсинга HTML как JSON (когда файл не найден)
        if (
          message.includes("<!DOCTYPE") ||
          message.includes("is not valid JSON")
        ) {
          errorMessage = `Файл модели не найден: ${path}`;
        } else if (message.includes("404") || message.includes("Not Found")) {
          errorMessage = `Файл модели не найден: ${path}`;
        } else if (
          message.includes("Failed to fetch") ||
          message.includes("NetworkError")
        ) {
          errorMessage =
            "Не удалось загрузить модель. Проверьте подключение к интернету.";
        } else {
          errorMessage = `Ошибка загрузки модели: ${message}`;
        }
      }

      error.value = errorMessage;
    } finally {
      isLoading.value = false;
    }
  };

  const cleanup = () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (model.value && scene.value) {
      model.value.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      scene.value.remove(model.value);
    }


    controls.value?.dispose();
    renderer.value?.dispose();

    scene.value = null;
    camera.value = null;
    renderer.value = null;
    controls.value = null;
    model.value = null;
  };

  watch(
    () => canvas.value,
    (newCanvas) => {
      if (newCanvas) {
        initScene();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cleanup();
  });

  return {
    scene,
    camera,
    renderer,
    controls,
    model,
    isLoading,
    error,
    loadModel,
    cleanup,
  };
}
