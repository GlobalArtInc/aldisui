package hooks

import "github.com/GlobalArtInc/aldisui/db"

type Hook interface {
	End(store db.Store, projectID int, taskID int)
}
