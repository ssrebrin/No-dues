package storage

import (
	"fmt"
	"strconv"
)

func (s *Storage) DeleteEvent(id string) error {
	const op = "storage.sqlite.DeleteEvent"
	i, err := strconv.Atoi(id)
	if err != nil {
		return fmt.Errorf("%s: decoding id: %w", op, err)
	}

	// Сначала удаляем атрибуты события
	stmtAttr, err := s.DB.Prepare("DELETE FROM event_attributes WHERE event_id = ?")
	if err != nil {
		return fmt.Errorf("%s: prepare statement (attributes): %w", op, err)
	}
	defer stmtAttr.Close()

	_, err = stmtAttr.Exec(i)
	if err != nil {
		return fmt.Errorf("%s: execute statement (attributes): %w", op, err)
	}

	// Сначала удаляем атрибуты события
	stmtST, err := s.DB.Prepare("DELETE FROM event_subtasks WHERE event_id = ?")
	if err != nil {
		return fmt.Errorf("%s: prepare statement (attributes): %w", op, err)
	}
	defer stmtST.Close()

	_, err = stmtST.Exec(i)
	if err != nil {
		return fmt.Errorf("%s: execute statement (attributes): %w", op, err)
	}

	// Теперь удаляем само событие
	stmtEvent, err := s.DB.Prepare("DELETE FROM events WHERE id = ?")
	if err != nil {
		return fmt.Errorf("%s: prepare statement (event): %w", op, err)
	}
	defer stmtEvent.Close()

	result, err := stmtEvent.Exec(i)
	if err != nil {
		return fmt.Errorf("%s: execute statement (event): %w", op, err)
	}

	// Проверим, действительно ли что-то удалилось
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("%s: getting rows affected: %w", op, err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("%s: event with id %d not found", op, id)
	}

	return nil

}

func (s *Storage) DeleteST(id string) error {
	const op = "storage.sqlite.DeleteST"
	i, err := strconv.Atoi(id)
	if err != nil {
		return fmt.Errorf("%s: decoding id: %w", op, err)
	}

	// Теперь удаляем само событие
	stmtEvent, err := s.DB.Prepare("DELETE FROM event_subtasks WHERE id = ?")
	if err != nil {
		return fmt.Errorf("%s: prepare statement (event): %w", op, err)
	}
	defer stmtEvent.Close()

	result, err := stmtEvent.Exec(i)
	if err != nil {
		return fmt.Errorf("%s: execute statement (event): %w", op, err)
	}

	// Проверим, действительно ли что-то удалилось
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("%s: getting rows affected: %w", op, err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("%s: event with id %d not found", op, id)
	}

	return nil

}
