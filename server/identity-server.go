package main

import (
	"log"
	"net"

	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	v2 "github.com/truward/user-service-app/.gen/api/identity/v2"
)

const (
	port = ":9090"
)

// server is used to implement v2.IdentityService
type server struct {
	v2.IdentityServiceServer
}

// SayHello implements helloworld.GreeterServer
func (s *server) ListAccounts(context.Context, *v2.ListAccountsRequest) (*v2.ListAccountsResponse, error) {
	return &v2.ListAccountsResponse{
		OffsetToken: "",
		Accounts:    []*v2.Account{},
	}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	v2.RegisterIdentityServiceServer(s, &server{})
	// Register reflection service on gRPC server.
	reflection.Register(s)

	log.Printf("Serving identity API")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
