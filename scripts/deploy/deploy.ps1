$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)
Set-Location ..

python -m unittest discover -s tests
python -c "import ast; ast.parse(open('contracts/VCDAOAlpha.py', encoding='utf-8').read())"
genlayer lint contracts/VCDAOAlpha.py
genlayer deploy contracts/VCDAOAlpha.py --name VCDAOAlpha
