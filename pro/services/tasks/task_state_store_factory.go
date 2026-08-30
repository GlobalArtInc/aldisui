package tasks

import (
	"github.com/GlobalArtInc/aldisui/services/tasks"
)

func NewTaskStateStore() tasks.TaskStateStore {
	return tasks.NewMemoryTaskStateStore()
}
