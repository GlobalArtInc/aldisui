package api

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCacheControlFor(t *testing.T) {
	tests := []struct {
		name     string
		file     string
		expected string
	}{
		{"html is never cached", "index.html", ""},
		{"runtime assets revalidate", "assets/i18n/en.json", "no-cache"},
		{"runtime assets revalidate with a leading slash", "/assets/i18n/ru.json", "no-cache"},
		{"hashed bundles are cached for a day", "main-ABCDEFGH.js", "max-age=86400, public, must-revalidate, proxy-revalidate"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, cacheControlFor(tt.file))
		})
	}
}
