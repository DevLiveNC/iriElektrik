-- Eski dağıtımlarda kalan örnek onarım kayıtlarını public veri kaynağından çıkarır.
-- Gerçek kayıtlar korunur; public sorgular ayrıca is_example alanını da filtreler.
DELETE FROM jobs WHERE is_example = true;
