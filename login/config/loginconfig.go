package config

import (
	"flag"
	"log"
	"time"
)

// EnvConfig defines environment configuration
type EnvConfig struct {
	ServerAddress string
	ReadTimeout   time.Duration
	WriteTimeout  time.Duration
}

func (e *EnvConfig) String() string {
	return "{ServerAddress: '" + e.ServerAddress + "'}"
}

// GetEnvConfig retrieves environment configuration based on command line arguments
func GetEnvConfig() (*EnvConfig, bool) {
	var env string
	flag.StringVar(&env, "env", "DEV", "environment: DEV (development), PROD (production)")
	flag.Parse()

	result := &EnvConfig{
		ReadTimeout:  1 * time.Second,
		WriteTimeout: 2 * time.Second,
	}
	if env == "DEV" {
		result.ServerAddress = "localhost:8080"
	} else if env == "PROD" {
		result.ServerAddress = ":8080"
	} else {
		flag.Usage()
		log.Fatalf("Unknown env=%s", env)
		return nil, false
	}

	return result, true
}
