#!/bin/bash
# Server diagnostics for ERR_CONNECTION_REFUSED debugging
set -euo pipefail

echo "=== SYSTEM RESOURCES ==="
echo "--- CPU ---"
nproc
echo "--- RAM ---"
free -m | head -3
echo "--- Uptime & Load ---"
uptime

echo ""
echo "=== FILE DESCRIPTOR LIMITS ==="
echo "--- System-wide ---"
cat /proc/sys/fs/file-max
echo "--- Per-process (current user) ---"
ulimit -n
echo "--- Open files count ---"
cat /proc/sys/fs/file-nr

echo ""
echo "=== NGINX CONFIG ==="
echo "--- Main config ---"
grep -E "worker_processes|worker_connections|worker_rlimit|keepalive|proxy_|client_max|send_timeout|proxy_connect_timeout|proxy_read_timeout" /etc/nginx/nginx.conf 2>/dev/null || echo "nginx.conf not found at default path"
echo "--- Site config ---"
ls /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled"
for f in /etc/nginx/sites-enabled/*; do
  echo "--- $f ---"
  cat "$f" 2>/dev/null | grep -E "listen|server_name|proxy_pass|keepalive|limit_|upstream|proxy_connect|proxy_read|proxy_send|client_max" || true
done

echo ""
echo "=== NGINX STATUS ==="
systemctl status nginx --no-pager -l 2>/dev/null | head -20 || echo "nginx not managed by systemctl"
nginx -t 2>&1 || true

echo ""
echo "=== NETWORK CONNECTIONS ==="
echo "--- Listening ports ---"
ss -tlnp | grep -E "80|443|5000" || true
echo "--- Connection states ---"
ss -s
echo "--- ESTABLISHED to port 5000 ---"
ss -tn state established '( dport = :5000 or sport = :5000 )' | wc -l
echo "--- TIME_WAIT count ---"
ss -tn state time-wait | wc -l

echo ""
echo "=== NODE PROCESS ==="
ps aux | grep -E "node|tsx" | grep -v grep || echo "No node process found"

echo ""
echo "=== RECENT NGINX ERRORS ==="
tail -30 /var/log/nginx/error.log 2>/dev/null || echo "No nginx error log"

echo ""
echo "=== SYSCTL NETWORK TUNING ==="
sysctl net.core.somaxconn 2>/dev/null || true
sysctl net.ipv4.tcp_max_syn_backlog 2>/dev/null || true
sysctl net.ipv4.ip_local_port_range 2>/dev/null || true
sysctl net.ipv4.tcp_tw_reuse 2>/dev/null || true
sysctl net.core.netdev_max_backlog 2>/dev/null || true

echo ""
echo "=== DONE ==="
