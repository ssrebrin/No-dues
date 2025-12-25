package items

import (
	"context"
	"errors"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

var (
	ErrWrongState  = errors.New("Wrong state error")
	ErrTermTimeout = errors.New("Termination timeout")
	ErrMainOmitted = errors.New("Main ometted")
	ErrShutdown    = errors.New("Shut down")
)

const (
	srvStateInit int32 = iota
	srvStateReady
	srvStateRunning
	srvStateShutdown
	srvStateOff
)
const (
	appStateInit int32 = iota
	appStateReady
	appStateRunning
	appStateOff
	appStateShutdown
	appStateHalt
)

type (
	Resources interface {
		Init(context.Context) error  // чтобы инициализировать
		Watch(context.Context) error // чтобы наблюдать
		Stop()
		Release() error // освободить ресурсы
	}
	Application struct {
		// это будет выполняться основным потоком
		MainFunc func(ctx context.Context, holdOn <-chan struct{}) error
		// это абстракция, чтобы не усложнять код
		Resources             Resources
		TerminationTimeout    time.Duration
		InitializationTimeout time.Duration
		ctx                   context.Context
		cancel                context.CancelFunc

		appState int32
		err      error
		mux      sync.Mutex
		halt     chan struct{}
		done     chan struct{}
	}
)

func (a *Application) setError(err error) {
	if err == nil {
		return
	}
	a.mux.Lock()
	if a.err == nil {
		a.err = err
	}
	a.mux.Unlock()
	a.Shutdown()
}

func (a *Application) getError() error {
	var err error
	a.mux.Lock()
	err = a.err
	a.mux.Unlock()
	return err
}

func (a *Application) run(sig <-chan os.Signal) error {
	defer a.Shutdown()               // при выходе просто установит поле state в значение appStateShutdown
	var errRun = make(chan error, 1) // канал для сигнала от основного потока
	go func() {
		defer close(errRun)
		// halt для основного потока - это сигнал о завершении работы
		if err := a.MainFunc(a.ctx, a.halt); err != nil {
			errRun <- err
		}
	}()
	var errHld = make(chan error, 1) // канал для сигнала от потока слушающего chan os.Signal
	go func() {
		defer close(errHld)
		select {
		// ожидаем сигнала операционной системы
		case <-sig:
			a.Halt() // вызов этой процедуры просто закроет канал a.halt
			// это и будет наш Graceful Shutdown воркфлоу
			// нам нужно дождаться завершения основного потока или выйти по таймауту
			select {
			case <-time.After(a.TerminationTimeout):
				// это выход по таймауту
				errHld <- ErrTermTimeout
			case <-a.done: // a.Shutdown закрывает этот канал
				// ok
			}
		case <-a.done: // a.Shutdown закрывает этот канал
			// сюда попадем, если завершение работы произошло без участия ОС
		}
	}()
	// на этом месте выполнение процедуры будет блокировано
	// пока не произойдет одно из следующих событий
	select {
	// получим ошибку от основного потока выполнения или закроется канал errRun
	case err, ok := <-errRun:
		if ok && err != nil {
			return err
		}
	// получим ошибку от рутины, слушающей сигналы ОС или закроется ее канал
	case err, ok := <-errHld:
		if ok && err != nil {
			return err
		}
	// это жесткий путь - кто-то вызвал процедуру Shutdown()
	case <-a.done:
		// shutdown
	}
	return nil
}

func (a *Application) Halt() {
	if a.checkState(appStateRunning, appStateHalt) {
		close(a.halt)
	}
}

func (a *Application) Shutdown() {
	a.Halt()
	if a.checkState(appStateHalt, appStateShutdown) {
		close(a.done)
	}
}

func (a *Application) Context() context.Context {
	return a.ctx
}

func (a *Application) checkState(old, new int32) bool {
	return atomic.CompareAndSwapInt32(&a.appState, old, new)
}

func (a *Application) init() error {
	if a.Resources != nil {
		a.ctx, a.cancel = context.WithTimeout(context.TODO(), a.InitializationTimeout)
		defer a.cancel()

		if a.halt == nil {
			a.halt = make(chan struct{})
		}
		if a.done == nil {
			a.done = make(chan struct{})
		}
		return a.Resources.Init(a.ctx)
	}
	return nil
}

func (a *Application) Run() error {
	if a.MainFunc == nil {
		// если у нас не задана эта функция, то и выполнять нечего
		return ErrMainOmitted
	}
	if a.checkState(appStateInit, appStateRunning) {
		// сюда дважды не войти
		if err := a.init(); err != nil {
			a.err = err
			a.appState = appStateShutdown
			// не сбылась инициализация ресурсов
			return err
		}
		// с помощью servicesRunning мы синхронизируем жизненный цикл ресурсов
		// с жизненным циклом приложения
		var servicesRunning = make(chan struct{})
		if a.Resources != nil {
			go func() {
				defer close(servicesRunning) // вот сигнал о том, что Watch остановлено
				// Shutdown просто остновит a.run(sig), это мы потом увидим
				//defer a.Shutdown()
				a.setError(a.Resources.Watch(context.TODO()))
			}()
		}
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
		// запускаем основной поток выполнения
		a.setError(a.run(sig))
		// в этом месте программа должна завершиться
		if a.Resources != nil {
			a.Resources.Stop()                // посылаем сигнал ресурсам
			<-servicesRunning                 // ожидаем завершения Watch
			a.setError(a.Resources.Release()) // освобождаем ресурсы
		}
		return a.getError()
	}
	return ErrWrongState
}
