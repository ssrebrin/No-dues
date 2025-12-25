package storage

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
)

type Event struct {
	ID          int
	Type        string
	Subtasks    map[int]string
	Description string
	Attributes  map[string]string
}

func (s *Storage) GetSubTasks(id int) (string, error) {
	const op = "storage.sqlite.GetSubTasks"

	fmt.Println(">>", id)
	rows, err := s.DB.Query("SELECT id, name, state FROM event_subtasks WHERE event_id = ?", id)
	if err != nil {
		return "None", fmt.Errorf("%s: query: %w", op, err)
	}
	defer rows.Close()

	type Subtask struct {
		Id    string `json:"id"`
		Name  string `json:"name"`
		State string `json:"state"`
	}

	subtasks := []Subtask{}

	for rows.Next() {
		var st Subtask
		if err := rows.Scan(&st.Id, &st.Name, &st.State); err != nil {
			return "None", fmt.Errorf("%s: scan: %w", op, err)
		}
		subtasks = append(subtasks, st)
	}

	if err := rows.Err(); err != nil {
		return "None", fmt.Errorf("%s: rows iteration: %w", op, err)
	}

	if len(subtasks) == 0 {
		//fmt.Println("HEREEEE") // теперь это сработает, если записей нет
		return "None", nil
	}

	jsonData, err := json.Marshal(subtasks)
	if err != nil {
		return "None", fmt.Errorf("%s: marshal: %w", op, err)
	}

	return string(jsonData), nil
}

func (s *Storage) GetUserId(alias string) (string, error) {
	const op = "storage.sqlite.GetURL"

	stmt, err := s.DB.Prepare("SELECT id FROM users WHERE name = ?")
	if err != nil {
		return "", fmt.Errorf("%s: prepare statement: %w", op, err)
	}

	var resURL string

	err = stmt.QueryRow(alias).Scan(&resURL)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrUnknownName
		}

		return "", fmt.Errorf("%s: execute statement: %w", op, err)
	}

	return resURL, nil
}

func (s *Storage) GetUserEvents(userId string) (string, error) {
	const op = "storage.sqlite.GetUserEvent"
	fmt.Println("hereeeeeeeeeee")

	rows, err := s.DB.Query(`
        SELECT e.id, e.type as type_name, e.description, a.name, a.value
        FROM events e
        LEFT JOIN event_attributes a ON e.id = a.event_id
        WHERE e.user_id = ?
        ORDER BY e.id;
    `, userId)
	if err != nil {
		return "", fmt.Errorf("%s: query: %w", op, err)
	}
	defer rows.Close()

	eventsMap := make(map[int]*Event)

	for rows.Next() {
		var (
			id          int
			typeName    sql.NullString
			description sql.NullString
			attrName    sql.NullString
			attrValue   sql.NullString
		)

		if err := rows.Scan(&id, &typeName, &description, &attrName, &attrValue); err != nil {
			return "", fmt.Errorf("%s: scan: %w", op, err)
		}

		ev, ok := eventsMap[id]
		if !ok {
			ev = &Event{
				ID:          id,
				Type:        typeName.String,
				Description: description.String,
				Attributes:  make(map[string]string),
			}
			eventsMap[id] = ev
		}

		// добавляем атрибут если есть
		if attrName.Valid && attrValue.Valid {
			ev.Attributes[attrName.String] = attrValue.String
		}
	}

	if err := rows.Err(); err != nil {
		return "", fmt.Errorf("%s: rows iteration: %w", op, err)
	}

	// если ничего не нашли
	if len(eventsMap) == 0 {
		return "", errors.New("no events found")
	}

	events := make([]Event, 0, len(eventsMap))
	for _, ev := range eventsMap {
		events = append(events, *ev)
	}

	// Кодируем в JSON
	jsonData, err := json.Marshal(events)
	if err != nil {
		return "", fmt.Errorf("%s: marshal: %w", op, err)
	}

	return string(jsonData), nil
}
