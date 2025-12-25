package storage

import (
	"context"
	"fmt"
)

func (s *Storage) UpdatEvent(
	id int,
	field string,
	newVal string,
	ctx context.Context,
) error {

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	switch field {
	case "description":
		_, err = tx.ExecContext(ctx,
			"UPDATE events SET description = ? WHERE id = ?",
			newVal, id,
		)
		if err != nil {
			return fmt.Errorf("add event: %w", err)
		}
		break
	default:
		_, err = tx.ExecContext(ctx,
			"UPDATE event_attributes SET value = ? WHERE event_id = ? AND name = ?",
			newVal, id, field,
		)
		fmt.Println(">>", newVal, field)
		if err != nil {
			return fmt.Errorf("add event: %w", err)
		}
	}

	return tx.Commit()

}

func (s *Storage) SubtasksUpdater(
	id int,
	field string,
	newVal string,
	ctx context.Context,
) error {

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	fmt.Println(">>>", field, newVal)

	switch field {
	case "state":
		_, err = tx.ExecContext(ctx,
			"UPDATE event_subtasks SET state = ? WHERE id = ?",
			newVal, id,
		)
		if err != nil {
			return fmt.Errorf("add event: %w", err)
		}
		break
	case "name":
		_, err = tx.ExecContext(ctx,
			"UPDATE event_subtasks SET name = ? WHERE id = ?",
			newVal, id,
		)
		if err != nil {
			return fmt.Errorf("add event: %w", err)
		}
		break
	default:
	}

	return tx.Commit()
}
