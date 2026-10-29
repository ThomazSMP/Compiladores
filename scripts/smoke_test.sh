#!/usr/bin/env bash
# Teste de implantação/integração: exige a aplicação no ar (docker compose up -d).
# Verifica a página, o proxy do Nginx e o contrato da API de ponta a ponta.
# Uso: bash scripts/smoke_test.sh            (padrão: http://localhost:8080)
#      BASE_URL=http://localhost:8081 bash scripts/smoke_test.sh
BASE_URL="${BASE_URL:-http://localhost:8080}"
passou=0; falhou=0
corpo="$(mktemp)"
trap 'rm -f "$corpo"' EXIT

verifica() {  # descricao status_esperado texto_esperado método url [json]
  local desc="$1" status_esp="$2" texto_esp="$3" metodo="$4" url="$5" json="${6:-}"
  local status
  if [ -n "$json" ]; then
    status="$(curl -s -o "$corpo" -w '%{http_code}' -X "$metodo" -H 'Content-Type: application/json' -d "$json" "$url")"
  else
    status="$(curl -s -o "$corpo" -w '%{http_code}' -X "$metodo" "$url")"
  fi
  if [ "$status" = "$status_esp" ] && grep -q -- "$texto_esp" "$corpo"; then
    echo "  ok     $desc"; passou=$((passou + 1))
  else
    echo "  FALHOU $desc (HTTP $status; esperado $status_esp contendo: $texto_esp)"; falhou=$((falhou + 1))
  fi
}

echo "Smoke test em $BASE_URL"
verifica "página principal carrega"                  200 'id="codigo"'            GET  "$BASE_URL/"
verifica "arquivos JS são servidos"                  200 'criarControlador'       GET  "$BASE_URL/js/controlador.js"
verifica "GET /api/hello (etapa 1) segue funcionando" 200 'Hello, World!'          GET  "$BASE_URL/api/hello"
verifica "GET /api/exemplos lista os exemplos"       200 '"id":"atribuicao"'      GET  "$BASE_URL/api/exemplos"
verifica "POST /api/analisar com código válido"      200 '"recebido":true'        POST "$BASE_URL/api/analisar" '{"codigo":"x = 10"}'
verifica "POST /api/analisar com código inválido"    200 '"recebido":true'        POST "$BASE_URL/api/analisar" '{"codigo":"x = = 5 +"}'
verifica "scanner retorna categoria do identificador" 200 'IDENTIFICADOR' POST "$BASE_URL/api/analisar" '{"codigo":"numero = 10"}'
verifica "scanner retorna sucesso léxico" 200 '"sucesso":true' POST "$BASE_URL/api/analisar" '{"codigo":"x = 10"}'
verifica "erro léxico é recuperável" 200 '"sucesso":false' POST "$BASE_URL/api/analisar" '{"codigo":"x = @ 2"}'
verifica "erro léxico tem mensagem didática" 200 'ERRO_LEXICO' POST "$BASE_URL/api/analisar" '{"codigo":"x = @ 2"}'
verifica "POST /api/analisar com entrada vazia"      400 'entrada_vazia'          POST "$BASE_URL/api/analisar" '{"codigo":"   "}'
verifica "POST /api/analisar sem o campo codigo"     400 'requisicao_invalida'    POST "$BASE_URL/api/analisar" '{}'
verifica "POST /api/analisar com JSON malformado"    400 'requisicao_invalida'    POST "$BASE_URL/api/analisar" '{nao e json'

echo "Resultado: $passou passaram, $falhou falharam."
[ "$falhou" -eq 0 ]
