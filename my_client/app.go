package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
)

type EventAttributes struct {
	Name        string `json:"Name,omitempty"`
	TimeStart   string `json:"TimeStart"`
	TimeEnd     string `json:"TimeEnd,omitempty"`
	DateStart   string `json:"DateStart,omitempty"`
	DateEnd     string `json:"DateEnd,omitempty"`
	Location    string `json:"Location,omitempty"`
	Regularity  string `json:"Regularity,omitempty"`
	BgColor     string `json:"BgColor"`
	LegendMark  string `json:"LegendMark"`
	Interval    string `json:"Interval,omitempty"`
	DetachOnCal string `json:"DetachOnCal,omitempty"`
}

type Event struct {
	ID              string          `json:"ID,omitempty"`
	Name            string          `json:"name"`
	EventType       string          `json:"event_type"`
	Description     string          `json:"description"`
	EventAttributes EventAttributes `json:"event_attributes"`
}

type Subtask struct {
	Id    *int   `json:"event_id"`
	Name  string `json:"name"`
	State string `json:"state"`
}

type App struct{}

// NewApp создаёт экземпляр приложения
func NewApp() *App {
	return &App{}
}

// startup вызывается при старте приложения
func (a *App) startup(ctx context.Context) {
	// можно инициализировать данные
}

func (a *App) DeleteURLData(url string) (string, error) {
	// Создаём запрос с методом DELETE
	req, err := http.NewRequest(http.MethodDelete, "http://localhost:8082/event/"+url, nil)
	if err != nil {
		return "", err
	}

	// Отправляем запрос
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Читаем ответ
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

func (a *App) DeleteST(url string) (string, error) {
	// Создаём запрос с методом DELETE
	req, err := http.NewRequest(http.MethodDelete, "http://localhost:8082/subtask/"+url, nil)
	if err != nil {
		return "", err
	}

	// Отправляем запрос
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Читаем ответ
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// GetURLData выполняет GET-запрос и возвращает тело ответа
func (a *App) GetURLData(url string) (string, error) {
	//fmt.Println("here\n")
	resp, err := http.Get("http://localhost:8082/user/" + url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	fmt.Println("> ", string(body))
	if err != nil {
		return "", err
	}

	return string(body), nil
}

func (a *App) GetSubtask(url string) (string, error) {
	//fmt.Println("here\n")
	resp, err := http.Get("http://localhost:8082/subtask/" + url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	//fmt.Println("> ", string(body))
	if err != nil {
		return "", err
	}
	//fmt.Println(string(body))
	return string(body), nil
}

func (a *App) PostURLData(event Event) {
	jsonData, err := json.Marshal(event)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}
	//fmt.Println(event)
	// Делаем POST-запрос
	resp, err := http.Post("http://localhost:8082/event", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return
	}
	defer resp.Body.Close()

	// Читаем ответ
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}

	fmt.Println("Response:", string(body))
}
func (a *App) PostSubtask(st Subtask) {
	jsonData, err := json.Marshal(st)
	fmt.Println(">>", st)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}
	// Делаем POST-запрос
	resp, err := http.Post("http://localhost:8082/subtask", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return
	}
	defer resp.Body.Close()

	// Читаем ответ
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}

	fmt.Println("Response:", string(body))
}

type UpdateField struct {
	Field  string `json:"field,omitempty"`
	NewVal string `json:"newVal,omitempty"`
}

func (a *App) UpdateEvent(Changes []UpdateField, id int) {

	jsonData, err := json.Marshal(Changes)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}
	//fmt.Println(Changes[0].field)
	// Делаем POST-запрос
	req, err := http.NewRequest(http.MethodPut, "http://localhost:8082/event/"+strconv.Itoa(id), bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("Response:", string(resp.Status))
}
func (a *App) UpdateSubtask(Changes UpdateField, id int) {
	fmt.Println("HEREE")

	jsonData, err := json.Marshal(Changes)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}
	//fmt.Println(Changes[0].field)
	// Делаем POST-запрос
	req, err := http.NewRequest(http.MethodPut, "http://localhost:8082/subtask/"+strconv.Itoa(id), bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("Response:", string(resp.Status))
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
