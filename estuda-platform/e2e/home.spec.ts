import { test, expect } from "@playwright/test";
test("exibe cadastro e séries atendidas",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Vamos começar?"})).toBeVisible();
  await expect(page.getByLabel("Em qual série você está?")).toContainText("6º ano do Ensino Fundamental");
  await expect(page.getByLabel("Em qual série você está?")).toContainText("3º ano do Ensino Médio");
});
test("alterna para login",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Entrar",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Que bom ter você de volta."})).toBeVisible();
});