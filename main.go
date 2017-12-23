package main

import (
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/reujab/httplogger"
)

var (
	games      = make(map[string]*Game)
	gamesMutex sync.RWMutex
)

// Deck represents a deck.
type Deck struct {
	Black []string
	White []string
}

var templates = template.Must(template.ParseGlob("src/*.tmpl"))

func main() {
	rand.Seed(time.Now().UnixNano())

	router := mux.NewRouter()
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("dist"))))
	router.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		die(templates.ExecuteTemplate(res, "index.tmpl", nil))
	}).Methods("GET")
	router.HandleFunc("/create-game", createGame).Methods("POST")
	router.HandleFunc(`/{id:[a-z\d]{20}}`, func(res http.ResponseWriter, req *http.Request) {
		if getGame(mux.Vars(req)["id"]) == nil {
			http.NotFound(res, req)
		} else {
			die(templates.ExecuteTemplate(res, "game.tmpl", nil))
		}
	}).Methods("GET")
	router.HandleFunc(`/{id:[a-z\d]{20}}/ws`, func(res http.ResponseWriter, req *http.Request) {
		game := getGame(mux.Vars(req)["id"])
		if game == nil {
			http.NotFound(res, req)
			return
		}

		ws, err := upgrader.Upgrade(res, req, nil)
		die(err)
		defer ws.Close()
		handlePlayer(game, ws)
	}).Methods("GET")
	log.Println("Listening to :8080")
	panic(http.ListenAndServe(":8080", httplogger.Wrap(router.ServeHTTP, func(req *httplogger.Request) {
		log.Println(req.IP, req.Method, req.URL, req.Status, req.Time)
	})))
}

func die(err error) {
	if err != nil {
		panic(err)
	}
}

func getGame(id string) *Game {
	gamesMutex.RLock()
	defer gamesMutex.RUnlock()
	return games[id]
}
