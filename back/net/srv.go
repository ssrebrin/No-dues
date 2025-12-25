package net

import (
	"context"
	"fmt"
	"log/slog"
	"my_app/net/internal/config"
	"my_app/net/internal/http-server/handlers/delete"
	"my_app/net/internal/http-server/handlers/redirect"
	"my_app/net/internal/http-server/handlers/update"
	"my_app/net/internal/http-server/handlers/url/save"
	mwLogger "my_app/net/internal/http-server/middleware/logger"
	"my_app/net/internal/lib/logger/sl"
	"my_app/services/storage"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
)

type Server struct {
	req chan string
	srv *http.Server
	log *slog.Logger
}

const (
	envLocal = "local"
	envDev   = "dev"
	envProd  = "prod"
)

func setupLogger(env string) *slog.Logger {
	var log *slog.Logger

	switch env {
	case envLocal:
		log = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	case envDev:
		log = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	case envProd:
		log = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	}

	return log
}

func (s *Server) Init(ctx context.Context) error {

	cfg := config.MustLoad()

	s.log = setupLogger(cfg.Env)
	//s.log = s.log.With(slog.String("env", cfg.Env)) // к каждому сообщению будет добавляться поле с информацией о текущем окружении

	s.log.Info("initializing server", slog.String("address", cfg.Address)) // Помимо сообщения выведем параметр с адресом
	s.log.Debug("logger debug mode enabled")

	router := chi.NewRouter()

	router.Use(middleware.RequestID) // Добавляет request_id в каждый запрос, для трейсинга
	router.Use(middleware.Logger)    // Логирование всех запросов
	router.Use(middleware.Recoverer) // Если где-то внутри сервера (обработчика запроса) произойдет паника, приложение не должно упасть
	router.Use(middleware.URLFormat) // Парсер URLов поступающих запросов
	router.Use(mwLogger.New(s.log))

	storage := &storage.Storage{}
	storage.StorPath = cfg.StoragePath

	if err := storage.Init(ctx); err != nil {
		s.log.Error("failed to init storage", sl.Err(err))
		return err
	}

	router.Put("/event/{id}", update.UpdateEventHandler(s.log, storage, ctx))
	router.Put("/subtask/{id}", update.UpdateEventHandler(s.log, storage, ctx))
	router.Post("/subtask", save.New1(s.log, storage, ctx))
	router.Post("/event", save.New(s.log, storage, ctx))
	router.Get("/user/{name}", redirect.New(s.log, storage))
	router.Get("/subtask/{name}", redirect.New1(s.log, storage))
	router.Delete("/event/{id}", delete.New(s.log, storage))
	router.Delete("/subtask/{id}", delete.New1(s.log, storage))

	// router.Route("/url", func(r chi.Router) {
	// 	r.Use(middleware.BasicAuth("task-man", map[string]string{
	// 		cfg.HTTPServer.User: cfg.HTTPServer.Password,
	// 	}))
	// 	r.Post("/", save.New(s.log, storage))
	// })
	s.log.Info("starting server", slog.String("address", cfg.Address))

	s.srv = &http.Server{
		Addr:         cfg.Address,
		Handler:      router,
		ReadTimeout:  cfg.HTTPServer.Timeout,
		WriteTimeout: cfg.HTTPServer.Timeout,
		IdleTimeout:  cfg.HTTPServer.IdleTimeout,
	}

	go func() {
		if err := s.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.log.Error("failed to start server", sl.Err(err))
		}
	}()

	return nil
}

func (s *Server) Ping(ctx context.Context) error {
	return nil
}

func (s *Server) Close() error {
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := s.srv.Shutdown(shutdownCtx); err != nil {
		s.log.Error("shutdown error", sl.Err(err))
	}
	fmt.Println("ok")
	return nil
}
