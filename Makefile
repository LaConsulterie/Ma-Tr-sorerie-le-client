deploy:
	ssh consulterie "\
		cd ~/tresorerie/client/ && \
		git pull && \
		~/.bun/bin/bun run build \
	"
