package items

import (
	"context"
	"sync/atomic"
	"time"
)

type Service interface {
	Init(ctx context.Context) error
	Ping(ctx context.Context) error
	Close() error
}

func (s *ServiceKeeper) Stop() {
	if s.checkState(srvStateRunning, srvStateShutdown) {
		close(s.stop)
	}
}

type ServiceKeeper struct {
	Services   []Service
	state      int32 // для контроля этапов выполнения
	stop       chan struct{}
	PingPeriod time.Duration
}

func NewServiceKeeper(Services []Service, Ping time.Duration) *ServiceKeeper {
	return &ServiceKeeper{
		Services:   Services,
		PingPeriod: Ping,
		state:      srvStateInit,
		stop:       make(chan struct{}),
	}
}

func (s *ServiceKeeper) initAllServices(ctx context.Context) error {
	for i := range s.Services {
		if err := s.Services[i].Init(ctx); err != nil {
			return err
		}
	}
	return nil
}

func (s *ServiceKeeper) checkState(old, new int32) bool {
	return atomic.CompareAndSwapInt32(&s.state, old, new)
}

func (s *ServiceKeeper) Init(ctx context.Context) error {
	if !s.checkState(srvStateInit, srvStateReady) {
		return ErrWrongState
	}
	return s.initAllServices(ctx)
}

func (s *ServiceKeeper) Watch(ctx context.Context) error {
	if !s.checkState(srvStateReady, srvStateRunning) {
		return ErrWrongState
	}
	if err := s.cycleTestServices(ctx); err != nil && err != ErrShutdown {
		return err
	}
	return nil
}

func (s *ServiceKeeper) cycleTestServices(ctx context.Context) error {
	ticker := time.NewTicker(5 * time.Second) // периодичность проверки
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err() // контекст отменён
		case <-s.stop:
			return ErrShutdown // кто-то вызвал Stop()
		case <-ticker.C:
			for _, srv := range s.Services {
				if err := srv.Ping(ctx); err != nil {
					return err // можно вернуть ошибку сразу или логировать
				}
			}
		}
	}
}

func (s *ServiceKeeper) Release() error {
	for _, ss := range s.Services {
		ss.Close()
	}
	return nil
}
