package server

import (
	"testing"

	"github.com/GlobalArtInc/aldisui/db"
	"github.com/GlobalArtInc/aldisui/pkg/common_errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDeserializeSecretWithoutSecret(t *testing.T) {
	service := &accessKeyEncryptionServiceImpl{}

	tests := []struct {
		name    string
		key     db.AccessKey
		message string
	}{
		{
			name:    "an ssh key restored without its secret",
			key:     db.AccessKey{Name: "github-infra", Type: db.AccessKeySSH},
			message: "key 'github-infra' has no secret yet: fill it in the key store",
		},
		{
			name: "the empty key type needs no secret",
			key:  db.AccessKey{Name: "None", Type: db.AccessKeyNone},
		},
		{
			name: "a key that was never set needs no secret",
			key:  db.AccessKey{},
		},
		{
			name: "an empty string value is a valid secret",
			key:  db.AccessKey{Name: "var.EMPTY", Type: db.AccessKeyString},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			key := tt.key
			err := service.DeserializeSecret(&key)

			if tt.message == "" {
				assert.NoError(t, err)
				return
			}

			var validation *common_errors.ValidationError
			require.ErrorAs(t, err, &validation)
			assert.Equal(t, tt.message, validation.Message)
		})
	}
}
