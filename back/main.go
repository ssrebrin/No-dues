package main

import (
	"context"
	"fmt"
	"my_app/items"
	"my_app/net"
	"os"
	"time"
)

func logError(err error) {
	if err = fmt.Errorf("%w", err); err != nil {
		fmt.Println(err)
	}
}

func main() {
	fmt.Println("hereeeeeeeeeeeeeee")
	//weat := &services.Weather{}
	//db := &services.DataBase{}
	srv := &net.Server{}
	task_man := items.Application{
		MainFunc: func(ctx context.Context, holdOn <-chan struct{}) error {
			fmt.Println("Запуск Task Manager")
			<-holdOn // ждём сигнала остановки
			fmt.Println("Завершение работы Task Manager")
			return nil
		},
		Resources: items.NewServiceKeeper(
			[]items.Service{
				//weat,
				srv,
			},
			time.Millisecond*500,
		),
		TerminationTimeout:    time.Second * 10,
		InitializationTimeout: time.Second * 5,
	}

	if err := task_man.Run(); err != nil {
		fmt.Println("Here")
		logError(err)
		os.Exit(1)
	}
}
