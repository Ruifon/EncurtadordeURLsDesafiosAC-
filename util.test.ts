// util.test.ts
import { expect, test, describe } from "bun:test";
import { gerarCodigo, urlValida, codigoValido } from "./util";

describe("gerarCodigo", () => {
  test("gera com 6 caracteres por padrão", () => {
    expect(gerarCodigo()).toHaveLength(6);
  });

  test("gera com tamanho personalizado", () => {
    expect(gerarCodigo(10)).toHaveLength(10);
    expect(gerarCodigo(4)).toHaveLength(4);
  });

  test("gera apenas caracteres alfanuméricos", () => {
    const codigo = gerarCodigo(100);
    expect(codigo).toMatch(/^[A-Za-z0-9]+$/);
  });

  test("gera códigos diferentes em múltiplas chamadas", () => {
    const codigos = new Set();
    for (let i = 0; i < 100; i++) {
      codigos.add(gerarCodigo());
    }
    // Deve ter alta probabilidade de gerar códigos únicos
    expect(codigos.size).toBeGreaterThan(95);
  });
});

describe("urlValida", () => {
  test("aceita http e https", () => {
    expect(urlValida("https://ifes.edu.br")).toBe(true);
    expect(urlValida("http://exemplo.com")).toBe(true);
  });

  test("aceita URLs com caminhos e parâmetros", () => {
    expect(urlValida("https://exemplo.com/path/to/page")).toBe(true);
    expect(urlValida("https://exemplo.com?param=value&other=123")).toBe(true);
  });

  test("rejeita string aleatória", () => {
    expect(urlValida("abc")).toBe(false);
    expect(urlValida("not a url")).toBe(false);
  });

  test("rejeita URLs sem protocolo", () => {
    expect(urlValida("exemplo.com")).toBe(false);
    expect(urlValida("www.exemplo.com")).toBe(false);
  });

  test("rejeita protocolos que não sejam http/https", () => {
    expect(urlValida("ftp://exemplo.com")).toBe(false);
    expect(urlValida("file:///etc/passwd")).toBe(false);
    expect(urlValida("javascript:alert(1)")).toBe(false);
  });
});

describe("codigoValido", () => {
  test("aceita códigos válidos", () => {
    expect(codigoValido("abc123")).toBe(true);
    expect(codigoValido("ABCD")).toBe(true);
    expect(codigoValido("test1234")).toBe(true);
  });

  test("rejeita códigos muito curtos", () => {
    expect(codigoValido("abc")).toBe(false);
    expect(codigoValido("ab")).toBe(false);
  });

  test("rejeita códigos muito longos", () => {
    expect(codigoValido("abcdefghijk")).toBe(false);
  });

  test("rejeita códigos com caracteres especiais", () => {
    expect(codigoValido("abc-123")).toBe(false);
    expect(codigoValido("abc_123")).toBe(false);
    expect(codigoValido("abc 123")).toBe(false);
    expect(codigoValido("abc@123")).toBe(false);
  });

  test("aceita exatamente 4 e 10 caracteres", () => {
    expect(codigoValido("abcd")).toBe(true);
    expect(codigoValido("1234567890")).toBe(true);
  });
});
