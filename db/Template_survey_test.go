package db

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateSurveyVarEmptyDefault(t *testing.T) {
	values := []SurveyVarEnumValue{{Name: "Common", Value: "common"}}

	tests := []struct {
		name    string
		v       SurveyVar
		invalid bool
	}{
		{
			name: "an enum without a default is accepted",
			v:    SurveyVar{Name: "only", Type: SurveyVarEnum, Values: values, DefaultValue: parseDefault(t, `""`)},
		},
		{
			name: "an enum with a known default is accepted",
			v:    SurveyVar{Name: "only", Type: SurveyVarEnum, Values: values, DefaultValue: parseDefault(t, `"common"`)},
		},
		{
			name:    "an enum with an unknown default is rejected",
			v:       SurveyVar{Name: "only", Type: SurveyVarEnum, Values: values, DefaultValue: parseDefault(t, `"other"`)},
			invalid: true,
		},
		{
			name: "a select without a default is accepted",
			v:    SurveyVar{Name: "only", Type: SurveyVarSelect, Values: values, DefaultValue: parseDefault(t, `[""]`)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateSurveyVar(tt.v)

			if tt.invalid {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
		})
	}
}

func parseDefault(t *testing.T, raw string) *SurveyVarDefaultValue {
	t.Helper()

	value := &SurveyVarDefaultValue{}
	require.NoError(t, value.UnmarshalJSON([]byte(raw)))
	return value
}
