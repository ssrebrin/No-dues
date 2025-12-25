package storage

import (
	"context"
	"fmt"
)

func (d *Storage) AddUserEvent(
	ctx context.Context,
	name, eventType, description string,
	attributes map[string]string,
) error {
	tx, err := d.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Создаём пользователя
	var userID int64

	//correct later
	_, err = tx.ExecContext(ctx,
		`INSERT OR IGNORE INTO users (name) VALUES (?)`,
		name,
	)
	if err != nil {
		return fmt.Errorf("add event: %w", err)
	}

	err = tx.QueryRowContext(ctx,
		`SELECT id FROM users WHERE name = ?`,
		name,
	).Scan(&userID)
	if err != nil {
		return fmt.Errorf("get user id: %w", err)
	}

	// 3. Создаём событие

	res, err := tx.ExecContext(ctx,
		`INSERT INTO events (user_id, type, description) VALUES (?, ?, ?)`,
		userID, eventType, description,
	)
	if err != nil {
		return fmt.Errorf("add event: %w", err)
	}
	eventID, err := res.LastInsertId()
	if err != nil {
		return err
	}

	// 4. Создаём атрибуты
	for k, v := range attributes {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO event_attributes (event_id, name, value) VALUES (?, ?, ?)`,
			eventID, k, v,
		)
		if err != nil {
			return fmt.Errorf("add attribute %s: %w", k, err)
		}
	}

	return tx.Commit()
}

func (d *Storage) AddSubTask(
	ctx context.Context,
	event_id int,
	name string,
) error {
	tx, err := d.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		`INSERT INTO event_subtasks (event_id, name, state) VALUES (?, ?, ?)`,
		event_id, name, 0,
	)
	if err != nil {
		return fmt.Errorf("add event: %w", err)
	}

	return tx.Commit()
}
