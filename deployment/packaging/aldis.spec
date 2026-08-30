%global debug_package %{nil}
%global _missing_build_ids_terminate_build 0
%global _dwz_low_mem_die_limit 0

Name:           aldis
Version:        2.8.90
Release:        1%{?dist}
Summary:        Aldis UI is a modern UI for Ansible, Terraform, OpenTofu, Bash and Pulumi. It lets you easily run Ansible playbooks, get notifications about fails, control access to deployment system.

License:        MIT
URL:            https://github.com/GlobalArtInc/aldisui
Source:         https://github.com/GlobalArtInc/aldisui/archive/refs/tags/v2.8.90.zip

BuildRequires:  golang
BuildRequires:  nodejs
BuildRequires:  nodejs-npm
BuildRequires:  go-task
BuildRequires:  git
BuildRequires:  systemd-rpm-macros

Requires:       ansible

%description
Aldis UI is a modern UI for Ansible, Terraform, OpenTofu, Bash and Pulumi. It lets you easily run Ansible playbooks, get notifications about fails, control access to deployment system.

%prep
%setup -q

%build
export ALDIS_VERSION="development"
export ALDIS_ARCH="linux_amd64"
export ALDIS_CONFIG_PATH="./etc/aldis"
export APP_ROOT="./globalartinc/"

if ! [[ "$PATH" =~ "$HOME/go/bin:" ]]
then
    PATH="$HOME/go/bin:$PATH"
fi
export PATH
go-task all

cat > aldisui.service <<EOF
[Unit]
Description=Aldis Ansible
Documentation=https://github.com/GlobalArtInc/aldisui
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=%{_bindir}/aldis service --config=/etc/aldis/config.json
SyslogIdentifier=aldis
Restart=always

[Install]
WantedBy=multi-user.target

EOF

cat > aldis-setup <<EOF
aldis setup --config=/etc/aldis/config.json
EOF

%install
mkdir -p %{buildroot}%{_sysconfdir}/aldis/
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_unitdir}

install -m 755 bin/aldis %{buildroot}%{_bindir}/aldis
install -m 755 aldis-setup %{buildroot}%{_bindir}/aldis-setup
install -m 755 aldisui.service %{buildroot}%{_unitdir}/aldisui.service

%files
%license LICENSE
%doc README.md CONTRIBUTING.md
%attr(755, root, root) %{_bindir}/aldis
%attr(755, root, root) %{_bindir}/aldis-setup
%attr(644, root,root) %{_sysconfdir}/aldis/
%{_unitdir}/aldisui.service

%changelog
* Wed Jun 28 2023 Neftali Yagua
-
