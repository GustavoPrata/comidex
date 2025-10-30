#!/bin/bash
# Aumenta o limite de memória para 4GB e executa o servidor
export NODE_OPTIONS="--max-old-space-size=4096"
export NODE_ENV=development
tsx server/index.ts