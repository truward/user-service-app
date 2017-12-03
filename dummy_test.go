package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
	v2 "github.com/truward/user-service-app/.gen/api/identity/v2"
)

func TestProtodemo(t *testing.T) {
	t.Run("foo", func(t *testing.T) {
		a := &v2.Account{Id: "1"}
		assert.Equal(t, "1", a.GetId())
	})
}
