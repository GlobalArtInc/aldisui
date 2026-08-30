package api

import (
	"net/http"

	"github.com/GlobalArtInc/aldisui/db"
)

func VerifySessionByEmail(session *db.Session, w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusForbidden)
	return
}
