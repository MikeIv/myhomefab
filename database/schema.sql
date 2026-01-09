-- Создание таблицы для хранения метаданных изображений
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL COMMENT 'Уникальное имя файла на сервере',
  original_filename VARCHAR(255) NOT NULL COMMENT 'Оригинальное имя файла при загрузке',
  file_path VARCHAR(500) NOT NULL COMMENT 'Путь к файлу относительно public/',
  mime_type VARCHAR(100) NOT NULL COMMENT 'MIME тип файла',
  file_size INT NOT NULL COMMENT 'Размер файла в байтах',
  width INT NULL COMMENT 'Ширина изображения в пикселях',
  height INT NULL COMMENT 'Высота изображения в пикселях',
  alt_text VARCHAR(255) NULL COMMENT 'Альтернативный текст для изображения',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания записи',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата последнего обновления',
  INDEX idx_filename (filename),
  INDEX idx_created_at (created_at),
  INDEX idx_mime_type (mime_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица для хранения метаданных загруженных изображений';

