FROM postgres:15-alpine
RUN apk add --no-cache bash rsync
WORKDIR /src
COPY supabase/migrations ./migrations
COPY supabase/functions ./functions
COPY scripts/vps/apply-supabase.sh /usr/local/bin/apply-supabase.sh
RUN chmod +x /usr/local/bin/apply-supabase.sh
# Applies, then idles: Coolify expects a running container (check Runtime Logs for the result)
# Runs as root on purpose: writes the root-owned functions bind mount (nosemgrep missing-user)
CMD ["bash", "-c", "apply-supabase.sh /src && echo 'DEPLOY OK' && exec sleep infinity"]
