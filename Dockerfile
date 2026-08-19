FROM n8nio/n8n:latest

USER root
# Copy the working workflows into the container
RUN mkdir -p /home/node/.n8n/workflows_import
COPY workflows_deploy/ /home/node/.n8n/workflows_import/

# Create entrypoint script to automatically import and activate workflows on start
RUN echo '#!/bin/sh' > /docker-entrypoint-custom.sh && \
    echo 'n8n import:workflow --separate --input=/home/node/.n8n/workflows_import &' >> /docker-entrypoint-custom.sh && \
    echo 'exec /docker-entrypoint.sh' >> /docker-entrypoint-custom.sh && \
    chmod +x /docker-entrypoint-custom.sh

USER node

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
