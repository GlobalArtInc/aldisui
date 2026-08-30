package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUnmarshalSurveyVarDefaultValue(t *testing.T) {
	tests := []struct {
		name     string
		backup   string
		expected string
	}{
		{
			name:     "a default value written as a string",
			backup:   `{"templates":[{"name":"apply","survey_vars":[{"name":"only","default_value":"common"}]}]}`,
			expected: "common",
		},
		{
			name:     "a default value written as an array",
			backup:   `{"templates":[{"name":"apply","survey_vars":[{"name":"only","default_value":["common"]}]}]}`,
			expected: "common",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var backup BackupFormat

			require.NoError(t, backup.Unmarshal(tt.backup))
			require.Len(t, backup.Templates, 1)
			require.Len(t, backup.Templates[0].SurveyVars, 1)

			value := backup.Templates[0].SurveyVars[0].DefaultValue
			require.NotNil(t, value)
			assert.Equal(t, tt.expected, value.String())
		})
	}
}
