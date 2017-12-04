package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

// IndexHandler handles GET requests to the root path '/'
func IndexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Fprintf(w, "<h2>User Service App</h2>")
}

//func

func main() {
	log.Println("Starting server")

	fs := http.FileServer(http.Dir("assets"))

	http.Handle("/assets/", http.StripPrefix("/assets/", fs))
	http.HandleFunc("/", IndexHandler)

	port := "8080"
	svr := &http.Server{
		Addr:         ":" + port,
		ReadTimeout:  2 * time.Second,
		WriteTimeout: 4 * time.Second,
	}

	fmt.Printf("Starting the server on port %s\n", port)
	err := svr.ListenAndServe()
	if err != nil {
		log.Printf("fatal error: cannot start the server: %v\n", err)
		return
	}
}
