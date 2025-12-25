package delete

import (
	"errors"
	"net/http"

	"log/slog"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"

	resp "my_app/net/internal/lib/api/response"
	"my_app/net/internal/lib/logger/sl"
	"my_app/services/storage"
)

type EventIdDeleter interface {
	DeleteEvent(id string) error
	DeleteST(id string) error
}

func New(log *slog.Logger, eventIdDeleter EventIdDeleter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.delete.New"
		log := log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		alias := chi.URLParam(r, "id")
		//fmt.Println(">> ", r.URL.Path, " - ", alias)
		if alias == "" {
			log.Info("id is empty")

			render.JSON(w, r, resp.Error("invalid request"))

			return
		}

		err := eventIdDeleter.DeleteEvent(alias)
		if errors.Is(err, storage.ErrUnknownEventType) {
			log.Info("id not found", "name", alias)

			render.JSON(w, r, resp.Error("not found"))

			return
		}
		if err != nil {
			log.Error("failed to get evnts", sl.Err(err))

			render.JSON(w, r, resp.Error("internal error"))

			return
		}

		log.Info("delete events", slog.String("events", alias))
	}
}

func New1(log *slog.Logger, eventIdDeleter EventIdDeleter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.delete.New"
		log := log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		alias := chi.URLParam(r, "id")
		//fmt.Println(">> ", r.URL.Path, " - ", alias)
		if alias == "" {
			log.Info("id is empty")

			render.JSON(w, r, resp.Error("invalid request"))

			return
		}

		err := eventIdDeleter.DeleteST(alias)
		if errors.Is(err, storage.ErrUnknownEventType) {
			log.Info("id not found", "name", alias)

			render.JSON(w, r, resp.Error("not found"))

			return
		}
		if err != nil {
			log.Error("failed to get evnts", sl.Err(err))

			render.JSON(w, r, resp.Error("internal error"))

			return
		}

		log.Info("delete events", slog.String("events", alias))
	}
}
