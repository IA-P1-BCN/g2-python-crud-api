import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import openapiTS, { astToString } from 'openapi-typescript'

const DEFAULT_URL = 'http://localhost:8000/openapi.json'
const OUTPUT = resolve(process.cwd(), 'src/types/schema.d.ts')

function parseFileArg() {
  const index = process.argv.indexOf('--file')
  return index !== -1 ? process.argv[index + 1] : undefined
}

async function loadSchema() {
  const file = parseFileArg() ?? process.env.OPENAPI_FILE
  if (file) {
    return JSON.parse(await readFile(resolve(process.cwd(), file), 'utf8'))
  }

  const base = process.env.VITE_API_URL
  const url =
    base && /^https?:\/\//.test(base) ? `${base.replace(/\/$/, '')}/openapi.json` : DEFAULT_URL

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not download the OpenAPI schema from ${url} (HTTP ${response.status})`)
  }
  return response.json()
}

const schema = await loadSchema()
const ast = await openapiTS(schema)
await writeFile(OUTPUT, astToString(ast))
console.log(`Generated ${OUTPUT}`)
