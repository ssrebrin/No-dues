package redirect

import (
	"errors"
	"net/http"

	"log/slog"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"

	resp "my_app/net/internal/lib/api/response"
	"my_app/net/internal/lib/logger/sl"
	"my_app/services/storage"
)

// URLGetter is an interface for getting url by alias.
//
//go:generate go run github.com/vektra/mockery/v2@v2.28.2 --name=URLGetter
type SubtasksGetter interface {
	GetSubTasks(id int) (string, error)
}

type UserIdGetter interface {
	GetUserId(alias string) (string, error)
	GetUserEvents(userId string) (string, error)
}

func New(log *slog.Logger, userIdGetter UserIdGetter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.redirect.New"

		log := log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		alias := chi.URLParam(r, "name")
		//fmt.Println(">> ", r.URL.Path, " - ", alias)
		if alias == "" {
			log.Info("name is empty")

			render.JSON(w, r, resp.Error("invalid request"))

			return
		}

		resURL, err := userIdGetter.GetUserId(alias)
		if errors.Is(err, storage.ErrUnknownEventType) {
			log.Info("id not found", "name", alias)

			render.JSON(w, r, resp.Error("not found"))

			return
		}
		resEv, err := userIdGetter.GetUserEvents(resURL)
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

		log.Info("got events", slog.String("events", resEv))

		render.JSON(w, r, map[string]string{"events": resEv})
	}
}

func New1(log *slog.Logger, userIdGetter SubtasksGetter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const op = "handlers.url.redirect.New1"

		log := log.With(
			slog.String("op", op),
			slog.String("request_id", middleware.GetReqID(r.Context())),
		)

		alias := chi.URLParam(r, "name")
		//fmt.Println(">> ", r.URL.Path, " - ", alias)
		if alias == "" {
			log.Info("name is empty")

			render.JSON(w, r, resp.Error("invalid request"))

			return
		}
		id, _ := strconv.Atoi(alias)
		resEv, err := userIdGetter.GetSubTasks(id)
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

		log.Info("got subtasks", slog.String("subtasks", resEv))

		render.JSON(w, r, map[string]string{"subtasks": resEv})
	}
}
