package main

import (
	"log"
	"net/http"

	"github.com/truward/user-service-app/login/config"
	"github.com/truward/user-service-app/login/handlers"
)

func main() {
	config, ok := config.GetEnvConfig()
	if !ok {
		return
	}

	log.Printf("Starting server, config=%s\n", config)

	fs := http.FileServer(http.Dir("assets"))

	http.Handle("/assets/", http.StripPrefix("/assets/", fs))
	http.HandleFunc("/index", handlers.GetIndexHandler())
	http.HandleFunc("/login", handlers.GetLoginHandler())

	svr := &http.Server{
		Addr:         config.ServerAddress,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
	}

	err := svr.ListenAndServe()
	if err != nil {
		log.Printf("fatal error: cannot start the server: %v\n", err)
		return
	}
}
