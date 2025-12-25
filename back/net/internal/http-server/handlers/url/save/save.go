package save

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	resp "my_app/net/internal/lib/api/response"
	"my_app/net/internal/lib/logger/sl"
	"net/http"
	"time"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
	"github.com/go-playground/validator"
)

type Request struct {
	Name            string            `json:"name"`
	EventType       string            `json:"event_type" validate:"required"`
	Description     string            `json:"description"`
	EventAttributes map[string]string `json:"event_attributes" validate:"required"`
}

type RequestSt struct {
	Name     string `json:"name" validate:"required"`
	Event_id int    `json:"event_id" validate:"required"`
}

type Response struct {
	resp.Response
}

type SubtasksSaver interface {
	AddSubTask(
		ctx context.Context,
		event_id int,
		name string,
	) error
}

type EventSaver interface {
	AddUserEvent(
		ctx context.Context,
		name, eventType, description string,
		attributes map[string]string,
	) error
}

func New(log *slog.Logger, eventSaver EventSaver, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.save.New"

		// Добавляем к текущму объекту логгера поля op и request_id
		// Они могут очень упростить нам жизнь в будущем
		log = log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)
		//fmt.Println("YEEEEEY")

		// Создаем объект запроса и анмаршаллим в него запрос
		var req Request

		err := render.DecodeJSON(r.Body, &req)
		if errors.Is(err, io.EOF) {
			// Такую ошибку встретим, если получили запрос с пустым телом
			// Обработаем её отдельно
			log.Error("request body is empty")

			render.JSON(w, r, resp.Response{
				Status: resp.StatusError,
				Error:  "empty request",
			})

			return
		}
		if err != nil {
			log.Error("failed to decode request body", sl.Err(err))

			render.JSON(w, r, resp.Response{
				Status: resp.StatusError,
				Error:  "failed to decode request",
			})

			return
		}

		// Лучше больше логов, чем меньше - лишнее мы легко сможем почистить,
		// при необходимости. А вот недостающую информацию мы уже не получим.
		log.Info("request body decoded", slog.Any("req", req))

		if err := validator.New().Struct(req); err != nil {
			// Приводим ошибку к типу ошибки валидации
			validateErr := err.(validator.ValidationErrors)

			log.Error("invalid request", sl.Err(err))

			render.JSON(w, r, resp.Error(validateErr.Error()))

			return
		}

		fmt.Println(">>>>Body:", r.Method)

		ctxx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()
		if err = eventSaver.AddUserEvent(ctxx, req.Name, req.EventType, req.Description, req.EventAttributes); err != nil {
			log.Error("failed to add", sl.Err(err))
			render.JSON(w, r, resp.Error("adding to db error"))
			return
		}

		log.Info("event added")

		render.JSON(w, r, Response{
			Response: resp.OK(),
		})
	}
}

func New1(log *slog.Logger, eventSaver SubtasksSaver, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.save.New1"

		// Добавляем к текущму объекту логгера поля op и request_id
		// Они могут очень упростить нам жизнь в будущем
		log = log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)
		//fmt.Println("YEEEEEY")

		// Создаем объект запроса и анмаршаллим в него запрос
		var req RequestSt

		err := render.DecodeJSON(r.Body, &req)
		if errors.Is(err, io.EOF) {
			// Такую ошибку встретим, если получили запрос с пустым телом
			// Обработаем её отдельно
			log.Error("request body is empty")

			render.JSON(w, r, resp.Response{
				Status: resp.StatusError,
				Error:  "empty request",
			})

			return
		}
		if err != nil {
			log.Error("failed to decode request body", sl.Err(err))

			render.JSON(w, r, resp.Response{
				Status: resp.StatusError,
				Error:  "failed to decode request",
			})

			return
		}

		// Лучше больше логов, чем меньше - лишнее мы легко сможем почистить,
		// при необходимости. А вот недостающую информацию мы уже не получим.
		log.Info("request body decoded", slog.Any("req", req))

		if err := validator.New().Struct(req); err != nil {
			// Приводим ошибку к типу ошибки валидации
			validateErr := err.(validator.ValidationErrors)

			log.Error("invalid request", sl.Err(err))

			render.JSON(w, r, resp.Error(validateErr.Error()))

			return
		}
		fmt.Println(">>", req)

		ctxx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()
		if err = eventSaver.AddSubTask(ctxx, req.Event_id, req.Name); err != nil {
			log.Error("failed to add", sl.Err(err))
			render.JSON(w, r, resp.Error("adding to db error"))
			return
		}

		log.Info("event added")

		render.JSON(w, r, Response{
			Response: resp.OK(),
		})
	}
}
