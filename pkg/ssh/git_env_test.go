package ssh

import (
	"strings"
	"testing"

	"github.com/GlobalArtInc/aldisui/util"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetGitEnvSshCommand(t *testing.T) {
	tests := []struct {
		name     string
		checking util.SshStrictHostKeyChecking
	}{
		{"host keys are trusted on first use", util.SshStrictHostKeyCheckingAcceptNew},
		{"host keys are not checked", util.SshStrictHostKeyCheckingNo},
		{"host keys are checked strictly", util.SshStrictHostKeyCheckingYes},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setupSshConfig(tt.checking)

			key := AccessKeyInstallation{SSHAgent: &Agent{SocketFile: "/tmp/agent.sock"}}
			env := key.GetGitEnv()

			command := ""
			for _, entry := range env {
				if strings.HasPrefix(entry, "GIT_SSH_COMMAND=") {
					command = strings.TrimPrefix(entry, "GIT_SSH_COMMAND=")
				}
			}

			require.NotEmpty(t, command)
			assert.True(t, strings.HasPrefix(command, "ssh -o "), "unexpected command: %s", command)
			assert.NotContains(t, command, "ssh ssh")
		})
	}
}

func setupSshConfig(checking util.SshStrictHostKeyChecking) {
	if util.Config == nil {
		util.Config = &util.ConfigType{}
	}
	if util.Config.Ssh == nil {
		util.Config.Ssh = &util.SshConfig{}
	}
	util.Config.Ssh.StrictHostKeyChecking = checking
	util.Config.Ssh.KnownHostsFile = "/tmp/known_hosts"
}
