#!/usr/bin/env bash
# Roda os testes automatizados do backend (pytest) e do frontend (node --test) dentro do Docker.
# Não exige que a aplicação esteja no ar.
set -u
cd "$(dirname "$0")/.."

falhas=0
echo "==> Construindo a imagem de testes do backend"
docker compose --profile test build backend-tests || exit 1

echo; echo "==> Testes do backend (pytest)"
docker compose --profile test run --rm backend-tests || falhas=$((falhas + 1))

echo; echo "==> Testes do frontend (node --test)"
docker compose --profile test run --rm frontend-tests || falhas=$((falhas + 1))

echo
if [ "$falhas" -eq 0 ]; then echo "RESULTADO: todos os conjuntos de testes passaram."; else echo "RESULTADO: $falhas conjunto(s) com falhas."; fi
exit "$falhas"
