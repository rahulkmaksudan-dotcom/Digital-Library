-- Keep generated IDs above the explicit IDs used by the seed migrations.
-- This is Postgres-only because H2 uses a separate migration location.

SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);
SELECT setval(pg_get_serial_sequence('authors', 'id'), COALESCE((SELECT MAX(id) FROM authors), 1), true);
SELECT setval(pg_get_serial_sequence('books', 'id'), COALESCE((SELECT MAX(id) FROM books), 1), true);
SELECT setval(pg_get_serial_sequence('loans', 'id'), COALESCE((SELECT MAX(id) FROM loans), 1), true);
SELECT setval(pg_get_serial_sequence('fines', 'id'), COALESCE((SELECT MAX(id) FROM fines), 1), true);
SELECT setval(pg_get_serial_sequence('reservations', 'id'), COALESCE((SELECT MAX(id) FROM reservations), 1), true);
SELECT setval(pg_get_serial_sequence('favorites', 'id'), COALESCE((SELECT MAX(id) FROM favorites), 1), true);
SELECT setval(pg_get_serial_sequence('book_requests', 'id'), COALESCE((SELECT MAX(id) FROM book_requests), 1), true);
SELECT setval(pg_get_serial_sequence('digital_resources', 'id'), COALESCE((SELECT MAX(id) FROM digital_resources), 1), true);
SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE((SELECT MAX(id) FROM notifications), 1), true);
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), COALESCE((SELECT MAX(id) FROM audit_logs), 1), true);
SELECT setval(pg_get_serial_sequence('library_settings', 'id'), COALESCE((SELECT MAX(id) FROM library_settings), 1), true);