package hooks

import (
	"github.com/GlobalArtInc/aldisui/db"
)

type AnsibleHook struct {
}

func (h *AnsibleHook) End(store db.Store, projectID int, taskID int) {
}
