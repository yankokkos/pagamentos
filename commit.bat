@echo off
cd /d C:\prototipos\Medup\pagamentos
git add .
git commit -m "Fix Dockerfile COPY command - Use RUN instead of COPY with shell redirection"
git push origin main
echo Done!
