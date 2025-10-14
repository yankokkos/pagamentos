@echo off
echo Criando build para hospedagem...

REM Criar pasta dist
if not exist "dist" mkdir dist

REM Copiar arquivos principais
copy server.js dist\
copy package.json dist\
copy env.example dist\

REM Copiar pasta public
xcopy public dist\public\ /E /I /Y

REM Copiar pasta services
xcopy services dist\services\ /E /I /Y

REM Copiar arquivos de documentação
copy README.md dist\
copy DEPLOY.md dist\

echo.
echo ✅ Build concluído!
echo 📁 Arquivos prontos na pasta 'dist'
echo.
echo Para fazer deploy:
echo 1. Compacte a pasta 'dist' em um arquivo ZIP
echo 2. Faça upload para sua hospedagem
echo 3. Configure as variáveis de ambiente (.env)
echo 4. Execute: npm install && npm start
echo.
pause
