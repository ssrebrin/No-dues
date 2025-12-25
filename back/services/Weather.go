package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type Weather struct {
	Geo GeoIP
	lat float64
	lon float64
}

type GeoIP struct {
	IP       string `json:"ip"`
	City     string `json:"city"`
	Region   string `json:"region"`
	Country  string `json:"country"`
	Loc      string `json:"loc"`
	Postal   string `json:"postal"`
	Timezone string `json:"timezone"`
}

func (w *Weather) Init(ctx context.Context) error {
	w.GetLocation()
	return nil
}

func (w *Weather) Ping(ctx context.Context) error {
	w.GetLocation()
	return nil
}
func (w *Weather) Close() error {
	return nil
}

func (w *Weather) GetLocation() error {
	resp, err := http.Get("https://ipinfo.io/json")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&w.Geo); err != nil {
		return err
	}

	locParts := strings.Split(w.Geo.Loc, ",")
	if len(locParts) != 2 {
		// Обработка ошибки: неверный формат строки
		fmt.Println("Ошибка: неверный формат координат")
		return nil
	}

	lat, err1 := strconv.ParseFloat(locParts[0], 64)
	if err1 != nil {
		// Обработка ошибки конвертации
		return err
	}
	lon, err := strconv.ParseFloat(locParts[1], 64)
	if err != nil {
		// Обработка ошибки конвертации
		return err
	}

	w.lat = lat
	w.lon = lon

	return nil
}
