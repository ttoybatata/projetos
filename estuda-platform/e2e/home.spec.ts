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
  await expect(page.getByText(/ainda não tem questões com correção automática/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar conclusão guiada" }).first()).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Continuar atividade" }).first().click();
  await expect(page.getByRole("button", { name: "Registrar conclusão guiada" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Registrar conclusão guiada" }).first().click();
  await expect(page.getByText("Concluída", { exact: true }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("Concluída", { exact: true }).first()).toBeVisible();

  await page.getByLabel("Como você se sente ao estudar um assunto novo?").selectOption("aprendo_com_exemplos");
  await page.getByLabel("Ao ler um texto, qual situação combina mais com você?").selectOption("identifico_ideia_principal");
  await page.getByLabel("Em matemática, qual tema você quer praticar primeiro?").selectOption("calculos_basicos");
  await page.getByLabel("Quando uma atividade fica difícil, o que você costuma fazer?").selectOption("tento_de_novo");
  await page.getByLabel("Qual formato mais desperta sua curiosidade para aprender algo novo?").selectOption("exemplo_pratico");
  await page.getByRole("button", { name: "Salvar diagnóstico" }).click();
  await expect(page.getByText("Diagnóstico", { exact: true })).toBeVisible();
  await expect(page.getByText("Iniciado", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Como você se sente ao estudar um assunto novo?")).toHaveValue("aprendo_com_exemplos");
  await expect(page.getByLabel("Qual formato mais desperta sua curiosidade para aprender algo novo?")).toHaveValue("exemplo_pratico");

  await page.getByRole("button", { name: "Sair" }).click();
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar no Estuda" }).click();

  await expect(page.getByRole("heading", { name: "Seu próximo passo começa aqui." })).toBeVisible();
  await expect(page.getByText("Concluída", { exact: true }).first()).toBeVisible();
});


test("recupera conta com código de uso único e permite editar o perfil", async ({ page }) => {
  const username = uniqueUser();
  const updatedUsername = `${username}-novo`;
  const originalPassword = "TesteEstuda@2026";
  const recoveredPassword = "NovaSenha@2026";
  const secondPassword = "OutraSenha@2026";

  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(originalPassword);
  await page.getByLabel("Em qual série você está?").selectOption("6EF");
  await page.getByRole("checkbox", { name: "Aprender coisas novas" }).check();
  await page.getByLabel("Confirme sua senha").fill(originalPassword);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await expect(page.locator(".dashboard-recovery code")).toBeVisible();
  const originalCode = (await page.locator(".dashboard-recovery code").textContent())?.trim();
  expect(originalCode).toBeTruthy();

  await page.getByRole("button", { name: "Sair" }).click();
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Código de recuperação").fill(originalCode!);
  await page.getByLabel("Nova senha", { exact: true }).fill(recoveredPassword);
  await page.getByLabel("Confirme a nova senha").fill(recoveredPassword);
  await page.getByRole("button", { name: "Redefinir senha" }).click();

  await expect(page.getByRole("heading", { name: "Seu próximo passo começa aqui." })).toBeVisible();
  await expect(page.locator(".dashboard-recovery code")).toBeVisible();
  const rotatedCode = (await page.locator(".dashboard-recovery code").textContent())?.trim();
  expect(rotatedCode).toBeTruthy();
  expect(rotatedCode).not.toBe(originalCode);

  await page.getByLabel("Nome de usuário", { exact: true }).fill(updatedUsername);
  await page.locator('select[name="profileSchoolYear"]').selectOption("7EF");
  await page.getByRole("button", { name: "Salvar configurações" }).click();
  await expect(page.getByText(`Olá, ${updatedUsername}`)).toBeVisible();
  await expect(page.locator('select[name="profileSchoolYear"]')).toHaveValue("7EF");

  await page.getByRole("button", { name: "Sair" }).click();
  const rejectedOldCode = await page.request.post("http://127.0.0.1:3000/api/auth/recover", {
    data: { displayName: updatedUsername, recoveryCode: originalCode, newPassword: secondPassword }
  });
  expect(rejectedOldCode.status()).toBe(400);
  expect(await rejectedOldCode.json()).toMatchObject({
    error: "Não foi possível recuperar a conta. Confira os dados e tente novamente."
  });

  const secondRecovery = await page.request.post("http://127.0.0.1:3000/api/auth/recover", {
    data: { displayName: updatedUsername, recoveryCode: rotatedCode, newPassword: secondPassword }
  });
  expect(secondRecovery.status()).toBe(200);
  const secondRecoveryBody = await secondRecovery.json() as { recoveryCode: string };
  expect(secondRecoveryBody.recoveryCode).not.toBe(rotatedCode);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Seu próximo passo começa aqui." })).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Nome de usuário").fill(updatedUsername);
  await page.getByLabel("Senha", { exact: true }).fill(secondPassword);
  await page.getByRole("button", { name: "Entrar no Estuda" }).click();
  await expect(page.getByRole("heading", { name: "Seu próximo passo começa aqui." })).toBeVisible();
});


test("informa quando o provedor do tutor IA não está configurado", async ({ page }) => {
  const username = uniqueUser();
  const password = "TesteEstuda@2026";
  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Em qual série você está?").selectOption("1EM");
  await page.getByRole("checkbox", { name: "Preparar-me para provas e ENEM" }).check();
  await page.getByLabel("Confirme sua senha").fill(password);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await page.getByLabel("Pergunte ao tutor").fill("Pode me ajudar a entender funções?");
  await page.getByRole("button", { name: "Enviar pergunta" }).click();
  await expect(page.getByRole("alert")).toHaveText(/tutor IA ainda não está configurado/i);
  await expect(page.getByText("Tutor Estuda", { exact: true })).toHaveCount(0);
});


test("corrige quiz de matemática no servidor e persiste a pontuação real", async ({ page }) => {
  const username = uniqueUser();
  const password = "TesteEstuda@2026";
  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Em qual série você está?").selectOption("6EF");
  await page.getByRole("checkbox", { name: "Aprender coisas novas" }).check();
  await page.getByLabel("Confirme sua senha").fill(password);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  const topic = page.locator(".topic-item").filter({ hasText: "Números naturais e operações" });
  await topic.getByRole("button", { name: "Começar" }).click();
  await expect(topic.getByRole("heading", { name: "Hora de praticar" })).toBeVisible();
  await topic.getByLabel("175").check();
  await topic.getByLabel("9").check();
  await topic.getByLabel("6 × 7").check();
  await topic.getByRole("button", { name: "Enviar respostas" }).click();

  await expect(topic.getByRole("heading", { name: "Você acertou 3 de 3" })).toBeVisible();
  await expect(topic.getByText("100% de aproveitamento")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Resultado do quiz: 100%", { exact: true })).toBeVisible();
});

test("não disponibiliza quiz de outra série", async ({ page }) => {
  const username = uniqueUser();
  const password = "TesteEstuda@2026";
  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Em qual série você está?").selectOption("7EF");
  await page.getByRole("checkbox", { name: "Aprender coisas novas" }).check();
  await page.getByLabel("Confirme sua senha").fill(password);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  const status = await page.evaluate(async () => {
    const response = await fetch("http://127.0.0.1:3000/api/activities/matematica-naturais/quiz", { credentials: "include" });
    return response.status;
  });
  expect(status).toBe(404);
});
