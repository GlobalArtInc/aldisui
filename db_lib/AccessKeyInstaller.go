package db_lib

import (
	"github.com/GlobalArtInc/aldisui/db"
	"github.com/GlobalArtInc/aldisui/pkg/ssh"
	"github.com/GlobalArtInc/aldisui/pkg/task_logger"
)

type AccessKeyInstaller interface {
	Install(key db.AccessKey, usage db.AccessKeyRole, logger task_logger.Logger) (installation ssh.AccessKeyInstallation, err error)
}
