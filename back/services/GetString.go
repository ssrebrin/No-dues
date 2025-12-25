package services

import (
	"context"
)

type GetStringer struct {
	str string
}

func (g *GetStringer) Init(ctx context.Context) error {
	g.str = "Hello from service!"
	return nil
}
func (g *GetStringer) Ping(ctx context.Context) error {
	return nil
}
func (g *GetStringer) Close() error {
	return nil
}
func (g *GetStringer) GetString() string {
	return g.str
}
