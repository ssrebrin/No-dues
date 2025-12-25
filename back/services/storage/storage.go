package storage

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

var (
	ErrUnknownName      = errors.New("name not found")
	ErrUnknownEventType = errors.New("event type not found")
	ErrURLExists        = errors.New("url exists")
)

type Storage struct {
	DB       *sql.DB
	StorPath string
}

func (d *Storage) Init(ctx context.Context) error {
	err := d.New(d.StorPath, ctx)
	if err != nil {
		return err
	}
	return nil
}

func (d *Storage) Ping(ctx context.Context) error {
	return d.DB.Ping()
}

func (d *Storage) Close() error {
	return nil
}

func (d *Storage) New(storagePath string, ctx context.Context) error {
	const op = "storage.sqlite.NewStorage"
	var err error

	d.DB, err = sql.Open("sqlite3", storagePath)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	if err := d.DB.Ping(); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	tables := []string{
		`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
		`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type INTEGER NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(type) REFERENCES event_types(id)
        );`,
		`CREATE TABLE IF NOT EXISTS event_attributes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            value TEXT NOT NULL,
            FOREIGN KEY(event_id) REFERENCES events(id)
        );`,
		`CREATE TABLE IF NOT EXISTS event_subtasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            state TEXT NOT NULL,
            FOREIGN KEY(event_id) REFERENCES events(id)
        );`,
	}

	for _, t := range tables {
		if err := d.MkTable(t); err != nil {
			return err
		}
	}

	fmt.Println("Database init suc")

	return nil
}

func (s *Storage) MkTable(query string) error {
	const op = "storage.sqlite.NewStorage"
	_, err := s.DB.Exec(query)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
