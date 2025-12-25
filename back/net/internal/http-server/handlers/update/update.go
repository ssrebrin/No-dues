package update

import (
	"context"
	"errors"
	"io"
	"log/slog"
	resp "my_app/net/internal/lib/api/response"
	"my_app/net/internal/lib/logger/sl"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
	"github.com/go-playground/validator"
)

type Response struct {
	resp.Response
}

type UpdatePair struct {
	Field  string `json:"field" validate:"required"`
	NewVal string `json:"newVal" validate:"required"`
}

type SubtasksSaver interface {
	UpdatEvent(
		id int,
		field string,
		newVal string,
		ctx context.Context,
	) error
	SubtasksUpdater(
		id int,
		field string,
		newVal string,
		ctx context.Context,
	) error
}

func UpdateEventHandler(log *slog.Logger, eventSaver SubtasksSaver, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.updateEvent"

		log = log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		// ID события из URL
		idStr := chi.URLParam(r, "id")
		eventID, err := strconv.Atoi(idStr)
		if err != nil {
			log.Error("invalid event id", sl.Err(err))
			render.JSON(w, r, resp.Error("invalid event id"))
			return
		}

		// Декодируем массив пар
		var updates UpdatePair
		if err := render.DecodeJSON(r.Body, &updates); err != nil {
			if errors.Is(err, io.EOF) {
				log.Error("request body is empty")
				render.JSON(w, r, resp.Error("empty request"))
				return
			}
			log.Error("failed to decode request body", sl.Err(err))
			render.JSON(w, r, resp.Error("failed to decode request"))
			return
		}

		log.Info("request body decoded", slog.Any("updates", updates))

		// Валидация входных данных
		if err := validator.New().Struct(updates); err != nil {
			log.Error("invalid request", sl.Err(err))
			render.JSON(w, r, resp.Error(err.Error()))
			return
		}

		cctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		// Обрабатываем каждую пару

		if err := eventSaver.SubtasksUpdater(eventID, updates.Field, updates.NewVal, cctx); err != nil {
			log.Error("failed to update event", sl.Err(err))
			render.JSON(w, r, resp.Error("failed to update event"))
			return
		}

		log.Info("update successful")
		render.JSON(w, r, Response{Response: resp.OK()})
	}
}

func UpdateSubtaskHandler(log *slog.Logger, eventSaver SubtasksSaver, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.updateEvent"

		log = log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		// ID события из URL
		idStr := chi.URLParam(r, "id")
		eventID, err := strconv.Atoi(idStr)
		if err != nil {
			log.Error("invalid event id", sl.Err(err))
			render.JSON(w, r, resp.Error("invalid event id"))
			return
		}

		// Декодируем массив пар
		var updates UpdatePair
		if err := render.DecodeJSON(r.Body, &updates); err != nil {
			if errors.Is(err, io.EOF) {
				log.Error("request body is empty")
				render.JSON(w, r, resp.Error("empty request"))
				return
			}
			log.Error("failed to decode request body", sl.Err(err))
			render.JSON(w, r, resp.Error("failed to decode request"))
			return
		}

		log.Info("request body decoded", slog.Any("updates", updates))

		// Валидация входных данных
		if err := validator.New().Struct(updates); err != nil {
			log.Error("invalid request", sl.Err(err))
			render.JSON(w, r, resp.Error(err.Error()))
			return
		}

		cctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		// Обрабатываем каждую пару
		if err := eventSaver.UpdatEvent(eventID, updates.Field, updates.NewVal, cctx); err != nil {
			log.Error("failed to update event", sl.Err(err))
			render.JSON(w, r, resp.Error("failed to update event"))
			return
		}

		log.Info("update successful")
		render.JSON(w, r, Response{Response: resp.OK()})
	}
}
