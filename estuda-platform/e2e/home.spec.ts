import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

function uniqueUser() {
  return `e2e-${randomUUID().slice(0, 12)}`;
}

test("exibe cadastro e séries atendidas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Vamos começar?" })).toBeVisible();
  await expect(page.getByLabel("Em qual série você está?")).toContainText("6º ano do Ensino Fundamental");
  await expect(page.getByLabel("Em qual série você está?")).toContainText("3º ano do Ensino Médio");
});

test("alterna para login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Que bom ter você de volta." })).toBeVisible();
});

test("valida objetivo obrigatório antes de cadastrar", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill(uniqueUser());
  await page.getByLabel("Senha", { exact: true }).fill("TesteEstuda@2026");
  await page.getByLabel("Confirme sua senha").fill("TesteEstuda@2026");
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  await expect(page.getByRole("alert")).toHaveText("Selecione pelo menos um objetivo para personalizar seus estudos.");
});

test("cadastra, salva atividades/diagnóstico e restaura tudo após atualizar e entrar novamente", async ({ page }) => {
  const username = uniqueUser();
  const password = "TesteEstuda@2026";

  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Em qual série você está?").selectOption("6EF");
  await page.getByRole("checkbox", { name: "Aprender coisas novas" }).check();
  await page.getByLabel("Confirme sua senha").fill(password);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await expect(page.getByRole("heading", { name: "Seu próximo passo começa aqui." })).toBeVisible();
  await expect(page.getByText("Compreensão de textos", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Começar" }).first().click();
  await expect(page.getByRole("button", { name: "Marcar concluída" }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Marcar concluída" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Marcar concluída" }).first().click();
  await expect(page.getByText("Concluída", { exact: true }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("Concluída", { exact: true }).first()).toBeVisible();

  await page.getByLabel("Como você se sente ao estudar um assunto novo?").selectOption("aprendo_com_exemplos");
  await page.getByRole("button", { name: "Salvar diagnóstico" }).click();
  await expect(page.getByText("Diagnóstico", { exact: true })).toBeVisible();
  await expect(page.getByText("Iniciado", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar no Estuda" }).click();

  await expect(page.getByRole("heading", { name: "Seu próximo passo começa aqui." })).toBeVisible();
  await expect(page.getByText("Concluída", { exact: true }).first()).toBeVisible();
});
