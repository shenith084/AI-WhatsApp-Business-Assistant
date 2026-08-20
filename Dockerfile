FROM n8nio/n8n:latest

USER root

# Copy workflows into the container
RUN mkdir -p /home/node/.n8n/workflows_import
COPY workflows_deploy/ /home/node/.n8n/workflows_import/

# Fix permissions so the node user can access these files
RUN chown -R node:node /home/node/.n8n/workflows_import

USER node

# Use the standard n8n entrypoint — n8n will load workflows on first start via N8N_IMPORT_WORKFLOWS_FROM
CMD ["n8n", "start"]
