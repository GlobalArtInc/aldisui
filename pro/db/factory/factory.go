package factory

import (
	"github.com/GlobalArtInc/aldisui/db"
	"github.com/GlobalArtInc/aldisui/pro/db/sql"
)

func NewTerraformStore(store db.Store) db.TerraformStore {
	return &sql.TerraformStoreImpl{}
}

func NewAnsibleTaskRepository(store db.Store) db.AnsibleTaskRepository {
	return &sql.AnsibleTaskStoreImpl{}
}

func NewWorkflowStore(store db.Store) db.WorkflowManager {
	return &sql.WorkflowStoreImpl{}
}
