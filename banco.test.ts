// banco.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  inserirUrl,
  buscarPorCodigo,
  codigoExiste,
  urlExpirou,
  listarUrls,
} from "./banco";
import type { UrlEncurtada } from "./tipos";

// Usa banco em memória para testes
const dbTest = new Database(":memory:");
dbTest.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    urlOriginal TEXT NOT NULL,
    acessos INTEGER NOT NULL DEFAULT 0,
    criadoEm TEXT NOT NULL DEFAULT (datetime('now')),
    expiraEm TEXT
  );
`);

describe("inserirUrl", () => {
  beforeEach(() => {
    dbTest.exec("DELETE FROM urls");
  });

  test("insere URL sem data de expiração", () => {
    const resultado = inserirUrl("abc123", "https://exemplo.com");
    expect(resultado.codigo).toBe("abc123");
    expect(resultado.urlOriginal).toBe("https://exemplo.com");
    expect(resultado.acessos).toBe(0);
    expect(resultado.expiraEm).toBeNull();
  });

  test("insere URL com data de expiração", () => {
    const expiraEm = new Date("2025-12-31").toISOString();
    const resultado = inserirUrl("xyz789", "https://teste.com", expiraEm);
    expect(resultado.expiraEm).toBe(expiraEm);
  });
});

describe("buscarPorCodigo", () => {
  beforeEach(() => {
    dbTest.exec("DELETE FROM urls");
  });

  test("encontra URL existente", () => {
    inserirUrl("test01", "https://ifes.edu.br");
    const resultado = buscarPorCodigo("test01");
    expect(resultado).not.toBeNull();
    expect(resultado?.codigo).toBe("test01");
  });

  test("retorna null para código inexistente", () => {
    const resultado = buscarPorCodigo("naoexiste");
    expect(resultado).toBeNull();
  });
});

describe("codigoExiste", () => {
  beforeEach(() => {
    dbTest.exec("DELETE FROM urls");
  });

  test("retorna true para código existente", () => {
    inserirUrl("existe", "https://exemplo.com");
    expect(codigoExiste("existe")).toBe(true);
  });

  test("retorna false para código inexistente", () => {
    expect(codigoExiste("naoexiste")).toBe(false);
  });
});

describe("urlExpirou", () => {
  test("retorna false quando não há data de expiração", () => {
    const url: UrlEncurtada = {
      id: 1,
      codigo: "test",
      urlOriginal: "https://exemplo.com",
      acessos: 0,
      criadoEm: new Date().toISOString(),
      expiraEm: null,
    };
    expect(urlExpirou(url)).toBe(false);
  });

  test("retorna true para URL expirada", () => {
    const url: UrlEncurtada = {
      id: 1,
      codigo: "test",
      urlOriginal: "https://exemplo.com",
      acessos: 0,
      criadoEm: new Date().toISOString(),
      expiraEm: new Date("2020-01-01").toISOString(),
    };
    expect(urlExpirou(url)).toBe(true);
  });

  test("retorna false para URL que ainda não expirou", () => {
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);
    
    const url: UrlEncurtada = {
      id: 1,
      codigo: "test",
      urlOriginal: "https://exemplo.com",
      acessos: 0,
      criadoEm: new Date().toISOString(),
      expiraEm: dataFutura.toISOString(),
    };
    expect(urlExpirou(url)).toBe(false);
  });
});

describe("listarUrls", () => {
  beforeEach(() => {
    dbTest.exec("DELETE FROM urls");
  });

  test("retorna array vazio quando não há URLs", () => {
    const lista = listarUrls();
    expect(lista).toBeArrayOfSize(0);
  });

  test("retorna URLs em ordem decrescente de ID", () => {
    inserirUrl("primeiro", "https://exemplo1.com");
    inserirUrl("segundo", "https://exemplo2.com");
    inserirUrl("terceiro", "https://exemplo3.com");
    
    const lista = listarUrls();
    expect(lista).toBeArrayOfSize(3);
    expect(lista[0].codigo).toBe("terceiro");
    expect(lista[2].codigo).toBe("primeiro");
  });
});
