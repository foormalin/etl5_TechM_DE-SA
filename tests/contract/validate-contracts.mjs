import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const openapi = JSON.parse(
  await readFile("contracts/openapi/techm-public-v1.json", "utf8"),
);
assert.match(openapi.openapi, /^3\./);
assert.equal(openapi.info.version, "1.0.0");
assert.ok(openapi.paths["/checkout"].post.parameters);
assert.ok(openapi.components.schemas.Problem.required.includes("code"));

const avroFiles = (await readdir("contracts/avro")).filter((file) =>
  file.endsWith(".avsc"),
);
assert.ok(avroFiles.length >= 3);
for (const file of avroFiles) {
  const schema = JSON.parse(await readFile(`contracts/avro/${file}`, "utf8"));
  assert.equal(schema.type, "record", `${file} must be an Avro record`);
  assert.ok(schema.name, `${file} must have a name`);
  assert.ok(Array.isArray(schema.fields), `${file} must have fields`);
  const names = new Set(schema.fields.map(({ name }) => name));
  assert.equal(names.size, schema.fields.length, `${file} has duplicate fields`);
}

console.log(`contracts: OpenAPI + ${avroFiles.length} Avro schemas valid`);
