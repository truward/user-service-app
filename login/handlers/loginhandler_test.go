package handlers

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTemplates(t *testing.T) {
	t.Run("login template", func(t *testing.T) {
		a := LoginForm
		assert.True(t, len(a) > 1)
	})
}
